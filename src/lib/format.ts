import type { Listing, ListingTranslation, Locale, Transaction, PropertyType, Period } from './types';
import { fill, intlLocales, localePath } from '../i18n/config';
import { labelSets } from '../i18n/labels';
// Dil almayan dışa aktarımlar Türkçedir; yönetim paneli bunları kullanır. Ziyaretçi sitesi dili ayrıca verir.
export const transactionLabels: Record<Transaction, string> = labelSets.tr.transaction;
export const propertyLabels: Record<PropertyType, string> = labelSets.tr.property;
export const periodLabels: Record<Period, string> = labelSets.tr.period;
export const poolLabels = labelSets.tr.pool;
/** Bir dilin etiket tablosu (ilan türü, gayrimenkul türü, dönem eki, havuz). */
export const labelsFor = (locale: Locale = 'tr') => labelSets[locale] ?? labelSets.tr;
/** Dönemlik kiralık: günlük ya da haftalık kiralanan ilanlar. */
export const isSeasonal = (listing: Pick<Listing, 'transaction' | 'period'>) => listing.transaction === 'rent' && (listing.period === 'day' || listing.period === 'week');
/** Kart ve ilan sayfası etiketi: dönemlik kiralıklarda dönem de yazılır. */
export function transactionLabel(listing: Pick<Listing, 'transaction' | 'period'>, locale: Locale = 'tr') { const labels = labelsFor(locale); return isSeasonal(listing) ? (listing.period === 'day' ? labels.seasonal.day : labels.seasonal.week) : labels.transaction[listing.transaction]; }
export function numberLabel(value: number, locale: Locale = 'tr') { return new Intl.NumberFormat(intlLocales[locale]).format(value); }
export function areaLabel(value: number, locale: Locale = 'tr') { return fill(labelsFor(locale).area, { n: numberLabel(value, locale) }); }
export function priceLabel(listing: Pick<Listing, 'price' | 'currency'>, locale: Locale = 'tr') {
  const labels = labelsFor(locale);
  if (listing.price === null) return labels.priceAsk;
  // Farsçada simge yerine para biriminin adı yazılır; Intl burada "TRY ۱۲٬۵۰۰٬۰۰۰" üretir ve okunmaz.
  if (labels.currency[listing.currency]) return `${new Intl.NumberFormat(intlLocales[locale], { maximumFractionDigits: 0 }).format(listing.price)} ${labels.currency[listing.currency]}`;
  // İngilizcede varsayılan gösterim "TRY 12,500,000" ve "US$" olur; dar simge ₺ ve $ verir. Türkçe çıktı değişmez.
  return new Intl.NumberFormat(intlLocales[locale], { style: 'currency', currency: listing.currency, maximumFractionDigits: 0, ...(locale === 'tr' ? {} : { currencyDisplay: 'narrowSymbol' as const }) }).format(listing.price);
}
/** Kira ilanlarında fiyatın yanına yazılan dönem eki ("/ ay"); satılıkta boştur. */
export function periodSuffix(listing: Pick<Listing, 'price' | 'transaction' | 'period'>, locale: Locale = 'tr') { return listing.price !== null && listing.transaction === 'rent' ? labelsFor(locale).period[listing.period] : ''; }
export function listingUrl(listing: Pick<Listing, 'slug'>, locale: Locale = 'tr') { return localePath(locale, `/ilan/${listing.slug}`); }
/** İlanın sayfa dilindeki metni. Çevirisi olmayan (ya da boş bırakılan) alan Türkçe kalır.
    auto: gösterilen açıklama makine çevirisiyse true; ilan sayfası bunu küçük bir notla belirtir. */
export function localizedListing(listing: Pick<Listing, 'title' | 'description' | 'features' | 'translations'>, locale: Locale = 'tr'): ListingTranslation & { translated: boolean } {
  const translation = locale === 'tr' ? undefined : listing.translations?.[locale];
  const title = translation?.title?.trim() ? translation.title : listing.title;
  const description = translation?.description?.trim() ? translation.description : listing.description;
  const features = translation?.features?.length ? translation.features : listing.features;
  const translated = !!translation && (title !== listing.title || description !== listing.description);
  return { title, description, features, translated, auto: translated && translation!.auto === true };
}
export function whatsappUrl(phone: string, text = 'Merhaba, portföyünüz hakkında bilgi almak istiyorum.') {
  const number = phone.replace(/\D/g, '');
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : 'https://www.hepsiemlak.com/emlak-ofisi/ka-emlak-29750';
}
export function slugify(value: string) { return value.toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
export function dateLabel(value: string, locale: Locale = 'tr') { return new Intl.DateTimeFormat(intlLocales[locale], { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value)); }
/** +905321234567 → 0532 123 45 67; başka biçimdeki numara olduğu gibi kalır. */
export function phoneLabel(phone: string) { return phone.replace(/^\+90(\d{3})(\d{3})(\d{2})(\d{2})$/, '0$1 $2 $3 $4'); }
