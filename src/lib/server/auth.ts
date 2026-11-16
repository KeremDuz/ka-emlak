import type { APIContext } from 'astro';
import { decodeJwt } from 'jose';
import { isPreview, setting, type ServerLocals } from './env';
import { HttpError } from './http';
import { withPreview } from './preview';

const COOKIE='ka_admin';
export type Fetcher=(input:string,init?:RequestInit)=>Promise<Response>;
export interface AuthSettings { url:string; publishableKey:string; adminUid:string; }
// Doğrulanan oturum kısa süre bellekte tutulur; her panel isteğinde Supabase'e yeniden sorulmaz.
const verified=new Map<string,{uid:string;expires:number;until:number}>();
const CACHE_MS=60_000;
async function digest(token:string) {return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),x=>x.toString(16).padStart(2,'0')).join('');}

/**
 * Supabase oturum anahtarını Supabase'in kendisine doğrulatır (imza yöntemi projeden projeye değiştiği için yerelde çözülmez)
 * ve yalnız tek yöneticinin kimliğini kabul eder. Başka biri Supabase'de hesap açsa da panele giremez.
 */
export async function verifySupabaseToken(token:string, settings:AuthSettings, fetcher:Fetcher=fetch) {
  if(!settings.url||!settings.publishableKey||!settings.adminUid)throw new HttpError(503,'Yönetici girişi henüz bağlanmadı.','AUTH_NOT_CONFIGURED');
  if(!token||token.length>12000)throw new HttpError(401,'Geçersiz oturum.','AUTH_INVALID');
  const now=Date.now(); const key=await digest(`${settings.url}:${settings.adminUid}:${token}`);
  const cached=verified.get(key);
  if(cached&&cached.until>now&&cached.expires*1000>now)return {uid:cached.uid,expires:cached.expires};
  let expires:number;
  try { const claims=decodeJwt(token); if(typeof claims.exp!=='number')throw new Error('exp'); expires=claims.exp; }
  catch { throw new HttpError(401,'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.','AUTH_INVALID'); }
  if(expires*1000<=now)throw new HttpError(401,'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.','AUTH_INVALID');
  let response:Response;
  try { response=await fetcher(`${settings.url.replace(/\/+$/,'')}/auth/v1/user`,{headers:{apikey:settings.publishableKey,Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(10_000)}); }
  catch { throw new HttpError(503,'Giriş doğrulama servisine erişilemiyor.','AUTH_UNAVAILABLE'); }
  if(response.status===401||response.status===403)throw new HttpError(401,'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.','AUTH_INVALID');
  if(!response.ok)throw new HttpError(503,'Giriş doğrulama servisine erişilemiyor.','AUTH_UNAVAILABLE');
  const user=await response.json().catch(()=>null) as {id?:unknown}|null;
  if(!user||typeof user.id!=='string'||!user.id)throw new HttpError(401,'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.','AUTH_INVALID');
  // ADMIN_UID virgülle ayrılmış birden çok kullanıcı kimliği olabilir (ör. iki yetkili).
  if(!settings.adminUid.split(',').map(uid=>uid.trim()).filter(Boolean).includes(user.id))throw new HttpError(403,'Bu hesabın yönetici yetkisi yok.','FORBIDDEN');
  if(verified.size>200)verified.clear();
  verified.set(key,{uid:user.id,expires,until:now+CACHE_MS});
  return {uid:user.id,expires};
}
const authSettings=(locals:ServerLocals):AuthSettings=>({url:setting(locals,'SUPABASE_URL'),publishableKey:setting(locals,'SUPABASE_PUBLISHABLE_KEY'),adminUid:[setting(locals,'ADMIN_UID'),setting(locals,'ADMIN_UID2')].filter(Boolean).join(',')});

export async function requireAdmin(context:Pick<APIContext,'request'|'cookies'|'locals'>) {
  const locals=context.locals as ServerLocals;
  const authorization=context.request.headers.get('Authorization');
  const token=authorization?.startsWith('Bearer ')?authorization.slice(7):context.cookies.get(COOKIE)?.value;
  if(!token)throw new HttpError(401,'Devam etmek için giriş yapın.','UNAUTHORIZED');
  if(isPreview(locals)) {
    const key=await digest(token); const valid=await withPreview(state=>(state.sessions[key]??0)>Date.now());
    if(!valid)throw new HttpError(401,'Önizleme oturumu sona erdi.','UNAUTHORIZED');
    return {uid:'local-preview',expires:Math.floor(Date.now()/1000)+3600};
  }
  return verifySupabaseToken(token,authSettings(locals));
}
export async function startSession(context:APIContext, body:{preview?:boolean;token?:string}) {
  const locals=context.locals as ServerLocals;let token:string;let expires:number;
  if(body.preview) {
    if(!isPreview(locals))throw new HttpError(403,'Önizleme girişi yalnız yerel geliştirmede açıktır.','PREVIEW_DISABLED');
    token=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');expires=Math.floor(Date.now()/1000)+8*3600;
    const key=await digest(token);await withPreview(state=>{state.sessions=Object.fromEntries(Object.entries(state.sessions).filter(([,until])=>until>Date.now()));state.sessions[key]=expires*1000;},true);
  } else {
    token=body.token??'';const result=await verifySupabaseToken(token,authSettings(locals));expires=result.expires;
  }
  context.cookies.set(COOKIE,token,{httpOnly:true,secure:!isPreview(locals),sameSite:'strict',path:'/',maxAge:Math.max(1,expires-Math.floor(Date.now()/1000))});
}
export async function endSession(context:APIContext) {
  const token=context.cookies.get(COOKIE)?.value;
  if(token&&isPreview(context.locals as ServerLocals)){const key=await digest(token);await withPreview(state=>{delete state.sessions[key];},true);}
  context.cookies.delete(COOKIE,{path:'/'});
}
