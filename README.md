# İshak Emlak

Web sitesi geliştirmeye hazırlık için tasarım ve animasyon araçları kurulmuştur.

| Araç | Kurulum |
| --- | --- |
| Motion | `motion@14.4.0` kütüphanesi, yerel Motion becerisi ve ücretsiz belge bağlantısı |
| UI UX Pro Max | `ui-ux-pro-max-cli@2.15.0` ve Codex tasarım becerisi |
| 21st.dev | `@21st-dev/cli@1.18.0` ve OAuth ile giriş yapılmış Codex MCP bağlantısı |

`motion-ai@14.2.0` resmî kurulum aracı da geliştirme bağımlılığı olarak eklenmiştir.

## Durum

- Motion kütüphanesi yükleme kontrolünden geçti.
- Motion belge sunucusuna erişim doğrulandı.
- UI UX Pro Max'in UX ve emlak tasarım aramaları çalıştırıldı.
- 21st.dev, Codex bağlantısı için başarılı OAuth girişi bildirdi.
- Paket denetiminde bilinen güvenlik açığı bildirilmedi.

Yeni beceriler sonraki Codex mesajında keşfedilebilir. MCP araçları görünmezse uygulamanın MCP bağlantılarını yeniden başlat.

Ücretli üyelik veya kredi satın alınmadı.

## Site

KA EMLAK sitesi ve yönetim paneli (`/yonetim`) yazılmıştır; canlı hesaplar henüz bağlanmamıştır (bkz. `docs/DEPLOYMENT.md`).

```powershell
node scripts/run.mjs dev     # http://127.0.0.1:4321
node scripts/run.mjs test
node scripts/run.mjs build   # Cloudflare derlemesi
```

Yerelde panel, "Önizleme panelini aç" ile `.local/` altındaki örnek veriyle açılır. İlan ekleme akışı telefonla kullanılmak üzere tasarlanmıştır: seçenekler dokunarak seçilir, başlık ve açıklama bilgilerden önerilir, benzer bir ilandan başlanabilir ve panel telefonda ana ekrana eklenebilir.

## Bağımlılıkları yeniden yükleme

```powershell
npm ci
```

21st CLI'nin doğrudan kullanımı kendi `login` oturumunu gerektirebilir. Codex bağlantısı ayrıca OAuth ile doğrulanmıştır; proje dosyalarında erişim anahtarı tutulmaz.
