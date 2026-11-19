import { describe, expect, it } from 'vitest';
import { alternates, dictionary, fill, localePath, locales, plural, routeLocale, splitLocale } from '../src/i18n';
import { localizedListing, priceLabel, periodSuffix } from '../src/lib/format';

const keys = (value: unknown, prefix = ''): string[] => Array.isArray(value) ? [`${prefix}[${value.length}]`, ...value.flatMap((item, i) => keys(item, `${prefix}[${i}]`))] : value && typeof value === 'object' ? Object.entries(value).flatMap(([key, child]) => keys(child, prefix ? `${prefix}.${key}` : key)) : [prefix];

describe('adresler', () => {
  it('Türkçe adresler eksizdir, öteki diller önek alır', () => {
    expect(localePath('tr', '/ilanlar?x=1')).toBe('/ilanlar?x=1');
    expect(localePath('en', '/')).toBe('/en');
    expect(localePath('fa', '/ilan/ev-1')).toBe('/fa/ilan/ev-1');
    expect(localePath('en', '/?a=1')).toBe('/en?a=1');
    expect(localePath('ru', '/kariyer')).toBe('/ru/kariyer');
    expect(localePath('ar', '/')).toBe('/ar');
  });
  it('splitLocale ve routeLocale yalnız Türkçe dışındaki dillerin önekini tanır', () => {
    expect(splitLocale('/de/satilik/konyaalti')).toEqual({ locale: 'de', path: '/satilik/konyaalti' });
    expect(splitLocale('/ar')).toEqual({ locale: 'ar', path: '/' });
    expect(splitLocale('/russia')).toEqual({ locale: 'tr', path: '/russia' });
    for (const locale of ['en', 'de', 'ru', 'ar', 'fa'] as const) expect(routeLocale(locale)).toBe(locale);
    expect(splitLocale('/en/ilanlar')).toEqual({ locale: 'en', path: '/ilanlar' });
    expect(splitLocale('/fa')).toEqual({ locale: 'fa', path: '/' });
    expect(splitLocale('/ilanlar')).toEqual({ locale: 'tr', path: '/ilanlar' });
    expect(splitLocale('/english')).toEqual({ locale: 'tr', path: '/english' });
    expect(routeLocale('tr')).toBeNull();
    expect(routeLocale('xx')).toBeNull();
    expect(routeLocale('fa')).toBe('fa');
  });
  it('alternates altı dili ve x-default adresini verir', () => {
    const links = alternates('/ilanlar', 'https://ornek.test');
    expect(links.map(l => `${l.locale}=${l.href}`)).toEqual(['tr=https://ornek.test/ilanlar', 'en=https://ornek.test/en/ilanlar', 'de=https://ornek.test/de/ilanlar', 'ru=https://ornek.test/ru/ilanlar', 'ar=https://ornek.test/ar/ilanlar', 'fa=https://ornek.test/fa/ilanlar', 'x-default=https://ornek.test/ilanlar']);
  });
});

describe('sözlükler', () => {
  it('her dil tr ile aynı anahtarlara sahiptir ve boş metin içermez', () => {
    const base = keys(dictionary('tr'));
    for (const locale of locales.filter(l => l !== 'tr')) expect(keys(dictionary(locale))).toEqual(base);
    const empty = (value: unknown, path = ''): string[] => typeof value === 'string' ? (value === '' ? [path] : []) : value && typeof value === 'object' ? Object.entries(value).flatMap(([k, v]) => empty(v, `${path}.${k}`)) : [];
    // Türkçede ancak üç alan bilerek boştur: çeviri notu ve onay cümlesinin başı.
    for (const locale of locales.filter(l => l !== 'tr')) expect(empty(dictionary(locale)).filter(p => !p.endsWith('consentBefore'))).toEqual([]);
  });
  it('yer tutucular her dilde aynıdır', () => {
    const holders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort().join();
    const flat = (value: unknown, path = ''): [string, string][] => typeof value === 'string' ? [[path, value]] : value && typeof value === 'object' ? Object.entries(value).flatMap(([k, v]) => flat(v, `${path}.${k}`)) : [];
    const tr = new Map(flat(dictionary('tr')));
    for (const locale of locales.filter(l => l !== 'tr')) for (const [path, text] of flat(dictionary(locale))) if (/\.(countOne|count|districtCountOne|districtCount|showOne|show)$/.test(path) || !path.includes('.sections')) expect([path, holders(text)]).toEqual([path, holders(tr.get(path) ?? '')]);
  });
  it('fill ve plural', () => {
    expect(fill('{n} ilan, {x}', { n: 3 })).toBe('3 ilan, {x}');
    expect(plural(1, 'bir', 'çok')).toBe('bir');
    expect(plural(2, 'bir', 'çok')).toBe('çok');
  });
});

describe('ilan metni ve fiyat', () => {
  const listing = { title: 'Başlık', description: 'Açıklama', features: ['Havuz'], translations: { en: { title: 'Title', description: '', features: [], auto: true }, fa: { title: '', description: '', features: [], auto: false } } };
  it('çeviri varsa kullanılır, boş alan Türkçe kalır, auto bayrağı taşınır', () => {
    expect(localizedListing(listing, 'tr')).toMatchObject({ title: 'Başlık', translated: false, auto: false });
    expect(localizedListing(listing, 'en')).toMatchObject({ title: 'Title', description: 'Açıklama', features: ['Havuz'], translated: true, auto: true });
    expect(localizedListing(listing, 'fa')).toMatchObject({ title: 'Başlık', translated: false, auto: false });
  });
  it('fiyat dile göre biçimlenir; Türkçe çıktı değişmez', () => {
    const sale = { price: 12500000, currency: 'TRY' as const, transaction: 'sale' as const, period: 'total' as const };
    expect(priceLabel(sale)).toBe(priceLabel(sale, 'tr'));
    expect(priceLabel(sale, 'en')).toContain('12,500,000');
    expect(priceLabel(sale, 'fa')).toContain('لیر');
    expect(periodSuffix({ ...sale, transaction: 'rent', period: 'month' }, 'en')).toBe('/ month');
    expect(periodSuffix(sale, 'en')).toBe('');
  });
});
