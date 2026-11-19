import type { LandFormContent, Localized } from './types';
import { de } from './locales/de';
import { ru } from './locales/ru';
import { ar } from './locales/ar';

export const arsaFormu: Localized<LandFormContent> = {
  tr: {
    title: 'Ücretsiz arsa değerleme',
    intro: 'Değerleme ücretsizdir; bilgileri inceledikten sonra sizi telefonla ararız.',
    fields: {
      fullName: { label: 'Ad soyad', placeholder: '', help: '' },
      phone: {
        label: 'Telefon',
        placeholder: '05xx xxx xx xx',
        help: 'Sizi bu numaradan ararız.',
      },
      applicationType: { label: 'Başvuru türü', placeholder: '', help: '' },
      district: { label: 'İlçe', placeholder: 'Örnek: Konyaaltı', help: '' },
      neighbourhood: { label: 'Mahalle', placeholder: '', help: '' },
      block: {
        label: 'Ada',
        placeholder: '',
        help: 'Tapuda yazar. Bilmiyorsanız boş bırakın.',
      },
      parcel: {
        label: 'Parsel',
        placeholder: '',
        help: 'Tapuda yazar. Bilmiyorsanız boş bırakın.',
      },
      areaM2: {
        label: 'Arsa büyüklüğü (m²)',
        placeholder: 'Örnek: 650',
        help: 'Yaklaşık değer yazabilirsiniz.',
      },
      zoning: { label: 'İmar durumu', placeholder: '', help: '' },
      hasBuilding: { label: 'Arsada yapı var mı', placeholder: '', help: '' },
      note: {
        label: 'Not',
        placeholder: 'Eklemek istediğiniz bilgi',
        help: 'Hissedar sayısı ya da mevcut yapının durumu gibi bilgileri buraya yazabilirsiniz.',
      },
    },
    options: {
      applicationType: {
        katKarsiligi: 'Kat karşılığı',
        kentselDonusum: 'Kentsel dönüşüm',
        degerleme: 'Değerleme',
      },
      zoning: {
        unknown: 'Bilmiyorum',
        residential: 'Konut',
        commercial: 'Ticari',
        mixed: 'Konut + ticari',
        other: 'Diğer',
      },
      hasBuilding: { yes: 'Evet', no: 'Hayır' },
    },
    optionalTag: 'isteğe bağlı',
    consent: '{privacy} okudum; başvurum için aranmayı kabul ediyorum.',
    privacyLinkLabel: 'KVKK aydınlatma metnini',
    submit: 'Başvuruyu gönder',
    submitting: 'Gönderiliyor',
    validation: {
      required: 'Bu alanı doldurun.',
      fullName: 'Adınızı ve soyadınızı yazın.',
      phone: 'Telefon numarasını alan koduyla birlikte yazın.',
      applicationType: 'Başvuru türünü seçin.',
      district: 'Arsanın bulunduğu ilçeyi yazın.',
      areaM2: 'Arsa büyüklüğünü yalnız rakamla yazın.',
      zoning: 'İmar durumunu seçin. Bilmiyorsanız "Bilmiyorum" seçeneğini işaretleyin.',
      hasBuilding: 'Arsada yapı olup olmadığını seçin.',
      noteTooLong: 'Not çok uzun. Lütfen kısaltın.',
      consent: 'Başvuruyu gönderebilmek için kutuyu işaretleyin.',
    },
    success: {
      title: 'Başvurunuz bize ulaştı',
      text: 'Bilgileri inceleyip sizi yazdığınız numaradan arayacağız.',
    },
    error: {
      generic: 'Başvuru gönderilemedi. Lütfen yeniden deneyin ya da 0532 224 76 58 numarasını arayın.',
      network: 'İnternet bağlantısı kurulamadı. Bağlantınızı kontrol edip yeniden deneyin.',
      tooMany: 'Kısa sürede çok fazla deneme yapıldı. Biraz sonra yeniden deneyin.',
    },
  },

  en: {
    title: 'Free land valuation',
    intro: 'The valuation is free; after reviewing the details we call you back.',
    fields: {
      fullName: { label: 'Full name', placeholder: '', help: '' },
      phone: {
        label: 'Phone',
        placeholder: '+90 5xx xxx xx xx',
        help: 'We call you on this number.',
      },
      applicationType: { label: 'Type of application', placeholder: '', help: '' },
      district: { label: 'District', placeholder: 'Example: Konyaaltı', help: '' },
      neighbourhood: { label: 'Neighbourhood', placeholder: '', help: '' },
      block: {
        label: 'Block (ada)',
        placeholder: '',
        help: 'It is written on the title deed. Leave it empty if you do not know it.',
      },
      parcel: {
        label: 'Parcel (parsel)',
        placeholder: '',
        help: 'It is written on the title deed. Leave it empty if you do not know it.',
      },
      areaM2: {
        label: 'Land size (m²)',
        placeholder: 'Example: 650',
        help: 'An approximate figure is fine.',
      },
      zoning: { label: 'Zoning status', placeholder: '', help: '' },
      hasBuilding: { label: 'Is there a building on the land', placeholder: '', help: '' },
      note: {
        label: 'Note',
        placeholder: 'Anything you would like to add',
        help: 'For example the number of co-owners or the condition of the existing building.',
      },
    },
    options: {
      applicationType: {
        katKarsiligi: 'Land-for-flats',
        kentselDonusum: 'Urban renewal',
        degerleme: 'Valuation',
      },
      zoning: {
        unknown: 'I do not know',
        residential: 'Residential',
        commercial: 'Commercial',
        mixed: 'Residential + commercial',
        other: 'Other',
      },
      hasBuilding: { yes: 'Yes', no: 'No' },
    },
    optionalTag: 'optional',
    consent: 'I have read the {privacy} and agree to be called about my application.',
    privacyLinkLabel: 'privacy notice',
    submit: 'Send application',
    submitting: 'Sending',
    validation: {
      required: 'Fill in this field.',
      fullName: 'Enter your first and last name.',
      phone: 'Enter the phone number with its area or country code.',
      applicationType: 'Choose the type of application.',
      district: 'Enter the district where the land is.',
      areaM2: 'Enter the land size in digits only.',
      zoning: 'Choose the zoning status. If you are not sure, choose "I do not know".',
      hasBuilding: 'Choose whether there is a building on the land.',
      noteTooLong: 'The note is too long. Please shorten it.',
      consent: 'Tick the box to send the application.',
    },
    success: {
      title: 'We have received your application',
      text: 'We will review the details and call you on the number you gave.',
    },
    error: {
      generic: 'The application could not be sent. Please try again or call 0532 224 76 58.',
      network: 'There is no internet connection. Check your connection and try again.',
      tooMany: 'Too many attempts in a short time. Try again a little later.',
    },
  },

  fa: {
    title: 'ارزیابی رایگان زمین',
    intro: 'ارزیابی رایگان است و پس از بررسی اطلاعات، تلفنی با شما تماس می‌گیریم.',
    fields: {
      fullName: { label: 'نام و نام خانوادگی', placeholder: '', help: '' },
      phone: {
        label: 'تلفن',
        placeholder: '+90 5xx xxx xx xx',
        help: 'با همین شماره با شما تماس می‌گیریم.',
      },
      applicationType: { label: 'نوع درخواست', placeholder: '', help: '' },
      district: { label: 'شهرستان (ilçe)', placeholder: 'نمونه: کنیاآلتی', help: '' },
      neighbourhood: { label: 'محله', placeholder: '', help: '' },
      block: {
        label: 'شمارهٔ آدا (ada)',
        placeholder: '',
        help: 'در سند (تاپو) نوشته شده است. اگر نمی‌دانید، خالی بگذارید.',
      },
      parcel: {
        label: 'شمارهٔ پارسل (parsel)',
        placeholder: '',
        help: 'در سند (تاپو) نوشته شده است. اگر نمی‌دانید، خالی بگذارید.',
      },
      areaM2: {
        label: 'مساحت زمین (متر مربع)',
        placeholder: 'نمونه: 650',
        help: 'عدد تقریبی هم کافی است.',
      },
      zoning: { label: 'وضعیت کاربری (imar durumu)', placeholder: '', help: '' },
      hasBuilding: { label: 'آیا روی زمین ساختمانی هست', placeholder: '', help: '' },
      note: {
        label: 'یادداشت',
        placeholder: 'هر توضیحی که می‌خواهید اضافه کنید',
        help: 'برای نمونه تعداد شریکان سند یا وضعیت ساختمان موجود.',
      },
    },
    options: {
      applicationType: {
        katKarsiligi: 'مشارکت در ساخت',
        kentselDonusum: 'نوسازی شهری',
        degerleme: 'ارزیابی',
      },
      zoning: {
        unknown: 'نمی‌دانم',
        residential: 'مسکونی',
        commercial: 'تجاری',
        mixed: 'مسکونی + تجاری',
        other: 'سایر',
      },
      hasBuilding: { yes: 'بله', no: 'خیر' },
    },
    optionalTag: 'اختیاری',
    consent: '{privacy} را خوانده‌ام و موافقم که دربارهٔ درخواستم با من تماس گرفته شود.',
    privacyLinkLabel: 'اطلاعیهٔ حفاظت از داده‌های شخصی',
    submit: 'ارسال درخواست',
    submitting: 'در حال ارسال',
    validation: {
      required: 'این قسمت را پر کنید.',
      fullName: 'نام و نام خانوادگی خود را بنویسید.',
      phone: 'شمارهٔ تلفن را همراه با پیش‌شماره بنویسید.',
      applicationType: 'نوع درخواست را انتخاب کنید.',
      district: 'شهرستانی را که زمین در آن قرار دارد بنویسید.',
      areaM2: 'مساحت زمین را فقط با عدد بنویسید.',
      zoning: 'وضعیت کاربری را انتخاب کنید. اگر مطمئن نیستید، گزینهٔ «نمی‌دانم» را بزنید.',
      hasBuilding: 'مشخص کنید که روی زمین ساختمانی هست یا نه.',
      noteTooLong: 'یادداشت بیش از اندازه طولانی است. لطفاً آن را کوتاه کنید.',
      consent: 'برای ارسال درخواست، این گزینه را علامت بزنید.',
    },
    success: {
      title: 'درخواست شما به دست ما رسید',
      text: 'اطلاعات را بررسی می‌کنیم و با شماره‌ای که نوشته‌اید تماس می‌گیریم.',
    },
    error: {
      generic:
        'درخواست ارسال نشد. لطفاً دوباره تلاش کنید یا با شمارهٔ ⁦0532 224 76 58⁩ تماس بگیرید.',
      network: 'اتصال اینترنت برقرار نیست. اتصال خود را بررسی کنید و دوباره تلاش کنید.',
      tooMany: 'در زمانی کوتاه بیش از اندازه تلاش شده است. کمی بعد دوباره امتحان کنید.',
    },
  },
  // Almanca, Rusça ve Arapça metinler src/content/locales/ altındadır.
  de: de.arsaFormu,
  ru: ru.arsaFormu,
  ar: ar.arsaFormu,
};
