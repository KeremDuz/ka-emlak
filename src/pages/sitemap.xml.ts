import type { APIRoute } from 'astro';
import { getPublicData } from '../lib/server/data';
import { filterListings } from '../lib/server/filters';
import { catalogOptions } from '../lib/listing-helpers';
import { slugify } from '../lib/format';
import type { ServerLocals } from '../lib/server/env';
import { alternates, localePath, locales } from '../i18n';
const escape = (value: string) => value.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]!));
export const GET: APIRoute = async ({ locals, url, site }) => {
  const data = await getPublicData(locals as ServerLocals);
  if (!data.available || data.mode === 'preview') return new Response('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>', { headers: { 'Content-Type': 'application/xml' } });
  const origin = site?.origin && !site.hostname.startsWith('localhost') ? site.origin : url.origin;
  // İlçe sayfaları yalnız o ilçede ilan varken listelenir.
  const districtPaths = (parent: string, filters: Record<string, string>) => catalogOptions(filterListings(data.listings, filters)).districts.map(name => `${parent}/${slugify(name)}`);
  const pages: { path: string; lastmod?: string }[] = [
    ...['/', '/ilanlar', '/satilik', '/kiralik', '/donemlik-kiralik', '/yatirim', '/kat-karsiligi', '/kentsel-donusum', '/arsa-degerleme', '/hakkimizda', '/iletisim', '/gizlilik', '/cerezler', '/kvkk'].map(path => ({ path })),
    ...districtPaths('/satilik', { transaction: 'sale' }).map(path => ({ path })),
    ...districtPaths('/kiralik', { transaction: 'rent', period: 'long' }).map(path => ({ path })),
    ...data.listings.map(l => ({ path: `/ilan/${l.slug}`, lastmod: (l.updatedAt || l.createdAt || '').slice(0, 10) || undefined })),
  ];
  // Her sayfa üç dilde ayrı bir kayıttır; her kayıt üç dilin karşılıklarını (hreflang) taşır.
  const entry = (path: string) => alternates(path, origin).map(link => `<xhtml:link rel="alternate" hreflang="${link.locale}" href="${escape(link.href)}"/>`).join('');
  const urls = pages.flatMap(({ path, lastmod }) => { const links = entry(path); return locales.map(locale => `<url><loc>${escape(new URL(localePath(locale, path), origin).href)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}${links}</url>`); });
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
