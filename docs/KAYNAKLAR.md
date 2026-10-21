# KA EMLAK — önizleme verileri ve kaynak kaydı

İnceleme tarihi: **19 Ekim 2026**. Bu dosya yerel önizlemedeki bilgilerin nereden alındığını ve yayın öncesi hangi kontrollerin gerektiğini kaydeder. Bir ilan aktarım veya sürekli senkronizasyon hizmeti kurulmuş değildir.

## Yayın sınırı

- `src/lib/seed.ts`, yerel tasarım önizlemesi için **9 kaynak ilan kaydı** içerir. `status: 'published'` yalnızca önizleme görünürlüğü içindir; bu kayıtlar kendiliğinden canlı veritabanına veya yayına aktarılmamalıdır.
- Bütün kayıtlar `needsReview: true` taşır. Ofis fiyatı, güncel müsaitliği, fotoğraf kullanım yetkisini ve teknik bilgileri kontrol etmelidir.
- Kaynak web sayfaları arama aracının farklı tarihlerdeki kamuya açık görüntülerini içerebilir. İnceleme tarihi, ilanın güncellik garantisi değildir.
- `createdAt` ve `updatedAt`, önizleme paketinin hazırlanma tarihidir; asıl ilanın yayın tarihi olarak kullanılmamalıdır. Kaynakta görülen güncellenme tarihleri aşağıda ayrıca listelenmiştir.
- Fotoğrafsız genel portföy çağrısına başka bir taşınmazın fotoğrafı atanmadı. Kesin taşınmaz koordinatı alınmadı; mahalle bilgisi bir parselin tam konumu olarak gösterilmemelidir.

## Ofis bilgileri

