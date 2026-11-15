import type { LegalContent, Localized } from './types';

// TASLAK: Bu metinler yayından önce bir avukat tarafından gözden geçirilmelidir.
// Doldurulacak yer tutucular: [VERİ SORUMLUSU UNVANI], [ADRES], [E-POSTA], [VERGİ/MERSİS NO], PLACEHOLDER_DATE.

const UPDATED = 'PLACEHOLDER_DATE';

// Farsça metinde telefon numarasının rakam grupları sağdan sola dizilmesin diye yön yalıtımı.
const PHONE = '0532 224 76 58';
const PHONE_FA = `⁦${PHONE}⁩`;

const NOTE_TR =
  'Bu metnin İngilizce ve Farsça çevirileri bilgi amaçlıdır. Metinler arasında fark olursa Türkçe metin esas alınır.';
const NOTE_EN =
  'This English text is a courtesy translation. If there is any difference between the versions, the Turkish text prevails.';
const NOTE_FA =
  'این متن فارسی تنها برای آگاهی شما ترجمه شده است. در صورت تفاوت میان نسخه‌ها، متن ترکی ملاک است.';

export const legal: Localized<LegalContent> = {
  tr: {
    kvkk: {
      metaTitle: 'KVKK aydınlatma metni | KA EMLAK',
      metaDescription:
        'KA EMLAK sitesinde hangi kişisel verilerin, hangi amaçla ve hangi hukuki sebeple işlendiğini ve 6698 sayılı Kanun kapsamındaki haklarınızı açıklayan aydınlatma metni.',
      title: 'Kişisel verilerin korunması hakkında aydınlatma metni',
      intro:
        'Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("Kanun") uyarınca, bu siteyi kullanırken ve bize başvururken kişisel verilerinizin nasıl işlendiğini açıklar.',
      updated: UPDATED,
      languageNote: NOTE_TR,
      sections: [
        {
          heading: 'Veri sorumlusu',
          paragraphs: [
            'Kişisel verileriniz, veri sorumlusu sıfatıyla [VERİ SORUMLUSU UNVANI] ("KA EMLAK") tarafından işlenir.',
            `Adres: [ADRES]. E-posta: [E-POSTA]. Telefon: ${PHONE}. Vergi/MERSİS numarası: [VERGİ/MERSİS NO]. Taşınmaz Ticareti Yetki Belgesi No: 0702648.`,
          ],
        },
        {
          heading: 'İşlenen kişisel veriler',
          paragraphs: ['Yalnız sizin bize verdiğiniz ve sitenin çalışması için gereken verileri işleriz.'],
          bullets: [
            'Kimlik bilgisi: ad ve soyad',
            'İletişim bilgisi: telefon numarası',
            'Talep bilgisi: yazdığınız mesaj ve ilgilendiğiniz ilanın referansı',
            'Arsa başvurusu bilgisi: başvuru türü, ilçe, mahalle, ada, parsel, arsa büyüklüğü, imar durumu, arsada yapı olup olmadığı ve notunuz',
            'Teknik veri: sitenin sunulması sırasında barındırma sağlayıcısının işlediği IP adresi ve tarayıcı bilgisi',
            'Onay verirseniz kullanım verisi: sayfa görüntülemeleri ile WhatsApp, telefon ve form düğmelerine yapılan tıklamalar',
          ],
        },
        {
          heading: 'İşleme amaçları',
          paragraphs: ['Verilerinizi aşağıdaki amaçlarla işleriz.'],
          bullets: [
            'Sorunuza ya da başvurunuza yanıt vermek ve sizi aramak',
            'İlgilendiğiniz ilan hakkında bilgi vermek ve görüşme ayarlamak',
            'Arsa ya da bina için değerleme yapmak',
            'Sitenin güvenli ve kesintisiz çalışmasını sağlamak',
            'Mevzuattan doğan yükümlülükleri yerine getirmek',
            'Onay verirseniz, sitenin nasıl kullanıldığını ölçmek',
          ],
        },
        {
          heading: 'Toplama yöntemi ve hukuki sebepler',
          paragraphs: [
            'Verileriniz, sitedeki formları doldurmanızla, bizi telefonla ya da WhatsApp üzerinden aramanızla ve siteyi ziyaret etmenizle elektronik ortamda toplanır. İşleme, Kanun\'un 5. maddesindeki şu hukuki sebeplere dayanır.',
          ],
          bullets: [
            'Bir sözleşmenin kurulması ya da ifasıyla doğrudan ilgili olması: talebinizin ve başvurunuzun değerlendirilmesi',
            'Veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi için zorunlu olması',
            'Temel hak ve özgürlüklerinize zarar vermemek kaydıyla veri sorumlusunun meşru menfaati: sitenin güvenliği ve işleyişi',
            'Açık rızanız: analitik ölçüm. Rızanızı dilediğiniz zaman geri alabilirsiniz.',
          ],
        },
        {
          heading: 'Verilerin aktarıldığı taraflar',
          paragraphs: [
            'Verilerinizi satmayız ve reklam amacıyla kimseyle paylaşmayız. Veriler yalnız aşağıdaki taraflara, belirtilen amaçla sınırlı olarak aktarılır.',
            'Bu hizmet sağlayıcıların sunucuları yurt dışında bulunabilir. Bu durumda verileriniz, Kanun\'un yurt dışına aktarıma ilişkin hükümlerine uygun olarak aktarılır.',
          ],
          bullets: [
            'Cloudflare: sitenin barındırılması ve ziyaretçiye sunulması',
            'Supabase: başvuru ve ilan verilerinin tutulduğu veri tabanı',
            'Google (Google Analytics 4): yalnız açık rıza verirseniz, kullanım ölçümü',
            'Yetkili kamu kurum ve kuruluşları: mevzuatın zorunlu kıldığı durumlarda',
          ],
        },
        {
          heading: 'Saklama süresi',
          paragraphs: [
            'Verilerinizi, talebiniz sonuçlanana kadar ve sonrasında ilgili mevzuatta öngörülen süreler boyunca saklarız. Süre dolduğunda verileri siler, yok eder ya da anonim hale getiririz.',
          ],
        },
        {
          heading: 'Kanun\'un 11. maddesi kapsamındaki haklarınız',
          paragraphs: ['Veri sorumlusuna başvurarak aşağıdaki haklarınızı kullanabilirsiniz.'],
          bullets: [
            'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
            'İşlenmişse buna ilişkin bilgi talep etme',
            'İşlenme amacını ve verilerin amacına uygun kullanılıp kullanılmadığını öğrenme',
            'Yurt içinde ya da yurt dışında verilerin aktarıldığı üçüncü kişileri bilme',
            'Eksik ya da yanlış işlenmişse düzeltilmesini isteme',
            'Kanun\'daki şartlar çerçevesinde silinmesini ya da yok edilmesini isteme',
            'Düzeltme, silme ve yok etme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme',
            'Verilerin yalnız otomatik sistemlerle analiz edilmesi yoluyla aleyhinize bir sonuç ortaya çıkmasına itiraz etme',
            'Kanuna aykırı işleme nedeniyle zarara uğrarsanız zararın giderilmesini talep etme',
          ],
        },
        {
          heading: 'Başvuru yolu',
          paragraphs: [
            'Taleplerinizi, kimliğinizi doğrulayan bilgilerle birlikte yazılı olarak [ADRES] adresine ya da [E-POSTA] e-posta adresine iletebilirsiniz.',
            'Başvurunuzu Kanun\'da öngörülen süre içinde yanıtlarız. Yanıtı yetersiz bulursanız ya da yanıt alamazsanız Kişisel Verileri Koruma Kurulu\'na şikâyette bulunabilirsiniz.',
          ],
        },
      ],
    },
    privacy: {
      metaTitle: 'Gizlilik | KA EMLAK',
      metaDescription:
        'KA EMLAK sitesinin sizden hangi bilgileri aldığını, bunları ne için kullandığını ve kimlerin gördüğünü kısaca anlatan gizlilik sayfası.',
      title: 'Gizlilik',
      intro:
        'Bu sayfa, sitenin sizden hangi bilgileri aldığını ve bunlarla ne yaptığını kısaca anlatır. Ayrıntılar KVKK aydınlatma metnindedir.',
      updated: UPDATED,
      languageNote: NOTE_TR,
      sections: [
        {
          heading: 'Hangi bilgileri alıyoruz',
          paragraphs: [
            'Siteyi gezmek için bilgi vermeniz gerekmez. Yalnız bir form doldurduğunuzda aşağıdaki bilgileri alırız.',
          ],
          bullets: [
            'Adınız ve telefon numaranız',
            'Yazarsanız mesajınız ve ilgilendiğiniz ilanın referansı',
            'Arsa başvurusunda: başvuru türü, ilçe, mahalle, ada, parsel, metrekare, imar durumu, mevcut yapı bilgisi ve notunuz',
          ],
        },
        {
          heading: 'Bu bilgileri ne için kullanıyoruz',
          paragraphs: [
            'Bilgilerinizi sizi aramak, sorunuzu yanıtlamak ve arsa ya da bina için değerleme yapmak için kullanırız. Reklam göstermiyoruz ve bilgilerinizi reklam amacıyla kullanmıyoruz.',
          ],
        },
        {
          heading: 'Bilgileri kimler görür',
          paragraphs: [
            'Başvurunuzu KA EMLAK görür. Site Cloudflare üzerinde barındırılır, başvurular Supabase veri tabanında tutulur; bu sağlayıcıların sunucuları yurt dışında olabilir. Bilgilerinizi satmıyoruz.',
            'Bizi telefonla ya da WhatsApp üzerinden ararsanız görüşme o hizmetin kendi koşullarına tabidir.',
          ],
        },
        {
          heading: 'Çerezler ve ölçüm',
          paragraphs: [
            'Site, çalışması için gereken birkaç tarayıcı kaydı kullanır. Google Analytics 4 yalnız siz onay verirseniz çalışır; onay vermezseniz analitik çerezi yerleştirilmez. Ayrıntılar çerez politikasındadır.',
          ],
        },
        {
          heading: 'Bilgiler ne kadar süre saklanır',
          paragraphs: [
            'Bilgilerinizi talebiniz sonuçlanana kadar ve mevzuatın gerektirdiği süre boyunca saklarız. Daha önce silinmesini isterseniz bize yazın.',
          ],
        },
        {
          heading: 'Haklarınız ve iletişim',
          paragraphs: [
            `Hakkınızda hangi bilgilerin tutulduğunu sorabilir, düzeltilmesini ya da silinmesini isteyebilirsiniz. Bunun için [E-POSTA] adresine yazın ya da ${PHONE} numarasını arayın.`,
          ],
        },
      ],
    },
    cookies: {
      metaTitle: 'Çerez politikası | KA EMLAK',
      metaDescription:
        'KA EMLAK sitesinin kullandığı zorunlu ve analitik çerezler, Google Analytics 4 için onay ve tercihinizi nasıl değiştireceğiniz.',
      title: 'Çerez politikası',
      intro:
        'Bu sayfa, sitenin tarayıcınızda hangi kayıtları tuttuğunu ve tercihinizi nasıl değiştirebileceğinizi açıklar.',
      updated: UPDATED,
      languageNote: NOTE_TR,
      sections: [
        {
          heading: 'Çerez nedir',
          paragraphs: [
            'Çerez, bir sitenin tarayıcınıza kaydettiği küçük bir bilgidir. Bu sayfada "çerez" sözü, tarayıcının yerel depolaması gibi benzer kayıtları da kapsar.',
          ],
        },
        {
          heading: 'Zorunlu kayıtlar',
          paragraphs: ['Bu kayıtlar sitenin çalışması için gereklidir ve onay gerektirmez.'],
          bullets: [
            'Dil tercihi: siteyi hangi dilde görüntülediğinizi hatırlar',
            'Çerez tercihi: analitik için verdiğiniz kararı hatırlar',
            'Yönetim oturumu: yalnız yönetim paneline giriş yapan ofis kullanıcısında oluşur',
          ],
        },
        {
          heading: 'Analitik çerezler',
          paragraphs: [
            'Onay verirseniz Google Analytics 4 çalışır. Onay vermezseniz analitik çerezi yerleştirilmez ve ölçüm yapılmaz.',
            'Google Analytics 4 ile yalnız aşağıdakileri ölçeriz. Formlara yazdığınız ad, telefon ve mesaj analitik aracına gönderilmez.',
          ],
          bullets: [
            'Sayfa görüntülemeleri',
            'WhatsApp düğmesine tıklamalar',
            'Telefon düğmesine tıklamalar',
            'Form gönderme tıklamaları',
          ],
        },
        {
          heading: 'Tercihinizi değiştirmek',
          paragraphs: [
            'Kararınızı her sayfanın altındaki "Çerez tercihleri" bağlantısından dilediğiniz zaman değiştirebilirsiniz. Ayrıca tarayıcınızın ayarlarından kayıtlı çerezleri silebilirsiniz.',
          ],
        },
        {
          heading: 'Üçüncü taraf içerikleri',
          paragraphs: [
            'İlan haritaları OpenStreetMap harita karolarını kullanır. Haritayı açtığınızda tarayıcınız karoları OpenStreetMap sunucularından ister ve bu sırada IP adresiniz o sunuculara iletilir.',
            'Sitenin yazı tipleri Google Fonts üzerinden yüklenir; tarayıcınız yazı tipi dosyalarını Google sunucularından ister. Sitede reklam ve reklam çerezi yoktur.',
          ],
        },
      ],
      banner: {
        text: 'Siteyi nasıl kullandığınızı ölçmek için Google Analytics kullanmak istiyoruz. Onay vermezseniz analitik çerezi yerleştirilmez.',
        accept: 'Kabul et',
        reject: 'Reddet',
        settings: 'Çerez tercihleri',
        analyticsLabel: 'Analitik',
        analyticsHelp:
          'Google Analytics 4 ile sayfa görüntülemelerini ve WhatsApp, telefon ve form tıklamalarını ölçer.',
        necessaryLabel: 'Zorunlu',
        necessaryHelp: 'Dil tercihi, çerez tercihi ve yönetim oturumu. Kapatılamaz.',
        save: 'Tercihi kaydet',
      },
    },
  },

  en: {
    kvkk: {
      metaTitle: 'Personal data notice (KVKK) | KA EMLAK',
      metaDescription:
        'The information notice explaining which personal data the KA EMLAK website processes, for what purposes and on what legal basis, and your rights under Turkish Law No. 6698.',
      title: 'Information notice on the protection of personal data',
      intro:
        'This notice explains, in line with Turkish Law No. 6698 on the Protection of Personal Data (KVKK, "the Law"), how your personal data are processed when you use this website and contact us.',
      updated: UPDATED,
      languageNote: NOTE_EN,
      sections: [
        {
          heading: 'Data controller',
          paragraphs: [
            'Your personal data are processed by [VERİ SORUMLUSU UNVANI] ("KA EMLAK") as the data controller.',
            `Address: [ADRES]. Email: [E-POSTA]. Phone: ${PHONE}. Tax/MERSİS number: [VERGİ/MERSİS NO]. Real Estate Trade Authorisation Certificate No: 0702648.`,
          ],
        },
        {
          heading: 'Personal data we process',
          paragraphs: ['We process only the data you give us and the data needed for the website to work.'],
          bullets: [
            'Identity: first and last name',
            'Contact: phone number',
            'Request: the message you write and the reference of the listing you are interested in',
            'Land application: type of application, district, neighbourhood, block, parcel, land size, zoning status, whether there is a building on the land, and your note',
            'Technical data: the IP address and browser information processed by the hosting provider while the website is delivered',
            'Usage data, if you consent: page views and clicks on the WhatsApp, phone and form buttons',
          ],
        },
        {
          heading: 'Purposes of processing',
          paragraphs: ['We process your data for the purposes below.'],
          bullets: [
            'To answer your question or application and to call you',
            'To give information about the listing you are interested in and to arrange a meeting',
            'To value a plot of land or a building',
            'To keep the website secure and running',
            'To meet obligations arising from legislation',
            'If you consent, to measure how the website is used',
          ],
        },
        {
          heading: 'How data are collected and the legal basis',
          paragraphs: [
            'Your data are collected electronically when you fill in the forms on the website, when you call us or contact us on WhatsApp, and when you visit the website. Processing relies on the following legal grounds in Article 5 of the Law.',
          ],
          bullets: [
            'Processing is directly related to the conclusion or performance of a contract: assessing your request and application',
            'Processing is necessary for the data controller to meet a legal obligation',
            'The legitimate interest of the data controller, provided your fundamental rights and freedoms are not harmed: the security and operation of the website',
            'Your explicit consent: analytics. You can withdraw your consent at any time.',
          ],
        },
        {
          heading: 'Who the data are shared with',
          paragraphs: [
            'We do not sell your data and do not share them with anyone for advertising. Data are transferred only to the parties below, limited to the stated purpose.',
            'The servers of these service providers may be located outside Türkiye. In that case your data are transferred in line with the provisions of the Law on transfers abroad.',
          ],
          bullets: [
            'Cloudflare: hosting the website and delivering it to visitors',
            'Supabase: the database where applications and listings are kept',
            'Google (Google Analytics 4): usage measurement, only if you give explicit consent',
            'Authorised public bodies: where legislation requires it',
          ],
        },
        {
          heading: 'How long data are kept',
          paragraphs: [
            'We keep your data until your request is concluded and afterwards for the periods set out in the relevant legislation. When the period ends, we delete, destroy or anonymise the data.',
          ],
        },
        {
          heading: 'Your rights under Article 11 of the Law',
          paragraphs: ['You can exercise the rights below by applying to the data controller.'],
          bullets: [
            'To learn whether your personal data are processed',
            'To request information if they have been processed',
            'To learn the purpose of processing and whether the data are used in line with that purpose',
            'To know the third parties, in Türkiye or abroad, to whom the data are transferred',
            'To request correction if the data are incomplete or inaccurate',
            'To request deletion or destruction under the conditions set out in the Law',
            'To request that correction, deletion and destruction be notified to the third parties to whom the data were transferred',
            'To object to a result against you that arises from analysis of the data solely by automated systems',
            'To claim compensation if you suffer damage because of unlawful processing',
          ],
        },
        {
          heading: 'How to apply',
          paragraphs: [
            'You can send your request in writing, together with information that confirms your identity, to [ADRES] or by email to [E-POSTA].',
            'We answer your application within the period set out in the Law. If you find the answer insufficient or receive no answer, you can lodge a complaint with the Personal Data Protection Board (Kişisel Verileri Koruma Kurulu).',
          ],
        },
      ],
    },
    privacy: {
      metaTitle: 'Privacy | KA EMLAK',
      metaDescription:
        'A short page explaining what information the KA EMLAK website takes from you, what it is used for and who sees it.',
      title: 'Privacy',
      intro:
        'This page explains briefly what information the website takes from you and what we do with it. The details are in the personal data notice (KVKK).',
      updated: UPDATED,
      languageNote: NOTE_EN,
      sections: [
        {
          heading: 'What information we take',
          paragraphs: [
            'You do not need to give any information to browse the website. We take the information below only when you fill in a form.',
          ],
          bullets: [
            'Your name and phone number',
            'Your message, if you write one, and the reference of the listing you are interested in',
            'In a land application: type of application, district, neighbourhood, block, parcel, size in square metres, zoning status, whether there is a building, and your note',
          ],
        },
        {
          heading: 'What we use it for',
          paragraphs: [
            'We use your information to call you, to answer your question and to value a plot of land or a building. We show no advertising and do not use your information for advertising.',
          ],
        },
        {
          heading: 'Who sees the information',
          paragraphs: [
            'KA EMLAK sees your application. The website is hosted on Cloudflare and applications are kept in a Supabase database; the servers of these providers may be outside Türkiye. We do not sell your information.',
            'If you call us or contact us on WhatsApp, that conversation is subject to the terms of that service.',
          ],
        },
        {
          heading: 'Cookies and measurement',
          paragraphs: [
            'The website uses a few browser records that it needs in order to work. Google Analytics 4 runs only if you consent; without consent no analytics cookies are set. The details are in the cookie policy.',
          ],
        },
        {
          heading: 'How long information is kept',
          paragraphs: [
            'We keep your information until your request is concluded and for as long as legislation requires. If you want it deleted earlier, write to us.',
          ],
        },
        {
          heading: 'Your rights and contact',
          paragraphs: [
            `You can ask what information is held about you and ask for it to be corrected or deleted. To do so, write to [E-POSTA] or call ${PHONE}.`,
          ],
        },
      ],
    },
    cookies: {
      metaTitle: 'Cookie policy | KA EMLAK',
      metaDescription:
        'The strictly necessary and analytics cookies used on the KA EMLAK website, consent for Google Analytics 4 and how to change your choice.',
      title: 'Cookie policy',
      intro:
        'This page explains which records the website keeps in your browser and how you can change your choice.',
      updated: UPDATED,
      languageNote: NOTE_EN,
      sections: [
        {
          heading: 'What a cookie is',
          paragraphs: [
            'A cookie is a small piece of information that a website saves in your browser. On this page the word "cookie" also covers similar records, such as the browser\'s local storage.',
          ],
        },
        {
          heading: 'Strictly necessary records',
          paragraphs: ['These records are needed for the website to work and do not require consent.'],
          bullets: [
            'Language preference: remembers the language in which you view the website',
            'Cookie choice: remembers your decision about analytics',
            'Admin session: created only for the office user who signs in to the admin panel',
          ],
        },
        {
          heading: 'Analytics cookies',
          paragraphs: [
            'If you consent, Google Analytics 4 runs. Without consent no analytics cookies are set and nothing is measured.',
            'With Google Analytics 4 we measure only the items below. The name, phone number and message you enter in forms are not sent to the analytics tool.',
          ],
          bullets: [
            'Page views',
            'Clicks on the WhatsApp button',
            'Clicks on the phone button',
            'Clicks that submit a form',
          ],
        },
        {
          heading: 'Changing your choice',
          paragraphs: [
            'You can change your decision at any time from the "Cookie preferences" link at the bottom of every page. You can also delete saved cookies in your browser settings.',
          ],
        },
        {
          heading: 'Third-party content',
          paragraphs: [
            'Listing maps use OpenStreetMap map tiles. When you open a map, your browser requests the tiles from OpenStreetMap servers and your IP address is sent to those servers in the process.',
            'The fonts of the website are loaded from Google Fonts; your browser requests the font files from Google servers. The website has no advertising and no advertising cookies.',
          ],
        },
      ],
      banner: {
        text: 'We would like to use Google Analytics to measure how the website is used. Without your consent no analytics cookies are set.',
        accept: 'Accept',
        reject: 'Reject',
        settings: 'Cookie preferences',
        analyticsLabel: 'Analytics',
        analyticsHelp:
          'Measures page views and clicks on WhatsApp, phone and form buttons with Google Analytics 4.',
        necessaryLabel: 'Necessary',
        necessaryHelp: 'Language preference, cookie choice and admin session. Cannot be switched off.',
        save: 'Save choice',
      },
    },
  },

  fa: {
    kvkk: {
      metaTitle: 'اطلاعیهٔ حفاظت از داده‌های شخصی (KVKK) | KA EMLAK',
      metaDescription:
        'اطلاعیه‌ای دربارهٔ اینکه وب‌سایت KA EMLAK کدام داده‌های شخصی را، برای چه هدفی و بر چه مبنای قانونی پردازش می‌کند و حقوق شما طبق قانون شمارهٔ ۶۶۹۸ ترکیه چیست.',
      title: 'اطلاعیهٔ حفاظت از داده‌های شخصی',
      intro:
        'این اطلاعیه بر پایهٔ قانون حفاظت از داده‌های شخصی ترکیه به شمارهٔ ۶۶۹۸ (KVKK، در این متن «قانون») توضیح می‌دهد که هنگام استفاده از این وب‌سایت و تماس با ما، داده‌های شخصی شما چگونه پردازش می‌شود.',
      updated: UPDATED,
      languageNote: NOTE_FA,
      sections: [
        {
          heading: 'مسئول داده‌ها',
          paragraphs: [
            'داده‌های شخصی شما را [VERİ SORUMLUSU UNVANI] («KA EMLAK») در مقام مسئول داده‌ها پردازش می‌کند.',
            `نشانی: [ADRES]. ایمیل: [E-POSTA]. تلفن: ${PHONE_FA}. شمارهٔ مالیاتی/مرسیس: [VERGİ/MERSİS NO]. شمارهٔ گواهی صلاحیت معاملات املاک: 0702648.`,
          ],
        },
        {
          heading: 'داده‌های شخصی که پردازش می‌شود',
          paragraphs: [
            'تنها داده‌هایی را پردازش می‌کنیم که خودتان به ما می‌دهید یا برای کارکرد وب‌سایت لازم است.',
          ],
          bullets: [
            'اطلاعات هویتی: نام و نام خانوادگی',
            'اطلاعات تماس: شمارهٔ تلفن',
            'اطلاعات درخواست: پیامی که می‌نویسید و شناسهٔ آگهی مورد نظر شما',
            'اطلاعات درخواست زمین: نوع درخواست، شهرستان، محله، آدا، پارسل، مساحت زمین، وضعیت کاربری، وجود ساختمان روی زمین و یادداشت شما',
            'داده‌های فنی: نشانی IP و اطلاعات مرورگر که ارائه‌دهندهٔ میزبانی هنگام نمایش وب‌سایت پردازش می‌کند',
            'در صورت رضایت شما، داده‌های استفاده: بازدید صفحه‌ها و کلیک روی دکمه‌های واتس‌اپ، تلفن و فرم',
          ],
        },
        {
          heading: 'هدف‌های پردازش',
          paragraphs: ['داده‌های شما را برای هدف‌های زیر پردازش می‌کنیم.'],
          bullets: [
            'پاسخ به پرسش یا درخواست شما و تماس با شما',
            'ارائهٔ اطلاعات دربارهٔ آگهی مورد نظر شما و تعیین وقت دیدار',
            'ارزیابی زمین یا ساختمان',
            'حفظ امنیت و کارکرد پیوستهٔ وب‌سایت',
            'انجام تکالیفی که مقررات تعیین کرده است',
            'در صورت رضایت شما، سنجش شیوهٔ استفاده از وب‌سایت',
          ],
        },
        {
          heading: 'شیوهٔ گردآوری و مبنای قانونی',
          paragraphs: [
            'داده‌های شما هنگام پر کردن فرم‌های وب‌سایت، تماس تلفنی یا واتس‌اپی با ما و بازدید از وب‌سایت، به صورت الکترونیکی گردآوری می‌شود. پردازش بر مبناهای قانونی زیر در مادهٔ ۵ قانون استوار است.',
          ],
          bullets: [
            'ارتباط مستقیم پردازش با انعقاد یا اجرای قرارداد: بررسی درخواست شما',
            'ضرورت پردازش برای انجام تکلیف قانونی مسئول داده‌ها',
            'منفعت مشروع مسئول داده‌ها، به شرط آسیب نرسیدن به حقوق و آزادی‌های اساسی شما: امنیت و کارکرد وب‌سایت',
            'رضایت صریح شما: سنجش آماری. هر زمان بخواهید می‌توانید رضایت خود را پس بگیرید.',
          ],
        },
        {
          heading: 'داده‌ها به چه کسانی منتقل می‌شود',
          paragraphs: [
            'داده‌های شما را نمی‌فروشیم و برای تبلیغات در اختیار کسی نمی‌گذاریم. داده‌ها تنها به طرف‌های زیر و در حدّ هدف یادشده منتقل می‌شود.',
            'سرورهای این ارائه‌دهندگان ممکن است بیرون از ترکیه باشد. در این صورت داده‌های شما مطابق احکام قانون دربارهٔ انتقال به خارج از کشور منتقل می‌شود.',
          ],
          bullets: [
            'Cloudflare: میزبانی وب‌سایت و نمایش آن به بازدیدکنندگان',
            'Supabase: پایگاه داده‌ای که درخواست‌ها و آگهی‌ها در آن نگهداری می‌شود',
            'Google (Google Analytics 4): سنجش استفاده، تنها در صورت رضایت صریح شما',
            'نهادهای عمومی صلاحیت‌دار: در مواردی که مقررات الزام می‌کند',
          ],
        },
        {
          heading: 'مدت نگهداری',
          paragraphs: [
            'داده‌های شما را تا پایان رسیدگی به درخواستتان و پس از آن به مدتی که مقررات مربوط تعیین کرده است نگه می‌داریم. با پایان این مدت، داده‌ها را پاک می‌کنیم، از میان می‌بریم یا بی‌نام می‌کنیم.',
          ],
        },
        {
          heading: 'حقوق شما طبق مادهٔ ۱۱ قانون',
          paragraphs: ['با مراجعه به مسئول داده‌ها می‌توانید از حقوق زیر استفاده کنید.'],
          bullets: [
            'آگاهی از اینکه داده‌های شخصی شما پردازش شده است یا نه',
            'درخواست اطلاعات در صورت پردازش',
            'آگاهی از هدف پردازش و اینکه داده‌ها مطابق همان هدف به کار رفته است یا نه',
            'آگاهی از اشخاص ثالثی که داده‌ها در داخل یا خارج از کشور به آنان منتقل شده است',
            'درخواست اصلاح داده‌های ناقص یا نادرست',
            'درخواست پاک کردن یا از میان بردن داده‌ها در چارچوب شرایط قانون',
            'درخواست اعلام اصلاح، پاک کردن و از میان بردن داده‌ها به اشخاص ثالثی که داده‌ها به آنان منتقل شده است',
            'اعتراض به نتیجه‌ای به زیان شما که تنها از تحلیل داده‌ها با سامانه‌های خودکار به دست آمده باشد',
            'مطالبهٔ جبران خسارت در صورتی که به سبب پردازش غیرقانونی زیان دیده باشید',
          ],
        },
        {
          heading: 'شیوهٔ درخواست',
          paragraphs: [
            'درخواست خود را همراه با اطلاعاتی که هویت شما را تأیید کند، به صورت کتبی به نشانی [ADRES] یا به ایمیل [E-POSTA] بفرستید.',
            'به درخواست شما در مهلتی که قانون تعیین کرده است پاسخ می‌دهیم. اگر پاسخ را کافی ندانید یا پاسخی دریافت نکنید، می‌توانید به هیئت حفاظت از داده‌های شخصی (Kişisel Verileri Koruma Kurulu) شکایت کنید.',
          ],
        },
      ],
    },
    privacy: {
      metaTitle: 'حریم خصوصی | KA EMLAK',
      metaDescription:
        'صفحه‌ای کوتاه دربارهٔ اینکه وب‌سایت KA EMLAK چه اطلاعاتی از شما می‌گیرد، آن را برای چه کاری به کار می‌برد و چه کسانی آن را می‌بینند.',
      title: 'حریم خصوصی',
      intro:
        'این صفحه به اختصار توضیح می‌دهد که وب‌سایت چه اطلاعاتی از شما می‌گیرد و با آن چه می‌کنیم. جزئیات در اطلاعیهٔ حفاظت از داده‌های شخصی (KVKK) آمده است.',
      updated: UPDATED,
      languageNote: NOTE_FA,
      sections: [
        {
          heading: 'چه اطلاعاتی می‌گیریم',
          paragraphs: [
            'برای دیدن وب‌سایت لازم نیست اطلاعاتی بدهید. تنها هنگامی که فرمی را پر می‌کنید اطلاعات زیر را می‌گیریم.',
          ],
          bullets: [
            'نام و شمارهٔ تلفن شما',
            'پیام شما، اگر بنویسید، و شناسهٔ آگهی مورد نظرتان',
            'در درخواست زمین: نوع درخواست، شهرستان، محله، آدا، پارسل، مساحت، وضعیت کاربری، وجود ساختمان و یادداشت شما',
          ],
        },
        {
          heading: 'این اطلاعات را برای چه به کار می‌بریم',
          paragraphs: [
            'از اطلاعات شما برای تماس با شما، پاسخ به پرسشتان و ارزیابی زمین یا ساختمان استفاده می‌کنیم. تبلیغی نمایش نمی‌دهیم و اطلاعات شما را برای تبلیغات به کار نمی‌بریم.',
          ],
        },
        {
          heading: 'چه کسانی اطلاعات را می‌بینند',
          paragraphs: [
            'درخواست شما را KA EMLAK می‌بیند. وب‌سایت روی Cloudflare میزبانی می‌شود و درخواست‌ها در پایگاه دادهٔ Supabase نگهداری می‌شود؛ سرورهای این ارائه‌دهندگان ممکن است بیرون از ترکیه باشد. اطلاعات شما را نمی‌فروشیم.',
            'اگر تلفنی یا از راه واتس‌اپ با ما تماس بگیرید، آن گفت‌وگو تابع شرایط همان سرویس است.',
          ],
        },
        {
          heading: 'کوکی‌ها و سنجش آماری',
          paragraphs: [
            'وب‌سایت از چند دادهٔ ذخیره‌شده در مرورگر استفاده می‌کند که برای کارکردش لازم است. Google Analytics 4 تنها با رضایت شما فعال می‌شود و بدون رضایت، هیچ کوکی تحلیلی قرار داده نمی‌شود. جزئیات در سیاست کوکی‌ها آمده است.',
          ],
        },
        {
          heading: 'اطلاعات تا چه زمانی نگهداری می‌شود',
          paragraphs: [
            'اطلاعات شما را تا پایان رسیدگی به درخواستتان و به مدتی که مقررات لازم می‌داند نگه می‌داریم. اگر می‌خواهید زودتر پاک شود، به ما بنویسید.',
          ],
        },
        {
          heading: 'حقوق شما و راه تماس',
          paragraphs: [
            `می‌توانید بپرسید چه اطلاعاتی از شما نگهداری می‌شود و اصلاح یا پاک شدن آن را بخواهید. برای این کار به [E-POSTA] بنویسید یا با شمارهٔ ${PHONE_FA} تماس بگیرید.`,
          ],
        },
      ],
    },
    cookies: {
      metaTitle: 'سیاست کوکی‌ها | KA EMLAK',
      metaDescription:
        'کوکی‌های ضروری و تحلیلی وب‌سایت KA EMLAK، رضایت برای Google Analytics 4 و شیوهٔ تغییر انتخاب شما.',
      title: 'سیاست کوکی‌ها',
      intro:
        'این صفحه توضیح می‌دهد که وب‌سایت چه داده‌هایی را در مرورگر شما نگه می‌دارد و چگونه می‌توانید انتخاب خود را تغییر دهید.',
      updated: UPDATED,
      languageNote: NOTE_FA,
      sections: [
        {
          heading: 'کوکی چیست',
          paragraphs: [
            'کوکی دادهٔ کوچکی است که وب‌سایت در مرورگر شما ذخیره می‌کند. در این صفحه واژهٔ «کوکی» موارد مشابه، مانند حافظهٔ محلی مرورگر، را نیز در بر می‌گیرد.',
          ],
        },
        {
          heading: 'موارد ضروری',
          paragraphs: ['این موارد برای کارکرد وب‌سایت لازم است و به رضایت نیاز ندارد.'],
          bullets: [
            'زبان انتخابی: زبانی را که وب‌سایت را با آن می‌بینید به خاطر می‌سپارد',
            'انتخاب کوکی: تصمیم شما دربارهٔ سنجش آماری را به خاطر می‌سپارد',
            'نشست مدیریت: تنها برای کاربر دفتر که وارد پنل مدیریت می‌شود ایجاد می‌گردد',
          ],
        },
        {
          heading: 'کوکی‌های تحلیلی',
          paragraphs: [
            'اگر رضایت بدهید، Google Analytics 4 فعال می‌شود. بدون رضایت، هیچ کوکی تحلیلی قرار داده نمی‌شود و سنجشی انجام نمی‌گیرد.',
            'با Google Analytics 4 تنها موارد زیر را می‌سنجیم. نام، شمارهٔ تلفن و پیامی که در فرم‌ها می‌نویسید به ابزار تحلیلی فرستاده نمی‌شود.',
          ],
          bullets: [
            'بازدید صفحه‌ها',
            'کلیک روی دکمهٔ واتس‌اپ',
            'کلیک روی دکمهٔ تلفن',
            'کلیک برای ارسال فرم',
          ],
        },
        {
          heading: 'تغییر انتخاب',
          paragraphs: [
            'هر زمان بخواهید می‌توانید از پیوند «تنظیمات کوکی» در پایین هر صفحه تصمیم خود را تغییر دهید. همچنین می‌توانید کوکی‌های ذخیره‌شده را از تنظیمات مرورگر پاک کنید.',
          ],
        },
        {
          heading: 'محتوای اشخاص ثالث',
          paragraphs: [
            'نقشهٔ آگهی‌ها از کاشی‌های نقشهٔ OpenStreetMap استفاده می‌کند. هنگامی که نقشه را باز می‌کنید، مرورگر شما کاشی‌ها را از سرورهای OpenStreetMap می‌گیرد و در این میان نشانی IP شما به آن سرورها فرستاده می‌شود.',
            'قلم‌های وب‌سایت از Google Fonts بارگذاری می‌شود و مرورگر شما فایل قلم‌ها را از سرورهای Google می‌گیرد. در این وب‌سایت تبلیغ و کوکی تبلیغاتی وجود ندارد.',
          ],
        },
      ],
      banner: {
        text: 'می‌خواهیم برای سنجش شیوهٔ استفاده از وب‌سایت از Google Analytics استفاده کنیم. بدون رضایت شما هیچ کوکی تحلیلی قرار داده نمی‌شود.',
        accept: 'می‌پذیرم',
        reject: 'نمی‌پذیرم',
        settings: 'تنظیمات کوکی',
        analyticsLabel: 'تحلیلی',
        analyticsHelp:
          'با Google Analytics 4 بازدید صفحه‌ها و کلیک روی دکمه‌های واتس‌اپ، تلفن و فرم را می‌سنجد.',
        necessaryLabel: 'ضروری',
        necessaryHelp: 'زبان انتخابی، انتخاب کوکی و نشست مدیریت. غیرفعال‌شدنی نیست.',
        save: 'ذخیرهٔ انتخاب',
      },
    },
  },
};
