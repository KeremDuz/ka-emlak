import { useRef, useState } from 'react';
import { CheckCircle2, CircleAlert } from 'lucide-react';

export default function InquiryForm({ listingId, kind = 'callback', compact = false, heading: Heading = 'h3' }: { listingId?: string; kind?: 'callback' | 'valuation'; compact?: boolean; heading?: 'h2' | 'h3' }) {
  const started = useRef(Date.now());
  const [pending, setPending] = useState(false), [message, setMessage] = useState(''), [success, setSuccess] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; const data = new FormData(form); setPending(true); setMessage('');
    try {
      const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.get('name'), phone: data.get('phone'), message: data.get('message') || '', website: data.get('website') || '', consent: true, startedAt: started.current, kind, listingId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Talebiniz iletilemedi. Lütfen tekrar deneyin.');
      setSuccess(true); setMessage(result.message || 'Talebiniz bize ulaştı. En kısa sürede sizi arayacağız.'); form.reset();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Talebiniz iletilemedi. Bize telefon veya WhatsApp üzerinden ulaşabilirsiniz.'); }
    finally { setPending(false); }
  }
  const submitLabel = kind === 'valuation' ? 'Talebi gönder' : 'Beni arayın';
  return <form className="inquiry-form" onSubmit={submit}>
    <Heading>{kind === 'valuation' ? 'Mülk değerleme' : 'Sizi arayalım'}</Heading>
    <p>{kind === 'valuation' ? 'Mülkünüzü kısaca yazın, size dönelim.' : 'Numaranızı bırakın, size dönelim.'}</p>
    {message && <div role={success ? 'status' : 'alert'} className={`form-message ${success ? '' : 'error'}`}>{success ? <CheckCircle2 size={19} aria-hidden="true" /> : <CircleAlert size={19} aria-hidden="true" />}<span>{message}</span></div>}
    <div className="form-field"><label htmlFor={`inquiry-name-${kind}`}>Ad soyad</label><input id={`inquiry-name-${kind}`} name="name" autoComplete="name" required minLength={2} maxLength={100} /></div>
    <div className="form-field"><label htmlFor={`inquiry-phone-${kind}`}>Telefon</label><input id={`inquiry-phone-${kind}`} name="phone" autoComplete="tel" type="tel" inputMode="tel" required minLength={10} maxLength={25} placeholder="05xx xxx xx xx" /></div>
    {!compact && <div className="form-field"><label htmlFor={`inquiry-message-${kind}`}>Mesaj (isteğe bağlı)</label><textarea id={`inquiry-message-${kind}`} name="message" maxLength={2000} placeholder={kind === 'valuation' ? 'Mülkünüzün konumu, türü ve metrekaresi' : 'Aradığınız mülk ya da sorunuz'} /></div>}
    <div className="honeypot" aria-hidden="true"><label>Web siteniz<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <label className="checkbox-line"><input type="checkbox" required /><span><a href="/gizlilik" target="_blank" rel="noreferrer">Aydınlatma metnini</a> okudum; talebim için benimle iletişime geçilmesini istiyorum.</span></label>
    <button className="button block" disabled={pending || success}>{pending ? 'Gönderiliyor…' : success ? 'Talebiniz alındı' : submitLabel}</button>
  </form>;
}
