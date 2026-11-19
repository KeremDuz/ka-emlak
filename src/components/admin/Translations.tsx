import { useRef, useState } from 'react';
import { Languages, LoaderCircle, RefreshCw } from 'lucide-react';
import type { Listing, ListingTranslation, TranslatedLocale } from '../../lib/types';
import { adminApi } from '../../lib/client/api';
import { sourceHash, translatedLocales, translationState, type TranslationState } from '../../lib/server/translation-source';
import { direction, localeNamesTr } from '../../i18n/config';

const localeNames = localeNamesTr;
const stateLabels: Record<TranslationState, string> = { missing: 'Henüz çevrilmedi', auto: 'Otomatik çeviri', edited: 'Siz düzelttiniz', stale: 'Türkçe metin değişti; yayınlayınca yenilenir' };
export const notConfiguredText = 'Otomatik çeviri henüz bağlanmamış. Bağlandığında kendiliğinden çalışır; ilanlarınız Türkçe olarak yayında kalır.';

/** Düzenleyicideki isteğe bağlı çeviri alanı: kapalı gelir, yönetici dokunmak zorunda değildir. */
export default function TranslationsField({ listingId, form, onChange }: { listingId: string; form: Listing; onChange: (patch: Partial<Listing>) => void }) {
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const latest = useRef(form); latest.current = form;
  const states = translatedLocales.map(locale => translationState(form, locale));
  const summary = states.every(state => state === 'missing') ? 'Yayınlayınca hazırlanır' : states.includes('stale') ? 'Yayınlayınca yenilenir' : states.includes('missing') ? 'Eksik var' : 'Hazır';
  const edit = (locale: TranslatedLocale, patch: Partial<ListingTranslation>) => {
    const current = latest.current; const translations = { ...current.translations };
    const next: ListingTranslation = { title: '', description: '', features: [], ...translations[locale], ...patch, auto: false, sourceHash: sourceHash(current) };
    // İki alan da boşaltılırsa çeviri silinir; yayınlayınca yeniden otomatik hazırlanır.
    if (!next.title.trim() && !next.description.trim()) delete translations[locale]; else translations[locale] = next;
    onChange({ translations });
  };
  const run = async () => {
    const source = { title: form.title, description: form.description, features: form.features };
    if (!source.title.trim() || !source.description.trim()) { setMessage({ text: 'Önce Türkçe başlığı ve açıklamayı yazın.', error: true }); return; }
    setBusy(true); setConfirming(false); setMessage(null);
    try {
      const result = await adminApi.translateText(listingId, source);
      if (result.translations && Object.keys(result.translations).length) onChange({ translations: { ...latest.current.translations, ...result.translations } });
      setMessage(result.status === 'ok' ? { text: 'Çeviri hazır. Aşağıdan okuyup düzeltebilirsiniz.' }
        : result.status === 'partial' ? { text: 'Bazı diller çevrilemedi. Biraz sonra yeniden deneyin.', error: true }
        : result.status === 'not_configured' ? { text: notConfiguredText }
        : { text: 'Çeviri şu anda yapılamadı. Biraz sonra yeniden deneyin; ilanınız bundan etkilenmez.', error: true });
    } catch { setMessage({ text: 'Çeviri şu anda yapılamadı. Bağlantınızı kontrol edip yeniden deneyin.', error: true }); }
    finally { setBusy(false); }
  };
  return <div className="kp-full">
    <button type="button" className="kp-advanced-toggle" aria-expanded={open} aria-controls="translation-fields" onClick={() => setOpen(!open)}><Languages size={17} /><span>Çeviriler (İngilizce, Almanca, Rusça, Arapça, Farsça)</span><small>{summary}</small></button>
    {open && <div id="translation-fields" className="kp-advanced-fields kp-translations">
      <p className="kp-help">İlanı yayınladığınızda beş dile (İngilizce, Almanca, Rusça, Arapça, Farsça) çevirisi kendiliğinden hazırlanır; bir şey yapmanız gerekmez. İsterseniz çeviriyi buradan okuyup düzeltebilirsiniz. Düzelttiğiniz çeviriye sonradan dokunulmaz.</p>
      {translatedLocales.map((locale, index) => {
        const value = form.translations?.[locale]; const rtl = direction(locale) === 'rtl';
        return <section className="kp-translation" key={locale} aria-label={`${localeNames[locale]} çeviri`}>
          <div className="kp-translation-heading"><h4>{localeNames[locale]}</h4><span className={`kp-translation-state kp-translation-${states[index]}`}>{stateLabels[states[index]]}</span></div>
          <div className="kp-field"><label htmlFor={`translation-${locale}-title`}>{localeNames[locale]} başlık</label><input id={`translation-${locale}-title`} value={value?.title ?? ''} maxLength={180} lang={locale} dir={rtl ? 'rtl' : 'ltr'} disabled={busy} onChange={event => edit(locale, { title: event.target.value })} /></div>
          <div className="kp-field"><label htmlFor={`translation-${locale}-description`}>{localeNames[locale]} açıklama</label><textarea id={`translation-${locale}-description`} value={value?.description ?? ''} maxLength={12000} rows={5} lang={locale} dir={rtl ? 'rtl' : 'ltr'} disabled={busy} onChange={event => edit(locale, { description: event.target.value })} /></div>
        </section>;
      })}
      <div className="kp-translation-actions">
        {confirming ? <><span className="kp-help">Elle düzelttiğiniz çeviri silinip yeniden hazırlanacak.</span><button type="button" className="kp-button kp-button-small" onClick={() => void run()}>Evet, yeniden çevir</button><button type="button" className="kp-button kp-button-small kp-button-secondary" onClick={() => setConfirming(false)}>Vazgeç</button></>
          : <button type="button" className="kp-button kp-button-small kp-button-secondary" disabled={busy} onClick={() => states.includes('edited') ? setConfirming(true) : void run()}>{busy ? <><LoaderCircle className="kp-spin" size={15} />Çevriliyor…</> : <><RefreshCw size={15} />{states.every(state => state === 'missing') ? 'Şimdi çevir' : 'Yeniden çevir'}</>}</button>}
        {message && <span className={message.error ? 'kp-field-error' : 'kp-help'} role="status">{message.text}</span>}
      </div>
    </div>}
  </div>;
}
