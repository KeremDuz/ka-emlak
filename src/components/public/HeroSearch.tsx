import { useId, useState } from 'react';
import { MotionConfig, motion } from 'motion/react';
import { Search } from 'lucide-react';
import { propertyLabels } from '../../lib/format';
import type { Transaction } from '../../lib/types';

// Dönemlik kiralık ayrı bir sayfada listelenir; arama oraya gider.
type Tab = Transaction | 'seasonal';
const tabs: [Tab, string][] = [['sale', 'Satılık'], ['rent', 'Kiralık'], ['seasonal', 'Dönemlik'], ['exchange', 'Kat karşılığı']];

const salePrices = [3_000_000, 5_000_000, 10_000_000, 20_000_000, 50_000_000];
const rentPrices = [25_000, 40_000, 60_000, 100_000];
const seasonalPrices = [5_000, 7_500, 10_000, 20_000];

export default function HeroSearch({ districts = [] }: { districts?: string[] }) {
  const [transaction, setTransaction] = useState<Tab>('sale');
  const line = useId();
  return <MotionConfig reducedMotion="user">
    <div className="search-panel">
      <div className="search-tabs" role="group" aria-label="İlan türü">
        {tabs.map(([key, label]) => <button type="button" key={key} onClick={() => setTransaction(key)} aria-pressed={transaction === key} className={transaction === key ? 'active' : ''}>
          {label}
          {/* Seçili sekmenin çizgisi sekmeler arasında kayar. */}
          {transaction === key && <motion.span layoutId={line} className="search-tab-line" transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }} />}
        </button>)}
      </div>
      <form action={transaction === 'seasonal' ? '/donemlik-kiralik' : '/ilanlar'} className="search-fields">
        {transaction !== 'seasonal' && <input type="hidden" name="transaction" value={transaction} />}
        <div className="search-field"><label htmlFor="hero-location">Bölge</label><select id="hero-location" name="district"><option value="">Tüm bölgeler</option>{(districts.length ? districts : ['Konyaaltı', 'Döşemealtı', 'Kepez', 'Kemer', 'Muratpaşa']).map(d => <option key={d}>{d}</option>)}</select></div>
        <div className="search-field"><label htmlFor="hero-type">Tür</label><select name="propertyType" id="hero-type"><option value="">Tüm türler</option>{Object.entries(propertyLabels).map(([k, l]) => <option value={k} key={k}>{l}</option>)}</select></div>
        {/* Kat karşılığı ilanlarında fiyat olmadığı için üst sınır sorulmaz. */}
        <div className="search-field"><label htmlFor="hero-price">En çok</label><select id="hero-price" name="maxPrice" disabled={transaction === 'exchange'}><option value="">Fark etmez</option>{(transaction === 'seasonal' ? seasonalPrices : transaction === 'rent' ? rentPrices : salePrices).map(p => <option value={p} key={p}>{new Intl.NumberFormat('tr-TR').format(p)} TL’ye kadar</option>)}</select></div>
        <button className="button" type="submit"><Search size={18} aria-hidden="true" />İlanları göster</button>
      </form>
    </div>
  </MotionConfig>;
}
