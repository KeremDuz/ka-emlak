import type { Listing, ListingFilters } from '../types';
import { isSeasonal } from '../format';
const normalize = (value: string) => value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function filterListings(listings: Listing[], filters: ListingFilters = {}) {
  let filtered = listings.filter(item => item.status === 'published');
  for (const field of ['transaction','propertyType','district','neighborhood','rooms','currency','period'] as const) {
    const value = filters[field]; if (!value || value === 'all') continue;
    // period=short: günlük ve haftalık kiralananlar (dönemlik kiralık bölümü).
    filtered = field === 'period' && value === 'short' ? filtered.filter(isSeasonal) : filtered.filter(item => item[field] === value);
  }
  if (filters.q?.trim()) { const q = normalize(filters.q.trim()); filtered = filtered.filter(item => normalize([item.title,item.city,item.district,item.neighborhood,item.description].join(' ')).includes(q)); }
  if (filters.featured === 'true') filtered = filtered.filter(item => item.featured);
  for (const [name, field, lower] of [['minPrice','price',true],['maxPrice','price',false],['minArea','grossArea',true],['maxArea','grossArea',false]] as const) {
    const raw=filters[name]; if (!raw?.trim()) continue; const amount=Number(raw); if (!Number.isFinite(amount) || amount < 0) continue;
    filtered=filtered.filter(item=>item[field] !== null && (lower ? item[field]! >= amount : item[field]! <= amount));
  }
  const result = [...filtered];
  const comparablePrice = new Set(result.map(item=>`${item.currency}:${item.period}`)).size <= 1;
  if ((filters.sort === 'price-asc' || filters.sort === 'price_asc') && comparablePrice) result.sort((a,b)=>(a.price ?? Infinity)-(b.price ?? Infinity));
  else if ((filters.sort === 'price-desc' || filters.sort === 'price_desc') && comparablePrice) result.sort((a,b)=>(b.price ?? -1)-(a.price ?? -1));
  else if (filters.sort === 'area-desc') result.sort((a,b)=>b.grossArea-a.grossArea);
  else result.sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
  return result;
}
