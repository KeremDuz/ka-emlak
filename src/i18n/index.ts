import type { Locale } from '../lib/types';
import { tr, type Dictionary } from './tr';
import { en } from './en';
import { fa } from './fa';
import { defaultLocale, localePath, locales } from './config';

/** Sözlüklerin tamamı yalnız sunucuda (.astro dosyalarında) yüklenir; React bileşenlerine gereken bölüm prop olarak verilir.
    Yeni metin: tr.ts'e anahtar eklenir, tip en.ts ve fa.ts'te aynı anahtarı zorunlu kılar. */
const dictionaries: Record<Locale, Dictionary> = { tr, en, fa };
export const dictionary = (locale: Locale): Dictionary => dictionaries[locale] ?? tr;
export type { Dictionary };
export * from './config';

/** Bir sayfanın üç dildeki tam adresleri (hreflang ve site haritası için). path dil eki olmadan verilir. */
export function alternates(path: string, origin: string | URL): { locale: Locale | 'x-default'; href: string }[] {
  const href = (locale: Locale) => new URL(localePath(locale, path), origin).href;
  return [...locales.map(locale => ({ locale, href: href(locale) })), { locale: 'x-default' as const, href: href(defaultLocale) }];
}
