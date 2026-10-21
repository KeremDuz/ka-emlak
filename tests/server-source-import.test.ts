import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Repository } from '../src/lib/server/repository';
import { importSourcePhoto, prepareSourceListing } from '../src/lib/server/source-import';
import type { SourceListing } from '../src/lib/source-mapper';

const fixture = async <T,>(name: string) => JSON.parse(await readFile(join(__dirname, 'fixtures', name), 'utf8')) as T;
// imageKind yalnız ilk baytlara baktığı için JPEG başlığı yeterli.
const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 0xff, 0xd9]);

let directory: string; let repo: Repository; let requested: string[];
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'ka-source-test-'));
  vi.stubEnv('DEV', true); vi.stubEnv('KA_PREVIEW_DIR', directory);
  repo = new Repository({ preview: true }); requested = [];
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL) => {
    const url = String(input); requested.push(url);
    if (url.startsWith('https://nominatim.openstreetmap.org/')) return Response.json([]);
    return url.includes('/x16_') ? new Response(null, { status: 404 }) : new Response(jpeg, { headers: { 'Content-Length': String(jpeg.length) } });
  }));
});
afterEach(async () => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); await rm(directory, { recursive: true, force: true }); });

describe('portal import on the server', () => {
  it('takes the next size when sahibinden has no large copy of a photo', async () => {
    const listing = await repo.create();
    const photo = await importSourcePhoto(repo, listing.id, 'https://i0.shbdn.com/photos/53/62/75/x16_1337536275ltf.jpg');
    expect(photo.bytes).toBe(jpeg.length);
    expect(requested).toEqual(['https://i0.shbdn.com/photos/53/62/75/x16_1337536275ltf.jpg', 'https://i0.shbdn.com/photos/53/62/75/big_1337536275ltf.jpg']);
  });
  it('updates the listing chosen from the other portal and keeps its own source address', async () => {
    const hepsiemlak = (await fixture<SourceListing[]>('hepsiemlak-sample.json')).find(item => item.id === '29750-189')!;
    const sahibinden = await fixture<SourceListing>('sahibinden-sample.json');
    const first = await prepareSourceListing(repo, hepsiemlak);
    const count = (await repo.listings()).length;
    const second = await prepareSourceListing(repo, { ...sahibinden, targetId: first.listing.id }, first.listing.id);
    expect(second).toMatchObject({ created: false, listing: { id: first.listing.id, sourceUrl: hepsiemlak.url, price: 375000 } });
    expect(await repo.listings()).toHaveLength(count);
    await expect(prepareSourceListing(repo, sahibinden, 'yok')).rejects.toMatchObject({ status: 404 });
  });
});
