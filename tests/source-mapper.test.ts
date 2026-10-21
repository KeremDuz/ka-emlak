import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { isSourceListing, likelySame, mapSource, sameSource, sourceIdOf, sourcePhotos, type SourceListing } from '../src/lib/source-mapper';
import { assertPublishable, listingSchema } from '../src/lib/server/validation';
import { newListing } from '../src/lib/server/lifecycle';

const samples = JSON.parse(readFileSync(join(__dirname, 'fixtures', 'hepsiemlak-sample.json'), 'utf8')) as SourceListing[];
const byId = (id: string) => mapSource(samples.find(item => item.id === id)!);
const sahibinden = JSON.parse(readFileSync(join(__dirname, 'fixtures', 'sahibinden-sample.json'), 'utf8')) as SourceListing;

describe('hepsiemlak listing page mapping', () => {
  it('reads a sale apartment with areas, rooms and location', () => {
    expect(byId('29750-199')).toMatchObject({ transaction: 'sale', propertyType: 'apartment', price: 6500000, period: 'total', district: 'Konyaaltı', neighborhood: 'Hurma', grossArea: 100, netArea: 90, rooms: '2+1', bathrooms: 2, title: 'Konyaaltı Hurma Satılık 2+1 Daire' });
  });
  it('treats a low price on a daily rental villa as the daily price', () => {
    expect(byId('29750-200')).toMatchObject({ transaction: 'rent', propertyType: 'villa', price: 6000, period: 'day', district: 'Kepez', neighborhood: 'Duacı', rooms: '4+1' });
  });
  it('maps work places by their type', () => {
    expect(byId('29750-192')).toMatchObject({ transaction: 'rent', propertyType: 'office', price: 60000, period: 'month' });
    expect(byId('29750-189')).toMatchObject({ transaction: 'rent', propertyType: 'warehouse', grossArea: 2000 });
  });
  it('keeps land calls without a price, including "aranıyor" posts', () => {
    expect(byId('29750-153')).toMatchObject({ transaction: 'exchange', propertyType: 'land', price: null, grossArea: 500 });
    expect(byId('29750-151')).toMatchObject({ transaction: 'exchange', price: null });
  });
  it('takes only the listing gallery at full size, never similar listings', () => {
    const photos = sourcePhotos(samples[0]);
    expect(photos.length).toBe(3);
    for (const url of photos) expect(url).toMatch(/^https:\/\/hecdn01\.hemlak\.com\/mnresize\/1600\/1200\/ds01\//);
    expect(sourcePhotos({ ...samples[0], photos: ['https://evil.example/mnresize/1/1/ds01/a.jpg', 'http://hecdn01.hemlak.com/mnresize/1/1/ds01/a.jpg'] })).toEqual([]);
  });
  it('produces listings the server accepts and can publish once photos are added', () => {
    for (const sample of [...samples, sahibinden]) {
      const listing = { ...newListing(), ...mapSource(sample), needsReview: false, photos: [{ id: 'p', url: '/images/p.webp', alt: '' }] };
      expect(listingSchema.safeParse(listing).success, sample.id).toBe(true);
      expect(() => assertPublishable(listing), sample.id).not.toThrow();
      expect(sourceIdOf(listing.sourceUrl)).toBe(sample.id);
    }
  });
});

describe('import link safety', () => {
  it('accepts only bookmark data from a hepsiemlak listing page', () => {
    expect(isSourceListing(samples[0])).toBe(true);
    expect(isSourceListing({ ...samples[0], id: undefined })).toBe(false);
    expect(isSourceListing({ ...samples[0], url: 'http://localhost:4321/yonetim' })).toBe(false);
    expect(isSourceListing({ ...samples[0], url: 'https://www.hepsiemlak.com/x/29750-1', id: '29750-2' })).toBe(false);
    expect(isSourceListing(null)).toBe(false);
  });
  it('never matches a listing that has no source number', () => {
    expect(sameSource(undefined, undefined)).toBe(false);
    expect(sameSource(undefined, '29750-1')).toBe(false);
    expect(sameSource('https://www.hepsiemlak.com/a/29750-1', '29750-1')).toBe(true);
  });
});

describe('sahibinden listing page mapping', () => {
  it('reads the info list, location links and price', () => {
    expect(sourceIdOf(sahibinden.url)).toBe('1337536275');
    expect(isSourceListing(sahibinden)).toBe(true);
    expect(mapSource(sahibinden)).toMatchObject({ transaction: 'rent', propertyType: 'warehouse', price: 375000, currency: 'TRY', period: 'month', city: 'Antalya', district: 'Kepez', neighborhood: 'Altınova Sinan', grossArea: 2000, buildingAge: '10', title: 'Kepez Altınova Sinan Kiralık 2.000 m² Depo' });
  });
  it('takes each gallery photo once at the largest JPEG size and skips other listings', () => {
    expect(sourcePhotos(sahibinden)).toEqual(['dz2', '0fv', 'ltf'].map(suffix => `https://i0.shbdn.com/photos/53/62/75/x16_1337536275${suffix}.jpg`));
  });
  it('spots the same property already imported from the other portal', () => {
    const fromHepsiemlak = { ...byId('29750-189'), sourceUrl: samples.find(item => item.id === '29750-189')!.url };
    expect(likelySame([byId('29750-199'), fromHepsiemlak], mapSource(sahibinden))).toBe(fromHepsiemlak);
    expect(likelySame([byId('29750-199')], mapSource(sahibinden))).toBeUndefined();
  });
  it('rejects data claiming to be sahibinden from another address', () => {
    expect(isSourceListing({ ...sahibinden, url: 'https://evil.example/ilan/x-1337536275/detay' })).toBe(false);
    expect(isSourceListing({ ...sahibinden, id: '29750-1' })).toBe(false);
  });
});
