import { defineMiddleware } from 'astro:middleware';
import { databaseReady, isLoopback, setting, type ServerLocals } from './lib/server/env';

const CSP_REPORT_ONLY=[
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://i0.shbdn.com https://*.shbdn.com https://*.hecdn.com https://*.hemlak.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://my.matterport.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

// Tek asıl adres: SITE_URL (astro.config site). Başka bir adresten (www., workers.dev) gelen istek
// ve http ile gelen istek aynı yola kalıcı olarak yönlendirilir; Google tek adresi dizinler. Yerel geliştirmede yönlendirme yapılmaz.
const canonical=(()=>{try{return new URL(import.meta.env.SITE);}catch{return null;}})();

export const onRequest=defineMiddleware(async(context,next)=>{
  if(canonical&&!isLoopback(canonical)&&!isLoopback(context.url)&&(context.url.host!==canonical.host||context.url.protocol!==canonical.protocol)){
    const target=new URL(context.url.pathname+context.url.search,canonical.origin);
    return new Response(null,{status:context.request.method==='GET'||context.request.method==='HEAD'?301:308,headers:{Location:target.href,'Cache-Control':'public, max-age=3600'}});
  }
  const locals=context.locals as ServerLocals;
  try {const platform=await import('cloudflare:workers');locals.env=platform.env as Record<string,unknown>;}catch{locals.env={};}
  locals.preview=import.meta.env.DEV&&isLoopback(context.url)&&setting(locals,'DEV_PREVIEW')!=='off'&&!databaseReady(locals);
  const response=await next();
  response.headers.set('X-Content-Type-Options','nosniff');response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');response.headers.set('X-Frame-Options','DENY');
  // Zorlayıcı değil, yalnız raporlayıcı: ihlaller tarayıcı konsoluna yazılır, hiçbir şey engellenmez. Temiz görününce zorlayıcıya çevrilebilir.
  response.headers.set('Content-Security-Policy-Report-Only',CSP_REPORT_ONLY);
  response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  // Tarayıcı siteyi bir yıl boyunca yalnız https ile açar.
  if(canonical?.protocol==='https:'&&!isLoopback(context.url))response.headers.set('Strict-Transport-Security','max-age=31536000');
  if(context.url.pathname.startsWith('/api/admin')||context.url.pathname.startsWith('/panel'))response.headers.set('Cache-Control','no-store');
  return response;
});
