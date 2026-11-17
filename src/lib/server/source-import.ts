import { z } from 'zod';
import type { AdminListing, Listing, Photo } from '../types';
import { isSourceListing, isSourcePhoto, mapSource, sameSource, smallerPhoto, sourcePhotos, sourceUpdatable as updatable, type MappedListing, type SourceListing } from '../source-mapper';
import { HttpError } from './http';
import { Repository } from './repository';
import { storePhoto } from './uploads';
import { suggestTitle } from '../listing-helpers';
import { editable, imageKind } from './validation';
import { incomplete, type AiField } from './source-ai';
import { MAX_FEATURES } from '../limits';

/** Sayfa düz metninden eksik bilgileri çıkaran yapay zekâ (Gemini; yoksa Workers AI). Testlerde verilmez. */
export type Extractor = (text: string) => Promise<Partial<Pick<MappedListing, AiField>>>;

// "KA Emlak'a ekle" yer imi, ofisin kendi hepsiemlak veya sahibinden ilan sayfasından okuduğu veriyi gönderir.
export const sourceSchema = z.object({
  // Yer iminin gönderdiği sayfa düz metni: portal tasarımı değişip bilgiler okunamazsa yapay zekâ buradan çıkarır.
  text: z.string().max(20000).optional(),
  source: z.enum(['hepsiemlak', 'sahibinden']),
  url: z.string().max(500).regex(/^https:\/\/www\.(hepsiemlak|sahibinden)\.com\/[^\s?#]+$/),
  id: z.string().regex(/^\d{1,12}(-\d{1,10})?$/),
  title: z.string().max(300),
  price: z.string().max(80),
  breadcrumb: z.array(z.string().max(160)).max(12),
  specs: z.record(z.string().max(160), z.string().max(400)).refine(value => Object.keys(value).length <= 80),
  description: z.string().max(20000),
  photos: z.array(z.string().max(800)).max(150),
  properties: z.record(z.string().max(80), z.array(z.string().max(100)).max(80)).refine(value => Object.keys(value).length <= 20).optional(),
});
const current = (record: AdminListing): Listing => { const { draft, ...listing } = record; return { ...(draft ?? listing), version: record.version }; };

async function locate(listing: Pick<Listing, 'neighborhood' | 'district' | 'city'>) {
  // Mahalle merkezi yaklaşık konum olarak kullanılır; ziyaretçiye zaten yuvarlanmış daire gösterilir.
  try {
    const query = encodeURIComponent(`${listing.neighborhood} Mahallesi, ${listing.district}, ${listing.city}`);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=tr&q=${query}`, { headers: { 'User-Agent': 'KA-Emlak-site/1.0 (ilan aktarma)' }, signal: AbortSignal.timeout(5000) });
    const [hit] = response.ok ? await response.json() as { lat: string; lon: string }[] : [];
    return hit ? { latitude: Math.round(Number(hit.lat) * 1e5) / 1e5, longitude: Math.round(Number(hit.lon) * 1e5) / 1e5 } : {};
  } catch { return {}; }
}

/**
 * İlanı oluşturur ya da sitede zaten varsa yapısal bilgilerini günceller: aynı portal numarası kendiliğinden eşleşir,
 * öteki portaldan gelmiş aynı mülk için panel targetId gönderir. Fotoğraflar ayrı isteklerle eklenir.
 */
export async function prepareSourceListing(repo: Repository, value: unknown, targetId?: string, extract?: Extractor) {
  const source = sourceSchema.parse(value) as SourceListing;
  if (!isSourceListing(source)) throw new HttpError(422, 'İlan numarası sayfa adresiyle uyuşmuyor.', 'SOURCE_MISMATCH');
  const mapped = mapSource(source);
  const photos = sourcePhotos(source);
  const listings = await repo.listings();
  const target = targetId ? listings.find(item => item.id === targetId) : undefined;
  if (targetId && (!target || target.status === 'trash')) throw new HttpError(404, 'Güncellenecek ilan bulunamadı.', 'NOT_FOUND');
  const existing = target ?? listings.find(item => item.status !== 'trash' && [item.sourceUrl, item.draft?.sourceUrl].some(url => sameSource(url, source.id)));
  if (existing) {
    // Başlık, açıklama ve fotoğraflar sitede düzenlenmiş olabilir; yalnız fiyat ve ölçüler güncellenir.
    // Öteki portaldan eşleştirilen ilanın kaynak adresi korunur; böylece kendi portalındaki numarasıyla eşleşmeye devam eder.
    const data = current(existing);
    const next: Listing = { ...data, needsReview: false, sourceUrl: target ? data.sourceUrl ?? source.url : source.url };
    // Portalda boş bırakılan alan sitedeki bilgiyi silmez. Günlük/haftalık kiralanan ilan öteki portalda aylık fiyatla
    // girilmiş olabilir; dönem tutmuyorsa fiyat, para birimi ve dönem korunur.
    const seasonal = (period: Listing['period']) => period === 'day' || period === 'week';
    const otherTerms = data.period !== mapped.period && (seasonal(data.period) || seasonal(mapped.period));
    for (const key of updatable) {
      const value = mapped[key];
      if (otherTerms && (key === 'price' || key === 'currency' || key === 'period')) continue;
      if ((value === null || value === '' || value === 0) && !(key === 'price' && mapped.transaction === 'exchange')) continue;
      Object.assign(next, { [key]: value });
    }
    // Portalda yeni işaretlenen özellikler eklenir; sitede eklenmiş ya da portalda kaldırılmış özellik silinmez.
    const known = new Set(data.features.map(item => item.toLocaleLowerCase('tr-TR')));
    next.features = [...data.features, ...mapped.features.filter(item => !known.has(item.toLocaleLowerCase('tr-TR')))].slice(0, MAX_FEATURES);
    const saved = await repo.save(existing.id, editable(next), existing.version);
    return { listing: saved, created: false, photos: data.photos.length ? [] : photos };
  }
  // Yeni ilanın önemli bilgileri okunamadıysa (portal tasarımı değişmiş olabilir) sayfa metninden yapay zekâyla tamamlanır.
  // Yalnız boş alanlar doldurulur; ilan ofis kontrol edene kadar taslakta kalır. Var olan ilanlara yapay zekâ dokunmaz.
  let filled: AiField[] = [];
  if (extract && source.text && incomplete(mapped, source.description)) {
    const found = await extract(source.text).catch((): Partial<Pick<MappedListing, AiField>> => ({}));
    // Bilgi listesi hiç okunamadıysa (tasarım değişmiş) işlem ve gayrimenkul türü de varsayılandır; yapay zekânınki alınır.
    const broken = Object.keys(source.specs).length === 0;
    const blank = (key: AiField) => key === 'description' ? source.description.trim().length < 30
      : (['transaction', 'propertyType', 'currency', 'period', 'city'] as AiField[]).includes(key) ? broken
      : mapped[key] === null || mapped[key] === '' || mapped[key] === 0;
    filled = (Object.keys(found) as AiField[]).filter(blank);
    for (const key of filled) Object.assign(mapped, { [key]: found[key] });
    if (filled.length) mapped.title = suggestTitle(mapped).slice(0, 160);
  }
  const created = await repo.create();
  const coordinates = mapped.transaction === 'exchange' || !mapped.neighborhood ? {} : await locate(mapped);
  const saved = await repo.save(created.id, editable({ ...current(created), ...mapped, ...coordinates, photos: [], needsReview: filled.length > 0 }), created.version);
  return { listing: saved, created: true, photos, aiFilled: filled };
}

async function download(url: string): Promise<Uint8Array<ArrayBuffer>> {
  // Cloudflare Workers redirect:'error' desteklemez (TypeError verir); yönlendirme 'manual' ile alınıp başarısız sayılır.
  let response: Response;
  try { response = await fetch(url, { redirect: 'manual', headers: { Accept: 'image/jpeg,image/png,image/webp' }, signal: AbortSignal.timeout(20000) }); }
  catch { throw new HttpError(502, 'Fotoğraf portaldan alınamadı.', 'SOURCE_PHOTO'); }
  if (response.status !== 200 || !response.body) throw new HttpError(502, 'Fotoğraf portaldan alınamadı.', 'SOURCE_PHOTO');
  const declared = Number(response.headers.get('Content-Length') || 0);
  if (declared > 3_000_000) throw new HttpError(413, 'Fotoğraf çok büyük.', 'TOO_LARGE');
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > 3_000_000) { await reader.cancel(); throw new HttpError(413, 'Fotoğraf çok büyük.', 'TOO_LARGE'); }
    chunks.push(value);
  }
  const output = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.length; }
  return output;
}

/**
 * Yalnız portalların fotoğraf sunucusundaki ilan galerisinden indirir. Büyük boy 3 MB'yi aşarsa ya da portalda
 * bulunmuyorsa (sahibinden afiş gibi küçük yüklenen görsellerin büyük boyunu üretmez) bir küçük boyu dener.
 */
export async function fetchSourcePhoto(url: string): Promise<Uint8Array<ArrayBuffer>> {
  if (!isSourcePhoto(url)) throw new HttpError(422, 'Yalnız hepsiemlak ve sahibinden ilan fotoğrafları aktarılabilir.', 'SOURCE_PHOTO');
  let data: Uint8Array<ArrayBuffer>;
  try { data = await download(url); }
  catch (error) {
    const smaller = smallerPhoto(url);
    if (smaller === url || !(error instanceof HttpError && (error.code === 'TOO_LARGE' || error.code === 'SOURCE_PHOTO'))) throw error;
    data = await download(smaller);
  }
  if (!imageKind(data)) throw new HttpError(415, 'Portal fotoğrafı tanınmayan biçimde.', 'IMAGE_TYPE');
  return data;
}

/** Portal fotoğrafını olduğu gibi saklar (eski panel sürümleri için; panel artık photo-file ile alıp WebP yükler). */
export async function importSourcePhoto(repo: Repository, listingId: string, url: string): Promise<Photo> {
  return storePhoto(repo, listingId, await fetchSourcePhoto(url));
}
