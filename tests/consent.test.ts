import { describe, expect, it } from 'vitest';
import { isEventName, parseConsent, scrubParams, validMeasurementId } from '../src/lib/analytics';
import { legal } from '../src/content/legal';

describe('onay kaydı', () => {
  it('geçerli kaydı okur, bozuk ya da eksik kaydı "seçim yok" sayar', () => {
    expect(parseConsent('{"analytics":true,"at":"2026-01-01T00:00:00.000Z"}')).toEqual({ analytics: true, at: '2026-01-01T00:00:00.000Z' });
    expect(parseConsent('{"analytics":false,"at":"x"}')?.analytics).toBe(false);
    for (const bad of [null, undefined, '', 'yok', '{}', '{"analytics":"yes","at":"x"}', '{"analytics":true}', 'null']) expect(parseConsent(bad as string)).toBeNull();
  });
  it('ölçüm kodu yalnız G-... biçiminde geçerlidir; boşsa hiçbir şey yüklenmez', () => {
    expect(validMeasurementId('G-ABC123XYZ9')).toBe('G-ABC123XYZ9');
    for (const bad of ['', undefined, 'UA-12345-1', 'G-', 'G-abc', '<script>', 'G-ABC 123']) expect(validMeasurementId(bad)).toBe('');
  });
});

describe('olay parametreleri', () => {
  it('izin listesindeki parametreleri geçirir', () => {
    expect(scrubParams({ placement: 'mobile_bar', listing_id: 'abc-123', form: 'land', success: false, locale: 'fa' }))
      .toEqual({ placement: 'mobile_bar', listing_id: 'abc-123', form: 'land', success: false, locale: 'fa' });
  });
  it('ad, telefon, mesaj ve e-postayı asla geçirmez', () => {
    const out = scrubParams({ name: 'Ali Veli', phone: '05322247658', message: 'merhaba', email: 'a@b.co', placement: 'footer', note: 'x', listing_id: '05322247658' });
    expect(out).toEqual({ placement: 'footer' });
    expect(JSON.stringify(out)).not.toMatch(/Ali|0532|merhaba|@/);
  });
  it('izin verilen anahtarda bile kalıba uymayan değeri atar', () => {
    expect(scrubParams({ placement: 'Ali Veli', form: 'x', success: 'true', locale: 'de', listing_id: 'a b', transaction: 'Satılık 5 000' })).toEqual({});
  });
  it('nesne olmayan girdide boş döner', () => {
    expect(scrubParams(null)).toEqual({});
    expect(scrubParams('phone')).toEqual({});
  });
  it('yalnız tanımlı olay adlarını kabul eder', () => {
    for (const name of ['whatsapp_click', 'phone_click', 'form_submit', 'language_switch', 'listing_view']) expect(isEventName(name)).toBe(true);
    expect(isEventName('purchase')).toBe(false);
    expect(isEventName(undefined)).toBe(false);
  });
});

describe('yasal metinler', () => {
  it('üç dilde KVKK, gizlilik, çerez metni ve afiş metinleri vardır', () => {
    for (const locale of ['tr', 'en', 'fa'] as const) {
      for (const kind of ['kvkk', 'privacy', 'cookies'] as const) {
        expect(legal[locale][kind].sections.length).toBeGreaterThan(0);
        expect(legal[locale][kind].metaDescription.length).toBeGreaterThan(20);
      }
      for (const text of Object.values(legal[locale].cookies.banner)) expect(text.length).toBeGreaterThan(0);
    }
  });
});
