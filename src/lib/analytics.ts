/**
 * Onaya bağlı Google Analytics 4 (tarayıcı tarafı).
 *
 * - Ölçüm kodu (PUBLIC_GA_MEASUREMENT_ID) boşsa hiçbir şey yüklenmez.
 * - Google Tag (gtag.js) YALNIZ analitik onayı verildikten sonra eklenir. Onaydan önce ağ isteği yoktur.
 * - Consent Mode v2: varsayılan "denied"; kabulde "granted" olarak güncellenir; geri çekilince tekrar "denied".
 * - Olaylar: whatsapp_click, phone_click, form_submit, language_switch, listing_view.
 * - Kişisel veri gönderilmez: yalnız aşağıdaki izin listesindeki olay adları ve parametre anahtarları, değerleri de
 *   dar kalıplarla doğrulanarak gider (ad, telefon, mesaj, e-posta hiçbir koşulda geçmez).
 *
 * Başka bileşenlerden olay göndermek (ör. yeni bir form):
 *   window.dispatchEvent(new CustomEvent('ka:track', { detail: { name: 'form_submit', params: { form: 'land', success: true } } }));
 * ya da `track('form_submit', { form: 'land', success: true })`. İzin listesinde olmayan ad ve parametreler sessizce atılır.
 * Bir öğeye `data-ga="whatsapp_click"` (ya da phone_click) koyup `data-ga-placement` ve `data-ga-listing` ile de tıklama ölçülür;
 * `a[href^="tel:"]` ve `a[href*="wa.me"]` bağlantıları ayrıca kendiliğinden ölçülür.
 */

export const CONSENT_KEY = 'ka:consent';
export const CONSENT_OPEN_EVENT = 'ka:consent-open';
export const TRACK_EVENT = 'ka:track';

export interface ConsentChoice { analytics: boolean; at: string; }

export const PLACEMENTS = ['header', 'detail', 'mobile_bar', 'footer', 'advisor'] as const;
export const FORMS = ['callback', 'valuation', 'land', 'renewal'] as const;
export const EVENT_NAMES = ['whatsapp_click', 'phone_click', 'form_submit', 'language_switch', 'listing_view'] as const;
export type EventName = typeof EVENT_NAMES[number];

const SLUG = /^[a-z][a-z0-9_]{0,31}$/;
const LOCALES = new Set(['tr', 'en', 'de', 'ru', 'ar', 'fa']);
/** Her parametre anahtarı için kabul edilen değer. Kalıba uymayan değer ve listede olmayan anahtar atılır. */
const PARAM_RULES: Record<string, (value: unknown) => boolean> = {
  placement: v => typeof v === 'string' && (PLACEMENTS as readonly string[]).includes(v),
  form: v => typeof v === 'string' && (FORMS as readonly string[]).includes(v),
  success: v => typeof v === 'boolean',
  // Uzun rakam dizisi telefon numarasına benzer; ilan kimliği olarak da geçmez.
  listing_id: v => typeof v === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(v) && !/^\+?\d{9,}$/.test(v),
  transaction: v => typeof v === 'string' && SLUG.test(v),
  property_type: v => typeof v === 'string' && SLUG.test(v),
  locale: v => typeof v === 'string' && LOCALES.has(v),
  from: v => typeof v === 'string' && LOCALES.has(v),
  to: v => typeof v === 'string' && LOCALES.has(v),
};

/** İzin listesindeki parametreleri süzer; geri kalan her şey (ad, telefon, mesaj vb.) düşer. */
export function scrubParams(params: unknown): Record<string, string | boolean> {
  const clean: Record<string, string | boolean> = {};
  if (!params || typeof params !== 'object') return clean;
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (Object.prototype.hasOwnProperty.call(PARAM_RULES, key) && PARAM_RULES[key](value)) clean[key] = value as string | boolean;
  }
  return clean;
}

export function isEventName(name: unknown): name is EventName {
  return typeof name === 'string' && (EVENT_NAMES as readonly string[]).includes(name);
}

/** Kaydı okur; bozuk ya da eksik kayıt "seçim yapılmadı" sayılır. */
export function parseConsent(raw: string | null | undefined): ConsentChoice | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<ConsentChoice> | null;
    if (!value || typeof value.analytics !== 'boolean' || typeof value.at !== 'string') return null;
    return { analytics: value.analytics, at: value.at };
  } catch { return null; }
}

export function readConsent(): ConsentChoice | null {
  try { return parseConsent(localStorage.getItem(CONSENT_KEY)); } catch { return null; }
}

export function saveConsent(analytics: boolean, now = new Date()): ConsentChoice {
  const choice: ConsentChoice = { analytics, at: now.toISOString() };
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(choice)); } catch { /* özel pencere: seçim yalnız bu sayfa için geçerli */ }
  return choice;
}

/** Ölçüm kodu geçerli biçimde değilse boş sayılır. */
export function validMeasurementId(id: unknown): string {
  return typeof id === 'string' && /^G-[A-Z0-9]{4,20}$/.test(id.trim()) ? id.trim() : '';
}

type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; [key: string]: unknown };
const win = () => window as unknown as GtagWindow;

let measurementId = '';
let loaded = false;
let granted = false;
let locale = 'tr';

