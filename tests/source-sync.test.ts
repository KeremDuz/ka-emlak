import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { AdminListing } from '../src/lib/types';
import { mapSource, type SourceListing } from '../src/lib/source-mapper';
import { decodeSyncHash, isSyncPayload, planSync, type SyncPayload } from '../src/lib/source-sync';
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
    expect(plan).toMatchObject({ update: [], unchanged: 1, unread: 0 });
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

  it('never removes listings that are not on hepsiemlak', () => {
    const gone = site(byId('29750-192'));
    const draft = site(byId('29750-189'), { status: 'draft' });
    const sold = site(byId('29750-153'), { status: 'sold' });
    const fromSahibinden = site(sahibinden);
    const plan = planSync(payload([byId('29750-199')]), [site(byId('29750-199')), gone, draft, sold, fromSahibinden]);
    expect(plan).not.toHaveProperty('remove');
    expect(plan.add).toEqual([]);
  });

  it('keeps listings whose page was seen but could not be read', () => {
    const unread = site(byId('29750-192'));
    const plan = planSync(payload([byId('29750-199')], ['29750-199', '29750-192']), [site(byId('29750-199')), unread]);
    expect(plan).toMatchObject({ unread: 1 });
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

});

describe('sahibinden store sync plan', () => {
  const store = (listings: SourceListing[], rows: SyncPayload['rows'] = [], seen = [...listings.map(item => item.id), ...(rows ?? []).map(row => row.id)]): SyncPayload => ({ source: 'sahibinden', office: '936699', seen, listings, rows });
  const row = (id: string, title = 'Kiralık villa') => ({ id, url: `https://www.sahibinden.com/ilan/emlak-konut-kiralik-villa-${id}/detay`, title, price: '80.000 TL' });

  it('matches a listing added from hepsiemlak and updates only its price', () => {
    const existing = site(sahibinden, { sourceUrl: byId('29750-189').url, price: 350000 });
    const plan = planSync(store([sahibinden]), [existing]);
    expect(plan.add).toEqual([]);
    expect(plan.update[0]).toMatchObject({ likely: true, listing: { id: existing.id }, changes: [{ field: 'price', from: 350000, to: 375000 }] });
  });

  it('matches its own sahibinden number exactly', () => {
    const plan = planSync(store([sahibinden]), [site(sahibinden)]);
    expect(plan).toMatchObject({ add: [], update: [], unchanged: 1 });
  });

  it('does not compare a daily price with a monthly one', () => {
    const daily = site(sahibinden, { sourceUrl: byId('29750-189').url, period: 'day', price: 7000 });
    const plan = planSync(store([sahibinden]), [daily]);
    expect(plan).toMatchObject({ update: [], unchanged: 1 });
  });

  it('lists unread store rows that are not on the site as links', () => {
    const onSite = site(sahibinden, { sourceUrl: row('1337530327').url });
    const plan = planSync(store([], [row('1337530327'), row('1340575405', 'Kiralık dükkan')]), [onSite]);
    expect(plan.unread).toBe(2);
    expect(plan.unreadRows.map(item => item.id)).toEqual(['1340575405']);
  });

  it('accepts a store payload and rejects foreign links', () => {
    expect(isSyncPayload(store([sahibinden], [row('1340575405')]))).toBe(true);
    expect(isSyncPayload(store([sahibinden], [{ ...row('1340575405'), url: 'https://kotu.example/ilan/x-1340575405/detay' }]))).toBe(false);
    expect(isSyncPayload(store([byId('29750-199')]))).toBe(false);
    expect(isSyncPayload({ ...payload([byId('29750-199')]), rows: [row('1340575405')] })).toBe(false);
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
