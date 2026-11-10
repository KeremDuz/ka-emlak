# KA EMLAK — kurulum ve işletim

Uygulamanın geliştirmesi ile canlı servis bağlantısı ayrı aşamalardır. Gerçek hesap, proje, yönetici hesabı veya sır tanımlanmadan canlı ilan kaydedildiği kabul edilmez. Yerel panel, `.local/preview.json` ve `.local/media/` içinde kalıcı bir örnek çalışma alanı kullanır. Yalnız geliştirme derlemesinde ve localhost üzerinde açılır; üretim derlemesinde önizleme girişi reddedilir. `.local/` Git'e eklenmemelidir.

## Ödeme yöntemi istemeyen başlangıç

- Cloudflare Workers **Free**: uygulama sunucusu ve site. R2 ve ücretli Images etkinleştirilmez. Çalışan istekler için günlük kota ve CPU sınırları vardır; bu sınırlar limitsiz hizmet anlamına gelmez.
- Supabase **Free**: ilanlar, taslaklar, iletişim talepleri ve private fotoğraf bucket'ı. Ücretsiz hesapta 500 MB DB, 1 GB dosya alanı ve trafik kotaları vardır. Düşük etkinlikte proje duraklayabilir; yönetici konsolundan yeniden başlatılması gerekir. Bu sınır kullanıcı tarafından kabul edilmiştir. Ücretli plana otomatik geçiş yapılmaz.
- Firebase **Spark**: yalnız e-posta/şifre girişi ve şifre sıfırlama. Firebase Cloud Storage, Firestore, Cloud Functions veya Blaze kullanılmaz. Spark parola sıfırlama e-posta kotası uygulanır. Supabase varsayılan SMTP kullanılmaz.

Bu planlar ücretsiz başlangıç sağlar; sağlayıcı limitleri, plan şartları veya ücretsiz kullanımın süresiz devam edeceği garanti edilmez. Alan adı satın alma ayrı ve isteğe bağlıdır; `workers.dev` adresiyle başlanabilir.

## Canlı bağlantıyı kurma

1. Kullanıcının kendi Supabase hesabında Free proje seçilir/oluşturulur. Mevcut projeye bağlanılacaksa veriler ve erişim politikaları önce incelenir. Yeni migration SQL'i Supabase SQL Editor veya bağlı Supabase aracıyla uygulanır: `supabase/migrations/20261019121704_ka_emlak_initial_schema.sql`. Yeni migration'lar sıralı uygulanır; uygulanmış migration değiştirilmez.
2. SQL, `listings`, `office_settings`, `inquiries`, `media_objects`, `request_limits` ve rezervasyon kilidini oluşturur. Her tabloda RLS açıktır. Anonim rol yalnız yayımlanmış ilanların **yayın snapshot'ını** ve ofis bilgilerini okur; `draft` sütununu okuyamaz. Bütün yazma RPC'leri yalnız `service_role` rolüne açıktır ve `SECURITY INVOKER` kullanır.
3. `ka-photos` bucket'ı **private** kalır. Anonim veya authenticated rollerine bucket geneli okuma/yazma politikası verilmez. Mevcut projelerde daha önce yazılmış geniş Storage RLS politikalarının bu bucket'a da izin vermediği doğrulanır. Fotoğraflar Worker `/media/:id` proxy'sinden sunulur; anonim isteklerde fotoğrafın yayımlanmış snapshot içinde bulunduğu denetlenir.
4. Firebase'de Spark proje ve web uygulaması açılır, Authentication > Email/Password etkinleştirilir. Tek yönetici konsolda oluşturulur. E-posta/şifre kayıt ekranı sunulmaz. Hesabın UID'si `ADMIN_UID` olur; uygulama diğer Firebase kullanıcılarına yetki vermez. Firebase tarafında başka hesap oluşturulabilmesi yazma yetkisi sağlamaz. `workers.dev` ve daha sonra özel alan adı Authorized Domains listesine eklenir. Şifre sıfırlama e-postası Türkçe ayarlanır.
5. `.env.example` içindeki adlarla gerçek değerler yerelde ignored `.env` veya `.dev.vars` dosyasına, üretimde Worker runtime settings/secrets alanına girilir. Supabase secret/service-role key **yalnız sunucuda** bulunur. Firebase web API key gizli sunucu yetkisi değildir; `/api/config` yalnız Firebase web ayarlarını döndürür. Hiçbir secret, API yanıtına, tarayıcı paketine veya Git'e yazılmaz.
6. Root build talimatıyla Cloudflare hedefi derlenir (`KA_BUILD_TARGET=cloudflare`); Worker Free hesabına deploy edilir. `SITE_URL` gerçek origin olarak ayarlanır. Firebase secret key veya private service account key gerekmez: Firebase ID token'ı Google'ın açık sertifikaları ve `jose` ile doğrulanır. RS256, issuer, audience, expiry, issue/auth zamanı ve tek yönetici UID kontrol edilir.
7. Canlı sitede örnek ilanlar otomatik eklenmez. İstenirse kaynağı gözden geçirilmiş JSON import edilir; bütün importlar `needsReview=true` ve **taslak** olarak kaydedilir. Yönetici fotoğraf, güncel fiyat ve bilgileri kontrol edip ayrıca Yayınla seçer. Önizleme görselleri ile gerçek ofis içeriği karıştırılmamalıdır.