Ana kaynak: [KA EMLAK ofis sayfası](https://www.hepsiemlak.com/emlak-ofisi/ka-emlak-29750).

- Marka: KA EMLAK. Danışman: İshak Kahraman. Genel konum: Konyaaltı / Antalya.
- Sayfada görünen Taşınmaz Ticareti Yetki Belgesi numarası: **0702648**. Belgenin güncel geçerliliği bağımsız olarak doğrulanmadı.
- İlan detaylarında açık görünen telefon: **0532 224 76 58**. Depo ilanının açıklamasında da aynı numara yazıyor. Önizleme için telefon ve WhatsApp alanları `+905322247658` olarak tanımlandı. Numaranın WhatsApp hesabı bağımsız olarak test edilmedi.
- Altınkale villa detayının üst bölümünde **0552 763 40 42** de bulunuyor; ofisin hangi numarayı ana iletişim hattı istediği yayın öncesi teyit edilmeli.
- Sokak adresi, e-posta adresi, çalışma saatleri ve Instagram hesabı doğrulanamadığından bu alanlar boş bırakıldı. Yalnızca doğrulanabilen genel konum yazıldı.
- Ofis sayfasındaki şirket tanıtım metni ile ilan detayındaki işletme unvanı farklıdır. Önizleme yalnızca marka ve danışman adını kullanır; hukuki şirket unvanı uydurulmadı.

## Kaynak ilanlar

| İlan | Detayda görülen tutar ve kapsam | Detay güncellemesi | Kaynak |
|---|---|---|---|
| 29750-166 — Altınkale villa | 32.000.000 TL; 4+1; 466 / 350 m² | 14.08.2026 | [İlan](https://www.hepsiemlak.com/antalya-dosemealti-altinkale-satilik/villa/29750-166) |
| 29750-172 — Arapsuyu daire | 14.500.000 TL; 4+1; 250 / 240 m² | 08.10.2026 | [İlan](https://www.hepsiemlak.com/antalya-konyaalti-arapsuyu-satilik/daire/29750-172) |
| 29750-112 — Çamyuva villa | Uzun dönem aylık 95.000 TL, **yıllık peşin**; 3+1; 350 / 300 m² | 28.09.2026 | [İlan](https://www.hepsiemlak.com/antalya-kemer-camyuva-kiralik/villa/29750-112) |
| 29750-181 — Yeni Emek dubleks | 5.450.000 TL; 3+2; 200 / 190 m² | 20.08.2026 | [İlan](https://www.hepsiemlak.com/antalya-kepez-yeni-emek-satilik/daire/29750-181) |
| 29750-197 — Liman daire | 29.000 TL; kiralık; 1+1; 50 / 45 m² | 28.08.2026 | [İlan](https://www.hepsiemlak.com/antalya-konyaalti-liman-kiralik/daire/29750-197) |
| 29750-118 — Geyikbayırı arsa | 1.890.000 TL; 600 m²; özel kullanım kategorisi | 14.08.2026 | [İlan](https://www.hepsiemlak.com/antalya-konyaalti-geyikbayiri-satilik/ozel-kullanim/29750-118) |
| 29750-193 — Öğretmenevleri ofis | Aylık 35.000 TL; 1+1 kullanım planı; 60 / 55 m² | 04.09.2026 | [İlan](https://www.hepsiemlak.com/antalya-konyaalti-ogretmenevleri-kiralik/ofis/29750-193) |
| 29750-189 — Altınova depo | Aylık 375.000 TL; 2.000 / 1.999 m² | 12.10.2026 | [İlan](https://www.hepsiemlak.com/antalya-kepez-altinova-sinan-kiralik/depo/29750-189) |
| 29750-179 — Kat karşılığı portföy çağrısı | Sayısal fiyat yok; kaynak alanı 10.000 m²; tek somut parsel olarak doğrulanmadı | 22.09.2026 | [İlan](https://www.hepsiemlak.com/antalya-konyaalti-hurma-kat-karsiligi-satilik/imarli-konut/29750-179) |

### Özellikle kontrol edilmesi gereken farklılıklar

- Arapsuyu kaydının ofis kartı 15.000.000 TL, detay sayfası 14.500.000 TL gösteriyor. Önizlemede detay tutarı kullanıldı.
- Yeni Emek kaydının ofis kartı 5.400.000 TL, detay sayfası 5.450.000 TL gösteriyor. Önizlemede detay tutarı kullanıldı.
- Çamyuva ofis kartında 14.000 TL ve günlük 300 € başlığı bulunurken detayda günlük 12.000 TL ve yıllık peşin kiralamada aylık 95.000 TL bilgileri var. Önizlemede koşulu açıklanmış aylık seçenek kullanıldı. Günlük/haftalık tutar ve dönem doğrulanmadan otomatik fiyat dönüşümü yapılmamalı.
- Liman kira bedelinin aylık olduğu önizleme için varsayıldı; teslim tarihi ve dönem onay bekliyor. Açıklama ve özelliklerde mevcut kullanım durumu kiracılıdır.
- Geyikbayırı açıklamasında araç takası geçerken özelliklerde “Takas: Hayır” yazıyor. Arsa kategorisi “Özel Kullanım”; imar ve kullanım hakları resmî belgelerle kontrol edilmeli.
- Kat karşılığı kaydının kategorisi kat karşılığı olmasına rağmen özelliklerde “Kat Karşılığı: Hayır” yazıyor. Açıklama Antalya genelindeki kapalı portföylere çağrıdır; 10.000 m² tek bir kesin parseli temsil ediyor kabul edilmedi.
- Altınkale açıklamasında A ve B blok ile 978 m² arsa payı geçiyor. Bir villa için kesin özel arsa alanı olarak ayrıca tanımlanmadı.
- Ofis listesinde bulunmasına rağmen detayı başka sonuç sayfasına yönlenen ilanlar önizlemeye alınmadı.

## İkinci aktarım: 20 ilan (21 Ekim 2026)

Ofis sayfasında **27 ilan** vardı. Önizlemedeki 9 kayıttan 7’si hâlâ yayında; bunlar güncel fotoğraflarıyla, kalan 20 ilanla birlikte **`data/import/hepsiemlak-tum-ilanlar.json`** dosyasında toplandı (27 ilan). Dosya panelin yedek biçimindedir: **Yönetim paneli → Portföyüm → ⋯ → Yedekten içe aktar** ile yüklenir; ilanlar kontrol bekleyen taslak olarak eklenir ve **“Hepsini yayınla”** ile tek seferde yayına alınır. Yerel önizlemede bu yol izlendi ve 27 ilan yayında.

- Güncellemede değişenler: 29750-181 fiyatı 5.450.000 → **5.990.000 TL**. 29750-112 kaynakta artık 7.000 TL (günlük) görünüyor; açıklamadaki “yıllık peşin kiralamada aylık 95.000 TL” korunarak aylık fiyat bırakıldı. 29750-179’a kaynaktaki tanıtım görseli eklendi.
- İçe aktarma “öne çıkan” işaretini sıfırlar; ana sayfada gösterilecek ilanlar panelde ⋯ → “Ana sayfada öne çıkar” ile seçilir.

- Veriler hepsiemlak ilan sayfalarından tarayıcı oturumunda okundu; otomatik veya sürekli senkronizasyon kurulmadı.
- Başlıklar sitenin üslubuna göre yeniden yazıldı; kaynak başlık her ilanın `sourceUrl` bağlantısında görülebilir. Açıklamalar kaynak metindir, yalnız Markdown işaretleri ve tekrarlanan satırlar temizlendi.
- Fotoğraflar (87 adet, ilan başına en fazla 6) `public/images/29750-<no>-NN.webp` olarak 1200 px genişliğe küçültüldü; kaynak adresleri `public/images/sources.json` içinde. Üzerlerinde ofisin “KA Global” logosu ve ilan numarası bulunuyor; filigransız asılları varsa panelden değiştirilmesi önerilir. Fotoğraf kullanım yetkisi ofis tarafından teyit edilmelidir.
- 9 ilan somut bir mülk değil, kat karşılığı / arsa arama çağrısı veya hizmet ilanıdır (180, 153, 151, 152, 178, 170, 168, 177, 176). Fiyatsız, “Kat karşılığı” türünde alındı. Önizlemedeki 29750-179 ile aynı amaçtadırlar; sitede hepsinin ayrı ilan olarak mı, tek bir “Arsa sahiplerine” sayfasında mı gösterileceğine ofis karar vermelidir.
- Önizlemedeki **29750-197** (Liman 1+1 kiralık) ve **29750-118** (Geyikbayırı arsa) artık ofis sayfasında görünmüyor; satılmış/kiralanmış veya kaldırılmış olabilir. 29750-201 aynı bölgede yeni bir Liman 1+1 kiralık ilanıdır.

- Somut mülk olan 10 ilana mahalle merkezinin yaklaşık konumu OpenStreetMap Nominatim ile eklendi (ziyaretçiye ~350 m daire olarak gösterilir). Döşemealtı Yeniköy (29750-141) eşleşmediği için ve arama/hizmet çağrıları gerçek bir parsele ait olmadığı için konumsuz bırakıldı. Ofis gerekirse panelde “Haritada işaretle” ile düzeltir.

| İlan | Tutar · alan | Kaynak güncelleme | Foto | Kaynak |
|---|---|---|---|---|
| 29750-200 — Duacı’da günlük kiralık, bahçeli 4+1 müstakil villa | 6.000 TL / gün · 250 m² | 06/10/2026 | 6 | [İlan](https://www.hepsiemlak.com/antalya-kepez-duaci-kiralik/villa/29750-200) |
| 29750-199 — Hurma’da site içinde, havuzlu 2+1 satılık daire | 6.500.000 TL · 100 m² | 05/10/2026 | 6 | [İlan](https://www.hepsiemlak.com/antalya-konyaalti-hurma-satilik/daire/29750-199) |
| 29750-201 — Liman’da doğalgazlı, iki klimalı kiralık 1+1 daire | 25.000 TL / ay · 60 m² | 27/09/2026 | 6 | [İlan](https://www.hepsiemlak.com/antalya-konyaalti-liman-kiralik/daire/29750-201) |
| 29750-195 — Kepez Baraj’da site içinde, havuz manzaralı 1+1 daire | 2.890.000 TL · 70 m² | 20/10/2026 | 6 | [İlan](https://www.hepsiemlak.com/antalya-kepez-baraj-satilik/daire/29750-195) |
| 29750-203 — Kuşkavağı’nda bahçeli, çift banyolu kiralık ofis | 42.000 TL / ay · 80 m² | 16/10/2026 | 6 | [İlan](https://www.hepsiemlak.com/antalya-konyaalti-kuskavagi-kiralik/ofis/29750-203) |
| 29750-198 — Hurma’da 3+1 satılık çatı dubleks daire | 8.995.000 TL · 140 m² | 12/10/2026 | 6 | [İlan](https://www.hepsiemlak.com/antalya-konyaalti-hurma-satilik/daire/29750-198) |
| 29750-192 — Atatürk Bulvarı’nda plaza içinde kiralık 2+1 ofis | 60.000 TL / ay · 100 m² | 06/10/2026 | 6 | [İlan](https://www.hepsiemlak.com/antalya-konyaalti-ogretmenevleri-kiralik/ofis/29750-192) |
| 29750-141 — Döşemealtı Yeniköy’de satılık komple bina | 20.000.000 TL · 125 m² | 15/09/2026 | 6 | [İlan](https://www.hepsiemlak.com/antalya-dosemealti-yenikoy-satilik/bina/29750-141) |
| 29750-186 — Fevzi Çakmak’ta sıfır binada 250 m² 4+1 dubleks | 6.600.000 TL · 250 m² | 08/09/2026 | 6 | [İlan](https://www.hepsiemlak.com/antalya-kepez-fevzi-cakmak-satilik/daire/29750-186) |
| 29750-190 — Hisarçandır’da özel havuzlu, günlük kiralık villa | Görüşme ile · 250 m² | 16/08/2026 | 6 | [İlan](https://www.hepsiemlak.com/antalya-konyaalti-hisarcandir-kiralik/villa/29750-190) |
| 29750-180 — Arsanıza özel hafif çelik villa yapımı | Görüşme ile · 10.000 m² | 06/10/2026 | 6 | [İlan](https://www.hepsiemlak.com/antalya-konyaalti-ogretmenevleri-kat-karsiligi-satilik/bahce/29750-180) |
| 29750-153 — Döşemealtı’nda kat karşılığı veya satılık arsa arıyoruz | Görüşme ile · 500 m² | 22/09/2026 | 3 | [İlan](https://www.hepsiemlak.com/antalya-dosemealti-bahceyaka-kat-karsiligi-satilik/imarli-konut/29750-153) |
| 29750-151 — Antalya genelinde 400–2.000 m² arsa arıyoruz | Görüşme ile · 2.000 m² | 26/09/2026 | 2 | [İlan](https://www.hepsiemlak.com/antalya-konyaalti-ogretmenevleri-satilik/imarli-konut/29750-151) |
| 29750-152 — Muratpaşa ve Konyaaltı’nda yatırımlık arsa arıyoruz | Görüşme ile · 1.000 m² | 26/09/2026 | 1 | [İlan](https://www.hepsiemlak.com/antalya-muratpasa-kircami-satilik/konutticaret/29750-152) |
| 29750-194 — Varsak Karşıyaka’da 3 katlı, geniş cepheli satılık dükkan | 7.200.000 TL · 125 m² | 21/08/2026 | 6 | [İlan](https://www.hepsiemlak.com/antalya-kepez-varsak-karsiyaka-satilik/atolye/29750-194) |
| 29750-178 — Kepez’de kentsel dönüşüme hazır blok nizam arsa | Görüşme ile · 7.000 m² | 26/09/2026 | 3 | [İlan](https://www.hepsiemlak.com/antalya-kepez-cankaya-kat-karsiligi-satilik/imarli-konut/29750-178) |
| 29750-170 — Konyaaltı’nda komple bina kentsel dönüşüm ve kat karşılığı | Görüşme ile · 800 m² | 26/09/2026 | 2 | [İlan](https://www.hepsiemlak.com/antalya-konyaalti-altinkum-kat-karsiligi-satilik/imarli-konut/29750-170) |
| 29750-168 — Konyaaltı’nda 7 kat imarlı, 800 m² kat karşılığı arsa | Görüşme ile · 800 m² | 26/09/2026 | 2 | [İlan](https://www.hepsiemlak.com/antalya-konyaalti-arapsuyu-kat-karsiligi-satilik/imarli-konut/29750-168) |
| 29750-177 — Konyaaltı merkezde kat karşılığı projelik arsa | Görüşme ile · 1.000 m² | 22/09/2026 | 1 | [İlan](https://www.hepsiemlak.com/antalya-konyaalti-hurma-kat-karsiligi-satilik/imarli-konut/29750-177) |
| 29750-176 — Muratpaşa’da kat karşılığı kupon arsa | Görüşme ile · 1.000 m² | 22/09/2026 | 1 | [İlan](https://www.hepsiemlak.com/antalya-muratpasa-barbaros-kat-karsiligi-satilik/imarli-konut/29750-176) |

### Kontrol notları

- **29750-200** — Kaynakta 6.000 TL yazıyor; günlük fiyat olduğu varsayıldı. Sezona göre değişiyor, dönemi doğrulayın.
- **29750-195** — Kaynak başlığı “Barış Mahallesi”, konum ve açıklama “Baraj” diyor; Baraj kullanıldı. Açıklamada 2.900.000 TL, ilan fiyatı 2.890.000 TL.
- **29750-203** — Oda bilgisi açıklamadan alındı (“2 büyük oda + mutfak, 1+1 formatında”). Ofis ve konut kullanımına uygun.
- **29750-190** — Kaynak fiyatı (16.000 TL) açıklamadaki fiyatlarla çelişiyor: günlük 300–550 €, aylık 3.500–5.500 €, 3 farklı villa. “Fiyat için görüşelim” olarak alındı.
- **29750-180** — Satılık bir mülk değil, hafif çelik villa yapım hizmeti (12.000 TL/m²). Kaynaktaki 10.000 m² anlamlı değil. Portföy yerine ayrı bir hizmet sayfasında anlatılması daha uygun olabilir.
- **29750-153** — Arsa arama çağrısı; kaynaktaki 500 m² somut bir parsel değil.
- **29750-151** — Arsa arama çağrısı; kaynaktaki 10.000.000 TL ve 2.000 m² somut bir mülke ait değil.
- **29750-152** — Arsa arama çağrısı; kaynaktaki 20.000.000 TL ve 1.000 m² somut bir mülke ait değil.
- **29750-178** — 7.000 m² ve “Tapu Yok” bilgisi doğrulanmalı.
- **29750-170** — Kentsel dönüşüm hizmet çağrısı; 800 m² somut bir parsel olarak doğrulanmadı.
- **29750-177** — Kaynakta “temsili konum işaretlenmiştir” yazıyor.
- **29750-176** — Detaylar yalnız ofiste paylaşılıyor; 1.000 m² doğrulanmadı.

## Görseller

- **Ana sayfa girişi:** `public/images/antalya-konyaalti.webp` (2400 px) ve `antalya-konyaalti-sm.webp` (1200 px) — Konyaaltı sahili ve Beydağları, fotoğraf: Burak Mike, [Unsplash](https://unsplash.com/photos/_p3CkITSW-I). Unsplash Lisansı: ücretsiz, ticari kullanım serbest, kaynak gösterme zorunlu değil. Hiçbir ilana ait değildir; ilanlar değişse de kalır.


`public/images/sources.json`, her indirilen dosyanın açık kaynak görsel adresini, ait olduğu ilanı, yerel yolunu, boyutunu ve açıklamasını içerir.

- Sekiz somut ilana ait **18 fotoğraf/görsel**, WebP olarak yerel dosyalara dönüştürüldü. Her fotoğraf yalnızca ait olduğu ilanın galerisinde kullanılıyor.
- Ana görsel `hero-villa.jpg`, **29750-112 Çamyuva villasının gerçek dış görünümüdür**; Antalya sahilinin veya başka bir taşınmazın fotoğrafı değildir. 1920 × 1080 boyutunda CDN çıktısı kullanıldı.
- `advisor.jpg`, KA EMLAK ofis sayfasında **İshak Kahraman** adıyla gösterilen profil fotoğrafıdır.
- `altinkale-villa-1.jpg`, ilk görsel doğrulaması için indirilen aynı villa kaynağının JPEG kopyasıdır; ilan galerisinde optimize WebP kopyaları kullanılır.
- Görsellerdeki mevcut kaynak/ofis filigranları korunmuştur. Görseller üretilmedi, bir başka taşınmazın görseliyle değiştirilmedi; yalnızca boyut ve dosya biçimi optimize edildi.
- Bunlar kullanıcının istediği yerel referans önizlemesi için, ilanlarda açıkça bağlantısı verilen CDN adreslerinden normal HTTP erişimiyle alındı. Kaynakların herkese açık olması, görsellerin sınırsız yeniden yayın lisansı olduğu anlamına gelmez. Canlı yayın için ofisin fotoğraf kullanım yetkisi kontrol edilmelidir.
- Hepsiemlak HTML adresine doğrudan yapılan normal istek 403 döndürdü. Erişim engelini aşmaya yönelik işlem yapılmadı; genel web aracında görülebilen ilan bağlantıları ve herkese açık CDN dosyaları kullanıldı.

## Hepsiemlak entegrasyonu: doğrulanan kapsam

Resmî bir API bulunmaktadır: [API genel bakışı](https://developers.hemlak.com/docs/quickstart/), [ilan yönetimi](https://developers.hemlak.com/docs/ilan-yonetimi/genel-bakis/).

- [İlan filtreleme](https://developers.hemlak.com/docs/ilan-filtreleme/) servisi, `listingId`, `updatedDateTime`, `currency`, `isActive` gibi alanları örneklendirir. Aktif/pasif ve silinmiş ilan durumları ile sayfalama seçenekleri bulunur.
- [Kimlik doğrulama](https://developers.hemlak.com/docs/authentication/) firma özel API anahtarı ister; [SSS](https://developers.hemlak.com/docs/sikca-sorulan-sorular/) yalnızca önceden tanımlanmış **statik IP** adreslerine izin verildiğini belirtir.
- Dokümanın API ile oluşturulmuş ilanlar üzerinden anlatılması nedeniyle, web panelindeki bütün eski ilanların bu API ile dışarı okunabilmesi doğrulanmış değildir. Firma 29750 için okuma kapsamı, resim kullanım izni, kota ve senkronizasyon sıklığı Hepsiemlak ile teyit edilmelidir.
- Herkese açık resmî XML/CSV dışa aktarımı veya webhook sözleşmesi bulunamadı. Otomatik scraping veya ücretsiz, kesintisiz senkronizasyon garantisi verilmez.
- Teknik iletişim, resmî rehberde `realtyintegration@hepsiemlak.com` olarak verilmiştir. Bu çalışma sırasında e-posta gönderilmedi.
- 21 Ekim 2026: developers.hemlak.com bu ofisin IP adresine (95.9.217.3) Cloudflare 1006 "IP yasaklandı" sayfası döndürüyor; ana hepsiemlak sitesi açılıyor. Belgeler bu yüzden yeniden doğrulanamadı; API erişimi istenirken bu da sorulmalı.
- Otomatik eşitleme için değerlendirilen yollar: (1) hepsiemlak resmî API ile periyodik okuma (anahtar, statik IP ve web panelinden girilen ilanların okunabilirliği teyit edilmeli; Cloudflare Workers Free sabit çıkış IP vermez); (2) sahibinden için herkese açık API yok, entegrasyon anlaşmalı entegratör firmalar üzerinden ve genellikle portala gönderme yönünde; (3) ilanları tek bir emlak yazılımında girip portallara ve siteye oradan dağıtmak. Sayfa taraması (scraping) kullanım şartları ve bot koruması nedeniyle yapılmadı.

## 21st.dev bileşen kaynağı

İncelenen kamuya açık örnek: **shadcn / Button**, [21st.dev bileşen sayfası](https://21st.dev/@shadcn/components/button). Sayfadaki lisans bilgisi **MIT License** olarak belirtilmektedir. Kaynakta `ButtonOutline`, `ButtonWithIcon` ve `ButtonAsChild` gibi kullanım örnekleri açıkça görülebilir.

Açık kullanım örneğinden kısa kesit:

```tsx
function ButtonOutline() {
  return <Button variant="outline">Outline</Button>
}

function ButtonWithIcon() {
  return (
    <Button>
      <Mail className="mr-2 h-4 w-4" /> Login with Email
    </Button>
  )
}
```

Bu örnekler varyant, ikon/metin düzeni ve erişilebilir yerel düğme davranışı için referans alınabilir. Tam bileşen uygulama kodu kamuya açık sayfa verisinde boş döndüğünden burada tam kod alınmış gibi bir iddia yoktur. Kurulu 21st CLI belgesi, bileşen kodu alımının hesap kotasına bağlı, hosted AI üretiminin ise ayrı bir özellik olduğunu belirtmektedir. Bu görevde 21st AI üretimi veya ücretli kredi kullanılmadı; oturum kısıtlarını aşacak bir işlem yapılmadı.
