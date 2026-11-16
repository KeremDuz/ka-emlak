import type { AdminListing, Listing } from './types';
import { isSourceListing, likelySame, mapSource, sourceIdOf, type MappedListing, type SourceListing, type SourceName } from './source-mapper';

/** sahibinden mağaza listesinde görülen ilan; sayfası okunamazsa panelde bağlantı olarak gösterilir. */
export interface SyncRow { id: string; url: string; title: string; price: string }

/** Yer iminin hepsiemlak ofis sayfasından ya da sahibinden mağaza listesinden okuyup panele getirdiği bütün ilanlar. */
export interface SyncPayload {
  source: SourceName;
  /** hepsiemlak ofis numarası ya da sahibinden mağaza numarası (storeId; bilinmiyorsa "0"). */
  office: string;
  /** Ofis sayfalarında görülen bütün ilan numaraları; detayı okunamayan ilan da burada olur ve yayından kaldırılmaz. */
  seen: string[];
  listings: SourceListing[];
  /** Yalnız sahibinden: mağaza listesindeki satırlar (başlık, fiyat, adres). */
  rows?: SyncRow[];
}

export function isSyncPayload(value: unknown): value is SyncPayload {
  const item = value as SyncPayload | null;
  if (!item || (item.source !== 'hepsiemlak' && item.source !== 'sahibinden') || typeof item.office !== 'string' || !/^\d{1,10}$/.test(item.office)) return false;
  const own = (id: unknown) => typeof id === 'string' && (item.source === 'sahibinden' ? /^\d{6,12}$/.test(id) : id.startsWith(`${item.office}-`) && /^\d+-\d+$/.test(id));
  const row = (value: SyncRow) => !!value && own(value.id) && item.seen.includes(value.id) && typeof value.title === 'string' && value.title.length <= 300
    && typeof value.price === 'string' && value.price.length <= 100 && typeof value.url === 'string' && value.url.startsWith('https://www.sahibinden.com/') && sourceIdOf(value.url) === value.id;
  return Array.isArray(item.seen) && item.seen.length > 0 && item.seen.length <= 300 && item.seen.every(own)
    && Array.isArray(item.listings) && item.listings.length <= 300
    && item.listings.every(listing => isSourceListing(listing) && listing.source === item.source && item.seen.includes(listing.id))
    && (item.rows === undefined || (item.source === 'sahibinden' && Array.isArray(item.rows) && item.rows.length <= 300 && item.rows.every(row)));
}

/** Eşitlemede karşılaştırılan alanlar. Kat ve bina yaşı gibi metinler sitede düzenlenmiş olabileceği için ezilmez. */
export const syncFields = ['transaction', 'price', 'currency', 'period', 'grossArea', 'netArea', 'rooms', 'bathrooms'] as const;
export type SyncField = typeof syncFields[number];
export interface SyncChange { field: SyncField; from: Listing[SyncField]; to: MappedListing[SyncField] }
export interface SyncAdd { source: SourceListing; mapped: MappedListing }
export interface SyncUpdate { source: SourceListing; listing: AdminListing; changes: SyncChange[]; likely: boolean }
/** unreadRows: sayfası okunamayan ve sitede bulunmayan sahibinden ilanları; ofis açıp yer imiyle tek tek ekler. */
export interface SyncPlan { add: SyncAdd[]; update: SyncUpdate[]; unchanged: number; unread: number; unreadRows: SyncRow[] }

export const current = (record: AdminListing): Listing => { const { draft, ...listing } = record; return { ...(draft ?? listing), version: record.version }; };
const sourceOf = (record: AdminListing) => sourceIdOf(record.draft?.sourceUrl ?? record.sourceUrl);
const ownId = (record: AdminListing, payload: Pick<SyncPayload, 'source' | 'office'>) => {
  const url = record.draft?.sourceUrl ?? record.sourceUrl;
  const id = sourceOf(record);
  if (payload.source === 'sahibinden') return url?.startsWith('https://www.sahibinden.com/') ? id : undefined;
  return url?.startsWith('https://www.hepsiemlak.com/') && id?.startsWith(`${payload.office}-`) ? id : undefined;
};

// Portalda boş bırakılmış alan sitedeki bilgiyi silmez; kat karşılığı ilanın fiyatsız olması ise gerçek bir değişikliktir.
const empty = (field: SyncField, mapped: MappedListing) => {
  const value = mapped[field];
  return (value === null || value === '' || value === 0) && !(field === 'price' && mapped.transaction === 'exchange');
};
// Günlük/haftalık kiralanan ilan öteki portalda aylık fiyatla girilmiş olabilir; dönem tutmuyorsa fiyat karşılaştırılmaz.
const seasonal = (period: Listing['period']) => period === 'day' || period === 'week';
const pricing: SyncField[] = ['price', 'currency', 'period'];
function changes(listing: Listing, mapped: MappedListing): SyncChange[] {
  const otherTerms = listing.period !== mapped.period && (seasonal(listing.period) || seasonal(mapped.period));
  return syncFields.filter(field => !(otherTerms && pricing.includes(field)) && !empty(field, mapped) && (listing[field] ?? null) !== (mapped[field] ?? null))
    .map(field => ({ field, from: listing[field], to: mapped[field] }));
}

/**
 * Ofis (hepsiemlak) ya da mağaza (sahibinden) sayfasındaki ilanları sitedekilerle karşılaştırır: sitede olmayanlar eklenir,
 * karşılaştırılan alanları değişenler güncellenir. Sitedeki hiçbir ilan kaldırılmaz: ofisin bütün ilanları portallarda
 * olmayabilir (sahibinden paketleri aylık ilan sayısını sınırlar). Satıldı/kiralandı/yayından kaldırıldı işaretleri değiştirilmez.
 */
export function planSync(payload: SyncPayload, listings: AdminListing[]): SyncPlan {
  const active = listings.filter(item => item.status !== 'trash');
  const byId = new Map(active.flatMap(item => { const id = ownId(item, payload); return id ? [[id, item] as const] : []; }));
  const others = active.filter(item => !ownId(item, payload));
  const unreadIds = payload.seen.filter(id => !payload.listings.some(item => item.id === id));
  // Sayfası okunamayan ilan sitede aynı numarayla varsa listelenmez; yalnız sitede olmayanlar bağlantı olarak gösterilir.
  const unreadRows = (payload.rows ?? []).filter(row => unreadIds.includes(row.id) && !byId.has(row.id));
  const plan: SyncPlan = { add: [], update: [], unchanged: 0, unread: unreadIds.length, unreadRows };
  const claimed = new Set<string>();
  for (const source of payload.listings) {
    const mapped = mapSource(source);
    const exact = byId.get(source.id);
    // Aynı mülk öteki portaldan eklenmişse numarası tutmaz; konum, tür ve metrekareden eşleştirilir.
    const likely = exact ? undefined : likelySame(others.filter(item => !claimed.has(item.id)).map(current), mapped);
    const listing = exact ?? (likely && others.find(item => item.id === likely.id));
    if (!listing) { plan.add.push({ source, mapped }); continue; }
    claimed.add(listing.id);
    const found = changes(current(listing), mapped);
    if (found.length) plan.update.push({ source, listing, changes: found, likely: !exact }); else plan.unchanged++;
  }
  return plan;
}

/** Yer imi veriyi gzip'leyip base64url olarak adresin # kısmında getirir. */
export async function decodeSyncHash(text: string): Promise<unknown> {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return JSON.parse(await new Response(stream).text());
}
