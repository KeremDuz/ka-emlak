import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkAnswer, extractFromText } from '../src/lib/server/source-ai';
import { Repository } from '../src/lib/server/repository';
import { prepareSourceListing } from '../src/lib/server/source-import';

// sahibinden tasarımı değişip bilgi listesi okunamadığında yer iminin gönderdiği düz metin.
const page = `Atatürk Bulvarı Üzerinde Kiralık Dükkan Mağaza
150.000 TL
Antalya / Konyaaltı / Liman Mh.
İlan No 1340575405
m² (Brüt) 120
m² (Net) 100
Bina Yaşı 5-10 arası
Bulunduğu Kat Zemin Kat
Açıklama
Konyaaltı Atatürk Bulvarı üzerinde, cadde cepheli, geniş vitrinli kiralık dükkan. Her işe uygundur.`;
const url = 'https://www.sahibinden.com/ilan/emlak-is-yeri-kiralik-konyaalti-ataturk-bulvari-uzerinde-kiralik-dukkan-magaza-1340575405/detay';
const broken = { source: 'sahibinden', url, id: '1340575405', title: 'Atatürk Bulvarı Üzerinde Kiralık Dükkan Mağaza', price: '', breadcrumb: [], specs: {}, description: '', photos: [], text: page };
const good = { transaction: 'rent', propertyType: 'commercial', price: 150000, currency: 'TRY', period: 'month', city: 'Antalya', district: 'Konyaaltı', neighborhood: 'Liman', grossArea: 120, netArea: 100, rooms: null, bathrooms: null, floor: 'Zemin Kat', buildingAge: '5-10 arası', description: 'Konyaaltı Atatürk Bulvarı üzerinde, cadde cepheli, geniş vitrinli kiralık dükkan. Her işe uygundur.' };

describe('reading a listing with AI when the portal layout changed', () => {
  it('keeps only values that are written on the page', () => {
    expect(checkAnswer(good, page)).toMatchObject({ price: 150000, grossArea: 120, netArea: 100, district: 'Konyaaltı', floor: 'Zemin Kat', description: good.description });
    // Uydurulan sayı, yer ve yeniden yazılmış açıklama atılır.
    const made = checkAnswer({ ...good, price: 175000, grossArea: 140, district: 'Muratpaşa', description: 'Harika konumda, yatırımlık, hemen kiralanacak muhteşem bir dükkan sizi bekliyor.' }, page);
    expect(made).not.toHaveProperty('price'); expect(made).not.toHaveProperty('grossArea');
    expect(made).not.toHaveProperty('district'); expect(made).not.toHaveProperty('description');
    expect(checkAnswer({ price: 'çok' }, page)).toEqual({});
  });
  it('reads Gemini’s JSON answer even inside a code block', async () => {
    const fetcher = vi.fn(async () => Response.json({ choices: [{ message: { content: '```json\n' + JSON.stringify(good) + '\n```' } }] }));
    const found = await extractFromText(page, { url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', key: 'k', model: 'm' } as never, null, fetcher as never);
    expect(found).toMatchObject({ transaction: 'rent', propertyType: 'commercial', price: 150000, neighborhood: 'Liman' });
  });
});

describe('importing a listing the bookmark could only partly read', () => {
  let directory: string; let repo: Repository;
  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'ka-ai-test-'));
    vi.stubEnv('DEV', true); vi.stubEnv('KA_PREVIEW_DIR', directory);
    repo = new Repository({ preview: true });
    vi.stubGlobal('fetch', vi.fn(async () => Response.json([])));
  });
  afterEach(async () => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); await rm(directory, { recursive: true, force: true }); });

  it('fills the missing fields and keeps the listing for review', async () => {
    const result = await prepareSourceListing(repo, broken, undefined, async text => checkAnswer(good, text));
    expect(result.aiFilled).toEqual(expect.arrayContaining(['price', 'grossArea', 'district', 'description', 'transaction', 'propertyType']));
    expect(result.listing).toMatchObject({ transaction: 'rent', propertyType: 'commercial', price: 150000, period: 'month', district: 'Konyaaltı', neighborhood: 'Liman', grossArea: 120, needsReview: true });
  });
  it('does not overwrite what the bookmark read, and works without AI', async () => {
    const partly = { ...broken, specs: { 'm² (Brüt)': '110' } };
    const result = await prepareSourceListing(repo, partly, undefined, async () => ({ ...checkAnswer(good, page), transaction: 'sale' as const }));
    expect(result.listing.grossArea).toBe(110);
    expect(result.aiFilled).not.toContain('transaction');
    const plain = await prepareSourceListing(repo, { ...broken, id: '1340575406', url: url.replace('1340575405', '1340575406') });
    expect(plain).toMatchObject({ created: true, aiFilled: [], listing: { needsReview: false } });
  });
});
