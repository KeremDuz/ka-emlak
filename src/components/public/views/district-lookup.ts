import { getPublicData } from '../../../lib/server/data';
import { filterListings } from '../../../lib/server/filters';
import { catalogOptions } from '../../../lib/listing-helpers';
import { slugify } from '../../../lib/format';
import type { ServerLocals } from '../../../lib/server/env';
import type { ListingFilters } from '../../../lib/types';

/** Satılık (sale) ve kiralık (rent) sayfalarının sabit filtresi; dönemlikler kiralık sayfasına girmez. */
export const listingBase = (kind: 'sale' | 'rent'): ListingFilters => kind === 'sale' ? { transaction: 'sale' } : { transaction: 'rent', period: 'long' };

/** /satilik/konyaalti gibi adresteki ilçe, yayındaki ilanlarda varsa adını verir. Veri alınamazsa sayfa yine açılır (boş liste). */
export async function districtExists(locals: unknown, kind: 'sale' | 'rent', slug: string | undefined): Promise<boolean> {
  if (!slug) return false;
  const data = await getPublicData(locals as ServerLocals);
  if (!data.available) return true;
  return catalogOptions(filterListings(data.listings, listingBase(kind))).districts.some(name => slugify(name) === slug);
}
