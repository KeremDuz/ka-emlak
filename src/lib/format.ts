import type { Listing, Transaction, PropertyType, Period } from './types';
export const transactionLabels: Record<Transaction, string> = { sale: 'Satılık', rent: 'Kiralık', exchange: 'Kat karşılığı' };
export const propertyLabels: Record<PropertyType, string> = { apartment: 'Daire', villa: 'Villa', land: 'Arsa', office: 'Ofis', commercial: 'İş yeri', building: 'Bina', warehouse: 'Depo' };
export const periodLabels: Record<Period, string> = { total: '', day: '/ gün', week: '/ hafta', month: '/ ay', year: '/ yıl' };
/** Dönemlik kiralık: günlük ya da haftalık kiralanan ilanlar. */
export const isSeasonal = (listing: Pick<Listing, 'transaction' | 'period'>) => listing.transaction === 'rent' && (listing.period === 'day' || listing.period === 'week');
/** Kart ve ilan sayfası etiketi: dönemlik kiralıklarda dönem de yazılır. */
export function transactionLabel(listing: Pick<Listing, 'transaction' | 'period'>) { return isSeasonal(listing) ? (listing.period === 'day' ? 'Günlük kiralık' : 'Haftalık kiralık') : transactionLabels[listing.transaction]; }
export const poolLabels = { private: 'Özel havuz', shared: 'Ortak havuz', none: 'Havuz yok' } as const;
export function priceLabel(listing: Pick<Listing, 'price' | 'currency'>) {
  return listing.price === null ? 'Fiyat için görüşelim' : new Intl.NumberFormat('tr-TR', { style: 'currency', currency: listing.currency, maximumFractionDigits: 0 }).format(listing.price);
}
export function listingUrl(listing: Pick<Listing, 'slug'>) { return `/ilan/${listing.slug}`; }
export function whatsappUrl(phone: string, text = 'Merhaba, portföyünüz hakkında bilgi almak istiyorum.') {
  const number = phone.replace(/\D/g, '');
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : 'https://www.hepsiemlak.com/emlak-ofisi/ka-emlak-29750';
}
export function slugify(value: string) { return value.toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
export function dateLabel(value: string) { return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value)); }
/** +905321234567 → 0532 123 45 67; başka biçimdeki numara olduğu gibi kalır. */
export function phoneLabel(phone: string) { return phone.replace(/^\+90(\d{3})(\d{3})(\d{2})(\d{2})$/, '0$1 $2 $3 $4'); }
