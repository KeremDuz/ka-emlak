import type { APIContext } from 'astro';
import type { Photo } from '../types';
import type { ServerLocals } from './env';
import { HttpError, boundedBody } from './http';
import { imageKind } from './validation';
import { Repository } from './repository';
import { storageRequest } from './database';
import { writeLocalAsset } from './preview';

export async function uploadPhoto(context:APIContext):Promise<Photo>{
  const bytes=await boundedBody(context.request,3_200_000);
  const request=new Request(context.request.url,{method:'POST',headers:{'Content-Type':context.request.headers.get('Content-Type')??''},body:bytes});
  let form:FormData;try{form=await request.formData();}catch{throw new HttpError(400,'Fotoğraf yükleme isteği geçersiz.','UPLOAD');}
  const file=form.get('file');const listingId=form.get('listingId');
  if(!file||typeof file==='string'||typeof listingId!=='string')throw new HttpError(400,'Fotoğraf ve ilan seçin.','UPLOAD');
  return storePhoto(new Repository(context.locals as ServerLocals),listingId,new Uint8Array(await file.arrayBuffer()));
}

/** Panelden yüklenen ve portallardan aktarılan fotoğraflar aynı denetimlerden geçer. */
export async function storePhoto(repo:Repository,listingId:string,data:Uint8Array<ArrayBuffer>):Promise<Photo>{
  if(data.byteLength===0||data.byteLength>3_000_000)throw new HttpError(413,'Fotoğraf en fazla 3 MB olabilir.','TOO_LARGE');
  const type=imageKind(data);
  if(!type)throw new HttpError(415,'JPEG, PNG veya WebP fotoğraf yükleyin. HEIC fotoğrafı önce JPEG olarak kaydedin.','IMAGE_TYPE');
  const listing=await repo.listing(listingId);
  if(listing.status==='trash')throw new HttpError(409,'Çöp kutusundaki ilana fotoğraf eklenemez.','TRASHED');
  if((listing.draft??listing).photos.length>=12)throw new HttpError(422,'Bir ilana en fazla 12 fotoğraf ekleyebilirsiniz.','PHOTO_LIMIT');
  const id=crypto.randomUUID();const ext=type==='image/jpeg'?'jpg':type==='image/png'?'png':'webp';
  const media={id,listingId,path:`${listingId}/${id}.${ext}`,bytes:data.byteLength,type,status:'pending' as const,createdAt:new Date().toISOString()};
  await repo.reserve(media);
  try {
    if(repo.preview)await writeLocalAsset(id,data);
    else{const response=await storageRequest(repo.locals,`object/ka-photos/${media.path.split('/').map(encodeURIComponent).join('/')}`,{method:'POST',headers:{'Content-Type':type,'x-upsert':'false'},body:data});if(!response.ok)throw new HttpError(503,'Fotoğraf yüklenemedi; tekrar deneyin.','UPLOAD_FAILED');}
    await repo.finalize(id);
  } catch(error){try{await repo.removeMedia(media);}catch{console.error(JSON.stringify({event:'upload_cleanup_pending',mediaId:id}));}throw error;}
  return {id,url:`/media/${id}`,thumbnail:`/media/${id}`,alt:listing.title||'İlan fotoğrafı',storagePath:media.path,bytes:media.bytes};
}
