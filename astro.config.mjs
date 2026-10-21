import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  site: process.env.SITE_URL || 'http://localhost:4321',
  integrations: [react()],
  adapter: process.env.KA_BUILD_TARGET === 'cloudflare' ? cloudflare({ imageService: 'passthrough' }) : undefined,
  // Yerel önizleme verisi .local/ altına yazılır; izlenirse her kayıtta sayfa yeniden yüklenir.
  // Leaflet yalnız dinamik import edildiği için baştan paketlenir; yoksa ilk açılışta geliştirme sunucusu eski paketi ister.
  vite: { plugins: [tailwindcss()], server: { watch: { ignored: ['**/.local/**'] } }, optimizeDeps: { include: ['leaflet'] } },
  server: { host: '127.0.0.1', port: 4321 },
});
