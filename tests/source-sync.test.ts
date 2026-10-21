import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { AdminListing } from '../src/lib/types';
import { mapSource, type SourceListing } from '../src/lib/source-mapper';
import { decodeSyncHash, isSyncPayload, planSync, suspiciousRemoval, type SyncPayload } from '../src/lib/source-sync';
import { bookmarklet } from '../src/lib/bookmarklet';

const fixture = <T,>(name: string) => JSON.parse(readFileSync(join(__dirname, 'fixtures', name), 'utf8')) as T;
const sources = fixture<SourceListing[]>('hepsiemlak-sample.json');
const sahibinden = fixture<SourceListing>('sahibinden-sample.json');
const byId = (id: string) => sources.find(item => item.id === id)!;

let counter = 0;
function site(source: SourceListing, extra: Partial<AdminListing> = {}): AdminListing {
  const now = '2026-10-01T00:00:00.000Z'; const id = `site-${++counter}`;
  return { ...mapSource(source), id, slug: id, photos: [], status: 'published', featured: false, createdAt: now, updatedAt: now, version: 1, needsReview: false, draft: null, ...extra };
}
const payload = (listings: SourceListing[], seen = listings.map(item => item.id)): SyncPayload => ({ source: 'hepsiemlak', office: '29750', seen, listings });

describe('hepsiemlak office sync plan', () => {
  it('adds listings missing on the site and leaves identical ones alone', () => {
    const plan = planSync(payload([byId('29750-199'), byId('29750-200')]), [site(byId('29750-199'))]);
    expect(plan.add.map(item => item.source.id)).toEqual(['29750-200']);
    expect(plan).toMatchObject({ update: [], remove: [], unchanged: 1, unread: 0 });
  });

  it('reports only the compared fields that changed', () => {
    const listing = site(byId('29750-199'), { price: 6000000, floor: '2. kat', title: 'Sitede düzenlenmiş başlık' });
    const plan = planSync(payload([byId('29750-199')]), [listing]);
    expect(plan.update).toHaveLength(1);
    expect(plan.update[0]).toMatchObject({ likely: false, changes: [{ field: 'price', from: 6000000, to: 6500000 }] });
  });

  it('does not erase site details that hepsiemlak leaves empty', () => {
    const office = byId('29750-192');
    const plan = planSync(payload([office]), [site(office, { rooms: '2+1', bathrooms: 1 })]);
    expect(plan).toMatchObject({ update: [], unchanged: 1 });
  });

  it('compares the pending draft of a published listing', () => {
    const base = site(byId('29750-199'));
    const listing = { ...base, draft: { ...base, price: 6500000 }, price: 6000000 };
    expect(planSync(payload([byId('29750-199')]), [listing]).unchanged).toBe(1);
  });

  it('removes only published listings of this office that left hepsiemlak', () => {
    const gone = site(byId('29750-192'));
    const draft = site(byId('29750-189'), { status: 'draft' });
    const sold = site(byId('29750-153'), { status: 'sold' });
    const fromSahibinden = site(sahibinden);
    const plan = planSync(payload([byId('29750-199')]), [site(byId('29750-199')), gone, draft, sold, fromSahibinden]);
    expect(plan.remove.map(item => item.id)).toEqual([gone.id]);
  });

  it('keeps listings whose page was seen but could not be read', () => {
    const unread = site(byId('29750-192'));
    const plan = planSync(payload([byId('29750-199')], ['29750-199', '29750-192']), [site(byId('29750-199')), unread]);
    expect(plan).toMatchObject({ remove: [], unread: 1 });
  });

  it('matches the same property added from sahibinden instead of adding it twice', () => {
    const source = byId('29750-189');
    const existing = site(source, { sourceUrl: sahibinden.url, price: 350000 });
    const plan = planSync(payload([source]), [existing]);
    expect(plan.add).toEqual([]);
    expect(plan.update[0]).toMatchObject({ likely: true, listing: { id: existing.id }, changes: [{ field: 'price', to: 375000 }] });
  });

  it('ignores trashed listings', () => {
    const plan = planSync(payload([byId('29750-199')]), [site(byId('29750-199'), { status: 'trash' })]);
    expect(plan.add).toHaveLength(1);
  });

  it('flags a removal of more than half of the published listings', () => {
    const listings = [site(byId('29750-199')), site(byId('29750-192')), site(byId('29750-200'))];
    const plan = planSync(payload([byId('29750-199')]), listings);
    expect(plan.remove).toHaveLength(2);
    expect(suspiciousRemoval(plan, listings, '29750')).toBe(true);
    expect(suspiciousRemoval(planSync(payload([byId('29750-199'), byId('29750-200')]), listings), listings, '29750')).toBe(false);
  });
});

describe('sync payload', () => {
  it('accepts the office own listings only', () => {
    expect(isSyncPayload(payload([byId('29750-199')]))).toBe(true);
    expect(isSyncPayload({ ...payload([byId('29750-199')]), office: '1234' })).toBe(false);
    expect(isSyncPayload(payload([byId('29750-199')], []))).toBe(false);
    expect(isSyncPayload(payload([sahibinden], [sahibinden.id]))).toBe(false);
  });

  it('round-trips through the gzip base64url hash', async () => {
    const data = payload(sources);
    const compressed = new Uint8Array(await new Response(new Blob([JSON.stringify(data)]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
    const hash = Buffer.from(compressed).toString('base64url');
    expect(await decodeSyncHash(hash)).toEqual(data);
  });
});

describe('bookmarklet', () => {
  it('compiles and carries the panel address', () => {
    const code = decodeURIComponent(bookmarklet('https://ka.example').slice('javascript:'.length));
    expect(() => new Function(code)).not.toThrow();
    expect(code).toContain("'https://ka.example/yonetim#esitle='");
    expect(code).toContain("'https://ka.example/yonetim#aktar='");
    expect(code).not.toContain('__ORIGIN__');
  });
});
