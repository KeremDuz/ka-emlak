import { describe, expect, it, vi } from 'vitest';
import { SignJWT } from 'jose';
import { verifySupabaseToken, type Fetcher } from '../src/lib/server/auth';

const settings = { url: 'https://proje.supabase.co', publishableKey: 'sb_publishable_test', adminUid: 'office-admin' };
const secret = new TextEncoder().encode('test-secret');
let counter = 0;
// Her test kendi anahtarını üretir; doğrulama önbelleği testleri birbirine karıştırmaz.
const token = (expiresIn = 3600) => new SignJWT({ n: ++counter }).setProtectedHeader({ alg: 'HS256' }).setSubject('whoever').setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn).sign(secret);
const supabase = (status: number, body: unknown): Fetcher => vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

describe('Supabase single-office authorization', () => {
  it('accepts a session Supabase confirms, only for the configured admin', async () => {
    const jwt = await token(); const fetcher = supabase(200, { id: 'office-admin' });
    await expect(verifySupabaseToken(jwt, settings, fetcher)).resolves.toMatchObject({ uid: 'office-admin' });
    expect(fetcher).toHaveBeenCalledWith('https://proje.supabase.co/auth/v1/user', expect.objectContaining({ headers: { apikey: 'sb_publishable_test', Authorization: `Bearer ${jwt}` } }));
    await expect(verifySupabaseToken(await token(), settings, supabase(200, { id: 'someone-else' }))).rejects.toMatchObject({ status: 403 });
  });
  it('never trusts the token contents on their own', async () => {
    // Anahtarın içinde ne yazarsa yazsın, Supabase reddederse giriş yoktur.
    const forged = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject('office-admin').setExpirationTime(Math.floor(Date.now() / 1000) + 3600).sign(new TextEncoder().encode('attacker'));
    await expect(verifySupabaseToken(forged, settings, supabase(401, { msg: 'invalid JWT' }))).rejects.toMatchObject({ status: 401 });
    await expect(verifySupabaseToken('not-a-token', settings, supabase(200, { id: 'office-admin' }))).rejects.toMatchObject({ status: 401 });
    await expect(verifySupabaseToken(await token(), settings, supabase(200, {}))).rejects.toMatchObject({ status: 401 });
  });
  it('rejects expired sessions without asking and reports an unreachable service', async () => {
    const fetcher = supabase(200, { id: 'office-admin' });
    await expect(verifySupabaseToken(await token(-60), settings, fetcher)).rejects.toMatchObject({ status: 401 });
    expect(fetcher).not.toHaveBeenCalled();
    await expect(verifySupabaseToken(await token(), settings, supabase(500, {}))).rejects.toMatchObject({ status: 503 });
    await expect(verifySupabaseToken(await token(), settings, vi.fn(async () => { throw new Error('offline'); }))).rejects.toMatchObject({ status: 503 });
  });
  it('accepts every admin in a comma-separated list, and nobody else', async () => {
    const two = { ...settings, adminUid: 'office-admin, second-admin' };
    await expect(verifySupabaseToken(await token(), two, supabase(200, { id: 'second-admin' }))).resolves.toMatchObject({ uid: 'second-admin' });
    await expect(verifySupabaseToken(await token(), two, supabase(200, { id: 'office-admin' }))).resolves.toMatchObject({ uid: 'office-admin' });
    await expect(verifySupabaseToken(await token(), two, supabase(200, { id: 'admin' }))).rejects.toMatchObject({ status: 403 });
    await expect(verifySupabaseToken(await token(), { ...settings, adminUid: ' , ' }, supabase(200, { id: '' }))).rejects.toMatchObject({ status: 401 });
  });
  it('refuses to work until the admin is configured', async () => {
    await expect(verifySupabaseToken(await token(), { ...settings, adminUid: '' }, supabase(200, { id: 'office-admin' }))).rejects.toMatchObject({ status: 503 });
  });
  it('asks Supabase once for repeated requests with the same session', async () => {
    const jwt = await token(); const fetcher = supabase(200, { id: 'office-admin' });
    await verifySupabaseToken(jwt, settings, fetcher); await verifySupabaseToken(jwt, settings, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
