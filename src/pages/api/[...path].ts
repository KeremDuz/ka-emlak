import type { APIContext, APIRoute } from 'astro';
import { z } from 'zod';
import { clientConfig, type ServerLocals } from '../../lib/server/env';
import { HttpError, apiError, bodyJson, json, requestVersion, sameOrigin } from '../../lib/server/http';
import { requireAdmin, startSession, endSession } from '../../lib/server/auth';
import { Repository } from '../../lib/server/repository';
import { editable, inquirySchema, office } from '../../lib/server/validation';
import { filterListings } from '../../lib/server/filters';
import { clearPublicDataCache, publicListing, publicPageSize } from '../../lib/server/data';
import { uploadPhoto } from '../../lib/server/uploads';
import { exportBackup, importBackup } from '../../lib/server/backup';
import { importSourcePhoto, prepareSourceListing } from '../../lib/server/source-import';
import { extractFromText } from '../../lib/server/source-ai';
import { aiBinding, ensureTranslations, translateTexts, translationConfig } from '../../lib/server/translate';
import { sourceHash } from '../../lib/server/translation-source';
import { notifyInquiry } from '../../lib/server/notify';
import { MAX_FEATURES } from '../../lib/limits';

export const prerender=false;
const translateSource=z.object({title:z.string().max(180),description:z.string().max(12000),features:z.array(z.string().max(100)).max(MAX_FEATURES)});
const actions=z.enum(['publish','archive','sold','rented','trash','restore','duplicate','feature','price']);
async function route(context:APIContext):Promise<Response>{
  const {request}=context;const url=new URL(request.url);const path=(context.params.path??'').split('/').filter(Boolean);const method=request.method;
  const locals=context.locals as ServerLocals;const repo=new Repository(locals);
  if(!['GET','HEAD','OPTIONS'].includes(method))sameOrigin(request);
  if(method==='GET'&&path.join('/')==='config')return json(clientConfig(locals));
  if(method==='GET'&&path.join('/')==='listings'){
    const all=await repo.listings(true);const filters=Object.fromEntries(url.searchParams.entries());const listings=filterListings(all,filters);const page=Math.max(1,Number(filters.page)||1);const pageSize=publicPageSize;
    return json({listings:listings.slice((page-1)*pageSize,page*pageSize).map(item=>publicListing(editable(item))),total:listings.length,page,pageSize,mode:repo.preview?'preview':'live',available:true});
  }
  if(method==='POST'&&path.join('/')==='inquiries'){
    const input=inquirySchema.parse(await bodyJson(request,10_000));
    if(input.website)return json({ok:true});
    if(!input.startedAt||Date.now()-input.startedAt<2000||Date.now()-input.startedAt>24*3600*1000)throw new HttpError(400,'Lütfen formu yeniden açıp doldurun.','FORM_TIMING');
    const ip=request.headers.get('CF-Connecting-IP')??'local';
    const hashed=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`inquiry:${ip}`))),x=>x.toString(16).padStart(2,'0')).join('');
    await repo.rateLimit(hashed,5,3600);
    const listing=input.listingId?(await repo.listings(true)).find(item=>item.id===input.listingId):undefined;
    if(input.listingId&&!listing)throw new HttpError(404,'İlan artık yayında değil.','NOT_FOUND');
    const details=Object.entries(input.details??{}).map(([key,value])=>[key.trim(),value.trim()]).filter(([key,value])=>key&&value);
    const inquiry=await repo.saveInquiry({id:crypto.randomUUID(),name:input.name,phone:input.phone,message:input.message,listingId:input.listingId,kind:input.kind,...(details.length?{details:Object.fromEntries(details)}:{}),...(input.locale?{locale:input.locale}:{}),status:'new',createdAt:new Date().toISOString()});
    // Talep kaydedildikten sonra ofise e-posta; gitmezse ziyaretçiye hata gösterilmez.
    await notifyInquiry(locals,(await repo.settings().catch(()=>({email:''}))).email,inquiry,listing,url.origin);
    return json({ok:true},201);
  }
  if(path[0]!=='admin')throw new HttpError(404,'Adres bulunamadı.','NOT_FOUND');
  if(path[1]==='session'){
    if(method==='POST'){const body=z.object({preview:z.boolean().optional(),token:z.string().max(12000).optional()}).parse(await bodyJson(request,15000));await startSession(context,body);return json({ok:true});}
    if(method==='DELETE'){await endSession(context);return json({ok:true});}
    await requireAdmin(context);if(method==='GET')return json({ok:true});
  }
  await requireAdmin(context);
  // Paneldeki her değişiklik bu Worker örneğindeki ziyaretçi önbelleğini boşaltır.
  if(method!=='GET')clearPublicDataCache();
  if(path[1]==='listings'){
    if(path.length===2){if(method==='GET')return json({listings:await repo.listings()});if(method==='POST')return json({listing:await repo.create()},201);}
    const id=z.string().min(1).max(100).parse(path[2]);
    if(path[3]==='action'&&method==='POST'){const body=z.object({action:actions,version:z.number().int().positive(),price:z.number().nonnegative().max(1e13).nullable().optional()}).parse(await bodyJson(request));const listing=await repo.action(id,body.action,body.version,body.price);if(body.action!=='publish')return json({listing});
      // İlan artık yayında; çeviri başarısız olsa da yanıt başarılıdır ve ilan Türkçe yayında kalır.
      const translated=await ensureTranslations(repo,listing);return json({listing:translated.listing,translation:translated.status});}
    if(path[3]==='translate'&&method==='POST'){
      const body=z.object({version:z.number().int().positive().optional(),force:z.boolean().optional(),source:translateSource.optional()}).parse(await bodyJson(request,60_000));
      // Düzenleyici kaydedilmemiş metni gönderir: çeviri yalnız geri döner, ilana düzenleyicinin olağan kaydıyla yazılır.
      if(body.source){const result=await translateTexts(body.source,translationConfig(locals),{ai:aiBinding(locals)});if(result.status!=='ok')return json(result);const hash=sourceHash(body.source);return json({status:Object.keys(result.failed).length?'partial':'ok',translations:Object.fromEntries(Object.entries(result.translations).map(([locale,value])=>[locale,{...value,auto:true,sourceHash:hash}]))});}
      const current=await repo.listing(id);if(current.version!==body.version)throw new HttpError(409,'İlan başka bir sekmede değişti. Son sürümü yeniden yükleyin.','VERSION_CONFLICT',{version:current.version});
      const result=await ensureTranslations(repo,current,{force:body.force});return json({listing:result.listing,status:result.status});
    }
    if(path.length===3&&method==='GET')return json({listing:await repo.listing(id)});
    if(path.length===3&&method==='PUT'){const body=z.object({listing:z.unknown(),version:z.number().int().positive()}).parse(await bodyJson(request));return json({listing:await repo.save(id,editable(body.listing),body.version)});}
    if(path.length===3&&method==='DELETE'){const body=url.searchParams.has('version')?{version:Number(url.searchParams.get('version'))}:z.object({version:z.number()}).parse(await bodyJson(request));await repo.remove(id,requestVersion(body.version));return json({ok:true});}
  }
  if(path[1]==='settings'){if(method==='GET')return json({settings:await repo.settings()});if(method==='PUT'){const data=await bodyJson(request);const value=data&&typeof data==='object'&&'settings'in data?data.settings:data;return json({settings:await repo.saveSettings(office(value))});}}
  if(path[1]==='inquiries'){
    if(method==='GET')return json({inquiries:await repo.inquiries()});
    if(method==='PATCH'){const body=z.object({id:z.string(),status:z.enum(['new','contacted','closed'])}).parse(await bodyJson(request));const inquiry=(await repo.inquiries()).find(item=>item.id===body.id);if(!inquiry)throw new HttpError(404,'Talep bulunamadı.');return json({inquiry:await repo.saveInquiry({...inquiry,status:body.status})});}
  }
  if(path[1]==='storage'&&method==='GET')return json(await repo.usage());
  if(path[1]==='upload'){
    if(method==='POST'&&path.length===2)return json({photo:await uploadPhoto(context)},201);
    if(method==='DELETE'&&path[2]){const media=(await repo.media()).find(item=>item.id===path[2]);if(!media)throw new HttpError(404,'Fotoğraf bulunamadı.');const used=(await repo.listings()).some(item=>[...item.photos,...(item.draft?.photos??[])].some(photo=>photo.id===media.id));if(used)throw new HttpError(409,'Önce fotoğrafı ilanlardan çıkarıp değişikliği kaydedin/yayınlayın.','PHOTO_IN_USE');await repo.removeMedia(media);return json({ok:true});}
  }
  if(path[1]==='source'&&method==='POST'){
    if(path[2]==='listing'){const body=await bodyJson(request,200_000);const targetId=z.string().min(1).max(100).optional().parse((body as {targetId?:unknown}|null)?.targetId);const config=translationConfig(locals),ai=aiBinding(locals);return json(await prepareSourceListing(repo,body,targetId,config||ai?text=>extractFromText(text,config,ai):undefined));}
    if(path[2]==='photo'){const body=z.object({listingId:z.string().min(1).max(100),url:z.string().max(800)}).parse(await bodyJson(request));return json({photo:await importSourcePhoto(repo,body.listingId,body.url)},201);}
  }
  if(path[1]==='export'&&method==='GET')return json(await exportBackup(repo),200,{'Content-Disposition':`attachment; filename="ka-emlak-yedek-${new Date().toISOString().slice(0,10)}.json"`});
  if(path[1]==='import'&&method==='POST')return json(await importBackup(repo,await bodyJson(request,10_000_000)));
  throw new HttpError(405,'Bu işlem desteklenmiyor.','METHOD_NOT_ALLOWED');
}
export const ALL:APIRoute=async context=>{try{return await route(context);}catch(error){return apiError(error);}};
