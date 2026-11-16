import { describe, expect, it } from 'vitest';
import { filterListings } from '../src/lib/server/filters';
import { isSeasonal, transactionLabel } from '../src/lib/format';
import { newListing } from '../src/lib/server/lifecycle';
import type { Listing } from '../src/lib/types';
import { listingSchema } from '../src/lib/server/validation';

const listing = (id: string, patch: Partial<Listing>): Listing => ({ ...newListing(), id, status: 'published', title: id, ...patch });
const listings = [
  listing('daily-villa', { transaction: 'rent', period: 'day', propertyType: 'villa', price: 7000 }),
  listing('weekly-flat', { transaction: 'rent', period: 'week', propertyType: 'apartment', price: 30000 }),
  listing('monthly-flat', { transaction: 'rent', period: 'month', propertyType: 'apartment', price: 25000 }),
  listing('sale-villa', { transaction: 'sale', period: 'total', propertyType: 'villa', price: 32000000 }),
];

describe('seasonal rentals', () => {
  it('counts only daily and weekly rentals as seasonal', () => {
    expect(listings.filter(isSeasonal).map(item => item.id)).toEqual(['daily-villa', 'weekly-flat']);
  });
  it('lists them with period=short and still narrows by other filters', () => {
    expect(filterListings(listings, { transaction: 'rent', period: 'short' }).map(item => item.id).sort()).toEqual(['daily-villa', 'weekly-flat']);
    expect(filterListings(listings, { transaction: 'rent', period: 'short', propertyType: 'villa' }).map(item => item.id)).toEqual(['daily-villa']);
    expect(filterListings(listings, { period: 'month' }).map(item => item.id)).toEqual(['monthly-flat']);
  });
  it('lists long-term rentals without the seasonal ones with period=long (Kiralık sayfası)', () => {
    expect(filterListings(listings, { transaction: 'rent', period: 'long' }).map(item => item.id)).toEqual(['monthly-flat']);
  });
  it('names the period on the card label', () => {
    expect(transactionLabel(listings[0])).toBe('Günlük kiralık');
    expect(transactionLabel(listings[1])).toBe('Haftalık kiralık');
    expect(transactionLabel(listings[2])).toBe('Kiralık');
    expect(transactionLabel(listings[3])).toBe('Satılık');
  });
  it('accepts the optional villa details and rejects impossible ones', () => {
    expect(listingSchema.safeParse({ ...listings[0], guests: 8, pool: 'private', minNights: 3 }).success).toBe(true);
    expect(listingSchema.safeParse(listings[0]).success).toBe(true);
    expect(listingSchema.safeParse({ ...listings[0], guests: 0 }).success).toBe(false);
    expect(listingSchema.safeParse({ ...listings[0], pool: 'olympic' }).success).toBe(false);
  });
});
