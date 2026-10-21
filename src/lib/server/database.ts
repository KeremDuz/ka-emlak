import type { ServerLocals } from './env';
import { setting } from './env';
import { HttpError } from './http';

export async function supabase<T>(locals:ServerLocals,path:string,init:RequestInit={},privileged=true):Promise<T> {
  const base=setting(locals,'SUPABASE_URL').replace(/\/$/,'');const key=setting(locals,privileged?'SUPABASE_SECRET_KEY':'SUPABASE_PUBLISHABLE_KEY');
  if(!base||!key)throw new HttpError(503,'Veritabanı bağlantısı henüz kurulmadı.','DATABASE_NOT_CONFIGURED');
  const url=new URL(base);if(url.protocol!=='https:' && !(import.meta.env.DEV && ['localhost','127.0.0.1'].includes(url.hostname)))throw new HttpError(503,'Veritabanı adresi güvenli değil.','CONFIG');
  const headers=new Headers(init.headers);headers.set('apikey',key);if(key.startsWith('eyJ'))headers.set('Authorization',`Bearer ${key}`);
  if(init.body && !(init.body instanceof Uint8Array) && !headers.has('Content-Type'))headers.set('Content-Type','application/json');
  let response:Response;
  try{response=await fetch(`${base}${path}`,{...init,headers,signal:AbortSignal.timeout(15000)});}catch{throw new HttpError(503,'Veritabanına erişilemiyor. Bağlantıyı kontrol edin.','DATABASE_UNAVAILABLE');}
  if(!response.ok){
    const error=await response.json().catch(()=>({})) as {message?:string;code?:string};
    if(response.status===409||error.message==='VERSION_CONFLICT')throw new HttpError(409,'İlan başka bir sekmede değişti. Son sürümü yeniden yükleyin.','VERSION_CONFLICT');
    if(error.message==='STORAGE_QUOTA')throw new HttpError(413,'Fotoğraf alanının %90 sınırına ulaşıldı. Önce kullanılmayan fotoğrafları silin.','STORAGE_QUOTA');
    if(error.message==='PHOTO_LIMIT')throw new HttpError(422,'Bir ilana en fazla 12 fotoğraf ekleyebilirsiniz.','PHOTO_LIMIT');
    if(error.message==='RATE_LIMIT')throw new HttpError(429,'Çok fazla istek gönderildi. Biraz sonra tekrar deneyin.','RATE_LIMIT');
    if(response.status===404)throw new HttpError(404,'Kayıt bulunamadı.','NOT_FOUND');
    console.error(JSON.stringify({event:'supabase_failure',status:response.status,code:error.code}));
    throw new HttpError(503,'Kayıt servisi şu anda kullanılamıyor. Verileriniz değiştirilmedi.','DATABASE_UNAVAILABLE');
  }
  if(response.status===204)return undefined as T;
  return response.json() as Promise<T>;
}
export function rpc<T>(locals:ServerLocals,name:string,payload:Record<string,unknown>){return supabase<T>(locals,`/rest/v1/rpc/${name}`,{method:'POST',body:JSON.stringify(payload)});}
export async function storageRequest(locals:ServerLocals,path:string,init:RequestInit={}) {
  const base=setting(locals,'SUPABASE_URL').replace(/\/$/,'');const key=setting(locals,'SUPABASE_SECRET_KEY');if(!base||!key)throw new HttpError(503,'Fotoğraf deposu bağlı değil.','STORAGE_NOT_CONFIGURED');
  const headers=new Headers(init.headers);headers.set('apikey',key);if(key.startsWith('eyJ'))headers.set('Authorization',`Bearer ${key}`);
  try {return await fetch(`${base}/storage/v1/${path}`,{...init,headers,signal:AbortSignal.timeout(20_000)});}catch{throw new HttpError(503,'Fotoğraf deposuna erişilemiyor.','STORAGE_UNAVAILABLE');}
}
