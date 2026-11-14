import { z } from 'zod';
import type { Listing, OfficeSettings } from '../types';
import { HttpError } from './http';
import { roomsRequired } from '../listing-helpers';

const text = (max: number) => z.string().max(max);
const safeUrl = z.string().max(1500).refine(value => !value || value.startsWith('/') && !value.startsWith('//') || /^https:\/\//i.test(value), 'Güvenli bir adres girin.');
export const photoSchema = z.object({ id: text(100), url: safeUrl, thumbnail: safeUrl.optional(), alt: text(200), storagePath: text(500).optional(), bytes: z.number().int().nonnegative().optional() });
const translationSchema = z.object({ title: text(180), description: text(12000), features: z.array(text(100)).max(50), auto: z.boolean() });
const httpsUrl = z.union([z.literal(''), z.string().max(500).regex(/^https:\/\/[^\s<>"']+$/)]);
export const listingSchema = z.object({
  id: z.string().min(1).max(100), slug: z.string().max(250), title: text(180),
  transaction: z.enum(['sale', 'rent', 'exchange']), propertyType: z.enum(['apartment','villa','land','office','commercial','building','warehouse']),
  price: z.number().finite().nonnegative().max(1e13).nullable(), currency: z.enum(['TRY','EUR','USD']), period: z.enum(['total','day','week','month','year']),
  city: text(100), district: text(100), neighborhood: text(150), grossArea: z.number().finite().min(0).max(1e9), netArea: z.number().finite().min(0).max(1e9).nullable(),
  rooms: text(30), bathrooms: z.number().int().min(0).max(100).nullable(), floor: text(50), buildingAge: text(50), description: text(12000),
  features: z.array(text(100)).max(50), photos: z.array(photoSchema).max(12), status: z.enum(['draft','published','sold','rented','archived','trash']), featured: z.boolean(),
  createdAt: z.string().datetime(), updatedAt: z.string().datetime(), version: z.number().int().positive(), sourceUrl: safeUrl.optional(), needsReview: z.boolean(),
  latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional(),
  guests: z.number().int().min(1).max(100).nullable().optional(), pool: z.enum(['private', 'shared', 'none']).optional(), minNights: z.number().int().min(1).max(365).nullable().optional(),
  translations: z.object({ en: translationSchema.optional(), fa: translationSchema.optional() }).optional(),
  videoUrl: httpsUrl.optional(), tourUrl: httpsUrl.optional(), investment: z.boolean().optional(),
});
export const settingsSchema = z.object({ name: text(100), advisor: text(100), phone: text(50), whatsapp: text(50), email: z.union([z.literal(''),z.string().email().max(200)]), address: text(400), hours: text(200), about: text(4000), heroImage: safeUrl, instagram: safeUrl, licenseNumber: text(100) });
export const inquirySchema = z.object({ name: z.string().trim().min(2).max(100), phone: z.string().trim().min(10).max(30).regex(/^[+\d\s()-]+$/), message: text(2000).default(''), listingId: text(100).optional(), kind: z.enum(['callback','valuation']), website: text(1000).optional(), startedAt: z.number().optional(), consent: z.literal(true) });
export const editable = (value: unknown): Listing => listingSchema.parse(value);
export const office = (value: unknown): OfficeSettings => settingsSchema.parse(value);
export function assertPublishable(listing: Listing) {
  const missing = [listing.title.trim().length<8 && 'en az 8 karakter başlık', !listing.city.trim() && 'il', !listing.district.trim() && 'ilçe', listing.grossArea <= 0 && 'brüt alan', listing.description.trim().length<30 && 'en az 30 karakter açıklama', !listing.photos.length && 'en az bir fotoğraf', roomsRequired(listing.propertyType)&&!listing.rooms.trim()&&'oda bilgisi'].filter(Boolean);
  if (missing.length) throw new HttpError(422, `Yayınlamak için ${missing.join(', ')} ekleyin.`, 'PUBLISH_VALIDATION', missing);
  if(listing.netArea!==null&&listing.netArea>listing.grossArea)throw new HttpError(422,'Net alan brüt alandan büyük olamaz.','PUBLISH_VALIDATION');
  if(listing.needsReview)throw new HttpError(422,'Yayınlamadan önce ilan bilgilerini kontrol ettiğinizi onaylayın.','REVIEW_REQUIRED');
}
export function imageKind(data: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return 'image/jpeg';
  if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47 && data[4] === 0x0d && data[5] === 0x0a && data[6] === 0x1a && data[7] === 0x0a) return 'image/png';
  const str = new TextDecoder().decode(data.subarray(0,12));
  if (str.startsWith('RIFF') && str.slice(8) === 'WEBP') return 'image/webp';
  return null;
}
