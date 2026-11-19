import type { Locale, TranslatedLocale } from '../lib/types';

/** Dil ayarları ve adres yardımcıları. Sözlükleri içe aktarmaz; tarayıcıya giden bileşenler bu dosyayı güvenle kullanabilir. */
export const locales: Locale[] = ['tr', 'en', 'de', 'ru', 'ar', 'fa'];
export const defaultLocale: Locale = 'tr';
export const translatedLocales: TranslatedLocale[] = ['en', 'de', 'ru', 'ar', 'fa'];
/** Dil değiştiricide görünen adlar; her dil kendi yazısıyla. */
export const localeNames: Record<Locale, string> = { tr: 'Türkçe', en: 'English', de: 'Deutsch', ru: 'Русский', ar: 'العربية', fa: 'فارسی' };
/** Panelde ve bildirimlerde dillerin Türkçe adları. */
export const localeNamesTr: Record<Locale, string> = { tr: 'Türkçe', en: 'İngilizce', de: 'Almanca', ru: 'Rusça', ar: 'Arapça', fa: 'Farsça' };
/** Sayı, para ve tarih biçimi için Intl etiketi. Arapçada fiyatlar Batı rakamlarıyla yazılır (ilan metinleri de öyle). */
export const intlLocales: Record<Locale, string> = { tr: 'tr-TR', en: 'en-GB', de: 'de-DE', ru: 'ru-RU', ar: 'ar-u-nu-latn', fa: 'fa-IR' };
export const ogLocales: Record<Locale, string> = { tr: 'tr_TR', en: 'en_GB', de: 'de_DE', ru: 'ru_RU', ar: 'ar_AR', fa: 'fa_IR' };
export const direction = (locale: Locale): 'ltr' | 'rtl' => locale === 'fa' || locale === 'ar' ? 'rtl' : 'ltr';

/** Adresteki dil eki: yalnız Türkçe dışındaki diller (en, de, ru, ar, fa) geçerlidir. Türkçe eksizdir; /tr/... ve bilinmeyen ekler 404 verir. */
export function routeLocale(param: string | undefined): TranslatedLocale | null {
  return translatedLocales.find(locale => locale === param) ?? null;
}

/** '/ilanlar?x=1' → '/en/ilanlar?x=1'. Türkçe adresler olduğu gibi kalır; dil eki yol bölümlerini değiştirmez. */
export function localePath(locale: Locale, path = '/'): string {
  if (locale === defaultLocale) return path;
  return path === '/' ? `/${locale}` : path.startsWith('/?') || path.startsWith('/#') ? `/${locale}${path.slice(1)}` : `/${locale}${path}`;
}

/** '/fa/ilanlar' → { locale: 'fa', path: '/ilanlar' }. Eki olmayan her yol Türkçedir. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const match = pathname.match(/^\/(en|de|ru|ar|fa)(\/.*)?$/);
  if (!match) return { locale: defaultLocale, path: pathname || '/' };
  return { locale: match[1] as Locale, path: match[2] && match[2] !== '/' ? match[2] : '/' };
}

/** Sözlükteki '{n} ilan' gibi kalıpları doldurur. Kalıplar düz metin olduğu için bileşenlere prop olarak gönderilebilir. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => key in values ? String(values[key]) : whole);
}

/** İngilizce ve Almancada tekil/çoğul ayrılır; Türkçe ve Farsçada iki kalıp aynıdır. Rusça ve Arapçada kalıplar sayıdan bağımsız yazılır ("Объявлений: {n}"). */
export function plural(count: number, one: string, other: string): string { return count === 1 ? one : other; }
