import type { ClientConfig } from '../types';

export interface ServerLocals {
  env?: Record<string, unknown>;
  preview?: boolean;
}
export function setting(locals: ServerLocals, name: string): string {
  const value = locals.env?.[name] ?? import.meta.env[name];
  return typeof value === 'string' ? value.trim() : '';
}
export function isLoopback(url: URL) {
  return ['localhost', '127.0.0.1', '[::1]', '::1'].includes(url.hostname);
}
export function isPreview(locals: ServerLocals) {
  return import.meta.env.DEV && locals.preview === true;
}
export function databaseReady(locals: ServerLocals) {
  return Boolean(setting(locals, 'SUPABASE_URL') && setting(locals, 'SUPABASE_PUBLISHABLE_KEY') && setting(locals, 'SUPABASE_SECRET_KEY'));
}
export function clientConfig(locals: ServerLocals): ClientConfig {
  // Publishable key tarayıcıya verilmek üzere tasarlanmıştır; gizli anahtar hiçbir zaman gönderilmez.
  const auth = { url: setting(locals, 'SUPABASE_URL'), publishableKey: setting(locals, 'SUPABASE_PUBLISHABLE_KEY') };
  return { mode: isPreview(locals) ? 'preview' : 'live', auth: auth.url && auth.publishableKey && setting(locals, 'ADMIN_UID') ? auth : null };
}
export function storageLimit(locals: ServerLocals) {
  const parsed = Number(setting(locals, 'STORAGE_LIMIT_BYTES') || 1_000_000_000);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1_000_000_000;
}
