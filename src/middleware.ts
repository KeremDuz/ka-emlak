import { defineMiddleware } from 'astro:middleware';
import { databaseReady, isLoopback, setting, type ServerLocals } from './lib/server/env';

export const onRequest=defineMiddleware(async(context,next)=>{
  const locals=context.locals as ServerLocals;
  try {const platform=await import('cloudflare:workers');locals.env=platform.env as Record<string,unknown>;}catch{locals.env={};}
  locals.preview=import.meta.env.DEV&&isLoopback(context.url)&&setting(locals,'DEV_PREVIEW')!=='off'&&!databaseReady(locals);
  const response=await next();
  response.headers.set('X-Content-Type-Options','nosniff');response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');response.headers.set('X-Frame-Options','DENY');
  response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  if(context.url.pathname.startsWith('/api/admin')||context.url.pathname.startsWith('/panel'))response.headers.set('Cache-Control','no-store');
  return response;
});
