import { useRef, useState } from 'react';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { localePath } from '../../i18n/config';
import type { Dictionary } from '../../i18n/tr';
import type { Locale } from '../../lib/types';

export default function InquiryForm({ listingId, kind = 'callback', compact = false, heading: Heading = 'h3', locale, t }: { listingId?: string; kind?: 'callback' | 'valuation'; compact?: boolean; heading?: 'h2' | 'h3'; locale: Locale; t: Dictionary['form'] }) {
  const started = useRef(Date.now());
  const [pending, setPending] = useState(false), [message, setMessage] = useState(''), [success, setSuccess] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const data = new FormData(form); setPending(true); setMessage('');
    let known = false;
    try {
      // locale: talebin hangi dilde geldiğini ofise bildirir. Sunucu şeması bilmediği alanı atar, isteği reddetmez.
      const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.get('name'), phone: data.get('phone'), message: data.get('message') || '', website: data.get('website') || '', consent: true, startedAt: started.current, kind, listingId, locale }) });
      const result = await response.json();
      // Sunucunun hata metinleri Türkçedir; öteki dillerde sözlükteki karşılığı gösterilir.
      if (!response.ok) { known = true; throw new Error(locale === 'tr' ? result.error || t.error : response.status === 429 ? t.errorRate : t.error); }
      setSuccess(true); setMessage(locale === 'tr' ? result.message || t.success : t.success); form.reset();
    } catch (error) { setMessage(known && error instanceof Error ? error.message : locale === 'tr' && error instanceof Error ? error.message : t.errorNetwork); }
    finally { setPending(false); }
  }
  const submitLabel = kind === 'valuation' ? t.submitValuation : t.submitCallback;
  return <form className="inquiry-form" onSubmit={submit}>
    <Heading>{kind === 'valuation' ? t.valuationTitle : t.callbackTitle}</Heading>
    <p>{kind === 'valuation' ? t.valuationIntro : t.callbackIntro}</p>
    {message && <div role={success ? 'status' : 'alert'} className={`form-message ${success ? '' : 'error'}`}>{success ? <CheckCircle2 size={19} aria-hidden="true" /> : <CircleAlert size={19} aria-hidden="true" />}<span>{message}</span></div>}
    <div className="form-field"><label htmlFor={`inquiry-name-${kind}`}>{t.name}</label><input id={`inquiry-name-${kind}`} name="name" autoComplete="name" required minLength={2} maxLength={100} /></div>
    <div className="form-field"><label htmlFor={`inquiry-phone-${kind}`}>{t.phone}</label><input id={`inquiry-phone-${kind}`} name="phone" autoComplete="tel" type="tel" inputMode="tel" required minLength={10} maxLength={25} placeholder={t.phonePlaceholder} /></div>
    {!compact && <div className="form-field"><label htmlFor={`inquiry-message-${kind}`}>{t.message}</label><textarea id={`inquiry-message-${kind}`} name="message" maxLength={2000} placeholder={kind === 'valuation' ? t.valuationPlaceholder : t.callbackPlaceholder} /></div>}
    <div className="honeypot" aria-hidden="true"><label>{t.honeypot}<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <label className="checkbox-line"><input type="checkbox" required /><span>{t.consentBefore}<a href={localePath(locale, '/gizlilik')} target="_blank" rel="noreferrer">{t.consentLink}</a>{t.consentAfter}</span></label>
    <button className="button block" disabled={pending || success}>{pending ? t.sending : success ? t.done : submitLabel}</button>
  </form>;
}
