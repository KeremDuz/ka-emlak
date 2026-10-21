import { beforeAll, describe, expect, it } from 'vitest';
import { generateKeyPair, SignJWT } from 'jose';
import { verifyFirebaseToken } from '../src/lib/server/auth';

let keys:Awaited<ReturnType<typeof generateKeyPair>>;
beforeAll(async()=>{keys=await generateKeyPair('RS256');});
async function token(overrides:Record<string,unknown>={}){const now=Math.floor(Date.now()/1000);return new SignJWT({auth_time:now-10,...overrides}).setProtectedHeader({alg:'RS256',kid:'trusted-key'}).setIssuer('https://securetoken.google.com/ka-project').setAudience('ka-project').setSubject('office-admin').setIssuedAt(now-10).setExpirationTime(now+3600).sign(keys.privateKey);}
describe('Firebase single-office authorization',()=>{
 it('accepts a cryptographically signed token only for the configured project and UID',async()=>{
  const jwt=await token();await expect(verifyFirebaseToken(jwt,'ka-project','office-admin',async()=>keys.publicKey)).resolves.toMatchObject({uid:'office-admin'});
  await expect(verifyFirebaseToken(jwt,'different-project','office-admin',async()=>keys.publicKey)).rejects.toMatchObject({status:401});
  await expect(verifyFirebaseToken(jwt,'ka-project','different-admin',async()=>keys.publicKey)).rejects.toMatchObject({status:403});
 });
 it('rejects a forged token, future authentication time and missing live configuration',async()=>{
  const jwt=await token();const pieces=jwt.split('.');pieces[1]=btoa(JSON.stringify({sub:'office-admin'}));await expect(verifyFirebaseToken(pieces.join('.'),'ka-project','office-admin',async()=>keys.publicKey)).rejects.toMatchObject({status:401});
  await expect(verifyFirebaseToken(await token({auth_time:Math.floor(Date.now()/1000)+3600}),'ka-project','office-admin',async()=>keys.publicKey)).rejects.toMatchObject({status:403});
  await expect(verifyFirebaseToken(jwt,'','',async()=>keys.publicKey)).rejects.toMatchObject({status:503});
 });
});
