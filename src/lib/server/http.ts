import { z } from 'zod';

export class HttpError extends Error {
  constructor(public status: number, message: string, public code = 'REQUEST_FAILED', public details?: unknown) { super(message); }
}
export function json(value: unknown, status = 200, headers?: HeadersInit) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });
}
export function apiError(error: unknown): Response {
  if (error instanceof HttpError) return json({ error: error.message, code: error.code, details: error.details }, error.status);
  if (error instanceof z.ZodError) return json({ error: 'Lütfen işaretli alanları kontrol edin.', code: 'VALIDATION', details: error.flatten() }, 400);
  console.error(JSON.stringify({ event: 'api_failure', type: error instanceof Error ? error.name : 'unknown' }));
  return json({ error: 'İşlem tamamlanamadı. Lütfen tekrar deneyin.', code: 'INTERNAL' }, 500);
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get('Origin');
  const expected = new URL(request.url).origin;
  if (!origin || origin !== expected || request.headers.get('Sec-Fetch-Site') === 'cross-site') throw new HttpError(403, 'Bu işlem bu siteden başlatılmalıdır.', 'ORIGIN');
}
export async function boundedBody(request: Request, max = 256_000): Promise<Uint8Array<ArrayBuffer>> {
  const declared = Number(request.headers.get('Content-Length') || 0);
  if (declared > max) throw new HttpError(413, 'Dosya veya istek çok büyük.', 'TOO_LARGE');
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > max) { await reader.cancel(); throw new HttpError(413, 'Dosya veya istek çok büyük.', 'TOO_LARGE'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const output = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.length; }
  return output;
}
export async function bodyJson(request: Request, max?: number): Promise<unknown> {
  try { return JSON.parse(new TextDecoder().decode(await boundedBody(request, max))); }
  catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, 'Geçerli bir JSON isteği gönderin.', 'INVALID_JSON'); }
}
export function requestVersion(value: unknown) { return z.number().int().positive().parse(value); }
