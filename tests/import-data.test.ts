import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { assertPublishable, listingSchema } from '../src/lib/server/validation';
import { seedListings } from '../src/lib/seed';
import type { Listing } from '../src/lib/types';

const file = join(__dirname, '..', 'data', 'import', 'hepsiemlak-tum-ilanlar.json');
const data = JSON.parse(readFileSync(file, 'utf8')) as { format: string; schemaVersion: number; listings: Listing[] };

describe('hepsiemlak import file', () => {
  it('matches the panel backup format and is accepted by the listing schema', () => {
    expect(data.format).toBe('ka-emlak-backup');
    expect(data.schemaVersion).toBe(1);
    for (const listing of data.listings) expect(listingSchema.safeParse(listing).success, listing.id).toBe(true);
  });
  it('holds all 27 current hepsiemlak listings as drafts and none of the removed ones', () => {
    for (const listing of data.listings) {
      expect(listing.status).toBe('draft');
      expect(listing.needsReview).toBe(true);
    }
    const ids = new Set(data.listings.map(item => item.id));
    expect(ids.size).toBe(27);
    expect(data.listings.length).toBe(27);
    // Önizlemedeki bu iki kayıt artık hepsiemlak'ta yayında değil.
    for (const removed of ['29750-197', '29750-118']) expect(ids.has(removed)).toBe(false);
    expect(seedListings.filter(item => ids.has(item.id)).length).toBe(7);
  });
  it('has every photo file on disk and is publishable once reviewed', () => {
    for (const listing of data.listings) {
      for (const photo of listing.photos) expect(existsSync(join(__dirname, '..', 'public', photo.url)), photo.url).toBe(true);
      expect(() => assertPublishable({ ...listing, needsReview: false }), listing.id).not.toThrow();
    }
  });
  it('publishes without rooms or area when the office did not give them', () => {
    const shop = { ...data.listings.find(item => item.propertyType === 'commercial')!, needsReview: false };
    expect(shop.rooms).toBe('');
    expect(() => assertPublishable(shop)).not.toThrow();
    expect(() => assertPublishable({ ...shop, propertyType: 'apartment' })).not.toThrow();
    expect(() => assertPublishable({ ...shop, propertyType: 'villa', grossArea: 0 })).not.toThrow();
    expect(() => assertPublishable({ ...shop, grossArea: 0, netArea: 50 })).not.toThrow();
    expect(() => assertPublishable({ ...shop, grossArea: 40, netArea: 50 })).toThrow();
  });
});
