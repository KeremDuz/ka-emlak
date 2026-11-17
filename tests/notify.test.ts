import { describe, expect, it, vi } from 'vitest';
import { inquiryEmail, notifyInquiry } from '../src/lib/server/notify';
import type { Inquiry } from '../src/lib/types';

const inquiry: Inquiry = { id: '1', name: 'Ayşe <b>Yılmaz</b>', phone: '0532 111 22 33', message: '', listingId: 'x', kind: 'callback', locale: 'en', status: 'new', createdAt: '2026-11-17T10:00:00Z' };
const listing = { title: 'Kepez Yeni Emek Satılık 4+1 Daire', slug: 'kepez-4-1-abc' };

describe('new inquiry e-mail', () => {
  it('says who called, which listing and links the panel', () => {
    const mail = inquiryEmail(inquiry, listing, 'https://kaemlak.com');
    expect(mail.subject).toBe('Yeni talep: Ayşe <b>Yılmaz</b> · Kepez Yeni Emek Satılık 4+1 Daire');
    expect(mail.text).toContain('Telefon: 0532 111 22 33');
    expect(mail.text).toContain('https://kaemlak.com/ilan/kepez-4-1-abc');
    expect(mail.text).toContain('Dil: İngilizce');
    expect(mail.html).toContain('href="tel:05321112233"');
    expect(mail.html).not.toContain('<b>Yılmaz');
  });
  it('sends from the site domain to the office address, and never breaks the form', async () => {
    const send = vi.fn(async () => ({ messageId: 'm' }));
    expect(await notifyInquiry({ env: { EMAIL: { send } } }, 'ofis@example.com', inquiry, listing, 'https://kaemlak.com')).toBe(true);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: 'ofis@example.com', from: { email: 'bildirim@kaemlak.com', name: 'KA EMLAK site' } }));
    expect(await notifyInquiry({ env: { EMAIL: { send }, NOTIFY_EMAIL: 'baska@example.com' } }, 'ofis@example.com', inquiry, undefined, 'https://kaemlak.com')).toBe(true);
    expect(send).toHaveBeenLastCalledWith(expect.objectContaining({ to: 'baska@example.com' }));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await notifyInquiry({ env: { EMAIL: { send: async () => { throw new Error('not verified'); } } } }, 'ofis@example.com', inquiry, listing, 'https://kaemlak.com')).toBe(false);
    expect(await notifyInquiry({ env: {} }, 'ofis@example.com', inquiry, listing, 'https://kaemlak.com')).toBe(false);
    expect(await notifyInquiry({ env: { EMAIL: { send } } }, '', inquiry, listing, 'https://kaemlak.com')).toBe(false);
  });
  it('can send through Resend without touching the domain mailbox', async () => {
    const fetcher = vi.fn(async () => Response.json({ id: 'r1' }));
    expect(await notifyInquiry({ env: { RESEND_API_KEY: 're_test' } }, 'ofis@example.com', inquiry, listing, 'https://kaemlak.com', fetcher as never)).toBe(true);
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect(JSON.parse(String(init.body))).toMatchObject({ from: 'KA EMLAK site <bildirim@kaemlak.com>', to: ['ofis@example.com'] });
    expect(await notifyInquiry({ env: { RESEND_API_KEY: 're_test' } }, 'ofis@example.com', inquiry, listing, 'https://kaemlak.com', (async () => new Response('no', { status: 403 })) as never)).toBe(false);
  });
});
