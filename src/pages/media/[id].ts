import type { APIRoute } from 'astro';
import { Repository } from '../../lib/server/repository';
import { HttpError, apiError } from '../../lib/server/http';
import { requireAdmin } from '../../lib/server/auth';
import { readLocalAsset } from '../../lib/server/preview';
import { storageRequest } from '../../lib/server/database';
import type { ServerLocals } from '../../lib/server/env';

type Platform = ServerLocals & { cfContext?: { waitUntil(promise: Promise<unknown>): void } };
// Yayındaki ilan fotoğrafı bir gün Cloudflare'de ve tarayıcıda saklanır: Supabase'ten (ücretsiz planda aylık aktarım
// sınırlı) her ziyarette yeniden çekilmez. Fotoğraf dosyaları değişmez; yeni yükleme yeni kimlik alır.
// Yayından kaldırılan ilanın fotoğrafı adresini bilen biri tarafından en çok bir gün daha açılabilir.
const PUBLIC_CACHE = 'public, max-age=86400';
const edgeCache = () => typeof caches === 'undefined' ? null : (caches as unknown as { default: Cache }).default;

export const prerender=false;
export const GET:APIRoute=async context=>{
  try{
    const id=context.params.id??'';if(!/^[a-f0-9-]{36}$/.test(id))throw new HttpError(404,'Fotoğraf bulunamadı.');
    const locals=context.locals as Platform;const repo=new Repository(locals);let admin=false;
    try{await requireAdmin(context);admin=true;}catch{/* Anonymous visitors can only see photos referenced by a published snapshot. */}
    const cache=admin||repo.preview?null:edgeCache();const key=new Request(new URL(`/media/${id}`,context.url).toString());
    const hit=await cache?.match(key).catch(()=>undefined);if(hit)return new Response(hit.body,{headers:new Headers(hit.headers)}); // önbellek yanıtının başlıkları değiştirilemez; ara katman başlık ekler
    if(!admin&&!await repo.publishedPhoto(id))throw new HttpError(404,'Fotoğraf bulunamadı.');
    const media=await repo.mediaById(id);if(!media||media.status!=='ready')throw new HttpError(404,'Fotoğraf bulunamadı.');
    const headers={'Content-Type':media.type,'Cache-Control':admin?'private, no-store':PUBLIC_CACHE,'X-Content-Type-Options':'nosniff','Content-Length':String(media.bytes)};
    if(repo.preview)return new Response(await readLocalAsset(id),{headers});
    const response=await storageRequest(repo.locals,`object/authenticated/ka-photos/${media.path.split('/').map(encodeURIComponent).join('/')}`);
    if(!response.ok||!response.body)throw new HttpError(response.status===404?404:503,'Fotoğraf şu anda yüklenemiyor.','MEDIA_UNAVAILABLE');
    if(!cache||!locals.cfContext)return new Response(response.body,{headers});
    const [body,copy]=response.body.tee();
    locals.cfContext.waitUntil(cache.put(key,new Response(copy,{headers})).catch(()=>{}));
    return new Response(body,{headers});
  }catch(error){return apiError(error);}
};
