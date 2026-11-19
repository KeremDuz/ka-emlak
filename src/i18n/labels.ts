import type { Currency, Locale, Period, Pool, PropertyType, Transaction } from '../lib/types';

/** İlan verisindeki sabit değerlerin (tür, dönem, havuz…) her dildeki karşılıkları.
    src/lib/format.ts bu tabloyu kullanır; yönetim paneli de format.ts'i yüklediği için dosya küçük tutulur. */
export interface LabelSet {
  transaction: Record<Transaction, string>;
  /** Dönemlik kiralıklarda kart etiketi. */
  seasonal: { day: string; week: string };
  property: Record<PropertyType, string>;
  /** Fiyatın yanındaki ek: "/ ay". */
  period: Record<Period, string>;
  pool: Record<Pool, string>;
  priceAsk: string;
  /** Farsçada para birimi adıyla yazılır (۱۲٬۵۰۰٬۰۰۰ لیر); ötekilerde boş kalır ve simge kullanılır. */
  currency: Record<Currency, string>;
  /** Alan birimi: "120 m²". */
  area: string;
}

export const labelSets: Record<Locale, LabelSet> = {
  tr: {
    transaction: { sale: 'Satılık', rent: 'Kiralık', exchange: 'Kat karşılığı' },
    seasonal: { day: 'Günlük kiralık', week: 'Haftalık kiralık' },
    property: { apartment: 'Daire', villa: 'Villa', land: 'Arsa', office: 'Ofis', commercial: 'İş yeri', building: 'Bina', warehouse: 'Depo' },
    period: { total: '', day: '/ gün', week: '/ hafta', month: '/ ay', year: '/ yıl' },
    pool: { private: 'Özel havuz', shared: 'Ortak havuz', none: 'Havuz yok' },
    priceAsk: 'Fiyat için görüşelim',
    currency: { TRY: '', EUR: '', USD: '' },
    area: '{n} m²',
  },
  en: {
    transaction: { sale: 'For sale', rent: 'For rent', exchange: 'Flat-for-land' },
    seasonal: { day: 'Daily rental', week: 'Weekly rental' },
    property: { apartment: 'Apartment', villa: 'Villa', land: 'Land', office: 'Office', commercial: 'Commercial', building: 'Building', warehouse: 'Warehouse' },
    period: { total: '', day: '/ day', week: '/ week', month: '/ month', year: '/ year' },
    pool: { private: 'Private pool', shared: 'Shared pool', none: 'No pool' },
    priceAsk: 'Price on request',
    currency: { TRY: '', EUR: '', USD: '' },
    area: '{n} m²',
  },
  de: {
    transaction: { sale: 'Zum Kauf', rent: 'Zur Miete', exchange: 'Grundstück gegen Wohnungen' },
    seasonal: { day: 'Tagesmiete', week: 'Wochenmiete' },
    property: { apartment: 'Wohnung', villa: 'Villa', land: 'Grundstück', office: 'Büro', commercial: 'Gewerbefläche', building: 'Gebäude', warehouse: 'Lager' },
    period: { total: '', day: '/ Tag', week: '/ Woche', month: '/ Monat', year: '/ Jahr' },
    pool: { private: 'Privater Pool', shared: 'Gemeinschaftspool', none: 'Kein Pool' },
    priceAsk: 'Preis auf Anfrage',
    currency: { TRY: '', EUR: '', USD: '' },
    area: '{n} m²',
  },
  ru: {
    transaction: { sale: 'Продажа', rent: 'Аренда', exchange: 'Земля за квартиры' },
    seasonal: { day: 'Посуточная аренда', week: 'Понедельная аренда' },
    property: { apartment: 'Квартира', villa: 'Вилла', land: 'Земельный участок', office: 'Офис', commercial: 'Коммерческое помещение', building: 'Здание', warehouse: 'Склад' },
    period: { total: '', day: '/ сутки', week: '/ неделя', month: '/ месяц', year: '/ год' },
    pool: { private: 'Собственный бассейн', shared: 'Общий бассейн', none: 'Без бассейна' },
    priceAsk: 'Цена по запросу',
    currency: { TRY: '', EUR: '', USD: '' },
    area: '{n} м²',
  },
  ar: {
    transaction: { sale: 'للبيع', rent: 'للإيجار', exchange: 'أرض مقابل شقق' },
    seasonal: { day: 'إيجار يومي', week: 'إيجار أسبوعي' },
    property: { apartment: 'شقة', villa: 'فيلا', land: 'أرض', office: 'مكتب', commercial: 'محل تجاري', building: 'مبنى', warehouse: 'مستودع' },
    period: { total: '', day: '/ يوم', week: '/ أسبوع', month: '/ شهر', year: '/ سنة' },
    pool: { private: 'مسبح خاص', shared: 'مسبح مشترك', none: 'بدون مسبح' },
    priceAsk: 'السعر عند الطلب',
    currency: { TRY: '', EUR: '', USD: '' },
    area: '{n} م²',
  },
  fa: {
    transaction: { sale: 'فروشی', rent: 'اجاره‌ای', exchange: 'مشارکت در ساخت' },
    seasonal: { day: 'اجاره روزانه', week: 'اجاره هفتگی' },
    property: { apartment: 'آپارتمان', villa: 'ویلا', land: 'زمین', office: 'دفتر کار', commercial: 'ملک تجاری', building: 'ساختمان', warehouse: 'انبار' },
    period: { total: '', day: '/ روز', week: '/ هفته', month: '/ ماه', year: '/ سال' },
    pool: { private: 'استخر اختصاصی', shared: 'استخر مشترک', none: 'بدون استخر' },
    priceAsk: 'قیمت توافقی',
    currency: { TRY: 'لیر', EUR: 'یورو', USD: 'دلار' },
    area: '{n} متر مربع',
  },
};
