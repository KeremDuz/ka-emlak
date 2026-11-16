import type { AdminListing, Listing } from './types';
import { isSourceListing, likelySame, mapSource, sourceIdOf, type MappedListing, type SourceListing } from './source-mapper';

/** Yer iminin hepsiemlak ofis sayfasından okuyup panele getirdiği bütün ilanlar. */
export interface SyncPayload {
  source: 'hepsiemlak';
  office: string;
  /** Ofis sayfalarında görülen bütün ilan numaraları; detayı okunamayan ilan da burada olur ve yayından kaldırılmaz. */
  seen: string[];
  listings: SourceListing[];
}

export function isSyncPayload(value: unknown): value is SyncPayload {
  const item = value as SyncPayload | null;
  if (!item || item.source !== 'hepsiemlak' || typeof item.office !== 'string' || !/^\d{1,10}$/.test(item.office)) return false;
  const own = (id: unknown) => typeof id === 'string' && id.startsWith(`${item.office}-`) && /^\d+-\d+$/.test(id);
  return Array.isArray(item.seen) && item.seen.length > 0 && item.seen.length <= 300 && item.seen.every(own)
    && Array.isArray(item.listings) && item.listings.length <= 300
    && item.listings.every(listing => isSourceListing(listing) && listing.source === 'hepsiemlak' && item.seen.includes(listing.id));
}

/** Eşitlemede karşılaştırılan alanlar. Kat ve bina yaşı gibi metinler sitede düzenlenmiş olabileceği için ezilmez. */
export const syncFields = ['transaction', 'price', 'currency', 'period', 'grossArea', 'netArea', 'rooms', 'bathrooms'] as const;
export type SyncField = typeof syncFields[number];
export interface SyncChange { field: SyncField; from: Listing[SyncField]; to: MappedListing[SyncField] }
export interface SyncAdd { source: SourceListing; mapped: MappedListing }
export interface SyncUpdate { source: SourceListing; listing: AdminListing; changes: SyncChange[]; likely: boolean }
export interface SyncPlan { add: SyncAdd[]; update: SyncUpdate[]; unchanged: number; unread: number }

export const current = (record: AdminListing): Listing => { const { draft, ...listing } = record; return { ...(draft ?? listing), version: record.version }; };
const sourceOf = (record: AdminListing) => sourceIdOf(record.draft?.sourceUrl ?? record.sourceUrl);
const ownId = (record: AdminListing, office: string) => {
  const url = record.draft?.sourceUrl ?? record.sourceUrl;
  const id = sourceOf(record);
  return url?.startsWith('https://www.hepsiemlak.com/') && id?.startsWith(`${office}-`) ? id : undefined;
};

// Portalda boş bırakılmış alan sitedeki bilgiyi silmez; kat karşılığı ilanın fiyatsız olması ise gerçek bir değişikliktir.
const empty = (field: SyncField, mapped: MappedListing) => {
  const value = mapped[field];
  return (value === null || value === '' || value === 0) && !(field === 'price' && mapped.transaction === 'exchange');
};
function changes(listing: Listing, mapped: MappedListing): SyncChange[] {
  return syncFields.filter(field => !empty(field, mapped) && (listing[field] ?? null) !== (mapped[field] ?? null)).map(field => ({ field, from: listing[field], to: mapped[field] }));
}

/**
 * Ofis sayfasındaki ilanları sitedekilerle karşılaştırır: sitede olmayanlar eklenir, karşılaştırılan alanları değişenler
 * güncellenir. Sitedeki hiçbir ilan kaldırılmaz: ofisin bütün ilanları portallarda olmayabilir (sahibinden paketleri
 * aylık ilan sayısını sınırlar). Satıldı/kiralandı/yayından kaldırıldı işaretleri değiştirilmez.
 */
export function planSync(payload: SyncPayload, listings: AdminListing[]): SyncPlan {
  const active = listings.filter(item => item.status !== 'trash');
  const byId = new Map(active.flatMap(item => { const id = ownId(item, payload.office); return id ? [[id, item] as const] : []; }));
  const others = active.filter(item => !ownId(item, payload.office));
  const plan: SyncPlan = { add: [], update: [], unchanged: 0, unread: payload.seen.filter(id => !payload.listings.some(item => item.id === id)).length };
  const claimed = new Set<string>();
  for (const source of payload.listings) {
    const mapped = mapSource(source);
    const exact = byId.get(source.id);
    // Aynı mülk sahibinden'den eklenmişse numarası tutmaz; konum, tür ve metrekareden eşleştirilir.
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
