import type { APIRoute } from 'astro';
import { getPublicData } from '../lib/server/data';
import type { ServerLocals } from '../lib/server/env';
import { alternates, localePath, locales } from '../i18n';
const escape = (value: string) => value.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]!));
export const GET: APIRoute = async ({ locals, url }) => {
  const data = await getPublicData(locals as ServerLocals);
  if (!data.available || data.mode === 'preview') return new Response('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>', { headers: { 'Content-Type': 'application/xml' } });
  const paths = ['/', '/ilanlar', '/donemlik-kiralik', '/yatirim', '/kat-karsiligi', '/kentsel-donusum', '/arsa-degerleme', '/hakkimizda', '/iletisim', '/gizlilik', '/cerezler', '/kvkk', ...data.listings.map(l => `/ilan/${l.slug}`)];
  // Her sayfa üç dilde ayrı bir kayıttır; her kayıt üç dilin karşılıklarını (hreflang) taşır.
  const entry = (path: string) => alternates(path, url.origin).map(link => `<xhtml:link rel="alternate" hreflang="${link.locale}" href="${escape(link.href)}"/>`).join('');
  const urls = paths.flatMap(path => { const links = entry(path); return locales.map(locale => `<url><loc>${escape(new URL(localePath(locale, path), url.origin).href)}</loc>${links}</url>`); });
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-store' } });
};
