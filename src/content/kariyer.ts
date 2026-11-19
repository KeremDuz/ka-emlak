import type { CareerContent, Localized } from './types';

// Ofisin Instagram'daki danışman alımı duyurusundan (5 Kasım 2026). Başvuru telefonla ya da WhatsApp'tan alınır; formu yoktur.
const PHONE = '0532 224 76 58';
// Farsça metinde telefon numarasının rakam grupları sağdan sola dizilmesin diye yön yalıtımı.
const PHONE_FA = `⁦${PHONE}⁩`;

export const kariyer: Localized<CareerContent> = {
  tr: {
    metaTitle: 'Gayrimenkul danışmanı arıyoruz',
    metaDescription:
      "KA Global Real Estate, Antalya Konyaaltı'ndaki ofisine gayrimenkul danışmanları arıyor: %50 net komisyon, ofise gelen müşteri talepleri ve Öğretmenevleri'nde plaza ofis.",
    title: 'Ekibimize gayrimenkul danışmanları arıyoruz',
    intro:
      "KA Global Real Estate yeni ekibini kuruyor. Antalya Konyaaltı'ndaki ofisimizde birlikte çalışacağımız gayrimenkul danışmanlarını arıyoruz.",
    sections: [
      {
        heading: 'Neler sunuyoruz',
        paragraphs: [],
        bullets: [
          '%50 net komisyon',
          'Ofise gelen müşteri talepleri dahil',
          "Konyaaltı Öğretmenevleri Mahallesi'nde plaza ofiste çalışma",
          'Sıfırdan kurulan ekipte erken katılım avantajı',
        ],
      },
      {
        heading: 'Kimler başvurabilir',
        paragraphs: [
          'Deneyimli ya da sektöre yeni başlayan, satışa ve öğrenmeye açık herkes başvurabilir. Kendi kazancını kendin belirleyeceğin, güçlü bir ekibin parçası olmak istiyorsan bizimle tanış.',
        ],
      },
    ],
    applyTitle: 'Nasıl başvurulur',
    applyText: `Başvuru için İshak Kahraman'ı ${PHONE} numarasından arayın ya da WhatsApp'tan yazın.`,
    callLabel: 'Arayın',
    whatsappLabel: 'WhatsApp’tan yazın',
    whatsappMessage: 'Merhaba, gayrimenkul danışmanlığı ilanınız için başvurmak istiyorum.',
  },
  en: {
    metaTitle: 'We are hiring real estate consultants',
    metaDescription:
      'KA Global Real Estate is looking for real estate consultants for its office in Konyaaltı, Antalya: 50% net commission, client enquiries from the office included and a plaza office in Öğretmenevleri.',
    title: 'We are looking for real estate consultants',
    intro:
      'KA Global Real Estate is building its new team. We are looking for real estate consultants to work with us at our office in Konyaaltı, Antalya.',
    sections: [
      {
        heading: 'What we offer',
        paragraphs: [],
        bullets: [
          '50% net commission',
          'Client enquiries that come to the office included',
          'Work from a plaza office in the Öğretmenevleri neighbourhood of Konyaaltı',
          'The advantage of joining early in a team built from scratch',
        ],
      },
      {
        heading: 'Who can apply',
        paragraphs: [
          'Anyone open to sales and learning can apply, whether experienced or new to the sector. If you want to set your own earnings and be part of a strong team, get in touch.',
        ],
      },
    ],
    applyTitle: 'How to apply',
    applyText: `To apply, call İshak Kahraman on ${PHONE} or send a WhatsApp message.`,
    callLabel: 'Call',
    whatsappLabel: 'Message on WhatsApp',
    whatsappMessage: 'Hello, I would like to apply for your real estate consultant position.',
  },
  fa: {
    metaTitle: 'استخدام مشاور املاک',
    metaDescription:
      'KA Global Real Estate برای دفتر خود در کنیالتی آنتالیا مشاور املاک استخدام می‌کند: ۵۰٪ پورسانت خالص، همراه با مشتریانی که به دفتر مراجعه می‌کنند، و دفتر اداری در محله اوغرتمن‌اولری.',
    title: 'برای تیم خود مشاور املاک استخدام می‌کنیم',
    intro:
      'KA Global Real Estate در حال تشکیل تیم جدید خود است. برای دفترمان در کنیالتی آنتالیا به دنبال مشاوران املاک هستیم.',
    sections: [
      {
        heading: 'آنچه ارائه می‌کنیم',
        paragraphs: [],
        bullets: [
          '۵۰٪ پورسانت خالص',
          'شامل درخواست‌های مشتریانی که به دفتر مراجعه می‌کنند',
          'کار در دفتر اداری در محله اوغرتمن‌اولری کنیالتی',
          'مزیت پیوستن زودهنگام به تیمی که از صفر ساخته می‌شود',
        ],
      },
      {
        heading: 'چه کسانی می‌توانند درخواست دهند',
        paragraphs: [
          'هر کسی که به فروش و یادگیری علاقه دارد، با تجربه یا تازه‌کار، می‌تواند درخواست دهد. اگر می‌خواهید درآمد خود را خودتان تعیین کنید و بخشی از یک تیم قوی باشید، با ما در تماس باشید.',
        ],
      },
    ],
    applyTitle: 'نحوه درخواست',
    applyText: `برای درخواست با ایشاک کهرمان به شماره ${PHONE_FA} تماس بگیرید یا در واتس‌اپ پیام دهید.`,
    callLabel: 'تماس',
    whatsappLabel: 'پیام در واتس‌اپ',
    whatsappMessage: 'سلام، می‌خواهم برای موقعیت مشاور املاک درخواست بدهم.',
  },
};
