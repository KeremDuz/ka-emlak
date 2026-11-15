import type { Localized, OwnerPageContent } from './types';

// Farsça metinde telefon numarasının rakam grupları sağdan sola dizilmesin diye yön yalıtımı.
const PHONE = '0532 224 76 58';
const PHONE_FA = `⁦${PHONE}⁩`;

export const kentselDonusum: Localized<OwnerPageContent> = {
  tr: {
    metaTitle: 'Kentsel dönüşüm: eski bina sahipleri için | KA EMLAK',
    metaDescription:
      "Antalya'da eski ya da riskli binanızı yenilemek istiyorsanız KA EMLAK daireleri değerler, seçenekleri açıklar ve kat maliklerini müteahhitle bir araya getirir.",
    title: 'Kentsel dönüşüm',
    intro:
      'Eski ya da depreme dayanıksız bir binada daireniz varsa bina yıkılıp yeniden yapılabilir. KA EMLAK dairelerin değerini çıkarır, seçenekleri açıklar ve kat maliklerini müteahhitle görüştürür.',
    sections: [
      {
        heading: 'Kentsel dönüşüm nedir',
        paragraphs: [
          'Kentsel dönüşüm, riskli bulunan bir binanın yıkılıp yerine yürürlükteki yapı kurallarına uygun yeni bir bina yapılmasıdır. Kararı kat malikleri birlikte verir. Yeni bina genellikle bir müteahhitle kat karşılığı anlaşması yapılarak inşa edilir; malikler binayı satmayı da seçebilir.',
        ],
      },
      {
        heading: 'Bina ne zaman kapsama girer',
        paragraphs: [
          'Genel olarak, binanın riskli yapı olarak tespit edilmesi gerekir. Bu tespiti, yetkili kuruluşlar binada teknik inceleme yaparak hazırlar. Binanın yaşı tek başına belirleyici değildir; sonucu teknik rapor belirler.',
          'Kurallar ve devlet destekleri zaman içinde değişir. Güncel koşulları, karar çoğunluğunu ve yararlanabileceğiniz destekleri belediyeden ve Çevre, Şehircilik ve İklim Değişikliği Bakanlığının il müdürlüğünden teyit edin.',
        ],
      },
      {
        heading: 'KA EMLAK ne yapar',
        paragraphs: [
          'Riskli yapı tespiti, ruhsat ve öteki resmî işlemler yetkili kuruluşlar ve belediye tarafından yürütülür. Ofisimiz bu işlemleri yapmaz; değerleme, müteahhit bulma ve görüşme tarafında yardımcı olur.',
        ],
        bullets: [
          `Aşağıdaki formu doldurursunuz ya da ${PHONE} numarasını ararsınız. Binanın yerini ve kaç bağımsız bölüm olduğunu öğreniriz.`,
          'Mevcut dairelerin ve arsanın bugünkü yaklaşık değerini çıkarırız.',
          'Seçenekleri açıklarız: müteahhitle yeniden yapım, binanın birlikte satılması ya da payınızın satışı.',
          'Kat malikleri isterse müteahhitlerden teklif alır, teklifleri karşılaştırarak anlatırız.',
          'Malikler bir teklifte anlaşırsa şartlar avukatlarla netleştirilir ve sözleşme noterde imzalanır.',
        ],
        ordered: true,
      },
      {
        heading: 'Hazır bulunması gereken bilgiler',
        paragraphs: [
          'Bu bilgilerin hepsi elinizde olmayabilir. Binanın adresi ve tapu bilgisi ilk görüşme için yeterlidir.',
        ],
        bullets: [
          'Binanın adresi',
          'Tapu bilgisi: ilçe, mahalle, ada ve parsel numarası',
          'Binadaki daire ve dükkân sayısı',
          'Kaç kat maliki olduğu ve dönüşüm konusunda ne düşündükleri',
          'Varsa riskli yapı tespit raporu',
        ],
      },
      {
        heading: 'Sözleşme hakkında not',
        paragraphs: [
          'Kesin şartlar noterde düzenlenen sözleşmeyle belirlenir: hangi dairenin kime verileceği, teslim tarihi ve inşaat süresindeki kira konusu sözleşmede yazar.',
          'KA EMLAK emlak danışmanlığı yapar, hukuki danışmanlık vermez. Bu sayfadaki bilgiler genel bilgilendirme içindir. İmzadan önce sözleşmeyi bağımsız bir avukata inceletmenizi öneririz.',
        ],
      },
    ],
    formTitle: 'Ücretsiz değerleme isteyin',
    formIntro:
      'Binanın bilgilerini yazın. Değerleme ücretsizdir; inceledikten sonra sizi telefonla ararız.',
    cta: 'Başvuruyu gönder',
  },

  en: {
    metaTitle: 'Urban renewal for owners of old buildings | KA EMLAK',
    metaDescription:
      'If you want to renew an old or at-risk building in Antalya, KA EMLAK values the flats, explains the options and brings the owners together with a contractor.',
    title: 'Urban renewal',
    intro:
      'If you own a flat in an old building or one that is not earthquake-resistant, the building can be demolished and rebuilt. KA EMLAK values the flats, explains the options and puts the owners in touch with a contractor.',
    sections: [
      {
        heading: 'What urban renewal is',
        paragraphs: [
          'Urban renewal (kentsel dönüşüm in Turkish) means demolishing a building that has been found to be at risk and replacing it with a new one that meets current building rules. The flat owners decide together. The new building is usually built by a contractor under a land-for-flats deal; the owners may also choose to sell the building.',
        ],
      },
      {
        heading: 'When a building qualifies',
        paragraphs: [
          'In general, the building has to be officially identified as an at-risk structure (riskli yapı). Authorised institutions prepare this report after a technical inspection of the building. The age of the building does not decide the matter on its own; the technical report does.',
          'The rules and the state support available change over time. Check the current conditions, the majority needed for a decision and any support you may be entitled to with the municipality and with the provincial office of the Ministry of Environment, Urbanisation and Climate Change.',
        ],
      },
      {
        heading: 'What KA EMLAK does',
        paragraphs: [
          'The at-risk assessment, the building permit and other official procedures are carried out by the authorised institutions and the municipality. Our office does not handle them; we help with valuation, finding a contractor and the talks.',
        ],
        bullets: [
          `You fill in the form below or call ${PHONE}. We ask where the building is and how many units it has.`,
          'We work out the approximate current value of the existing flats and the land.',
          'We explain the options: rebuilding with a contractor, selling the building together, or selling your own share.',
          'If the owners wish, we collect offers from contractors and explain them side by side.',
          'If the owners agree on an offer, the terms are settled with the lawyers and the contract is signed at a notary.',
        ],
        ordered: true,
      },
      {
        heading: 'Information to have ready',
        paragraphs: [
          'You may not have all of this. The address of the building and the title deed details are enough for a first conversation.',
        ],
        bullets: [
          'The address of the building',
          'Title deed details: district, neighbourhood, block (ada) and parcel (parsel) numbers',
          'The number of flats and shops in the building',
          'How many owners there are and what they think about renewal',
          'The at-risk structure report, if there is one',
        ],
      },
      {
        heading: 'A note on the contract',
        paragraphs: [
          'The final terms are set in a contract drawn up at a notary: which flat goes to whom, the delivery date and the question of rent during construction are all written there.',
          'KA EMLAK is a real-estate office and does not give legal advice. The information on this page is general. We recommend having the contract reviewed by an independent lawyer before you sign.',
        ],
      },
    ],
    formTitle: 'Ask for a free valuation',
    formIntro:
      'Enter the details of the building. The valuation is free; after reviewing it we call you back.',
    cta: 'Send application',
  },

  fa: {
    metaTitle: 'نوسازی شهری برای مالکان ساختمان‌های قدیمی | KA EMLAK',
    metaDescription:
      'اگر می‌خواهید ساختمان قدیمی یا پرخطر خود را در آنتالیا نوسازی کنید، KA EMLAK واحدها را ارزیابی می‌کند، گزینه‌ها را توضیح می‌دهد و مالکان را با سازنده آشنا می‌کند.',
    title: 'نوسازی شهری',
    intro:
      'اگر در ساختمانی قدیمی یا ناایمن در برابر زلزله واحد دارید، آن ساختمان را می‌توان تخریب کرد و از نو ساخت. KA EMLAK ارزش واحدها را برآورد می‌کند، گزینه‌ها را توضیح می‌دهد و مالکان را با سازنده به گفت‌وگو می‌نشاند.',
    sections: [
      {
        heading: 'نوسازی شهری چیست',
        paragraphs: [
          'نوسازی شهری (به ترکی: kentsel dönüşüm) یعنی تخریب ساختمانی که پرخطر تشخیص داده شده و ساخت ساختمانی تازه به جای آن، مطابق مقررات ساختمانی روز. تصمیم را مالکان واحدها با هم می‌گیرند. ساختمان تازه معمولاً با قرارداد مشارکت در ساخت به دست یک سازنده ساخته می‌شود؛ مالکان می‌توانند فروش ساختمان را نیز انتخاب کنند.',
        ],
      },
      {
        heading: 'چه ساختمانی مشمول می‌شود',
        paragraphs: [
          'به طور کلی، ساختمان باید به صورت رسمی «سازهٔ پرخطر» (riskli yapı) تشخیص داده شود. این گزارش را مؤسسه‌های مجاز پس از بازرسی فنی ساختمان تهیه می‌کنند. قدمت ساختمان به تنهایی تعیین‌کننده نیست و نتیجه را گزارش فنی مشخص می‌کند.',
          'مقررات و حمایت‌های دولتی در طول زمان تغییر می‌کند. شرایط روز، اکثریت لازم برای تصمیم‌گیری و حمایت‌هایی را که ممکن است به شما تعلق بگیرد از شهرداری و ادارهٔ استانی وزارت محیط زیست، شهرسازی و تغییرات اقلیمی بپرسید.',
        ],
      },
      {
        heading: 'KA EMLAK چه می‌کند',
        paragraphs: [
          'تشخیص سازهٔ پرخطر، پروانهٔ ساخت و دیگر کارهای اداری را مؤسسه‌های مجاز و شهرداری انجام می‌دهند. دفتر ما این کارها را انجام نمی‌دهد و در ارزیابی، یافتن سازنده و گفت‌وگوها به شما کمک می‌کند.',
        ],
        bullets: [
          `فرم پایین صفحه را پر می‌کنید یا با شمارهٔ ${PHONE_FA} تماس می‌گیرید. نشانی ساختمان و تعداد واحدهای آن را می‌پرسیم.`,
          'ارزش تقریبی امروز واحدهای موجود و زمین را برآورد می‌کنیم.',
          'گزینه‌ها را توضیح می‌دهیم: بازسازی با سازنده، فروش یکجای ساختمان یا فروش سهم شما.',
          'اگر مالکان بخواهند، از سازندگان پیشنهاد می‌گیریم و پیشنهادها را در کنار هم توضیح می‌دهیم.',
          'اگر مالکان بر سر پیشنهادی به توافق برسند، شرایط با حضور وکلا نهایی می‌شود و قرارداد در دفتر اسناد رسمی (نوتر) امضا می‌شود.',
        ],
        ordered: true,
      },
      {
        heading: 'اطلاعاتی که بهتر است آماده داشته باشید',
        paragraphs: [
          'ممکن است همهٔ این اطلاعات را در اختیار نداشته باشید. نشانی ساختمان و مشخصات سند برای گفت‌وگوی نخست کافی است.',
        ],
        bullets: [
          'نشانی ساختمان',
          'مشخصات سند (تاپو): شهرستان، محله، شمارهٔ آدا (ada) و شمارهٔ پارسل (parsel)',
          'تعداد واحدهای مسکونی و مغازه‌های ساختمان',
          'تعداد مالکان و نظر آنان دربارهٔ نوسازی',
          'گزارش سازهٔ پرخطر، اگر تهیه شده است',
        ],
      },
      {
        heading: 'نکته‌ای دربارهٔ قرارداد',
        paragraphs: [
          'شرایط نهایی در قراردادی تعیین می‌شود که در دفتر اسناد رسمی تنظیم می‌گردد: اینکه کدام واحد به چه کسی می‌رسد، تاریخ تحویل و موضوع اجاره در مدت ساخت، همه در قرارداد نوشته می‌شود.',
          'KA EMLAK مشاور املاک است و مشاورهٔ حقوقی نمی‌دهد. مطالب این صفحه جنبهٔ اطلاع‌رسانی عمومی دارد. توصیه می‌کنیم پیش از امضا، قرارداد را به یک وکیل مستقل نشان دهید.',
        ],
      },
    ],
    formTitle: 'درخواست ارزیابی رایگان',
    formIntro:
      'مشخصات ساختمان را بنویسید. ارزیابی رایگان است و پس از بررسی، تلفنی با شما تماس می‌گیریم.',
    cta: 'ارسال درخواست',
  },
};
