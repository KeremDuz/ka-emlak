import { z } from 'zod';
import type { MappedListing } from '../source-mapper';
import { callProvider, contentOf, secureUrl, type AiBinding, type TranslateConfig, fallbackModel } from './translate';

/**
 * Yer imi portal sayfasını tam okuyamadığında (portal tasarımını değiştirdiğinde) sayfanın düz metninden eksik bilgileri
 * Gemini ile çıkarır. Yalnız boş kalan alanlar doldurulur. Her sayı sayfa metninde gerçekten geçmelidir; geçmeyen sayı
 * (yapay zekânın uydurduğu) atılır. Açıklama yalnız sayfadan birebir alınmışsa kabul edilir. İlan kontrol için taslakta kalır.
 */
export type AiField = 'transaction' | 'propertyType' | 'price' | 'currency' | 'period' | 'city' | 'district' | 'neighborhood' | 'grossArea' | 'netArea' | 'rooms' | 'bathrooms' | 'floor' | 'buildingAge' | 'description';

const answer = z.object({
  transaction: z.enum(['sale', 'rent', 'exchange']).nullish(),
  propertyType: z.enum(['apartment', 'villa', 'land', 'office', 'commercial', 'building', 'warehouse']).nullish(),
  price: z.number().nonnegative().max(1e13).nullish(),
  currency: z.enum(['TRY', 'EUR', 'USD']).nullish(),
  period: z.enum(['total', 'day', 'week', 'month', 'year']).nullish(),
  city: z.string().max(80).nullish(), district: z.string().max(80).nullish(), neighborhood: z.string().max(120).nullish(),
  grossArea: z.number().nonnegative().max(1e7).nullish(), netArea: z.number().nonnegative().max(1e7).nullish(),
  rooms: z.string().max(20).nullish(), bathrooms: z.number().int().nonnegative().max(50).nullish(),
  floor: z.string().max(60).nullish(), buildingAge: z.string().max(40).nullish(),
  description: z.string().max(12000).nullish(),
});
type Answer = z.infer<typeof answer>;

const prompt = `You read the visible text of a Turkish real-estate listing page (sahibinden.com or hepsiemlak.com) and return ONE JSON object, nothing else.
Fields (use null when the page does not say it; never guess):
transaction: "sale" (Satılık), "rent" (Kiralık, Günlük Kiralık), "exchange" (Kat Karşılığı)
propertyType: "apartment" (daire, residence), "villa" (villa, müstakil ev, yazlık), "land" (arsa, tarla), "office" (ofis, büro), "commercial" (dükkan, mağaza, iş yeri), "building" (komple bina), "warehouse" (depo, antrepo)
price: the asking price as a plain number exactly as written (e.g. "150.000 TL" -> 150000)
currency: "TRY", "EUR" or "USD"
period: "total" for sale; for rent "month" unless the page says daily ("day") or weekly ("week")
city, district, neighborhood: from the location line (e.g. "Antalya / Konyaaltı / Liman Mh." -> "Antalya", "Konyaaltı", "Liman"); drop "Mh./Mah./Mahallesi"
grossArea, netArea: m² (Brüt / Net) as numbers
rooms: like "3+1"; bathrooms: number
floor: "Bulunduğu Kat" value as written; buildingAge: "Bina Yaşı" value as written
description: the listing's own description text copied word for word (not the page menus, not other listings), or null`;

const digits = (value: string) => value.replace(/\D/g, '');
/** Sayı sayfada yazılı mı? "150.000", "150000" ve "150,000" aynı sayılır. */
function appears(text: string, value: number) {
  const plain = String(Math.round(value));
  if (plain === '0') return false;
  return (text.match(/\d[\d.,\s]*/g) ?? []).some(token => digits(token) === plain || digits(token.split(/[,]/)[0]) === plain);
}
const words = (value: string) => value.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();

export function checkAnswer(raw: unknown, text: string): Partial<Pick<MappedListing, AiField>> {
  const parsed = answer.safeParse(raw);
  if (!parsed.success) return {};
  const a: Answer = parsed.data, out: Partial<Pick<MappedListing, AiField>> = {};
  const page = words(text);
  if (a.transaction) out.transaction = a.transaction;
  if (a.propertyType) out.propertyType = a.propertyType;
  if (a.currency) out.currency = a.currency;
  if (a.period) out.period = a.period;
  if (a.price && appears(text, a.price)) out.price = a.price;
  if (a.grossArea && appears(text, a.grossArea)) out.grossArea = a.grossArea;
  if (a.netArea && appears(text, a.netArea)) out.netArea = a.netArea;
  if (a.bathrooms && appears(text, a.bathrooms)) out.bathrooms = a.bathrooms;
  if (a.rooms && /^\d{1,2}\s*\+\s*\d{1,2}$/.test(a.rooms) && page.replace(/\s/g, '').includes(a.rooms.replace(/\s/g, ''))) out.rooms = a.rooms.replace(/\s/g, '');
  for (const key of ['city', 'district', 'neighborhood', 'floor', 'buildingAge'] as const) {
    const value = a[key]?.trim();
    if (value && page.includes(words(value))) out[key] = value;
  }
  const description = a.description?.trim();
  // Açıklama yalnız sayfada birebir geçiyorsa (yapay zekâ yeniden yazmamışsa) alınır.
  if (description && description.length >= 30 && page.includes(words(description.slice(0, 60))) && page.includes(words(description.slice(-40)))) out.description = description;
  return out;
}

/** Bilgilerin önemli bir kısmı okunamadıysa yapay zekâya sorulur. */
export function incomplete(mapped: MappedListing, description: string) {
  return (mapped.transaction !== 'exchange' && !mapped.price) || !mapped.grossArea || !mapped.district || description.trim().length < 30;
}

export async function extractFromText(text: string, config: TranslateConfig | null, ai: AiBinding | null, fetcher: typeof fetch = fetch): Promise<Partial<Pick<MappedListing, AiField>>> {
  const page = text.slice(0, 15000);
  const messages = [{ role: 'system', content: prompt }, { role: 'user', content: page }];
  let content = '';
  if (config && secureUrl(config.url)) {
    const attempt = await callProvider(config, messages, fetcher, 20000);
    if ('content' in attempt) content = attempt.content;
  }
  if (!content && ai) {
    try {
      const output = await ai.run(fallbackModel, { messages, temperature: 0, max_tokens: 4096 });
      content = typeof output === 'string' ? output : typeof (output as { response?: unknown })?.response === 'string' ? (output as { response: string }).response : contentOf(output);
    } catch { /* yapay zekâ yoksa ilan okunabilen bilgilerle eklenir */ }
  }
  const start = content.indexOf('{'), end = content.lastIndexOf('}');
  if (start < 0 || end <= start) return {};
  try { return checkAnswer(JSON.parse(content.slice(start, end + 1)), page); } catch { return {}; }
}