## GitHub'dan otomatik yayın

`.github/workflows/yayinla.yml`, `main` dalına her gönderimde tip kontrolü, testler ve derlemeyi çalıştırır; Cloudflare sırları varsa siteyi Workers'a yayınlar. Sırlar yokken yayın adımı atlanır, iş akışı yine yeşil biter.

1. [dash.cloudflare.com](https://dash.cloudflare.com) üzerinde ücretsiz hesap açın. **Workers & Pages** sayfasının sağında **Account ID** yazar.
2. **My Profile → API Tokens → Create Token → "Edit Cloudflare Workers"** şablonuyla bir anahtar oluşturun.
3. GitHub'da depo **Settings → Secrets and variables → Actions** altında iki sır ekleyin: `CLOUDFLARE_API_TOKEN` (2. adımdaki anahtar) ve `CLOUDFLARE_ACCOUNT_ID` (1. adımdaki kimlik). Bu değerleri sohbete ya da koda yazmayın.
4. **Actions → Yayınla → Run workflow** ile ilk yayını başlatın. Site `https://ka-emlak.<hesap-adı>.workers.dev` adresinde açılır.
5. Aynı sayfada **Variables** sekmesine `SITE_URL` değişkenini sitenin adresiyle ekleyin (kalıcı bağlantılar ve site haritası için) ve iş akışını bir kez daha çalıştırın.
6. Supabase ve Firebase değerleri (yukarıdaki 1–5. adımlar) Cloudflare'da Worker'ın **Settings → Variables and Secrets** alanına girilir. Bunlar girilene kadar site açılır ama "İlanlar şu an yüklenemiyor" yazar ve panele giriş yapılamaz.

## hepsiemlak ve sahibinden'den tek tıkla aktarma

Panelde İlanlar sayfasındaki **“hepsiemlak ve sahibinden’den tek tıkla aktarın”** kartında “KA Emlak’a ekle” düğmesi vardır. Ofis bu düğmeyi bir kez tarayıcının yer imleri çubuğuna sürükler; sonra hepsiemlak’ta ya da sahibinden’de kendi ilanının sayfasındayken yer imine tıklar. Panel açılır, ilanın özeti görünür; “Siteye ekle ve yayınla” ilanı oluşturur, fotoğrafları tek tek aktarır ve yayınlar. Aynı portal numarası sitede varsa yalnız fiyat ve ölçüler güncellenir; başlık, açıklama ve fotoğraflar korunur.

Aynı mülk iki portalda farklı numarayla yayında olabilir. Numara tutmasa da işlem türü, gayrimenkul türü, ilçe, mahalle ve metrekare (±%3) tutan bir ilan sitede varsa panel bunu gösterir ve ofise sorar: **“Sitedekini güncelle”** (varsayılan; fiyat ve ölçüler güncellenir, sitedeki ilan ilk portalın numarasını korur) ya da **“Ayrı ilan olarak ekle”**.

- Yer imi, düğmenin alındığı sitenin adresini taşır. **Canlıya geçince düğme canlı panelden yeniden sürüklenmeli**; yerel geliştirmede alınan düğme localhost’u açar.
- Veri portal sayfasından adresin `#aktar=` kısmıyla taşınır; bu kısım sunucuya gitmez. Panel yalnız biçimi doğru, `https://www.hepsiemlak.com/` ya da `https://www.sahibinden.com/` adresli ve ilan numarası adresle uyuşan veriyi kabul eder; sunucu aynı denetimi yeniden yapar.
- Fotoğraflar yalnız portalların ilan galerisinden indirilir: hepsiemlak’ta `hecdn*.hemlak.com` üzerindeki `/mnresize/…/ds01/`, sahibinden’de `i*.shbdn.com/photos/…` altında dosya adı o ilanın numarasını taşıyanlar (benzer ilanların fotoğrafları alınmaz). En büyük boy denenir; 3 MB’yi aşarsa ya da portalda yoksa (sahibinden afiş gibi küçük yüklenen görsellerin büyük boyunu üretmez) bir küçük boy alınır. Yönlendirme izlenmez, en fazla 12 fotoğraf; panel yüklemesiyle aynı imza ve kota denetiminden geçer. Cloudflare Workers Free’nin istek başına alt istek sınırı nedeniyle her fotoğraf ayrı bir istekle aktarılır.
- Yeni ilanın yaklaşık konumu mahalle adından OpenStreetMap Nominatim ile bulunur (tek istek).
- Yer imi bilgisayar tarayıcısında rahat çalışır; telefonda yer imini adres çubuğundan adıyla seçmek gerekir. Kendi Chrome’unuzda her iki portalda bir kez denenmelidir: bazı siteler yer imi betiklerini engelleyebilir. hepsiemlak’ta betik ilan sayfasında tarayıcı geliştirici araçlarıyla çalıştırılarak denendi; sahibinden’in tarayıcı denetimi otomatik gezinmeyi durdurduğu için sahibinden kaydedilmiş bir ilan sayfasıyla denendi, canlı sayfada denenmedi.
- Portallar sayfa yapısını değiştirirse yer imi “ilanın kendi sayfasını açın” uyarısı verir ya da eksik bilgi getirir; seçiciler `src/lib/bookmarklet.ts` içindedir.

### Bütün ilanları tek tıkla eşitleme (hepsiemlak)

Aynı yer imine hepsiemlak’taki **ofis sayfasındayken** (`/emlak-ofisi/ka-emlak-29750`) tıklanırsa ofisin bütün ilanları okunur. Okuma kullanıcının kendi tarayıcı oturumunda, ilanlar arasında kısa beklemelerle sırayla yapılır (27 ilan için yaklaşık yarım dakika); sağ üstte ilerleme görünür. Bitince çıkan “KA Emlak panelinde aç” düğmesi paneli açar. Panel sitedeki ilanlarla karşılaştırıp bir özet gösterir:

- **Yeni ilanlar** fotoğraflarıyla eklenip yayınlanır; eksik bilgi varsa taslakta kalır.
- **Değişen ilanlar**: yalnız işlem türü, fiyat, para birimi, fiyat dönemi, brüt/net m², oda ve banyo karşılaştırılır; her değişiklik eski → yeni olarak gösterilir. Başlık, açıklama, fotoğraflar, kat ve bina yaşı korunur. hepsiemlak’ta boş bırakılmış alan sitedeki bilgiyi silmez. Yayındaki ilan güncellenince yeniden yayınlanır.
- **hepsiemlak’tan kalkanlar**: yalnız bu ofisin hepsiemlak numaralı ve yayındaki ilanları yayından kaldırılır (arşiv; “Yeniden yayınla” ile geri gelir). Taslaklar, satıldı/kiralandı işaretlileri ve sahibinden’den eklenenler dokunulmaz. Ofis sayfasında görülüp detayı okunamayan ilan kaldırılmaz.
- Yayındaki hepsiemlak ilanlarının yarısından fazlası kalkacak görünürse sayfa eksik okunmuş sayılır ve kaldırma işaretleri kapalı gelir.
- Her satır ayrı ayrı işaretlenip çıkarılabilir; hiçbir şey ofis “Seçilenleri uygula” demeden değişmez.
- Veri gzip’lenip `#esitle=` ile taşınır. Panel yalnız aynı ofis numarasıyla başlayan hepsiemlak ilanlarını kabul eder. Portföy yüklenmeden ya da yüklenirken hata varken eşitleme penceresi açılmaz.
- Daha önce sürüklenen eski yer imi bu özelliği içermez; düğme yeniden sürüklenmelidir. Eşitleme canlı hepsiemlak ofis sayfasında henüz denenmedi; panel tarafı yerel önizlemede örnek veriyle denendi.

## Veri davranışı

Yayımdaki ilanın düzenlemesi ayrı `draft` snapshot'ına otomatik kaydedilir. Ziyaretçi son yayımlanmış snapshot'ı görür. Yayınla doğrulaması başarılı olduğunda taslak atomik olarak yayına alınır. İlan kaldırma arşiv/çöp kutusu durumudur; kalıcı silme yalnız çöp kutusundan yapılır. Her ilan güncellemesi `version` ile denetlenir; eski sürüm **409** döndürür ve mevcut veriyi ezmez.

Fotoğraf yüklemesi önce SQL row-lock altında alan ayırır. Kullanılan ve bekleyen rezervasyonlar birlikte %90'a ulaşırsa yeni yükleme reddedilir; %80'de uyarı görünür. En fazla 12 fotoğraf ve dosya başına 3 MB sunucu tarafından uygulanır. Gerçek JPEG/PNG/WebP imzası doğrulanır; uzantı/MIME tek başına güvenilir sayılmaz. Tarayıcı küçültme yapsa bile bu sınırlar sunucuda korunur. HEIC dönüşümü tarayıcı destekliyorsa yapılır; desteklenmeyen dosya JPEG/PNG/WebP olarak yeniden seçilir. Worker'da pahalı fotoğraf kodlama yapılmaz.

Supabase Free alanı tüm bucket'ların toplamıdır. Rezervasyon hesabı uygulamanın `ka-photos` kayıtlarını kapsar; aynı Supabase projesine başka büyük bucket'lar eklenmemelidir. Manuel bucket değişiklikleri uygulamanın kayıtlarını geçersiz kılabilir. Bekleyen rezervasyonlar otomatik unutulmaz; gerçek dosya silinmeden alan serbest sayılmaz. Başarısız yükleme temizliği tamamlanamazsa rezervasyon korunur; Supabase konsolunda dosya ile `media_objects` birlikte kontrol edilir.

İletişim formu honeypot, form doldurma süresi, aynı-origin kontrolü ve kalıcı hız sınırı kullanır. Ham IP veritabanına yazılmaz. Talepler kişisel veri içerir; ofis silme/saklama politikasını belirlemeli, JSON yedeklerini herkese açık klasöre koymamalıdır.

## Yedek ve geri alma

Paneldeki JSON dışa aktarma ilanların yayın/taslak snapshot'larını, ofis bilgilerini, talepleri ve **fotoğraf manifestini** içerir. **JSON fotoğraf dosyalarının kendisini içermez.** Eksiksiz yedek için JSON ile birlikte manifestteki `media[].downloadUrl` dosyaları yönetici oturumunda indirilip aynı yedek klasöründe saklanır. Gerçek fotoğrafları Supabase Storage konsolundan `ka-photos` bucket'ıyla ayrıca yedeklemek de mümkündür. Yerelde `.local/` klasörünün tamamı uygulama kapalıyken kopyalanabilir.

İçe aktarma güvenli bir portföy kurtarma/taşıma işlemidir: mevcut kayıtları değiştirmez, yeni kimlikli **kontrol bekleyen taslaklar** ekler. Aynı depoda mevcut fotoğrafları yeniden kullanır; eksik fotoğrafları çıkarır ve tekrar yüklenmesini ister. JSON'daki ofis ayarları ve talepler otomatik uygulanmaz; bunlar export'ta inceleme/yedek amacıyla korunur. Tam felaket kurtarma için önce fotoğraf dosyalarını yeni depoya geri yüklemek ve manifest eşlemesini yapmak gerekir; yalnız JSON importunu tam fotoğraf yedeği olarak kabul etmeyin.

## Yayın öncesi kontroller

- Oturumsuz create/save/upload/settings/inquiry-list istekleri reddedilir; başka Firebase UID'si yetki alamaz.
- Anonim DB sorgusunda taslaklar görünmez, `draft` sütunu reddedilir. Taslak fotoğrafın `/media/:id` adresi 404 döner; yayımlanınca görünür; arşivlenince erişim kapanır.
- İki sekmede aynı version ile kaydetmede yalnız biri başarılı olur. Yayımdaki ilan taslak autosave sırasında değişmez.
- Yeni yükleme kota sınırında eşzamanlı da olsa aşımı geçmez; hata sonrasında dosya/rezervasyon birlikte temizlenir.
- Üretim derlemesinde `{preview:true}` oturumu reddedilir. Eksik/kapalı Supabase bağlantısı sahte boş başarı olarak sunulmaz; API 503 ve sitede erişim uyarısı gösterilir.
- Gerçek yöneticiyle giriş, şifre sıfırlama, bir taslak oluşturma/yayınlama/arşivleme, fotoğraf yükleme, ikinci tarayıcıdan okuma ve export/import denemesi yapılır. Hesaplar bağlanana kadar bu canlı kontroller tamamlanmış sayılmaz.

Kaynaklar: [Workers limitleri](https://developers.cloudflare.com/workers/platform/limits/), [Supabase Free](https://supabase.com/pricing), [Supabase duraklatma](https://supabase.com/docs/guides/platform/free-project-pausing), [Firebase Spark](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans), [ID token doğrulama](https://firebase.google.com/docs/auth/admin/verify-id-tokens).
