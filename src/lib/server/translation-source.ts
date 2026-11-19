import type { Listing, TranslatedLocale } from '../types';

// Bağımlılığı olmayan saf yardımcılar: hem sunucu hem panel aynı "çeviri güncel mi" kararını verir.
export type TranslationSource = Pick<Listing, 'title' | 'description' | 'features'>;
export type TranslationState = 'missing' | 'auto' | 'edited' | 'stale';
export const translatedLocales: TranslatedLocale[] = ['en', 'de', 'ru', 'ar', 'fa'];

/** Türkçe başlık + açıklama + özelliklerin kısa özeti (cyrb53). Güvenlik için değil, yalnız "metin değişti mi" içindir. */
export function sourceHash(source: TranslationSource): string {
  const text = [source.title.trim(), source.description.trim(), ...source.features.map(item => item.trim())].join('\u0001');
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let index = 0; index < text.length; index++) {
    const code = text.charCodeAt(index);
    h1 = Math.imul(h1 ^ code, 2654435761); h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}
/**
 * Çeviri aslında çevrilmemiş mi: açıklama Türkçenin aynısı, ya da açıklamanın uzun satırlarının çoğu Türkçeden aynen kopyalanmış
 * (model bazen yalnız başlığı çevirip açıklamayı Türkçe bıraktı ya da Türkçeyi Kiril harfle yazdı). Açıklama boşsa başlığa bakılır.
 */
export function sameAsSource(translation: Pick<TranslationSource, 'title' | 'description'>, source: TranslationSource): boolean {
  const description = source.description.trim(), translated = translation.description.trim();
  if (!description) return translation.title.trim() === source.title.trim();
  if (translated === description) return true;
  const lines = description.split('\n').map(line => line.trim()).filter(line => line.length >= 20);
  const copied = lines.filter(line => translated.includes(line)).length;
  return copied >= 3 && copied / lines.length >= 0.5;
}
export function translationState(listing: TranslationSource & Pick<Listing, 'translations'>, locale: TranslatedLocale): TranslationState {
  const translation = listing.translations?.[locale];
  if (!translation) return 'missing';
  if (!translation.auto) return 'edited';
  // Model bazen metni çevirmeden Türkçe geri verdi; böyle kaydedilmiş otomatik çeviri yeniden çevrilir.
  if (sameAsSource(translation, listing)) return 'stale';
  return translation.sourceHash === sourceHash(listing) ? 'auto' : 'stale';
}
/** Çevrilmesi gereken diller. Yöneticinin düzelttiği çeviri (auto: false) hiçbir durumda listeye girmez. */
export function pendingLocales(listing: TranslationSource & Pick<Listing, 'translations'>, force = false): TranslatedLocale[] {
  return translatedLocales.filter(locale => { const state = translationState(listing, locale); return state === 'missing' || state === 'stale' || force && state === 'auto'; });
}
