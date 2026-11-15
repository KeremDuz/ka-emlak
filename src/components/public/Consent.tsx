import { useEffect, useRef, useState } from 'react';
import type { CookieBanner } from '../../content/types';
import { CONSENT_OPEN_EVENT, consentChanged, readConsent, saveConsent } from '../../lib/analytics';

interface Props { banner: CookieBanner; title: string; privacyHref: string; privacyLabel: string; }

/** Çerez afişi: tercih yapılana kadar sayfanın altında görünür; "Çerez tercihleri" düğmeleri (data-consent-open) yeniden açar. */
export default function Consent({ banner, title, privacyHref, privacyLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const reopened = useRef(false);

  useEffect(() => {
    const saved = readConsent();
    if (saved) setAnalytics(saved.analytics); else setOpen(true);
    const show = () => { const current = readConsent(); setAnalytics(current?.analytics ?? false); setDetails(true); reopened.current = true; setOpen(true); };
    window.addEventListener(CONSENT_OPEN_EVENT, show);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, show);
  }, []);

  // Kullanıcı isteyerek açtıysa odak afişe gelir; ilk görünüşte sayfanın akışı bozulmaz.
  useEffect(() => { if (open && reopened.current) root.current?.focus(); }, [open]);

  const choose = (value: boolean) => { saveConsent(value); consentChanged(value); setAnalytics(value); setOpen(false); setDetails(false); reopened.current = false; };
  const close = () => { setOpen(false); setDetails(false); reopened.current = false; };

  if (!open) return null;
  return (
    <div className="consent" ref={root} role="dialog" aria-modal="false" aria-labelledby="consent-title" tabIndex={-1}
      onKeyDown={event => { if (event.key === 'Escape' && readConsent()) close(); }}>
      <div className="container consent-inner">
        <p id="consent-title" className="consent-text"><strong className="consent-title">{title}</strong> {banner.text} <a href={privacyHref}>{privacyLabel}</a></p>
        {details && (
          <div className="consent-options">
            <label className="consent-option"><input type="checkbox" checked disabled /><span><strong>{banner.necessaryLabel}</strong><small>{banner.necessaryHelp}</small></span></label>
            <label className="consent-option"><input type="checkbox" checked={analytics} onChange={event => setAnalytics(event.target.checked)} /><span><strong>{banner.analyticsLabel}</strong><small>{banner.analyticsHelp}</small></span></label>
          </div>
        )}
        <div className="consent-actions">
          {details ? <button type="button" className="button sm" onClick={() => choose(analytics)}>{banner.save}</button>
            : <>
              <button type="button" className="button sm" onClick={() => choose(true)}>{banner.accept}</button>
              <button type="button" className="button outline sm" onClick={() => choose(false)}>{banner.reject}</button>
              <button type="button" className="consent-link" aria-expanded={details} onClick={() => setDetails(true)}>{banner.settings}</button>
            </>}
        </div>
      </div>
    </div>
  );
}
