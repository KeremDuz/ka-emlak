import type { Inquiry, Listing } from '../types';
import { setting, type ServerLocals } from './env';
import { localeNamesTr } from '../../i18n/config';

/**
 * Yeni talep gelince ofise e-posta bildirimi. Alıcı NOTIFY_EMAIL ya da paneldeki ofis e-postasıdır.
 * Gönderici: RESEND_API_KEY varsa Resend (ücretsiz katman; kaemlak.com'un Türkticaret posta kutusuna dokunmaz),
 * yoksa Cloudflare `send_email` bağlaması `EMAIL`. İkisi de yoksa sessizce atlanır; talep zaten panele kaydedilmiştir.
 */
export interface EmailBinding { send(message: { from: { email: string; name?: string } | string; to: string; subject: string; text: string; html?: string }): Promise<unknown> }

const kinds: Record<Inquiry['kind'], string> = { callback: 'Sizi arayalım', valuation: 'Değerleme', land: 'Arsa / kat karşılığı', renewal: 'Kentsel dönüşüm' };
const languages: Record<string, string> = localeNamesTr;
const escape = (value: string) => value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);
const oneLine = (value: string) => value.replace(/[\r\n]+/g, ' ').trim();

export function inquiryEmail(inquiry: Inquiry, listing: Pick<Listing, 'title' | 'slug'> | undefined, origin: string) {
  const rows: [string, string][] = [
    ['Ad soyad', inquiry.name], ['Telefon', inquiry.phone], ['Talep türü', kinds[inquiry.kind]],
    ...(listing ? [['İlan', `${listing.title}\n${origin}/ilan/${listing.slug}`] as [string, string]] : []),
    ...Object.entries(inquiry.details ?? {}),
    ...(inquiry.message ? [['Mesaj', inquiry.message] as [string, string]] : []),
    ...(inquiry.locale && inquiry.locale !== 'tr' ? [['Dil', languages[inquiry.locale]] as [string, string]] : []),
  ];
  const subject = oneLine(`Yeni talep: ${inquiry.name}${listing ? ` · ${listing.title}` : ''}`).slice(0, 180);
  const text = `${rows.map(([key, value]) => `${key}: ${value}`).join('\n')}\n\nBütün talepler: ${origin}/yonetim`;
  const tel = inquiry.phone.replace(/[^\d+]/g, '');
  const html = `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#1d2a24">
<p style="margin:0 0 12px">Sitenizden yeni bir talep geldi.</p>
<table style="border-collapse:collapse">${rows.map(([key, value]) => `<tr><td style="padding:4px 16px 4px 0;color:#5c6860;vertical-align:top">${escape(key)}</td><td style="padding:4px 0">${key === 'Telefon' ? `<a href="tel:${escape(tel)}">${escape(value)}</a>` : escape(value).replace(/\n/g, '<br>')}</td></tr>`).join('')}</table>
<p style="margin:16px 0 0"><a href="${escape(origin)}/yonetim">Panelde bütün talepleri görün</a></p></div>`;
  return { subject, text, html };
}

export function emailBinding(locals: ServerLocals, fetcher: typeof fetch = fetch): EmailBinding | null {
  const key = setting(locals, 'RESEND_API_KEY');
  if (key) return { async send(message) {
    const from = typeof message.from === 'string' ? message.from : `${message.from.name ?? ''} <${message.from.email}>`.trim();
    const response = await fetcher('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [message.to], subject: message.subject, text: message.text, html: message.html }) });
    if (!response.ok) throw new Error(`resend ${response.status}`);
    return response.json();
  } };
  const binding = locals.env?.EMAIL as EmailBinding | undefined;
  return binding && typeof binding.send === 'function' ? binding : null;
}

/** Bildirimi gönderir; hata ya da 8 sn'yi aşan bekleme ziyaretçinin formunu bozmaz. */
export async function notifyInquiry(locals: ServerLocals, officeEmail: string, inquiry: Inquiry, listing: Pick<Listing, 'title' | 'slug'> | undefined, origin: string, fetcher: typeof fetch = fetch) {
  const binding = emailBinding(locals, fetcher), to = setting(locals, 'NOTIFY_EMAIL') || officeEmail.trim();
  if (!binding || !to) return false;
  const host = new URL(origin).hostname;
  const message = { from: { email: setting(locals, 'NOTIFY_FROM') || `bildirim@${host}`, name: 'KA EMLAK site' }, to, ...inquiryEmail(inquiry, listing, origin) };
  try {
    await Promise.race([binding.send(message), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))]);
    return true;
  } catch (error) {
    console.error('inquiry_email_failed', error instanceof Error ? error.message : 'unknown');
    return false;
  }
}
