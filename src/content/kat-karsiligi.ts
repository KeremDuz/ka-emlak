import type { Localized, OwnerPageContent } from './types';
import { de } from './locales/de';
import { ru } from './locales/ru';
import { ar } from './locales/ar';

// Farsça metinde telefon numarasının rakam grupları sağdan sola dizilmesin diye yön yalıtımı.
const PHONE = '0532 224 76 58';
const PHONE_FA = `⁦${PHONE}⁩`;

export const katKarsiligi: Localized<OwnerPageContent> = {
  tr: {
    metaTitle: 'Kat karşılığı inşaat: arsa sahipleri için | KA EMLAK',
    metaDescription:
      "Antalya'da arsanızı kat karşılığı değerlendirmek istiyorsanız KA EMLAK arsayı inceler, müteahhitlerden teklif toplar ve teklifleri size açıklar. Ön değerleme ücretsizdir.",
    title: 'Kat karşılığı inşaat',
    intro:
      "Arsanızı satmadan, üzerine yapılacak binadan daire alarak değerlendirebilirsiniz. KA EMLAK, Antalya'da arsa sahibi ile müteahhidi bir araya getirir ve görüşmeleri yürütür.",
    sections: [
      {
        heading: 'Kat karşılığı nedir',
        paragraphs: [
          'Kat karşılığı inşaatta arsa sahibi arsasını müteahhide verir, müteahhit de kendi parasıyla binayı yapar. Bina bitince dairelerin bir bölümü arsa sahibine, kalanı müteahhide kalır. Arsa sahibi inşaat masrafını ödemez; karşılığında arsasının bir bölümünü müteahhide devretmiş olur.',
        ],
      },
      {
        heading: 'KA EMLAK ile süreç nasıl ilerler',
        paragraphs: [
          'Arsanız kat karşılığına uygun değilse satış ya da arsanıza hafif çelik villa yapımı gibi öteki seçenekleri de konuşuruz.',
        ],
        bullets: [
          `Aşağıdaki formu doldurursunuz ya da ${PHONE} numarasını ararsınız. Arsanın yerini ve tapu bilgisini alırız.`,
          'Arsanın konumunu, imar durumunu ve çevredeki satışları inceleriz.',
          'Sizi arar, arsanın yaklaşık değerini ve kat karşılığına uygun olup olmadığını söyleriz. Bu ön değerleme ücretsizdir.',
          'Onay verirseniz arsayı müteahhitlere sunar, gelen teklifleri size yan yana açıklarız.',
          'Bir teklifi seçerseniz şartlar avukatınızla birlikte netleştirilir ve sözleşme noterde imzalanır.',
        ],
        ordered: true,
      },
      {
        heading: 'Hazır bulunması gereken bilgiler',
        paragraphs: [
          'Hepsini bilmeniz gerekmez. İlçe, mahalle, ada ve parsel numarası başlamak için yeterlidir.',
        ],
        bullets: [
          'Tapu bilgisi: ilçe, mahalle, ada ve parsel numarası',
          'Arsanın metrekaresi',
          'Biliyorsanız imar durumu (konut, ticari, kat sayısı gibi)',
          'Arsanın konumu: adres ya da harita konumu',
          'Tapuda birden fazla malik varsa kaç kişi olduğu',
        ],
      },
      {
        heading: 'Paylaşım oranını neler etkiler',
        paragraphs: [
          'Oran her arsa için ayrı belirlenir. Arsayı incelemeden oran söylemiyoruz.',
        ],
        bullets: [
          'Konum: ilçe, mahalle ve arsanın cadde ya da sokağa göre yeri',
          'İmar durumu: arsaya ne kadar inşaat yapılabildiği ve kullanım türü',
          'Arsanın büyüklüğü ve biçimi',
          'Arsanın üzerinde yapı ya da tapuda hisse bulunup bulunmadığı',
        ],
      },
      {
        heading: 'Sözleşme hakkında not',
        paragraphs: [
          'Kesin şartlar noterde düzenlenen sözleşmeyle belirlenir: hangi dairelerin kime kalacağı, teslim tarihi ve gecikme durumunda ne olacağı sözleşmede yazar.',
          'KA EMLAK emlak danışmanlığı yapar, hukuki danışmanlık vermez. Bu sayfadaki bilgiler genel bilgilendirme içindir. İmzadan önce sözleşmeyi bağımsız bir avukata inceletmenizi öneririz.',
        ],
      },
    ],
    formTitle: 'Ücretsiz arsa değerleme',
    formIntro:
      'Arsanızın bilgilerini yazın. Değerleme ücretsizdir; inceledikten sonra sizi telefonla ararız.',
    cta: 'Başvuruyu gönder',
  },

  en: {
    metaTitle: 'Land-for-flats deals for land owners | KA EMLAK',
    metaDescription:
      'If you own land in Antalya and are considering a land-for-flats (kat karşılığı) deal, KA EMLAK reviews the plot, collects offers from contractors and explains them to you. The first valuation is free.',
    title: 'Land-for-flats construction',
    intro:
      'You can keep your land and receive flats in the building that is constructed on it. KA EMLAK brings land owners and contractors together in Antalya and handles the talks.',
    sections: [
      {
        heading: 'What a land-for-flats deal is',
        paragraphs: [
          'In a land-for-flats deal (kat karşılığı inşaat in Turkish), the owner provides the land and the contractor pays for and builds the building. When it is finished, some of the flats belong to the land owner and the rest to the contractor. The owner does not pay for the construction; in return, part of the land is transferred to the contractor.',
        ],
      },
      {
        heading: 'How KA EMLAK works with you',
        paragraphs: [
          'If your land is not suitable for this kind of deal, we also discuss the other options, such as selling it or building a light-steel villa on it.',
        ],
        bullets: [
          `You fill in the form below or call ${PHONE}. We take the location and the title deed details of the land.`,
          'We review the location, the zoning status and recent sales in the area.',
          'We call you and tell you the approximate value of the land and whether it suits a land-for-flats deal. This first valuation is free.',
          'With your approval, we present the land to contractors and explain the offers to you side by side.',
          'If you choose an offer, the terms are settled together with your lawyer and the contract is signed at a notary.',
        ],
        ordered: true,
      },
      {
        heading: 'Information to have ready',
        paragraphs: [
          'You do not need all of it. The district, neighbourhood, block and parcel numbers are enough to start.',
        ],
        bullets: [
          'Title deed details: district, neighbourhood, block (ada) and parcel (parsel) numbers',
          'The size of the land in square metres',
          'The zoning status (imar durumu), if you know it: residential, commercial, number of floors',
          'The location: an address or a map pin',
          'If the title deed has more than one owner, how many owners there are',
        ],
      },
      {
        heading: 'What affects the share ratio',
        paragraphs: [
          'The ratio is set separately for each plot. We do not quote a ratio before reviewing the land.',
        ],
        bullets: [
          'Location: the district, the neighbourhood and how the plot sits on its street',
          'Zoning: how much may be built on the plot and for what use',
          'The size and shape of the plot',
          'Whether there is a building on the plot or the title is held in shares',
        ],
      },
      {
        heading: 'A note on the contract',
        paragraphs: [
          'The final terms are set in a contract drawn up at a notary: which flats go to whom, the delivery date and what happens if there is a delay are all written there.',
          'KA EMLAK is a real-estate office and does not give legal advice. The information on this page is general. We recommend having the contract reviewed by an independent lawyer before you sign.',
        ],
      },
    ],
    formTitle: 'Free land valuation',
    formIntro:
      'Enter the details of your land. The valuation is free; after reviewing it we call you back.',
    cta: 'Send application',
  },

  fa: {
    metaTitle: 'مشارکت در ساخت برای مالکان زمین | KA EMLAK',
    metaDescription:
      'اگر در آنتالیا زمین دارید و به مشارکت در ساخت (kat karşılığı) فکر می‌کنید، KA EMLAK زمین را بررسی می‌کند، از سازندگان پیشنهاد می‌گیرد و پیشنهادها را برای شما توضیح می‌دهد. ارزیابی اولیه رایگان است.',
    title: 'مشارکت در ساخت',
    intro:
      'می‌توانید زمین خود را نفروشید و در برابر آن، از ساختمانی که روی زمین ساخته می‌شود واحد دریافت کنید. KA EMLAK در آنتالیا مالک زمین و سازنده را با هم آشنا می‌کند و گفت‌وگوها را پیش می‌برد.',
    sections: [
      {
        heading: 'مشارکت در ساخت چیست',
        paragraphs: [
          'در مشارکت در ساخت (به ترکی: kat karşılığı inşaat) مالک زمین را در اختیار سازنده می‌گذارد و سازنده با هزینهٔ خود ساختمان را می‌سازد. پس از پایان کار، بخشی از واحدها به مالک زمین و بقیه به سازنده می‌رسد. مالک هزینهٔ ساخت را نمی‌پردازد و در برابر آن، سهمی از زمین به سازنده منتقل می‌شود.',
        ],
      },
      {
        heading: 'روند کار با KA EMLAK',
        paragraphs: [
          'اگر زمین شما برای مشارکت در ساخت مناسب نباشد، دربارهٔ راه‌های دیگر مانند فروش زمین یا ساخت ویلای سازهٔ فولادی سبک روی آن نیز گفت‌وگو می‌کنیم.',
        ],
        bullets: [
          `فرم پایین صفحه را پر می‌کنید یا با شمارهٔ ${PHONE_FA} تماس می‌گیرید. نشانی زمین و مشخصات سند را از شما می‌گیریم.`,
          'موقعیت زمین، وضعیت کاربری و فروش‌های اخیر همان محدوده را بررسی می‌کنیم.',
          'با شما تماس می‌گیریم و ارزش تقریبی زمین و مناسب بودن آن برای مشارکت در ساخت را می‌گوییم. این ارزیابی اولیه رایگان است.',
          'در صورت موافقت شما، زمین را به سازندگان معرفی می‌کنیم و پیشنهادهای رسیده را در کنار هم برایتان توضیح می‌دهیم.',
          'اگر پیشنهادی را انتخاب کنید، شرایط با حضور وکیل شما نهایی می‌شود و قرارداد در دفتر اسناد رسمی (نوتر) امضا می‌شود.',
        ],
        ordered: true,
      },
      {
        heading: 'اطلاعاتی که بهتر است آماده داشته باشید',
        paragraphs: [
          'لازم نیست همه را بدانید. نام شهرستان و محله و شمارهٔ آدا و پارسل برای شروع کافی است.',
        ],
        bullets: [
          'مشخصات سند (تاپو): شهرستان، محله، شمارهٔ آدا (ada) و شمارهٔ پارسل (parsel)',
          'مساحت زمین به متر مربع',
          'وضعیت کاربری (imar durumu) در صورت اطلاع: مسکونی، تجاری، تعداد طبقات',
          'موقعیت زمین: نشانی یا موقعیت روی نقشه',
          'اگر سند بیش از یک مالک دارد، تعداد مالکان',
        ],
      },
      {
        heading: 'چه عواملی بر نسبت تقسیم اثر دارد',
        paragraphs: [
          'نسبت تقسیم برای هر زمین جداگانه تعیین می‌شود. پیش از بررسی زمین نسبتی اعلام نمی‌کنیم.',
        ],
        bullets: [
          'موقعیت: شهرستان، محله و جای زمین نسبت به خیابان یا کوچه',
          'وضعیت کاربری: میزان ساخت مجاز روی زمین و نوع استفاده',
          'مساحت و شکل زمین',
          'وجود ساختمان روی زمین یا مشاع بودن سند',
        ],
      },
      {
        heading: 'نکته‌ای دربارهٔ قرارداد',
        paragraphs: [
          'شرایط نهایی در قراردادی تعیین می‌شود که در دفتر اسناد رسمی تنظیم می‌گردد: اینکه کدام واحدها به چه کسی می‌رسد، تاریخ تحویل و پیامد تأخیر، همه در قرارداد نوشته می‌شود.',
          'KA EMLAK مشاور املاک است و مشاورهٔ حقوقی نمی‌دهد. مطالب این صفحه جنبهٔ اطلاع‌رسانی عمومی دارد. توصیه می‌کنیم پیش از امضا، قرارداد را به یک وکیل مستقل نشان دهید.',
        ],
      },
    ],
    formTitle: 'ارزیابی رایگان زمین',
    formIntro:
      'مشخصات زمین خود را بنویسید. ارزیابی رایگان است و پس از بررسی، تلفنی با شما تماس می‌گیریم.',
    cta: 'ارسال درخواست',
  },
  // Almanca, Rusça ve Arapça metinler src/content/locales/ altındadır.
  de: de.katKarsiligi,
  ru: ru.katKarsiligi,
  ar: ar.katKarsiligi,
};
