import type { APIContext } from 'astro';
import { importX509, jwtVerify } from 'jose';
import { isPreview, setting, type ServerLocals } from './env';
import { HttpError } from './http';
import { withPreview } from './preview';

const COOKIE='ka_admin';
const CERT_URL='https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
export type KeyLoader=(kid:string)=>Promise<CryptoKey>;
async function googleKey(kid:string):Promise<CryptoKey> {
  const cache = 'caches' in globalThis ? (globalThis.caches as CacheStorage & {default?:Cache}).default : undefined;
  let response = await cache?.match(CERT_URL);
  if(!response) { response=await fetch(CERT_URL,{signal:AbortSignal.timeout(10_000)}); if(!response.ok)throw new HttpError(503,'Giriş doğrulama servisine erişilemiyor.','AUTH_UNAVAILABLE'); if(cache)await cache.put(CERT_URL,response.clone()); }
  const certificates=await response.json() as Record<string,string>;
  const cert=certificates[kid]; if(!cert)throw new HttpError(401,'Oturum yenilenmeli.','AUTH_INVALID');
  return importX509(cert,'RS256');
}
export async function verifyFirebaseToken(token:string, projectId:string, adminUid:string, keyLoader:KeyLoader=googleKey) {
  if(!projectId || !adminUid)throw new HttpError(503,'Yönetici girişi henüz bağlanmadı.','AUTH_NOT_CONFIGURED');
  if(token.length>12000)throw new HttpError(401,'Geçersiz oturum.','AUTH_INVALID');
  try {
    const result=await jwtVerify(token,async header=> {
      if(header.alg!=='RS256'||!header.kid)throw new Error('Invalid key');return keyLoader(header.kid);
    },{algorithms:['RS256'],issuer:`https://securetoken.google.com/${projectId}`,audience:projectId,requiredClaims:['exp','iat','auth_time','sub'],clockTolerance:5});
    const {payload}=result; const now=Math.floor(Date.now()/1000);
    if(typeof payload.iat!=='number'||payload.iat>now+5||typeof payload.auth_time!=='number'||payload.auth_time>now+5||!payload.sub||payload.sub!==adminUid)throw new HttpError(403,'Bu hesabın yönetici yetkisi yok.','FORBIDDEN');
    return {uid:payload.sub,expires:payload.exp!};
  } catch(error) {
    if(error instanceof HttpError)throw error;
    throw new HttpError(401,'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.','AUTH_INVALID');
  }
}
async function digest(token:string) {return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),x=>x.toString(16).padStart(2,'0')).join('');}
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
  return verifyFirebaseToken(token,setting(locals,'FIREBASE_PROJECT_ID'),setting(locals,'ADMIN_UID'));
}
export async function startSession(context:APIContext, body:{preview?:boolean;token?:string}) {
  const locals=context.locals as ServerLocals;let token:string;let expires:number;
  if(body.preview) {
    if(!isPreview(locals))throw new HttpError(403,'Önizleme girişi yalnız yerel geliştirmede açıktır.','PREVIEW_DISABLED');
    token=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');expires=Math.floor(Date.now()/1000)+8*3600;
    const key=await digest(token);await withPreview(state=>{state.sessions=Object.fromEntries(Object.entries(state.sessions).filter(([,until])=>until>Date.now()));state.sessions[key]=expires*1000;},true);
  } else {
    token=body.token??'';const result=await verifyFirebaseToken(token,setting(locals,'FIREBASE_PROJECT_ID'),setting(locals,'ADMIN_UID'));expires=result.expires;
  }
  context.cookies.set(COOKIE,token,{httpOnly:true,secure:!isPreview(locals),sameSite:'strict',path:'/',maxAge:Math.max(1,expires-Math.floor(Date.now()/1000))});
}
export async function endSession(context:APIContext) {
  const token=context.cookies.get(COOKIE)?.value;
  if(token&&isPreview(context.locals as ServerLocals)){const key=await digest(token);await withPreview(state=>{delete state.sessions[key];},true);}
  context.cookies.delete(COOKIE,{path:'/'});
}
