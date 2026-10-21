import { describe, expect, it } from 'vitest';
import { catalogOptions, formatPriceInput, parsePrice, suggestDescription, suggestTitle } from '../src/lib/listing-helpers';

const base = { transaction: 'sale' as const, propertyType: 'apartment' as const, rooms: '4+1', grossArea: 250, netArea: 240, district: 'Konyaaltı', neighborhood: 'Arapsuyu', floor: '', buildingAge: '', features: [] as string[] };

describe('listing helpers', () => {
  it('builds a title from the listing facts', () => {
    expect(suggestTitle(base)).toBe('Konyaaltı Arapsuyu Satılık 4+1 Daire');
    expect(suggestTitle({ ...base, propertyType: 'land', rooms: '', grossArea: 600, transaction: 'exchange' })).toBe('Konyaaltı Arapsuyu Kat karşılığı 600 m² Arsa');
    expect(suggestTitle({ ...base, district: '', neighborhood: '', rooms: '', grossArea: 0, transaction: 'rent', propertyType: 'warehouse' })).toBe('Kiralık Depo');
  });
  it('writes a description long enough to publish', () => {
    const text = suggestDescription({ ...base, features: ['Asansör', 'Otopark'] });
    expect(text).toContain('Konyaaltı Arapsuyu Mahallesi bölgesinde satılık 4+1 daire.');
    expect(text).toContain('Asansör, Otopark');
    expect(text.length).toBeGreaterThanOrEqual(30);
  });
  it('offers only the districts and rooms that exist in the portfolio', () => {
    const options = catalogOptions([{ district: 'Kepez', rooms: '3+2' }, { district: 'Konyaaltı', rooms: '4+1' }, { district: 'Konyaaltı', rooms: '1+1' }, { district: '', rooms: '' }]);
    expect(options.districts).toEqual(['Konyaaltı', 'Kepez']);
    expect(options.rooms).toEqual(['1+1', '4+1', '3+2']);
  });
  it('parses and formats prices typed with separators', () => {
    expect(parsePrice('14.500.000 ₺')).toBe(14500000);
    expect(parsePrice('')).toBeNull();
    expect(formatPriceInput(14500000)).toBe('14.500.000');
    expect(formatPriceInput(null)).toBe('');
  });
});
