# Proje araçları

Bu proje için Motion, UI UX Pro Max ve 21st.dev kurulmuştur. Kullanıcı web sitesinin bu üç araçtan yararlanılarak hazırlanmasını istemektedir.

- UI/UX işlerinde `.agents/skills/ui-ux-pro-max/SKILL.md` dosyasını okuyup tasarım aramasını kullan.
- Animasyon işlerinde `.agents/skills/motion/SKILL.md` dosyasını ve ilgili rehberini oku.
- Motion kütüphanesi `motion` paketidir. React seçilirse React API'si `motion/react` üzerinden kullanılır.
- 21st.dev, `21st` adlı MCP bağlantısı üzerinden kullanılabilir; Codex OAuth girişi tamamlandı. CLI oturumu MCP oturumundan ayrıdır.
- Motion'un ücretsiz MCP bağlantısı `https://mcp.motion.dev` adresindedir ve belge araması hesap gerektirmez.
- Kullanıcının tercihi ücretsiz araçlardır. Ücretli Motion+ özelliklerini veya 21st AI kredilerini kullanıcı ayrıca istemeden kullanma.

## Python

Bu bilgisayarda sistemdeki `python` kısayolu çalışmıyor. UI UX Pro Max aramaları için mevcut Python ortamını kullan:

```powershell
& 'C:\Users\KeremInternal\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -X utf8 '.agents/skills/ui-ux-pro-max/scripts/search.py' 'real estate' --design-system --json
```

## Mevcut aşama

KA EMLAK sitesi Astro + React ile yazılmıştır; canlı servis hesapları (Cloudflare, Supabase, Firebase) henüz bağlanmamıştır. Kurulum `docs/DEPLOYMENT.md`, örnek ilan kaynakları `docs/KAYNAKLAR.md` içindedir.

- Ziyaretçi sayfaları `src/pages`, yönetim paneli `src/components/admin/AdminApp.tsx` (`/yonetim`).
- Panelin önceliği ilan eklemenin çok kolay olmasıdır: dokunarak seçim, otomatik başlık/açıklama önerisi (`src/lib/listing-helpers.ts`), benzer ilandan başlama ve telefonda ana ekrana ekleme (`public/yonetim.webmanifest`). Listede her ilanın durumuna göre tek bir ana düğmesi vardır (Kontrol et / Yayınla / Yayından kaldır / Yeniden yayınla); yayından kaldırma ve çöp kutusu bildirimdeki "Geri al" ile geri döner; kontrol bekleyen taslaklar "Kontrole başla" ile sırayla açılır.
- Ana sayfa girişi ilanlardan bağımsız şehir fotoğrafıdır (`antalya-konyaalti*.webp`, Unsplash). Girişe ilan fotoğrafı koyma; çizim/illüstrasyon ve ilan fotoğrafı slaytı kullanıcı tarafından reddedildi. Harita yalnız İlanlar sayfasında (Liste/Harita, `?gorunum=harita`). Favoriler özelliği kaldırıldı. Varsayılan paylaşım görseli `public/images/og-default.png`.
- İlan fotoğrafları 1600 px (`29750-…-NN.webp`) ve kartlar için 640 px (`-sm.webp`) olarak `public/images`'tadır; kaynakları `sources.json`.
- hepsiemlak ve sahibinden'den tek tıkla aktarma: aynı yer imi iki portalda da çalışır. Yer imi `src/lib/bookmarklet.ts`, eşleme `src/lib/source-mapper.ts` (testli; iki portalda aynı mülkü `likelySame` bulur), sunucu `src/lib/server/source-import.ts` (`/api/admin/source/listing|photo`, öteki portaldaki ilan için `targetId`), panelde `SourceImportHint`/`SourceImportDialog`. Yer imi hepsiemlak ofis sayfasında tıklanırsa bütün ilanları okur ve panelde `SyncDialog` ile eşitler; karşılaştırma `src/lib/source-sync.ts` (testli). Ayrıntı `docs/DEPLOYMENT.md`. Portal API'leri kullanılmaz (kullanıcı istemedi); sunucudan ya da zamanlanmış işle otomatik tarama kurma (hepsiemlak bot doğrulaması gösterir). sahibinden tarayıcı denetimi gösterir; geçmeye çalışma, kaydedilmiş sayfa ya da örnek veriyle (`tests/fixtures`) dene.
- Harita Leaflet + OpenStreetMap ile yapılır (ücretsiz). Panelde konum isteğe bağlı işaretlenir; ziyaretçiye `publicListing()` ile ~100 m'ye yuvarlanmış konum ve yaklaşık daire gösterilir, tam nokta gönderilmez.
- hepsiemlak'taki 27 ilanın tamamı `data/import/hepsiemlak-tum-ilanlar.json` içindedir (panel yedek biçimi). Canlıda "Yedekten içe aktar" ile taslak olarak eklenir, "Hepsini yayınla" ile tek seferde yayına alınır. Kaynaklar ve kontrol notları `docs/KAYNAKLAR.md`'de. hepsiemlak sayfaları komut satırından 403 verir; bot korumasını aşmaya çalışma.
- Komutlar `node scripts/run.mjs <dev|build|test|preview>` ile çalışır. `check` görevi TypeScript 7 ile uyumsuzdur; tip kontrolü için `node node_modules/typescript/bin/tsc --noEmit -p .` kullan.
- Yerel geliştirmede panel `.local/` altındaki örnek veriyle açılır ("Önizleme panelini aç").