function gtag(...args: unknown[]) {
  const w = win();
  w.dataLayer = w.dataLayer || [];
  // gtag.js "arguments" nesnesini bekler; dizi geçirmek olayları yok sayar.
  (function (..._a: unknown[]) { w.dataLayer!.push(arguments); })(...args);
}

function loadScript() {
  if (loaded || !measurementId) return;
  loaded = true;
  gtag('js', new Date());
  // send_page_view: sayfa görüntülemesi dilli yol ile gider. Tarayıcı IP'sini GA4 zaten saklamaz.
  gtag('config', measurementId, { send_page_view: true, page_path: location.pathname, transport_type: 'beacon' });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

function clearGaCookies() {
  for (const name of document.cookie.split(';').map(part => part.split('=')[0].trim()).filter(name => name === '_ga' || name.startsWith('_ga_') || name === '_gid')) {
    for (const domain of [location.hostname, `.${location.hostname}`]) document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
    document.cookie = `${name}=; Max-Age=0; path=/`;
  }
}

/** Onay durumunu GA'ya uygular. Onay yoksa script hiç eklenmez. */
export function applyConsent(analytics: boolean) {
  if (!measurementId) return;
  granted = analytics;
  const w = win();
  w[`ga-disable-${measurementId}`] = !analytics;
  gtag('consent', 'update', { analytics_storage: analytics ? 'granted' : 'denied' });
  if (analytics) loadScript(); else if (loaded) clearGaCookies();
}

/** Olay gönderir. Onay yoksa ya da ölçüm kodu boşsa hiçbir şey yapmaz. */
export function sendEvent(name: unknown, params?: unknown) {
  if (!measurementId || !granted || !loaded || !isEventName(name)) return;
  gtag('event', name, scrubParams(params));
}

/** Uygulama içinden olay bildirir (onay denetimi sendEvent'te). */
export function track(name: EventName, params?: Record<string, string | boolean>) {
  try { window.dispatchEvent(new CustomEvent(TRACK_EVENT, { detail: { name, params } })); } catch { /* yok say */ }
}

const placementOf = (el: Element): string => {
  const explicit = el.closest('[data-ga-placement]')?.getAttribute('data-ga-placement');
  if (explicit) return explicit;
  if (el.closest('.mobile-contact-bar')) return 'mobile_bar';
  if (el.closest('.site-header-wrap')) return 'header';
  if (el.closest('.site-footer')) return 'footer';
  if (el.closest('.detail-aside')) return 'detail';
  return 'advisor';
};

function clickEvent(target: EventTarget | null): { name: EventName; params: Record<string, string> } | null {
  const el = target instanceof Element ? target.closest('a, [data-ga]') : null;
  if (!el) return null;
  const href = el.getAttribute('href') || '';
  const marked = el.getAttribute('data-ga');
  let name: EventName | null = null;
  if (marked === 'whatsapp_click' || marked === 'phone_click') name = marked;
  else if (!marked && /^tel:/i.test(href)) name = 'phone_click';
  else if (!marked && /wa\.me/i.test(href)) name = 'whatsapp_click';
  if (name) {
    const listing = el.closest('[data-ga-listing]')?.getAttribute('data-ga-listing') || document.body.dataset.listingId || '';
    return { name, params: { placement: placementOf(el), ...(listing ? { listing_id: listing } : {}) } };
  }
  const lang = el.closest('.lang-switch') && el.getAttribute('hreflang');
  if (lang && lang !== locale) return { name: 'language_switch', params: { from: locale, to: lang } };
  return null;
}

let bound = false;
let pendingListing: { id: string; transaction?: string; propertyType?: string } | undefined;

/** Sayfa başına bir kez çağrılır (SiteLayout). Dinleyiciler onaydan bağımsız kurulur; olay göndermek onaya bağlıdır. */
export function initAnalytics(options: { id: string; locale: string; listing?: { id: string; transaction?: string; propertyType?: string } }) {
  measurementId = validMeasurementId(options.id);
  locale = options.locale;
  if (bound) return;
  bound = true;
  document.addEventListener('click', event => { const hit = clickEvent(event.target); if (hit) sendEvent(hit.name, hit.params); }, true);
  window.addEventListener(TRACK_EVENT, event => { const detail = (event as CustomEvent).detail || {}; sendEvent(detail.name, detail.params); });
  document.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('[data-consent-open]')) { event.preventDefault(); window.dispatchEvent(new Event(CONSENT_OPEN_EVENT)); }
  });
  if (!measurementId) return;
  const w = win();
  w.dataLayer = w.dataLayer || [];
  w.gtag = gtag;
  // Varsayılan: hepsi reddedildi. Script yüklenmeden önce tanımlanır.
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 });
  pendingListing = options.listing;
  // Daha önce onay verilmişse tag hemen yüklenir (sayfa ve ilan görüntülemesi gider).
  if (readConsent()?.analytics) consentChanged(true);
}

export function sendListingView(listing: { id: string; transaction?: string; propertyType?: string }) {
  sendEvent('listing_view', { listing_id: listing.id, transaction: listing.transaction, property_type: listing.propertyType, locale });
}

/** Onay sonradan verilirse (afiş), o sayfadaki ilan görüntülemesi de gönderilir. */
export function consentChanged(analytics: boolean) {
  const wasGranted = granted;
  applyConsent(analytics);
  if (analytics && !wasGranted && pendingListing) sendListingView(pendingListing);
}
