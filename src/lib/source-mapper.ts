import type { Currency, Listing, Period, PropertyType, Transaction } from './types';
import { suggestDescription, suggestTitle } from './listing-helpers';

export type SourceName = 'hepsiemlak' | 'sahibinden';
/** "KA Emlak'a ekle" yer iminin hepsiemlak veya sahibinden ilan sayfasından okuduğu ham veri. */
export interface SourceListing {
  source: SourceName;
  url: string;
  id: string;
  title: string;
  price: string;
  /** hepsiemlak: sayfa yolu (Ana Sayfa > … > il > ilçe > mahalle > tür); sahibinden: konum (il, ilçe, mahalle). */
  breadcrumb: string[];
  specs: Record<string, string>;
  description: string;
  photos: string[];
}
export type MappedListing = Pick<Listing, 'title' | 'transaction' | 'propertyType' | 'price' | 'currency' | 'period' | 'city' | 'district' | 'neighborhood' | 'grossArea' | 'netArea' | 'rooms' | 'bathrooms' | 'floor' | 'buildingAge' | 'description' | 'features' | 'sourceUrl'>;

export const sourceLabels: Record<SourceName, string> = { hepsiemlak: 'hepsiemlak', sahibinden: 'sahibinden' };
/** Portaldan güncellenen alanlar; başlık, açıklama ve fotoğraflar sitede düzenlenmiş olabileceği için korunur. */
export const sourceUpdatable = ['transaction', 'propertyType', 'price', 'currency', 'period', 'grossArea', 'netArea', 'rooms', 'bathrooms', 'floor', 'buildingAge'] as const;
const origins: Record<SourceName, string> = { hepsiemlak: 'https://www.hepsiemlak.com/', sahibinden: 'https://www.sahibinden.com/' };
const idPatterns: Record<SourceName, RegExp> = { hepsiemlak: /^\d{1,10}-\d{1,10}$/, sahibinden: /^\d{6,12}$/ };

/** hepsiemlak adresi ".../29750-195", sahibinden adresi ".../ilan/...-1337536275/detay" ile biter. */
export const sourceIdOf = (url: string | undefined) => url?.match(/(\d+-\d+)\/?$/)?.[1] ?? url?.match(/^https:\/\/www\.sahibinden\.com\/.*-(\d{6,12})\/detay\/?$/)?.[1];
/** Aynı portal ilanı mı? Numarası olmayan kayıtlar hiçbir şeyle eşleşmez. */
export const sameSource = (url: string | undefined, id: string | undefined) => !!id && sourceIdOf(url) === id;
/** Panel adresine gelen veri gerçekten yer iminden mi geldi? Biçimi bozuk veya başka siteden gelen veri reddedilir. */
export function isSourceListing(value: unknown): value is SourceListing {
  const item = value as SourceListing | null;
  return !!item && (item.source === 'hepsiemlak' || item.source === 'sahibinden') && typeof item.id === 'string' && idPatterns[item.source].test(item.id)
    && typeof item.url === 'string' && item.url.startsWith(origins[item.source]) && sourceIdOf(item.url) === item.id
    && typeof item.title === 'string' && typeof item.price === 'string' && typeof item.description === 'string'
    && Array.isArray(item.breadcrumb) && Array.isArray(item.photos) && !!item.specs && typeof item.specs === 'object';
}

