import type { Listing } from './types';
import { propertyLabels, transactionLabels } from './format';

export const antalyaDistricts = ['Akseki', 'Aksu', 'Alanya', 'Demre', 'Döşemealtı', 'Elmalı', 'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer', 'Kepez', 'Konyaaltı', 'Korkuteli', 'Kumluca', 'Manavgat', 'Muratpaşa', 'Serik'];
/** Oda sayısı yalnız konutlarda zorunludur; ofis, dükkan, depo ve binada isteğe bağlıdır. */
export const roomOptions = ['1+0', '1+1', '2+1', '3+1', '4+1', '4+2', '5+1', '5+2', '6+1', '6+2', '7+'];

type TitleSource = Pick<Listing, 'transaction' | 'propertyType' | 'rooms' | 'grossArea' | 'district' | 'neighborhood'>;
type DescriptionSource = TitleSource & Pick<Listing, 'netArea' | 'floor' | 'buildingAge' | 'features'>;

const area = (value: number) => `${value.toLocaleString('tr-TR')} m²`;
const words = (parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

/** "Konyaaltı Arapsuyu Satılık 4+1 Daire" biçiminde, ilan sitelerindeki alışkanlığa uygun başlık. */
export function suggestTitle(listing: TitleSource) {
  const type = propertyLabels[listing.propertyType];
  const size = listing.propertyType === 'land' || !listing.rooms ? listing.grossArea > 0 && area(listing.grossArea) : listing.rooms;
  return words([listing.district, listing.neighborhood, transactionLabels[listing.transaction], size, type]);
}

/** Açıklama alanı boşken başlangıç metni; danışman kendi sözleriyle düzenler. */
export function suggestDescription(listing: DescriptionSource) {
  const place = words([listing.district, listing.neighborhood && `${listing.neighborhood} Mahallesi`]) || 'Antalya';
  const sentences = [`${place} bölgesinde ${transactionLabels[listing.transaction].toLocaleLowerCase('tr-TR')} ${words([listing.propertyType !== 'land' && listing.rooms, propertyLabels[listing.propertyType].toLocaleLowerCase('tr-TR')])}.`];
  if (listing.grossArea > 0) sentences.push(listing.netArea ? `${area(listing.grossArea)} brüt, ${area(listing.netArea)} net kullanım alanına sahiptir.` : `${area(listing.grossArea)} ${listing.propertyType === 'land' ? 'arsa alanına' : 'brüt kullanım alanına'} sahiptir.`);
  if (listing.floor) sentences.push(`Bulunduğu kat: ${listing.floor}.`);
  if (listing.buildingAge) sentences.push(`Bina yaşı: ${listing.buildingAge}.`);
  if (listing.features.length) sentences.push(`Öne çıkan özellikler: ${listing.features.join(', ')}.`);
  sentences.push('Detaylı bilgi almak ve yerinde görmek için bizimle iletişime geçebilirsiniz.');
  return sentences.join(' ');
}

/** İlçeler ilan sayısına göre, odalar küçükten büyüğe; yalnız portföyde gerçekten bulunanlar. */
export function catalogOptions(listings: Pick<Listing, 'district' | 'rooms'>[]) {
  const counts = new Map<string, number>();
  for (const { district } of listings) if (district.trim()) counts.set(district, (counts.get(district) ?? 0) + 1);
  const districts = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'tr')).map(([name]) => name);
  const present = new Set(listings.map(item => item.rooms).filter(Boolean));
  const rooms = [...roomOptions.filter(room => present.has(room)), ...[...present].filter(room => !roomOptions.includes(room)).sort()];
  return { districts, rooms };
}

/** Rakam dışındaki karakterleri atar; "14.500.000" → 14500000. */
export function parsePrice(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) : null;
}
export function formatPriceInput(value: number | null) { return value ? value.toLocaleString('tr-TR') : ''; }
