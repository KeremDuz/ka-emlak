import type { AdminListing, Inquiry, OfficeSettings } from '../types';
import { HttpError } from './http';

export interface MediaRecord { id:string; listingId:string; path:string; bytes:number; type:string; status:'pending'|'ready'; createdAt:string; }
export interface PreviewState {
  listings:AdminListing[]; settings:OfficeSettings; inquiries:Inquiry[];
  sessions:Record<string,number>; media:MediaRecord[]; rates:Record<string,{count:number;expires:number}>;
}
async function files() {
  if(!import.meta.env.DEV) throw new HttpError(503,'Yerel önizleme üretimde kullanılamaz.','PREVIEW_DISABLED');
  return import('node:fs/promises');
}
async function directory() {
  const {resolve}=await import('node:path');
  return resolve(process.env.KA_PREVIEW_DIR || `${process.cwd()}/.local`);
}
export async function withPreview<T>(fn:(state:PreviewState)=>T|Promise<T>, write=false):Promise<T> {
  const fs=await files(); const dir=await directory(); await fs.mkdir(dir,{recursive:true});
  const lockPath=`${dir}/preview.lock`; let lock:Awaited<ReturnType<typeof fs.open>>|undefined;
  const deadline=Date.now()+5000;
  while(!lock) {
    try { lock=await fs.open(lockPath,'wx'); }
    catch(error) { if((error as NodeJS.ErrnoException).code!=='EEXIST')throw error;const stat=await fs.stat(lockPath).catch(()=>null);if(stat&&Date.now()-stat.mtimeMs>60000){await fs.unlink(lockPath).catch(()=>undefined);continue;}if(Date.now()>deadline)throw new HttpError(503,'Önizleme meşgul; tekrar deneyin.','BUSY'); await new Promise(resolve=>setTimeout(resolve,20)); }
  }
  try {
    let state:PreviewState;
    try { state=JSON.parse(await fs.readFile(`${dir}/preview.json`,'utf8')) as PreviewState; }
    catch(error) {
      if((error as NodeJS.ErrnoException).code!=='ENOENT')throw new HttpError(503,'Yerel veri dosyası okunamadı; dosyayı silmeden yedekleyin.','LOCAL_DATA');
      const {seedListings,officeSettings}=await import('../seed');
      state={listings:seedListings.map(listing=>({...listing,draft:null})),settings:structuredClone(officeSettings),inquiries:[],sessions:{},media:[],rates:{}};
    }
    const result=await fn(state);
    if(write) { const temp=`${dir}/preview-${crypto.randomUUID()}.tmp`; await fs.writeFile(temp,JSON.stringify(state)); await fs.rename(temp,`${dir}/preview.json`); }
    return result;
  } finally { await lock.close(); await fs.unlink(lockPath); }
}
export async function writeLocalAsset(id:string,data:Uint8Array) { if(!/^[a-f0-9-]{36}$/.test(id))throw new HttpError(400,'Geçersiz dosya.'); const fs=await files();const dir=await directory();await fs.mkdir(`${dir}/media`,{recursive:true});await fs.writeFile(`${dir}/media/${id}`,data); }
export async function readLocalAsset(id:string) { if(!/^[a-f0-9-]{36}$/.test(id))throw new HttpError(404,'Fotoğraf bulunamadı.'); const fs=await files();const dir=await directory();try{return new Uint8Array(await fs.readFile(`${dir}/media/${id}`));}catch{throw new HttpError(404,'Fotoğraf bulunamadı.');} }
export async function deleteLocalAsset(id:string) { if(!/^[a-f0-9-]{36}$/.test(id))throw new HttpError(400,'Geçersiz dosya.');const fs=await files();const dir=await directory();await fs.rm(`${dir}/media/${id}`,{force:true}); }
