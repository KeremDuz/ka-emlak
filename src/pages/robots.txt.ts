import type { APIRoute } from 'astro';
// Sitemap adresi SITE_URL'den (astro.config site) gelir; tanımsızsa (yerel varsayılan) isteğin kendi adresi kullanılır.
export const GET: APIRoute = ({ url, site }) => {
  const origin = site && !/^(localhost|127\.|\[::1\])/.test(site.hostname) ? site.origin : url.origin;
  return new Response(`User-agent: *\nAllow: /\nDisallow: /yonetim\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
