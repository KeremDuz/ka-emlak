import { getPublicData } from '../../../lib/server/data';
import type { ServerLocals } from '../../../lib/server/env';
import { listingUrl } from '../../../lib/format';
import type { Locale } from '../../../lib/types';

/** İlan sayfasının üç dildeki rotası aynı aramayı kullanır. Yönlendirme ve durum kodu sayfa dosyasında verilir
    (bir bileşen akış başladıktan sonra yanıt kodunu değiştiremez), bu yüzden arama bileşenin dışında yapılır. */
export async function lookupListing(locals: unknown, slug: string | undefined, locale: Locale) {
  const data = await getPublicData(locals as ServerLocals);
  const listing = data.listings.find(l => l.slug === slug);
  // Başlık değişince adres de değişir; adresin sonundaki kimlik eki eski paylaşılan linkleri yeni adrese taşır.
  const idSuffix = !listing && slug?.match(/-([0-9a-f]{8})$/)?.[1];
  const moved = idSuffix ? data.listings.find(l => l.id.startsWith(idSuffix)) : undefined;
  return { data, listing, redirect: moved ? listingUrl(moved, locale) : undefined, status: listing ? 200 : data.available ? 404 : 503 };
}
export type ListingLookup = Awaited<ReturnType<typeof lookupListing>>;
