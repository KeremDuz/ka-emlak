export type Transaction = 'sale' | 'rent' | 'exchange';
export type PropertyType = 'apartment' | 'villa' | 'land' | 'office' | 'commercial' | 'building' | 'warehouse';
export type ListingStatus = 'draft' | 'published' | 'sold' | 'rented' | 'archived' | 'trash';
export type Currency = 'TRY' | 'EUR' | 'USD';
export type Period = 'total' | 'day' | 'week' | 'month' | 'year';
export type Pool = 'private' | 'shared' | 'none';
export interface Photo { id: string; url: string; thumbnail?: string; alt: string; storagePath?: string; bytes?: number; }
export interface Listing {
  id: string; slug: string; title: string; transaction: Transaction; propertyType: PropertyType;
  price: number | null; currency: Currency; period: Period; city: string; district: string;
  neighborhood: string; grossArea: number; netArea: number | null; rooms: string;
  bathrooms: number | null; floor: string; buildingAge: string; description: string;
  features: string[]; photos: Photo[]; status: ListingStatus; featured: boolean;
  createdAt: string; updatedAt: string; version: number; sourceUrl?: string;
  needsReview: boolean; latitude?: number; longitude?: number;
  /** Dönemlik (günlük/haftalık) kiralıklar için: kaç kişilik, havuz, en az kaç gece. İsteğe bağlıdır. */
  guests?: number | null; pool?: Pool; minNights?: number | null;
}
export interface AdminListing extends Listing { draft: Listing | null; }
export interface OfficeSettings {
  name: string; advisor: string; phone: string; whatsapp: string; email: string;
  address: string; hours: string; about: string; heroImage: string;
  instagram: string; licenseNumber: string;
}
export interface Inquiry {
  id: string; name: string; phone: string; message: string; listingId?: string;
  kind: 'callback' | 'valuation'; status: 'new' | 'contacted' | 'closed'; createdAt: string;
}
export interface ListingFilters {
  q?: string; transaction?: string; propertyType?: string; district?: string;
  neighborhood?: string; rooms?: string; minPrice?: string; maxPrice?: string;
  minArea?: string; maxArea?: string; currency?: string; period?: string;
  sort?: string; page?: string; featured?: string;
}
export interface PublicData { listings: Listing[]; settings: OfficeSettings; mode: 'live' | 'preview'; available: boolean; }
export interface ClientConfig {
  /** auth: panel girişi için Supabase adresi ve herkese açık anahtarı; giriş bağlanmamışsa null. */
  mode: 'live' | 'preview'; auth: { url: string; publishableKey: string } | null;
}