// Fotoğraflar: yalnız portalın fotoğraf sunucusundaki bu ilanın galerisi, en büyük boyda.
// hepsiemlak: benzer ilanlar mncropresize kullandığı için yalnız mnresize alınır. sahibinden: dosya adı ilan numarasını içerir.
const hepsiemlakPhoto = (url: URL) => /^hecdn[a-z0-9]*\.hemlak\.com$/.test(url.hostname) && /^\/mnresize\/\d+\/\d+\/ds01\//.test(url.pathname);
const sahibindenPhoto = (url: URL) => /^i\d*\.shbdn\.com$/.test(url.hostname) && /^\/photos\/\d+\/\d+\/\d+\/(x16|big|x5|thmb)_\d{6,12}[a-z0-9]*\.jpg$/.test(url.pathname);
export const isSourcePhoto = (value: string) => { try { const url = new URL(value); return url.protocol === 'https:' && (hepsiemlakPhoto(url) || sahibindenPhoto(url)); } catch { return false; } };
const largest = (url: string) => url.replace(/\/mnresize\/\d+\/\d+\//, '/mnresize/1600/1200/').replace(/\/(thmb|x5|big|x16)_(\d+[a-z0-9]*)\.(?:jpg|jpeg|avif|webp)$/, '/x16_$2.jpg');
/** Büyük boy 3 MB'yi aşarsa denenecek bir küçük boy. */
export const smallerPhoto = (url: string) => url.replace('/mnresize/1600/1200/', '/mnresize/1200/900/').replace('/x16_', '/big_');
export function sourcePhotos(source: Pick<SourceListing, 'source' | 'id' | 'photos'>) {
  const own = source.photos.filter(url => source.source === 'hepsiemlak' ? url.includes('/mnresize/') : url.includes(`_${source.id}`));
  return [...new Set(own.map(largest).filter(isSourcePhoto))].slice(0, 12);
}

const digits = (value?: string) => { const found = (value ?? '').replace(/\D/g, ''); return found ? Number(found) : null; };
const area = (value?: string) => digits((value ?? '').replace(/m2|m²/gi, ''));
const place = (value?: string) => (value ?? '').replace(/\s+(Kat Karşılığı Satılık|Satılık|Kiralık|Günlük Kiralık)$/i, '').replace(/\s+(Mh\.?|Mah\.?|Mahallesi)$/i, '').trim();
const spec = (specs: Record<string, string>, name: string) => Object.entries(specs).find(([key]) => key.replace(/\s+/g, ' ').trim().startsWith(name))?.[1]?.trim() ?? '';
const yes = (value: string) => /^(evet|var)$/i.test(value);

function homeType(kind: string): PropertyType { return /villa|yazlık|köşk|konak|müstakil|yalı|çiftlik/i.test(kind) ? 'villa' : /bina/i.test(kind) ? 'building' : 'apartment'; }
function workType(kind: string): PropertyType { return /ofis|büro/i.test(kind) ? 'office' : /depo|antrepo/i.test(kind) ? 'warehouse' : /bina/i.test(kind) ? 'building' : 'commercial'; }
/** Kaynak metindeki Markdown işaretlerini ve art arda tekrarlanan satırları temizler; sitede düz metin gösterilir. */
export function cleanDescription(text: string) {
  const lines = text.replace(/\*\*/g, '').replace(/^#{1,6}\s*/gm, '').replace(/^\s*-{3,}\s*$/gm, '').replace(/^\s*\* /gm, '• ').split('\n').map(line => line.trim());
  const result: string[] = [];
  for (const line of lines) if (!(line && line.length > 20 && result.includes(line))) result.push(line);
  return result.join('\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 12000);
}

/** İki portalın farklı alan adlarını tek biçime toplar. */
function fields(source: SourceListing) {
  const { specs } = source, crumbs = source.breadcrumb;
  if (source.source === 'sahibinden') {
    // "İş Yeri" gibi büyük İ'li değerler /i bayrağıyla eşleşmez; Türkçe küçük harfe çevrilerek karşılaştırılır.
    const lower = (value: string) => value.toLocaleLowerCase('tr-TR');
    const category = lower(spec(specs, 'Kategori')), kind = lower(spec(specs, 'Türü').replace(/&amp;/g, '&')), heating = lower(spec(specs, 'Isıtma'));
    const features = [
      yes(spec(specs, 'Eşyalı')) && 'Eşyalı', /doğalgaz/i.test(heating) && 'Doğalgaz', /kombi/i.test(heating) && 'Kombi', /klima/i.test(heating) && 'Klima',
      yes(spec(specs, 'Krediye Uygun')) && 'Krediye uygun', spec(specs, 'Kullanım Durumu') === 'Kiracılı' && 'Kiracılı', yes(spec(specs, 'Site İçerisinde')) && 'Site içerisinde',
      yes(spec(specs, 'Balkon')) && 'Balkon', yes(spec(specs, 'Asansör')) && 'Asansör', /açık|kapalı/i.test(spec(specs, 'Otopark')) && 'Otopark',
    ].filter((item): item is string => !!item);
    return {
      status: spec(specs, 'Durumu'),
      propertyType: category.includes('arsa') ? 'land' as const : /iş ?yeri/.test(category) ? workType(kind) : category.includes('bina') ? 'building' as const : homeType(kind),
      city: place(crumbs[0]), district: place(crumbs[1]), neighborhood: place(crumbs[2]),
      gross: area(spec(specs, 'm² (Brüt)')) ?? area(spec(specs, 'm²')), net: area(spec(specs, 'm² (Net)')),
      age: spec(specs, 'Bina Yaşı'), features,
    };
  }
  const work = spec(specs, 'İşyeri Tipi'), home = spec(specs, 'Konut Tipi'), last = crumbs[crumbs.length - 1] ?? '';
  const [gross, net] = spec(specs, 'Brüt / Net').split('/').map(area);
  return {
    status: spec(specs, 'İlan Durumu'),
    propertyType: spec(specs, 'Arsa Tipi') ? 'land' as const : work ? workType(work) : home ? homeType(home)
      : ({ Daire: 'apartment', Villa: 'villa', Ofis: 'office', Bina: 'building', Depo: 'warehouse', Atölye: 'commercial', Dükkan: 'commercial' } as Record<string, PropertyType>)[last] ?? 'land',
    city: place(crumbs[2]), district: place(crumbs[3]), neighborhood: place(crumbs[4]),
    gross: gross ?? area(spec(specs, 'Metrekare')) ?? area(spec(specs, 'Brüt')), net,
    age: spec(specs, 'Bina Yaşı'),
    features: [
      spec(specs, 'Eşya Durumu') === 'Eşyalı' && 'Eşyalı', spec(specs, 'Yakıt Tipi') === 'Doğalgaz' && 'Doğalgaz', spec(specs, 'Isınma Tipi') === 'Klima' && 'Klima',
      spec(specs, 'Isınma Tipi') === 'Kombi' && 'Kombi', spec(specs, 'Krediye Uygunluk') === 'Uygun' && 'Krediye uygun', spec(specs, 'Kullanım Durumu') === 'Kiracılı' && 'Kiracılı',
    ].filter((item): item is string => !!item),
  };
}

export function mapSource(source: SourceListing): MappedListing {
  const { specs } = source;
  const f = fields(source);
  const wanted = /aran[ıi]yor|ar[ıi]yoruz/i.test(source.title);
  const transaction: Transaction = wanted || /kat karşılığı/i.test(f.status) ? 'exchange' : /kiralık/i.test(f.status) ? 'rent' : 'sale';
  const currency: Currency = /€|eur/i.test(source.price) ? 'EUR' : /\$|usd/i.test(source.price) ? 'USD' : 'TRY';
  const price = transaction === 'exchange' ? null : digits(source.price);
  // Günlük kiralık villalar portallarda günlük fiyatla girilir; yüksek tutarlar aylık sayılır.
  const daily = /günlük/i.test(`${f.status} ${source.title}`) && price !== null && price < 50000;
  const period: Period = transaction === 'rent' ? (daily ? 'day' : 'month') : 'total';
  const grossArea = f.gross ?? 0;
  const age = f.age.replace(/ Yaşında$/, '');
  const mapped: MappedListing = {
    title: '', transaction, propertyType: f.propertyType, price, currency, period,
    city: f.city || 'Antalya', district: f.district, neighborhood: f.neighborhood,
    grossArea, netArea: f.net && f.net <= grossArea ? f.net : null,
    rooms: spec(specs, 'Oda Sayısı').match(/(\d+)\s*\+\s*(\d+)/)?.slice(1, 3).join('+') ?? '',
    bathrooms: digits(spec(specs, 'Banyo Sayısı')), floor: spec(specs, 'Bulunduğu Kat'),
    buildingAge: /^(0|sıfır bina)$/i.test(age) ? 'Sıfır bina' : age,
    description: cleanDescription(source.description), features: f.features, sourceUrl: source.url,
  };
  mapped.title = suggestTitle(mapped).slice(0, 160);
  if (mapped.description.length < 30) mapped.description = suggestDescription(mapped);
  return mapped;
}

const placeKey = (value: string) => value.toLocaleLowerCase('tr-TR').replace(/\s+(mh\.?|mah\.?|mahallesi)$/i, '').trim();
/**
 * Aynı mülk iki portalda farklı numarayla yayında olabilir. Numara tutmasa da işlem türü, gayrimenkul türü,
 * ilçe, mahalle ve metrekare (±%3) tutan ilan "aynı görünüyor" sayılır; karar ofise bırakılır.
 */
export function likelySame<T extends Pick<Listing, 'transaction' | 'propertyType' | 'district' | 'neighborhood' | 'grossArea'>>(candidates: T[], mapped: MappedListing): T | undefined {
  if (!(mapped.grossArea > 0) || !mapped.district || !mapped.neighborhood) return undefined;
  return candidates.find(item => item.transaction === mapped.transaction && item.propertyType === mapped.propertyType
    && placeKey(item.district) === placeKey(mapped.district) && placeKey(item.neighborhood) === placeKey(mapped.neighborhood)
    && item.grossArea > 0 && Math.abs(item.grossArea - mapped.grossArea) / mapped.grossArea <= 0.03);
}
