import { useId, useState } from 'react';
import { MotionConfig, motion } from 'motion/react';
import { Search } from 'lucide-react';
import { labelsFor, numberLabel } from '../../lib/format';
import { fill, localePath } from '../../i18n/config';
import type { Dictionary } from '../../i18n/tr';
import type { Locale, Transaction } from '../../lib/types';

// Dönemlik kiralık ayrı bir sayfada listelenir; arama oraya gider.
type Tab = Transaction | 'seasonal';
const tabs: Tab[] = ['sale', 'rent', 'seasonal', 'exchange'];

const salePrices = [3_000_000, 5_000_000, 10_000_000, 20_000_000, 50_000_000];
const rentPrices = [25_000, 40_000, 60_000, 100_000];
const seasonalPrices = [5_000, 7_500, 10_000, 20_000];

export default function HeroSearch({ districts = [], locale, t }: { districts?: string[]; locale: Locale; t: Dictionary['search'] }) {
  const [transaction, setTransaction] = useState<Tab>('sale');
  const line = useId();
  const labels = labelsFor(locale);
  return <MotionConfig reducedMotion="user">
    <div className="search-panel">
      <div className="search-tabs" role="group" aria-label={t.aria}>
        {tabs.map(key => <button type="button" key={key} onClick={() => setTransaction(key)} aria-pressed={transaction === key} className={transaction === key ? 'active' : ''}>
          {key === 'seasonal' ? t.seasonalTab : labels.transaction[key]}
          {/* Seçili sekmenin çizgisi sekmeler arasında kayar. */}
          {transaction === key && <motion.span layoutId={line} className="search-tab-line" transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }} />}
        </button>)}
      </div>
      <form action={localePath(locale, transaction === 'seasonal' ? '/donemlik-kiralik' : '/ilanlar')} className="search-fields">
        {transaction !== 'seasonal' && <input type="hidden" name="transaction" value={transaction} />}
        <div className="search-field"><label htmlFor="hero-location">{t.district}</label><select id="hero-location" name="district"><option value="">{t.allDistricts}</option>{(districts.length ? districts : ['Konyaaltı', 'Döşemealtı', 'Kepez', 'Kemer', 'Muratpaşa']).map(d => <option key={d}>{d}</option>)}</select></div>
        <div className="search-field"><label htmlFor="hero-type">{t.type}</label><select name="propertyType" id="hero-type"><option value="">{t.allTypes}</option>{Object.entries(labels.property).map(([k, l]) => <option value={k} key={k}>{l}</option>)}</select></div>
        {/* Kat karşılığı ilanlarında fiyat olmadığı için üst sınır sorulmaz. */}
        <div className="search-field"><label htmlFor="hero-price">{t.max}</label><select id="hero-price" name="maxPrice" disabled={transaction === 'exchange'}><option value="">{t.any}</option>{(transaction === 'seasonal' ? seasonalPrices : transaction === 'rent' ? rentPrices : salePrices).map(p => <option value={p} key={p}>{fill(t.upTo, { n: numberLabel(p, locale) })}</option>)}</select></div>
        <button className="button" type="submit"><Search size={18} aria-hidden="true" />{t.submit}</button>
      </form>
    </div>
  </MotionConfig>;
}
