import type { APIRoute } from 'astro';
import { Repository } from '../../lib/server/repository';
import { HttpError, apiError } from '../../lib/server/http';
import { requireAdmin } from '../../lib/server/auth';
import { readLocalAsset } from '../../lib/server/preview';
import { storageRequest } from '../../lib/server/database';
import type { ServerLocals } from '../../lib/server/env';

export const prerender=false;
export const GET:APIRoute=async context=>{
  try{
    const id=context.params.id??'';if(!/^[a-f0-9-]{36}$/.test(id))throw new HttpError(404,'Fotoğraf bulunamadı.');
    const repo=new Repository(context.locals as ServerLocals);let admin=false;
    try{await requireAdmin(context);admin=true;}catch{/* Anonymous visitors can only see photos referenced by a published snapshot. */}
    if(!admin&&!await repo.publishedPhoto(id))throw new HttpError(404,'Fotoğraf bulunamadı.');
    const media=await repo.mediaById(id);if(!media||media.status!=='ready')throw new HttpError(404,'Fotoğraf bulunamadı.');
    const headers={'Content-Type':media.type,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Length':String(media.bytes)};
    if(repo.preview)return new Response(await readLocalAsset(id),{headers});
    const response=await storageRequest(repo.locals,`object/authenticated/ka-photos/${media.path.split('/').map(encodeURIComponent).join('/')}`);
    if(!response.ok)throw new HttpError(response.status===404?404:503,'Fotoğraf şu anda yüklenemiyor.','MEDIA_UNAVAILABLE');
    return new Response(response.body,{headers});
  }catch(error){return apiError(error);}
};
