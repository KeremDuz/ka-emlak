import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpFromLine, Building2, Check, CheckCheck, ChevronLeft, ChevronRight, CircleAlert, CloudCheck, Copy, Ellipsis, ExternalLink, Eye, EyeOff, FolderArchive, Home, ImagePlus, Languages, LayoutGrid, LoaderCircle, LogOut, Mail, MapPin, MessageSquare, Pencil, Phone, Plus, RefreshCw, Save, Search, Settings2, ShieldCheck, Smartphone, Sparkles, Star, Trash2, Upload, WifiOff, X } from 'lucide-react';
import type { AdminListing, ClientConfig, Inquiry, Listing, ListingStatus, OfficeSettings, Photo, PropertyType } from '../../lib/types';
import { dateLabel, isSeasonal, periodLabels, poolLabels, priceLabel, propertyLabels, transactionLabels, whatsappUrl } from '../../lib/format';
import { adminApi, ApiError, downloadJson, errorMessage, setTokenProvider, type ListingAction, type StorageUsage } from '../../lib/client/api';
import { authError, createAuth, type AuthController } from '../../lib/client/auth';
import { preparePhoto } from '../../lib/client/photos';
import { clearRecovery, readRecovery, writeRecovery, type Recovery } from '../../lib/client/recovery';
import { antalyaDistricts, roomsRequired, formatPriceInput, parsePrice, roomOptions, suggestDescription, suggestTitle } from '../../lib/listing-helpers';
import { isSourceListing, likelySame, mapSource, sameSource, sourceLabels, sourcePhotos, type SourceListing } from '../../lib/source-mapper';
import { bookmarklet } from '../../lib/bookmarklet';
import { decodeSyncHash, isSyncPayload, planSync, type SyncField, type SyncPayload } from '../../lib/source-sync';
import { pendingLocales } from '../../lib/server/translation-source';
import TranslationsField, { notConfiguredText } from './Translations';
import './admin.css';
const LocationPicker = lazy(() => import('./LocationPicker'));

const statusLabels: Record<ListingStatus, string> = { draft: 'Taslak', published: 'Yayında', sold: 'Satıldı', rented: 'Kiralandı', archived: 'Yayında değil', trash: 'Çöp kutusu' };
const emptySettings: OfficeSettings = { name: '', advisor: '', phone: '', whatsapp: '', email: '', address: '', hours: '', about: '', heroImage: '', instagram: '', licenseNumber: '' };
const featureOptions = ['Balkon', 'Asansör', 'Otopark', 'Havuz', 'Bahçe', 'Deniz manzarası', 'Eşyalı', 'Klima', 'Güvenlik', 'Site içerisinde', 'Doğalgaz', 'Ankastre mutfak'];
type Tab = 'listings' | 'inquiries' | 'settings';
type Notice = { text: string; kind: 'success' | 'error' | 'info'; action?: { label: string; run: () => void } };
const bytesLabel = (bytes: number) => `${(Math.max(0, bytes) / 1024 / 1024).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} MB`;
const editData = (record: AdminListing): Listing => {
  const { draft, ...listing } = record;
  return { ...(draft || listing), version: record.version };
};
/** Açılıp hiçbir bilgi girilmeden bırakılan taslak; otomatik başlık bilgi sayılmaz. */
const isEmptyDraft = (record: AdminListing) => {
  const data = editData(record);
  return record.status === 'draft' && !data.photos.length && !data.district.trim() && !data.neighborhood.trim() && !data.grossArea && !data.price && !data.description.trim() && (!data.title.trim() || data.title === suggestTitle(data));
};

function Spinner({ label = 'Yükleniyor' }: { label?: string }) { return <span className="ad-loading"><LoaderCircle className="ad-spin" size={18} aria-hidden="true" />{label}</span>; }
function Status({ status }: { status: ListingStatus }) { return <span className={`ad-status ad-status-${status}`}><span />{statusLabels[status]}</span>; }
function Modal({ open, onClose, title, description, children, wide = false }: { open: boolean; onClose: () => void; title: string; description: string; children: ReactNode; wide?: boolean }) {
  return <Dialog.Root open={open} onOpenChange={value => { if (!value) onClose(); }}><Dialog.Portal><Dialog.Overlay className="ad-dialog-overlay" /><Dialog.Content className={`ad-dialog ${wide ? 'ad-dialog-wide' : ''}`}><div className="ad-dialog-heading"><div><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{description}</Dialog.Description></div><Dialog.Close asChild><button className="ad-icon-button" aria-label="Pencereyi kapat"><X size={20} /></button></Dialog.Close></div>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
function InputField({ name, label, value, onChange, type = 'text', required, error, hint, multiline, ...rest }: { name: string; label: string; value: string | number | null; onChange: (value: string) => void; type?: string; required?: boolean; error?: string; hint?: string; multiline?: boolean; placeholder?: string; min?: number; maxLength?: number; autoComplete?: string; list?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']; disabled?: boolean; onBlur?: () => void }) {
  const shared = { id: name, name, value: value ?? '', required, onBlur: rest.onBlur, 'aria-invalid': !!error, 'aria-describedby': error ? `${name}-error` : hint ? `${name}-hint` : undefined, placeholder: rest.placeholder, maxLength: rest.maxLength, disabled: rest.disabled, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value) };
  return <div className={`ad-field ${error ? 'ad-field-invalid' : ''}`}><label htmlFor={name}>{label}{required && <span aria-hidden="true"> *</span>}</label>{multiline ? <textarea {...shared} rows={5} /> : <input {...shared} type={type} min={rest.min} autoComplete={rest.autoComplete} list={rest.list} inputMode={rest.inputMode} />}{hint && !error && <small id={`${name}-hint`}>{hint}</small>}{error && <small className="ad-field-error" id={`${name}-error`}>{error}</small>}</div>;
}
function ChoiceField({ name, label, value, onChange, options, required, error }: { name: string; label: string; value: string; onChange: (value: string) => void; options: Record<string, string>; required?: boolean; error?: string }) {
  return <fieldset id={name} tabIndex={-1} className={`ad-field ad-choice ${error ? 'ad-field-invalid' : ''}`} aria-invalid={!!error} aria-describedby={error ? `${name}-error` : undefined}><legend>{label}{required && <span aria-hidden="true"> *</span>}</legend><div className="ad-choice-options">{Object.entries(options).map(([key, text]) => <label key={key} className={`ad-choice-option ${value === key ? 'selected' : ''}`}><input type="radio" name={name} value={key} checked={value === key} onChange={() => onChange(key)} />{text}</label>)}</div>{error && <small className="ad-field-error" id={`${name}-error`}>{error}</small>}</fieldset>;
}
function SelectField({ name, label, value, onChange, options, required, error }: { name: string; label: string; value: string; onChange: (value: string) => void; options: Record<string, string>; required?: boolean; error?: string }) {
  return <div className={`ad-field ${error ? 'ad-field-invalid' : ''}`}><label htmlFor={name}>{label}{required && <span aria-hidden="true"> *</span>}</label><select id={name} value={value} onChange={e => onChange(e.target.value)} required={required} aria-invalid={!!error} aria-describedby={error ? `${name}-error` : undefined}>{Object.entries(options).map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select>{error && <small className="ad-field-error" id={`${name}-error`}>{error}</small>}</div>;
}

export default function AdminApp() {
  const [config, setConfig] = useState<ClientConfig | null>(null);
  const [bootError, setBootError] = useState('');
  const [session, setSession] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const auth = useRef<AuthController | null>(null);
  const [email, setEmail] = useState('');
  const [tab, setTab] = useState<Tab>('listings');
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [settings, setSettings] = useState<OfficeSettings>(emptySettings);
  const [storage, setStorage] = useState<StorageUsage | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState('');
  const [editor, setEditor] = useState<AdminListing | null>(null);
  const [quickPrice, setQuickPrice] = useState<AdminListing | null>(null);
  const [confirm, setConfirm] = useState<{ item: AdminListing; permanent: boolean } | null>(null);
  const [starter, setStarter] = useState(false);
  const [checkEditor, setCheckEditor] = useState(false);
  const [unpublishing, setUnpublishing] = useState<AdminListing | null>(null);
  // Kontrol bekleyen taslakları sırayla açma: görülenler tekrar açılmaz.
  const [queue, setQueue] = useState(false); const reviewed = useRef(new Set<string>());
  const [editorStep, setEditorStep] = useState(0);
  // "KA Emlak'a ekle" yer imi ilanı adresin #aktar= kısmında getirir; giriş yapılınca aktarma penceresi açılır.
  const [sourcePayload, setSourcePayload] = useState<SourceListing | null>(null);
  const [recovery, setRecovery] = useState(false);
  // Yer imine hepsiemlak ofis sayfasında tıklanınca bütün ilanlar #esitle= ile gelir.
  const [syncPayload, setSyncPayload] = useState<SyncPayload | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false); const [bulk, setBulk] = useState<{ total: number; done: number } | null>(null);
  const [confirmTranslate, setConfirmTranslate] = useState(false); const [translating, setTranslating] = useState<{ total: number; done: number } | null>(null);
  const [importData, setImportData] = useState<unknown>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const [online, setOnline] = useState(true);
  const notify = useCallback((text: string, kind: Notice['kind'] = 'success') => setNotice({ text, kind }), []);
  const listingsRef = useRef(listings); listingsRef.current = listings;
  const upsert = useCallback((item: AdminListing) => setListings(items => [item, ...items.filter(previous => previous.id !== item.id)]), []);
  const navigate = (target: Tab) => { if (editor) { notify('Önce düzenleyicideki “İlanlara dön” düğmesiyle taslağınızı kaydedin.', 'info'); return; } setTab(target); };

  useEffect(() => {
    let active = true; let unsubscribe: (() => void) | undefined;
    adminApi.config().then(async result => {
      if (!active) return; setConfig(result);
      if (result.mode === 'preview') { setAuthLoading(false); return; }
      if (!result.auth) throw new Error('Giriş hizmeti henüz yapılandırılmamış. Kurulum ayarlarını kontrol edin.');
      const controller = await createAuth(result.auth);
      if (!active) return; auth.current = controller;
      unsubscribe = controller.subscribe((user, recovering) => {
        if (!active) return;
        if (recovering) setRecovery(true);
        setTokenProvider(user ? user.token : null);
        // Giriş ve her anahtar yenilemesinde çerez de yenilenir; başarısız olursa panel yine çalışır, yalnız taslak fotoğrafları görünmez.
        if (user) void adminApi.session(user.current).catch(() => undefined);
        setEmail(user?.email || ''); setSession(!!user); setAuthLoading(false);
      });
    }).catch(error => { if (active) { setBootError(errorMessage(error)); setAuthLoading(false); } });
    return () => { active = false; unsubscribe?.(); setTokenProvider(null); };
  }, []);
  useEffect(() => { setOnline(navigator.onLine); const update = () => setOnline(navigator.onLine); window.addEventListener('online', update); window.addEventListener('offline', update); return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); }; }, []);
  // Fare bildirimin üzerindeyken ya da odak içindeyken süre durur; 'Geri al' düğmesine yetişmek için acele etmek gerekmez.
  const [noticeHeld, setNoticeHeld] = useState(false);
  useEffect(() => { if (!notice || notice.kind === 'error' || noticeHeld) return; const timer = setTimeout(() => setNotice(null), notice.action ? 9000 : 6000); return () => clearTimeout(timer); }, [notice, noticeHeld]);
  useEffect(() => { if (!notice) setNoticeHeld(false); }, [notice]);

  const load = useCallback(async () => {
    setDataLoading(true); setDataError('');
    const results = await Promise.allSettled([adminApi.listings(), adminApi.inquiries(), adminApi.settings(), adminApi.storage()]);
    if (results[0].status === 'fulfilled') setListings(results[0].value.listings); else setDataError(errorMessage(results[0].reason));
    if (results[1].status === 'fulfilled') setInquiries(results[1].value.inquiries);
    if (results[2].status === 'fulfilled') setSettings(results[2].value.settings);
    if (results[3].status === 'fulfilled') setStorage(results[3].value);
    const failed = results.find(result => result.status === 'rejected');
    if (failed?.status === 'rejected' && results[0].status === 'fulfilled') setDataError(errorMessage(failed.reason));
    setDataLoading(false);
  }, []);
  useEffect(() => { if (session) void load(); }, [session, load]);
  // Yer imi paneli hep aynı sekmede açar; panel zaten açıksa yalnız adresin # kısmı değişir, sayfa yenilenmez.
  const [hashTick, setHashTick] = useState(0);
  useEffect(() => { const onHash = () => setHashTick(tick => tick + 1); window.addEventListener('hashchange', onHash); return () => window.removeEventListener('hashchange', onHash); }, []);
  useEffect(() => {
    if (!session || !location.hash.startsWith('#esitle=')) return;
    const hash = location.hash.slice(8);
    history.replaceState(null, '', location.pathname);
    decodeSyncHash(hash).then(payload => {
      if (isSyncPayload(payload)) setSyncPayload(payload);
      else throw new Error('invalid');
    }).catch(() => notify('Portaldaki ilanlar okunamadı. Yer imine hepsiemlak ofis sayfanızda ya da sahibinden mağaza listenizde yeniden tıklayın.', 'error'));
  }, [session, notify, hashTick]);
  useEffect(() => {
    if (!session || !location.hash.startsWith('#aktar=')) return;
    let payload: unknown = null;
    try { payload = JSON.parse(decodeURIComponent(location.hash.slice(7))); } catch { /* aşağıda bildirilir */ }
    if (isSourceListing(payload)) setSourcePayload(payload);
    else notify('İlan okunamadı. Yer imine hepsiemlak ya da sahibinden’de ilanın kendi sayfasındayken tıklayın.', 'error');
    history.replaceState(null, '', location.pathname);
  }, [session, notify, hashTick]);
  const performAction = async (item: AdminListing, action: ListingAction, price?: number | null) => {
    setBusy(item.id);
    try {
      const result = await adminApi.action(item, action, price); upsert(result.listing);
      const messages: Partial<Record<ListingAction, string>> = { duplicate: 'İlanın kopyası taslak olarak oluşturuldu.', trash: 'İlan çöp kutusuna taşındı.', price: 'Fiyat güncellendi.', publish: isClosed(item.status) ? 'İlan yeniden yayında.' : 'İlan yayında.', sold: 'İlan satıldı olarak işaretlendi ve siteden kalktı.', rented: 'İlan kiralandı olarak işaretlendi ve siteden kalktı.', archive: 'İlan siteden kaldırıldı.', restore: 'İlan geri alındı ve taslaklara eklendi.', feature: result.listing.featured ? 'İlan ana sayfada öne çıkarıldı.' : 'İlan ana sayfadan kaldırıldı.' };
      // Yayından kaldırma ve çöp kutusu yanlışlıkla yapılabilir; bildirimdeki “Geri al” ilanı önceki durumuna döndürür.
      const reversible = ['sold', 'rented', 'archive', 'trash'].includes(action);
      setNotice({ text: messages[action] ?? 'İlan güncellendi.', kind: 'success', ...(reversible ? { action: { label: 'Geri al', run: () => void undo(item, result.listing) } } : {}) });
      if (action === 'duplicate') setEditor(result.listing);
      return true;
    } catch (error) {
      notify(errorMessage(error), 'error');
      // Eksik bilgiyle yayınlanamayan taslak doğrudan düzenleyicide açılır; eksikler orada görünür.
      if (action === 'publish' && error instanceof ApiError && error.status < 500) { setCheckEditor(true); setEditor(item); }
      return false;
    } finally { setBusy(''); }
  };
  const undo = async (before: AdminListing, after: AdminListing) => {
    setNotice(null); setBusy(after.id);
    let current = after;
    try {
      if (current.status === 'trash') { current = (await adminApi.action(current, 'restore')).listing; upsert(current); }
      if (before.status === 'published') current = (await adminApi.action(current, 'publish')).listing;
      upsert(current); notify(before.status === 'published' ? 'Geri alındı; ilan yeniden yayında.' : 'Geri alındı.');
    } catch (error) {
      notify(errorMessage(error), 'error');
      // Yeniden yayın için eksik varsa ilan düzenleyicide eksik adımda açılır.
      if (error instanceof ApiError && error.status < 500) { setCheckEditor(true); setEditor(current); }
    } finally { setBusy(''); }
  };
  const openNextReview = () => {
    const next = listingsRef.current.filter(item => needsReviewDraft(item) && !reviewed.current.has(item.id)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    if (!next) { setQueue(false); setEditor(null); notify('Kontrol bekleyen ilan kalmadı. Tebrikler!'); return; }
    reviewed.current.add(next.id); setQueue(true); setCheckEditor(false); setEditorStep(2); setEditor(next);
  };
  const startReview = () => { reviewed.current.clear(); openNextReview(); };
  // Kontrol bekleyen taslakların hepsini sırayla yayınlar; yayınlanamayanlar taslakta kalır ve adları bildirilir.
  const publishAll = async () => {
    const items = listingsRef.current.filter(needsReviewDraft); const failed: string[] = [];
    setBulk({ total: items.length, done: 0 });
    for (const [index, item] of items.entries()) {
      try {
        const saved = (await adminApi.save(item.id, { ...editData(item), needsReview: false }, item.version)).listing;
        upsert((await adminApi.action(saved, 'publish')).listing);
      } catch { failed.push(editData(item).title || 'Başlıksız ilan'); }
      setBulk({ total: items.length, done: index + 1 });
    }
    setBulk(null); setConfirmBulk(false);
    const published = items.length - failed.length;
    notify(failed.length ? `${published} ilan yayınlandı. ${failed.length} ilan eksik bilgi nedeniyle taslakta kaldı: ${failed.join(', ')}.` : `${published} ilan yayınlandı.`, failed.length ? 'info' : 'success');
  };
  // Yayındaki ilanların eksik çevirileri: her istekte tek ilan çevrilir ki Worker sınırları aşılmasın.
  const translateAll = async () => {
    const items = listingsRef.current.filter(needsTranslation); let done = 0, failed = 0, unavailable = false;
    setTranslating({ total: items.length, done: 0 });
    for (const [index, item] of items.entries()) {
      try {
        const result = await adminApi.translate(item); upsert(result.listing);
        if (result.status === 'not_configured') { unavailable = true; break; }
        if (result.status === 'ok' || result.status === 'fresh') done++; else failed++;
      } catch { failed++; }
      setTranslating({ total: items.length, done: index + 1 });
    }
    setTranslating(null); setConfirmTranslate(false);
    if (unavailable) notify(notConfiguredText, 'info');
    else notify(failed ? `${done} ilan çevrildi. ${failed} ilan çevrilemedi; biraz sonra yeniden deneyin. İlanlarınız Türkçe olarak yayında.` : `${done} ilanın çevirisi tamamlandı.`, failed ? 'info' : 'success');
  };
  const createListing = async () => {
    setBusy('new');
    try { const result = await adminApi.create(); upsert(result.listing); setEditor(result.listing); setStarter(false); } catch (error) { notify(errorMessage(error), 'error'); } finally { setBusy(''); }
  };
  const discardEmptyDraft = async (id: string) => {
    const current = listingsRef.current.find(item => item.id === id);
    if (!current || !isEmptyDraft(current)) return;
    try { const trashed = (await adminApi.action(current, 'trash')).listing; await adminApi.remove(trashed); setListings(items => items.filter(item => item.id !== id)); clearRecovery(id); }
    catch { /* Silinemezse taslak listede kalır; kullanıcı elle kaldırabilir. */ }
  };
  const startFrom = async (source: AdminListing) => {
    setBusy('new');
    try {
      const copy = (await adminApi.action(source, 'duplicate')).listing;
      // Benzer ilandan yalnız bilgiler alınır; fotoğraflar başka taşınmaza ait olduğu için boş başlar.
      const data = { ...editData(copy), photos: [] }; data.title = suggestTitle(data);
      const saved = (await adminApi.save(copy.id, data, copy.version)).listing;
      upsert(saved); setEditor(saved); setStarter(false);
    } catch (error) { notify(errorMessage(error), 'error'); } finally { setBusy(''); }
  };
  const logout = async () => {
    setBusy('logout');
    try { if (config?.mode === 'live') await auth.current?.logout(); await adminApi.logout(); setSession(false); setListings([]); setInquiries([]); setSettings(emptySettings); } catch (error) { notify(errorMessage(error), 'error'); } finally { setBusy(''); }
  };
  const exportBackup = async () => {
    setBusy('export');
    try { downloadJson(await adminApi.export(), `ka-emlak-yedek-${new Date().toISOString().slice(0, 10)}.json`); notify('Veri yedeği indirildi. Fotoğraf dosyalarını ayrıca yedekleyin.', 'info'); } catch (error) { notify(errorMessage(error), 'error'); } finally { setBusy(''); }
  };
  const selectImport = async (file?: File) => {
    if (!file) return;
    try { if (file.size > 10 * 1024 * 1024) throw new Error('Yedek dosyası en fazla 10 MB olabilir.'); const data = JSON.parse(await file.text()); if (!Array.isArray(data.listings)) throw new Error('Dosyada geçerli bir ilan listesi bulunamadı.'); setImportData(data); } catch (error) { notify(errorMessage(error), 'error'); }
    if (importInput.current) importInput.current.value = '';
  };

  if (authLoading) return <div className="ad-root ad-center"><div className="ad-login-brand">KA<span>EMLAK</span></div><Spinner label="Yönetim paneli hazırlanıyor" /></div>;
  if (!session) return <MotionConfig reducedMotion="user"><Login config={config} bootError={bootError} auth={auth.current} onSession={() => setSession(true)} /></MotionConfig>;
  const newInquiries = inquiries.filter(item => item.status === 'new').length;
  return <MotionConfig reducedMotion="user"><div className="ad-root">
    <a className="ad-skip" href="#admin-main">İçeriğe geç</a>
    <aside className="ad-sidebar"><a className="ad-brand" href="/" aria-label="KA Emlak ana sayfa">KA<span>EMLAK<small>PORTFÖY YÖNETİMİ</small></span></a><div className="ad-sidebar-line" /><span className="ad-sidebar-label">ÇALIŞMA ALANIM</span><nav aria-label="Yönetim menüsü">{([{ id: 'listings', label: 'İlanlar', Icon: LayoutGrid }, { id: 'inquiries', label: 'Talepler', Icon: MessageSquare }, { id: 'settings', label: 'Ofis bilgileri', Icon: Settings2 }] as const).map(({ id, label, Icon }) => <button key={id} className={`ad-nav-item ${tab === id ? 'active' : ''}`} onClick={() => navigate(id)} aria-current={tab === id ? 'page' : undefined}><Icon size={20} /><span>{label}</span>{id === 'inquiries' && newInquiries > 0 && <b>{newInquiries}</b>}</button>)}</nav><div className="ad-sidebar-bottom"><a className="ad-nav-item" href="/" target="_blank" rel="noreferrer"><ExternalLink size={19} /><span>Siteyi görüntüle</span></a><div className="ad-account"><div className="ad-avatar">KA</div><div><strong>{settings.advisor || 'Yönetici'}</strong><small>{config?.mode === 'preview' ? 'Yerel önizleme' : email}</small></div><button className="ad-icon-button" onClick={logout} disabled={!!busy} aria-label="Güvenli çıkış"><LogOut size={18} /></button></div></div></aside>
    <div className="ad-workspace"><header className="ad-topbar"><div className="ad-mobile-brand">KA <span>EMLAK</span></div><span className="ad-topbar-path">Çalışma alanı <ChevronRight size={13} /> {tab === 'listings' ? 'İlanlar' : tab === 'inquiries' ? 'Talepler' : 'Ofis bilgileri'}</span><div className="ad-topbar-right"><span className="ad-security"><ShieldCheck size={15} />{config?.mode === 'preview' ? 'Yerel önizleme' : 'Güvenli yönetim'}</span><a href="/" target="_blank" rel="noreferrer" className="ad-button ad-button-small ad-button-ghost"><ExternalLink size={15} />Siteyi aç</a><button className="ad-icon-button ad-mobile-logout" aria-label="Çıkış yap" onClick={logout}><LogOut size={18} /></button></div></header>
      <nav className="ad-mobile-nav" aria-label="Mobil yönetim menüsü"><button className={tab === 'listings' ? 'active' : ''} onClick={() => navigate('listings')}><LayoutGrid size={18} />İlanlar</button><button className={tab === 'inquiries' ? 'active' : ''} onClick={() => navigate('inquiries')}><MessageSquare size={18} />Talepler{newInquiries > 0 && <b>{newInquiries}</b>}</button><button className={tab === 'settings' ? 'active' : ''} onClick={() => navigate('settings')}><Settings2 size={18} />Ofis</button></nav>
      {config?.mode === 'preview' && <div className="ad-preview-notice"><Eye size={17} /><span><strong>Yerel önizleme.</strong> Bu oturum yalnızca bu cihazdaki geliştirme ortamına aittir. Gerçek müşteri bilgileri girmeyin.</span></div>}
      {!online && <div className="ad-banner ad-banner-warning" role="status"><WifiOff size={18} />Bağlantınız kesildi. Düzenleyicideki metin değişiklikleri cihazda korunur; fotoğrafları bağlantı gelince tekrar yükleyin.</div>}
      <main id="admin-main" className={`ad-main ${editor ? 'ad-main-editor' : ''}`}>
        {dataError && <div className="ad-banner ad-banner-error" role="alert"><CircleAlert size={19} /><span>{dataError}</span><button className="ad-text-button" onClick={load}>Yeniden dene</button></div>}
        {dataLoading && listings.length === 0 ? <div className="ad-loading-panel"><Spinner label="Portföyünüz yükleniyor" /></div> : editor ? <ListingEditor key={editor.id} initial={editor} storage={storage} places={listings.map(editData)} checkOnOpen={checkEditor} startStep={editorStep} queue={queue ? { position: reviewed.current.size, total: reviewed.current.size + listings.filter(item => needsReviewDraft(item) && !reviewed.current.has(item.id)).length } : undefined} onSaved={upsert} onClose={reason => { const id = editor.id; setEditor(null); setCheckEditor(false); setEditorStep(0); void discardEmptyDraft(id); void adminApi.storage().then(setStorage).catch(() => {}); if (queue && reason) openNextReview(); else setQueue(false); }} notify={notify} /> : tab === 'listings' ? <ListingsPanel listings={listings} inquiries={newInquiries} busy={busy} storage={storage} onNew={() => listings.some(item => item.status !== 'trash') ? setStarter(true) : void createListing()} onEdit={item => { setEditorStep(0); setEditor(item); }} onReview={item => { setEditorStep(2); setEditor(item); }} onStartReview={startReview} onPublishAll={() => setConfirmBulk(true)} onTranslate={() => setConfirmTranslate(true)} onAction={performAction} onUnpublish={setUnpublishing} onInquiries={() => navigate('inquiries')} onPrice={setQuickPrice} onDelete={item => setConfirm({ item, permanent: item.status === 'trash' })} onExport={exportBackup} onImport={() => importInput.current?.click()} onRefresh={load} /> : tab === 'inquiries' ? <InquiriesPanel inquiries={inquiries} listings={listings} notify={notify} onUpdated={(id, status) => setInquiries(items => items.map(item => item.id === id ? { ...item, status } : item))} /> : <SettingsPanel initial={settings} onSaved={setSettings} notify={notify} storage={storage} />}
      </main><footer className="ad-footer"><span>KA EMLAK · Portföy yönetimi</span><span>İyi bir portföy, özenle başlar.</span></footer>
    </div>
    <AnimatePresence>{notice && <motion.div key="notice" className={`ad-toast ad-toast-${notice.kind}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} role={notice.kind === 'error' ? 'alert' : 'status'} onMouseEnter={() => setNoticeHeld(true)} onMouseLeave={() => setNoticeHeld(false)} onFocus={() => setNoticeHeld(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setNoticeHeld(false); }}>{notice.kind === 'success' ? <CheckCheck size={20} /> : <CircleAlert size={20} />}<span>{notice.text}</span>{notice.action && <button className="ad-toast-action" onClick={notice.action.run}>{notice.action.label}</button>}<button className="ad-icon-button" aria-label="Bildirimi kapat" onClick={() => setNotice(null)}><X size={16} /></button></motion.div>}</AnimatePresence>
    <input ref={importInput} type="file" accept="application/json,.json" hidden onChange={e => selectImport(e.target.files?.[0])} />
    <Modal open={starter} onClose={() => { if (!busy) setStarter(false); }} title="Yeni ilan" description="Boş bir ilanla başlayın ya da benzer bir ilanın bilgilerini kopyalayın." wide><div className="ad-starter"><button className="ad-starter-blank" disabled={!!busy} onClick={() => void createListing()}><span className="ad-upload-icon"><Plus size={24} /></span><strong>Boş ilanla başla</strong><small>Fotoğraflarla başlayıp bilgileri adım adım doldurun.</small></button><div className="ad-starter-copy"><strong><Copy size={16} />Benzer bir ilandan başla</strong><small>Tür, konum, alan, fiyat ve özellikler kopyalanır. Fotoğrafları yeni ilana eklersiniz.</small><div className="ad-starter-list">{listings.filter(item => item.status !== 'trash' && !isEmptyDraft(item)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8).map(item => { const data = editData(item); return <button key={item.id} disabled={!!busy} onClick={() => void startFrom(item)}>{data.photos[0] ? <img src={data.photos[0].thumbnail || data.photos[0].url} alt="" width="64" height="48" loading="lazy" /> : <span className="ad-starter-noimage"><ImagePlus size={18} /></span>}<span><strong>{data.title || 'Başlıksız ilan'}</strong><small>{transactionLabels[data.transaction]} · {propertyLabels[data.propertyType]}{data.rooms ? ` · ${data.rooms}` : ''} · {[data.neighborhood, data.district].filter(Boolean).join(', ') || 'Konum yok'}</small></span><ArrowRight size={16} /></button>; })}</div></div></div>{busy === 'new' && <div className="ad-starter-busy"><Spinner label="İlan hazırlanıyor" /></div>}</Modal>
    {recovery && <PasswordDialog auth={auth.current} notify={notify} onClose={() => setRecovery(false)} />}
    {sourcePayload && <SourceImportDialog payload={sourcePayload} listings={listings} notify={notify} onClose={() => setSourcePayload(null)} onDone={(listing, result) => {
      upsert(listing); setSourcePayload(null);
      const photoNote = result.failedPhotos ? ` ${result.failedPhotos} fotoğraf alınamadı.` : '';
      if (result.published) setNotice({ text: `${result.created ? 'İlan siteye eklendi ve yayında.' : 'İlan güncellendi.'}${photoNote}`, kind: 'success', action: { label: 'Sitede gör', run: () => window.open(`/ilan/${listing.slug}`, '_blank') } });
      else if (result.error) { notify(`İlan taslak olarak eklendi; yayınlamak için eksik bilgi var: ${result.error}`, 'info'); setCheckEditor(true); setEditor(listing); }
      else notify(`İlan taslak olarak eklendi.${photoNote}`);
    }} />}
    {/* Portföy yüklenmeden karşılaştırılırsa her ilan "yeni" görünür; yükleme bitmeden ya da hatalıyken açılmaz. */}
    {syncPayload && !dataLoading && !dataError && <SyncDialog payload={syncPayload} listings={listings} onClose={() => setSyncPayload(null)} onDone={(changed, summary) => {
      changed.forEach(upsert); setSyncPayload(null);
      notify(summary, summary.includes('yapılamadı') ? 'info' : 'success');
    }} />}
    <Modal open={confirmBulk} onClose={() => { if (!bulk) setConfirmBulk(false); }} title="Hepsini yayınla" description="Kontrol bekleyen ilanların hepsi sitede yayına alınır. Bilgiler hepsiemlak’taki ilanlarınızdan alındı; yayındaki bir ilanı istediğiniz zaman düzenleyebilir ya da yayından kaldırabilirsiniz.">{bulk ? <div className="ad-bulk-progress" role="status"><Spinner label={`${bulk.done} / ${bulk.total} ilan yayınlandı`} /><progress value={bulk.done} max={bulk.total} aria-label="Yayınlama ilerlemesi" /></div> : <p className="ad-confirm-item">{listings.filter(needsReviewDraft).length} ilan yayınlanacak</p>}<div className="ad-dialog-actions"><button className="ad-button ad-button-secondary" disabled={!!bulk} onClick={() => setConfirmBulk(false)}>Vazgeç</button><button className="ad-button" disabled={!!bulk} onClick={() => void publishAll()}><CheckCheck size={17} />Hepsini yayınla</button></div></Modal>
    <Modal open={confirmTranslate} onClose={() => { if (!translating) setConfirmTranslate(false); }} title="Eksik çevirileri tamamla" description="Yayındaki ilanların İngilizce ve Farsça çevirisi hazırlanır. Elle düzelttiğiniz çevirilere dokunulmaz; ilanlarınız bu sırada yayında kalır.">{translating ? <div className="ad-bulk-progress" role="status"><Spinner label={`${translating.done} / ${translating.total} ilan çevrildi`} /><progress value={translating.done} max={translating.total} aria-label="Çeviri ilerlemesi" /></div> : <p className="ad-confirm-item">{listings.filter(needsTranslation).length} ilan çevrilecek</p>}<div className="ad-dialog-actions"><button className="ad-button ad-button-secondary" disabled={!!translating} onClick={() => setConfirmTranslate(false)}>Vazgeç</button><button className="ad-button" disabled={!!translating || !listings.some(needsTranslation)} onClick={() => void translateAll()}><Languages size={17} />Çevirileri tamamla</button></div></Modal>
    <Modal open={!!unpublishing} onClose={() => { if (!busy) setUnpublishing(null); }} title="İlanı yayından kaldır" description="İlan siteden hemen kalkar. Dilediğiniz zaman “Yeniden yayınla” ile tek dokunuşla geri getirebilirsiniz."><p className="ad-confirm-item">{unpublishing?.title || 'Başlıksız ilan'}</p><div className="ad-unpublish-options">{unpublishing && unpublishing.transaction !== 'exchange' && <button className="ad-unpublish-option" disabled={!!busy} onClick={async () => { if (unpublishing && await performAction(unpublishing, unpublishing.transaction === 'rent' ? 'rented' : 'sold')) setUnpublishing(null); }}><CheckCheck size={20} /><span><strong>{unpublishing.transaction === 'rent' ? 'Kiralandı' : 'Satıldı'}</strong><small>“Yayından kalkan” ilanlarınızda {unpublishing.transaction === 'rent' ? 'kiralandı' : 'satıldı'} olarak saklanır.</small></span></button>}<button className="ad-unpublish-option" disabled={!!busy} onClick={async () => { if (unpublishing && await performAction(unpublishing, 'archive')) setUnpublishing(null); }}><EyeOff size={20} /><span><strong>Sadece yayından kaldır</strong><small>Şimdilik sitede görünmesin; bilgiler ve fotoğraflar korunur.</small></span></button></div><div className="ad-dialog-actions"><button className="ad-button ad-button-secondary" disabled={!!busy} onClick={() => setUnpublishing(null)}>Vazgeç</button></div></Modal>
    <QuickPrice item={quickPrice} busy={!!busy} onClose={() => setQuickPrice(null)} onSave={async (item, price) => { if (await performAction(item, 'price', price)) setQuickPrice(null); }} />
    <Modal open={!!confirm} onClose={() => { if (!busy) setConfirm(null); }} title={confirm?.permanent ? 'İlan kalıcı olarak silinsin mi?' : 'İlan çöp kutusuna taşınsın mı?'} description={confirm?.permanent ? 'Bu işlem geri alınamaz. İlan ve bağlı fotoğraflar kalıcı olarak silinir.' : 'İlan yayından kalkar. Daha sonra çöp kutusundan taslak olarak geri alabilirsiniz.'}><p className="ad-confirm-item">{confirm?.item.title || 'Başlıksız ilan'}</p><div className="ad-dialog-actions"><button className="ad-button ad-button-secondary" disabled={!!busy} onClick={() => setConfirm(null)}>Vazgeç</button><button className="ad-button ad-button-danger" disabled={!!busy} onClick={async () => { if (!confirm) return; if (confirm.permanent) { setBusy(confirm.item.id); try { await adminApi.remove(confirm.item); setListings(items => items.filter(item => item.id !== confirm.item.id)); clearRecovery(confirm.item.id); notify('İlan kalıcı olarak silindi.'); setConfirm(null); } catch (error) { notify(errorMessage(error), 'error'); } finally { setBusy(''); } } else if (await performAction(confirm.item, 'trash')) setConfirm(null); }}>{busy ? <Spinner label="İşleniyor" /> : <><Trash2 size={17} />{confirm?.permanent ? 'Kalıcı olarak sil' : 'Çöp kutusuna taşı'}</>}</button></div></Modal>
    <Modal open={!!importData} onClose={() => { if (!busy) setImportData(null); }} title="Yedekten ilanları içe aktar" description="İçe aktarılan tüm ilanlar kontrol edilmek üzere taslak olarak eklenir. Mevcut ilanlarınızın üzerine yazılmaz."><div className="ad-banner ad-banner-info">{(importData as { listings?: unknown[] })?.listings?.length || 0} ilan bulundu. JSON dosyası fotoğraf dosyalarının kendisini içermez; erişilebilir fotoğraf bağlantıları ayrıca kontrol edilmelidir.</div><div className="ad-dialog-actions"><button className="ad-button ad-button-secondary" disabled={!!busy} onClick={() => setImportData(null)}>Vazgeç</button><button className="ad-button" disabled={!!busy} onClick={async () => { setBusy('import'); try { const result = await adminApi.import(importData); notify(`${result.imported ?? result.count ?? 'İlanlar'} taslak olarak içe aktarıldı.`); setImportData(null); await load(); } catch (error) { notify(errorMessage(error), 'error'); } finally { setBusy(''); } }}>{busy ? <Spinner label="Aktarılıyor" /> : <><Upload size={17} />Taslak olarak içe aktar</>}</button></div></Modal>
  </div></MotionConfig>;
}

/** Şifre yenileme bağlantısıyla gelen yönetici yeni şifresini belirler. */
function PasswordDialog({ auth, onClose, notify }: { auth: AuthController | null; onClose: () => void; notify: (text: string, kind?: Notice['kind']) => void }) {
  const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (password.length < 8) { setError('Şifre en az 8 karakter olmalı.'); return; }
    setBusy(true); setError('');
    try { if (!auth) throw new Error('Giriş hizmeti hazır değil.'); await auth.setPassword(password); notify('Şifreniz değiştirildi.', 'success'); onClose(); } catch (cause) { setError(authError(cause)); } finally { setBusy(false); }
  };
  return <Modal open onClose={() => { if (!busy) onClose(); }} title="Yeni şifrenizi belirleyin" description="Bundan sonra panele bu şifreyle gireceksiniz."><form onSubmit={submit}>{error && <div className="ad-banner ad-banner-error" role="alert">{error}</div>}<InputField name="new-password" label="Yeni şifre" value={password} type="password" autoComplete="new-password" onChange={setPassword} required placeholder="En az 8 karakter" /><div className="ad-dialog-actions"><button type="button" className="ad-button ad-button-secondary" disabled={busy} onClick={onClose}>Sonra</button><button className="ad-button" disabled={busy}>Şifreyi kaydet</button></div></form></Modal>;
}

function Login({ config, bootError, auth, onSession }: { config: ClientConfig | null; bootError: string; auth: AuthController | null; onSession: () => void }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setError(''); setMessage(''); setBusy(true); try { if (config?.mode === 'preview') { await adminApi.preview(); onSession(); } else if (auth) await auth.login(email, password); else throw new Error('Giriş hizmeti hazır değil.'); } catch (cause) { setError(config?.mode === 'preview' ? errorMessage(cause) : authError(cause)); } finally { setBusy(false); } };
  return <div className="ad-root ad-login"><div className="ad-login-art"><a className="ad-brand" href="/">KA<span>EMLAK<small>ANTALYA</small></span></a><div className="ad-login-quote"><span className="ad-eyebrow">PORTFÖYÜNÜZ, KONTROLÜNÜZDE.</span><h1>Her yeni anahtar,<br /><em>yeni bir hikâye.</em></h1><p>İlanlarınızı özenle yönetin.<br />Doğru yaşam alanlarını, doğru insanlarla buluşturun.</p></div><span className="ad-login-art-bottom">ANTALYA · KONYAALTI</span></div><main className="ad-login-main"><div className="ad-login-card"><a className="ad-login-home" href="/"><ArrowLeft size={16} />Siteye dön</a><span className="ad-eyebrow">KA EMLAK YÖNETİM</span><h2>Hoş geldiniz.</h2><p className="ad-login-intro">Portföyünüzle ilgilenmek için güzel bir gün.</p>{bootError && <div className="ad-banner ad-banner-error" role="alert">{bootError}<button className="ad-text-button" onClick={() => location.reload()}>Tekrar yükle</button></div>}{error && <div className="ad-banner ad-banner-error" role="alert">{error}</div>}{message && <div className="ad-banner ad-banner-success" role="status">{message}</div>}{config?.mode === 'preview' ? <form onSubmit={submit}><div className="ad-preview-login"><Eye size={24} /><strong>Yerel geliştirme önizlemesi</strong><p>Bu cihazdaki paneli test edebilirsiniz. Bu giriş canlı site için yönetici yetkisi oluşturmaz.</p></div><button type="submit" className="ad-button ad-login-submit" disabled={busy || !!bootError}>{busy ? <Spinner label="Açılıyor" /> : <>Önizleme panelini aç<ArrowRight size={18} /></>}</button></form> : <form onSubmit={submit}><InputField name="login-email" label="E-posta adresiniz" value={email} type="email" autoComplete="username" onChange={setEmail} required placeholder="E-posta adresi" /><InputField name="login-password" label="Şifreniz" value={password} type="password" autoComplete="current-password" onChange={setPassword} required placeholder="Şifrenizi yazın" /><button type="button" className="ad-forgot" disabled={busy || !auth} onClick={async () => { setError(''); setMessage(''); if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Şifre yenilemek için önce e-posta adresinizi yazın.'); document.getElementById('login-email')?.focus(); return; } setBusy(true); try { await auth?.reset(email); setMessage('Hesabınız uygunsa şifre yenileme bağlantısı e-posta adresinize gönderildi. Spam klasörünü de kontrol edin.'); } catch (cause) { setError(authError(cause)); } finally { setBusy(false); } }}>Şifremi unuttum</button><button className="ad-button ad-login-submit" type="submit" disabled={busy || !auth || !!bootError}>{busy ? <Spinner label="Giriş yapılıyor" /> : <>Giriş yap<ArrowRight size={18} /></>}</button></form>}<p className="ad-login-security"><ShieldCheck size={16} />Yalnızca yetkili ofis yöneticisi erişebilir.</p></div><footer>KA EMLAK · Yönetim alanı</footer></main></div>;
}

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };
const installDismissedKey = 'ka:install-hint-dismissed';
/** Paneli telefonda uygulama gibi açmak için ana ekrana ekleme önerisi. */
const sourceHintKey = 'ka:source-hint-hidden';
/** Yer imi kurulum kartı: düğme tarayıcının yer imleri çubuğuna sürüklenir. Telefonda gösterilmez. */
function SourceImportHint() {
  const link = useRef<HTMLAnchorElement>(null);
  const [hidden, setHidden] = useState(() => { try { return localStorage.getItem(sourceHintKey) === '1'; } catch { return false; } });
  const [clicked, setClicked] = useState(false);
  // React javascript: bağlantılarını engellediği için yer imi adresi elle verilir.
  useEffect(() => { link.current?.setAttribute('href', bookmarklet(location.origin)); }, [hidden]);
  const toggle = (next: boolean) => { setHidden(next); try { if (next) localStorage.setItem(sourceHintKey, '1'); else localStorage.removeItem(sourceHintKey); } catch { /* yerel saklama kapalı */ } };
  if (hidden) return <button className="ad-text-button ad-source-reopen" onClick={() => toggle(false)}><ArrowDownToLine size={15} />hepsiemlak’tan aktarma düğmesi</button>;
  return <div className="ad-source-hint"><span className="ad-install-icon"><ArrowDownToLine size={20} /></span><div><strong>hepsiemlak ve sahibinden’den tek tıkla aktarın</strong><p>{clicked ? 'Bu düğmeye burada tıklamayın; tutup tarayıcınızın yer imleri çubuğuna sürükleyin.' : 'Sağdaki düğmeyi bir kez tarayıcınızın yer imleri çubuğuna sürükleyin. Sonra hepsiemlak veya sahibinden’de siteye eklemek istediğiniz ilanı açıp yer imindeki “KA Emlak’a ekle”ye tıklayın; ilan fotoğraflarıyla birlikte buraya gelir. Sitedeki ilanlarınız portallarda olmasa da silinmez. Düğmeyi daha önce sürüklediyseniz eskisini silip yenisini sürükleyin.'}</p></div><div className="ad-inline-actions"><a ref={link} className="ad-bookmarklet" draggable onClick={event => { event.preventDefault(); setClicked(true); }}>KA Emlak’a ekle</a><button className="ad-icon-button" aria-label="Kurulum kartını gizle" onClick={() => toggle(true)}><X size={17} /></button></div></div>;
}

type ImportResult = { listing: AdminListing; created: boolean; published: boolean; failedPhotos: number; error?: string };
/** Portal ilanını oluşturur ya da günceller, fotoğrafları tek tek aktarır ve istenirse yayınlar. */
async function importFromSource(payload: SourceListing & { targetId?: string }, publish: boolean, onProgress: (text: string) => void): Promise<ImportResult> {
  const prepared = await adminApi.sourceListing(payload);
  let latest = prepared.listing; const added: Photo[] = []; let failedPhotos = 0;
  for (const [index, url] of prepared.photos.entries()) {
    onProgress(`Fotoğraflar aktarılıyor ${index + 1}/${prepared.photos.length}`);
    try { added.push((await adminApi.sourcePhoto(latest.id, url)).photo); } catch { failedPhotos++; }
  }
  if (added.length) { const data = editData(latest); latest = (await adminApi.save(latest.id, { ...data, photos: [...data.photos, ...added] }, latest.version)).listing; }
  if (!publish) return { listing: latest, created: prepared.created, published: false, failedPhotos };
  onProgress('Yayınlanıyor…');
  try { return { listing: (await adminApi.action(latest, 'publish')).listing, created: prepared.created, published: true, failedPhotos }; }
  catch (error) { return { listing: latest, created: prepared.created, published: false, failedPhotos, error: errorMessage(error) }; }
}

const syncLabels: Record<SyncField, string> = { transaction: 'İşlem', price: 'Fiyat', currency: 'Para birimi', period: 'Fiyat dönemi', grossArea: 'Brüt m²', netArea: 'Net m²', rooms: 'Oda', bathrooms: 'Banyo' };
const syncValue = (field: SyncField, value: unknown) => {
  if (value === null || value === undefined || value === '') return '—';
  if (field === 'price') return Number(value).toLocaleString('tr-TR');
  if (field === 'transaction') return transactionLabels[value as keyof typeof transactionLabels] ?? String(value);
  if (field === 'period') return periodLabels[value as keyof typeof periodLabels] || 'toplam';
  return String(value);
};

/**
 * hepsiemlak ofis sayfasından ya da sahibinden mağaza listesinden gelen bütün ilanları sitedekilerle karşılaştırır. Ofis neyin
 * değişeceğini görüp istediği yeni ilanları işaretler; onaylayınca işaretli ilanlar eklenip yayınlanır, değişen alanlar güncellenir.
 * Portalda olmayan ilanlara dokunulmaz (ofisin bütün ilanları portallarda olmayabilir). sahibinden'de sayfası okunamayan
 * ve sitede olmayan ilanlar bağlantı olarak listelenir; ofis açıp yer imiyle tek tek ekler.
 */
function SyncDialog({ payload, listings, onClose, onDone }: { payload: SyncPayload; listings: AdminListing[]; onClose: () => void; onDone: (changed: AdminListing[], summary: string) => void }) {
  const [plan] = useState(() => planSync(payload, listings));
  const [selected, setSelected] = useState(() => new Set(plan.update.map(item => `update:${item.listing.id}`)));
  const toggle = (key: string) => setSelected(previous => { const next = new Set(previous); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  const [busy, setBusy] = useState(false); const [progress, setProgress] = useState('');
  const total = plan.add.length + plan.update.length;
  const run = async () => {
    setBusy(true); const changed: AdminListing[] = []; let added = 0, updated = 0, failed = 0, drafts = 0;
    const adds = plan.add.filter(item => selected.has(`add:${item.source.id}`));
    for (const [index, item] of adds.entries()) {
      try {
        const result = await importFromSource(item.source, true, text => setProgress(`Yeni ilan ${index + 1}/${adds.length}: ${text}`));
        changed.push(result.listing); added++; if (!result.published) drafts++;
      } catch { failed++; }
    }
    const updates = plan.update.filter(item => selected.has(`update:${item.listing.id}`));
    for (const [index, item] of updates.entries()) {
      setProgress(`Güncelleniyor ${index + 1}/${updates.length}`);
      try {
        const data = editData(item.listing);
        for (const change of item.changes) Object.assign(data, { [change.field]: change.to });
        let latest = (await adminApi.save(item.listing.id, data, item.listing.version)).listing;
        // Yayındaki ilanın düzenlemesi taslağa kaydedilir; sitede görünmesi için yeniden yayınlanır.
        if (item.listing.status === 'published') latest = (await adminApi.action(latest, 'publish')).listing;
        changed.push(latest); updated++;
      } catch { failed++; }
    }
    const parts = [added && `${added} yeni ilan eklendi`, updated && `${updated} ilan güncellendi`].filter(Boolean);
    const notes = [drafts && `${drafts} yeni ilan eksik bilgi nedeniyle taslakta kaldı`, failed && `${failed} işlem yapılamadı, tekrar deneyin`].filter(Boolean);
    onDone(changed, `${parts.length ? parts.join(', ') : 'Değişiklik yapılmadı'}.${notes.length ? ` ${notes.join('; ')}.` : ''}`);
  };
  const row = (key: string, title: string, detail: ReactNode) => <label key={key} className="ad-sync-item"><input type="checkbox" checked={selected.has(key)} disabled={busy} onChange={() => toggle(key)} /><span><strong>{title}</strong>{detail}</span></label>;
  const portal = sourceLabels[payload.source], other = payload.source === 'hepsiemlak' ? 'sahibinden' : 'hepsiemlak';
  const pending = plan.unread - plan.unreadRows.length;
  return <Modal open onClose={() => { if (!busy) onClose(); }} title={`${portal} ile eşitle`} description={`${payload.source === 'sahibinden' ? 'Mağazanızdaki' : 'Ofis sayfanızdaki'} ${payload.seen.length} ilan sitedekilerle karşılaştırıldı.`} wide>
    {pending > 0 && <div className="ad-banner ad-banner-warning"><CircleAlert size={18} /><span>{pending} ilanın sayfası okunamadı. Bu ilanlar değiştirilmeyecek.</span></div>}
    {plan.unreadRows.length > 0 && <div className="ad-sync-list"><section><h3>Sayfası okunamayanlar <span>{plan.unreadRows.length}</span></h3><p>sahibinden art arda sayfa açılmasına izin vermedi. Sitede olmayan bu ilanları tek tek açıp yer imindeki “KA Emlak’a ekle”ye basın.</p><ul className="ad-sync-links">{plan.unreadRows.map(row => <li key={row.id}><a href={row.url} target="_blank" rel="noopener noreferrer">{row.title || `İlan ${row.id}`}<ExternalLink size={14} aria-hidden="true" /></a><small>{row.price}</small></li>)}</ul></section></div>}
    {total === 0 ? (plan.unreadRows.length === 0 && <p className="ad-confirm-item">Sitedeki ilanlarınız {portal} ile aynı. Yapılacak bir şey yok.</p>) : <div className="ad-sync-list">
      {plan.add.length > 0 && <section><h3>Yeni ilanlar <span>{plan.add.length}</span></h3><p>Siteye eklemek istediklerinizi işaretleyin; fotoğraflarıyla eklenip yayınlanır.</p>{plan.add.map(item => row(`add:${item.source.id}`, item.mapped.title, <small>{transactionLabels[item.mapped.transaction]} {propertyLabels[item.mapped.propertyType]} · {[item.mapped.neighborhood, item.mapped.district].filter(Boolean).join(', ')} · {priceLabel(item.mapped)}</small>))}</section>}
      {plan.update.length > 0 && <section><h3>Değişen ilanlar <span>{plan.update.length}</span></h3><p>Yalnız gösterilen alanlar değişir; başlık, açıklama ve fotoğraflar korunur.</p>{plan.update.map(item => row(`update:${item.listing.id}`, editData(item.listing).title || 'Başlıksız ilan', <small>{item.likely && `${sourceFrom[other]} eklenen aynı mülk · `}{item.changes.map(change => `${syncLabels[change.field]}: ${syncValue(change.field, change.from)} → ${syncValue(change.field, change.to)}`).join(' · ')}</small>))}</section>}
    </div>}
    {plan.unchanged > 0 && <p className="ad-sync-note">{plan.unchanged} ilan zaten güncel.</p>}
    {busy && <div className="ad-bulk-progress" role="status"><Spinner label={progress || 'Hazırlanıyor…'} /></div>}
    <div className="ad-dialog-actions">
      <button className="ad-button ad-button-secondary" disabled={busy} onClick={onClose}>{total === 0 ? 'Kapat' : 'Vazgeç'}</button>
      {total > 0 && <button className="ad-button" disabled={busy || selected.size === 0} onClick={() => void run()}><RefreshCw size={17} />Seçilenleri uygula ({selected.size})</button>}
    </div>
  </Modal>;
}

const sourceFrom = { hepsiemlak: 'hepsiemlak’tan', sahibinden: 'sahibinden’den' } as const;
const sourceAt = { hepsiemlak: 'hepsiemlak’taki', sahibinden: 'sahibinden’deki' } as const;

/** Yer iminden gelen hepsiemlak veya sahibinden ilanını önizler; onaylanınca ilanı oluşturur, fotoğrafları tek tek aktarır ve yayınlar. */
function SourceImportDialog({ payload, listings, onClose, onDone, notify }: { payload: SourceListing; listings: AdminListing[]; onClose: () => void; onDone: (listing: AdminListing, result: { created: boolean; published: boolean; failedPhotos: number; error?: string }) => void; notify: (text: string, kind?: Notice['kind']) => void }) {
  const mapped = useMemo(() => mapSource(payload), [payload]);
  const photos = useMemo(() => sourcePhotos(payload), [payload]);
  const active = listings.filter(item => item.status !== 'trash');
  const exact = active.find(item => [item.sourceUrl, item.draft?.sourceUrl].some(url => sameSource(url, payload.id)));
  // Aynı mülk öteki portaldan eklenmişse numara tutmaz; ofis sitedekini güncellemeyi ya da ayrı ilan açmayı seçer.
  const likelyId = exact ? undefined : likelySame(active.map(editData), mapped)?.id;
  const likely = active.find(item => item.id === likelyId);
  const [merge, setMerge] = useState(true);
  const existing = exact ?? (merge ? likely : undefined);
  const [busy, setBusy] = useState(false); const [progress, setProgress] = useState('');
  const run = async (publish: boolean) => {
    setBusy(true); setProgress(existing ? 'İlan güncelleniyor…' : 'İlan oluşturuluyor…');
    try {
      const result = await importFromSource(existing && !exact ? { ...payload, targetId: existing.id } : payload, publish, setProgress);
      onDone(result.listing, result);
    } catch (error) { notify(errorMessage(error), 'error'); setBusy(false); setProgress(''); }
  };
  const small = (url: string) => url.replace('/mnresize/1600/1200/', '/mnresize/320/240/').replace('/x16_', '/x5_');
  const kept = `Fiyat ve ölçüler ${sourceAt[payload.source]} hâline getirilir; başlık, açıklama ve fotoğraflar korunur.`;
  return <Modal open onClose={() => { if (!busy) onClose(); }} title={existing ? 'İlanı güncelle' : `${sourceFrom[payload.source]} ilan ekle`} description={`${sourceLabels[payload.source]} ilan no ${payload.id}`} wide>
    {exact && <div className="ad-banner ad-banner-info"><CircleAlert size={18} /><span>Bu ilan sitede zaten var. {kept}</span></div>}
    {likely && <div className="ad-banner ad-banner-info ad-source-match"><CircleAlert size={18} /><div><span>Sitede aynı görünen bir ilan var: <strong>{editData(likely).title}</strong>. {merge ? kept : 'Yeni bir ilan olarak eklenecek.'}</span><div className="ad-source-choice" role="group" aria-label="Aynı görünen ilan"><button aria-pressed={merge} className={merge ? 'active' : ''} disabled={busy} onClick={() => setMerge(true)}>Sitedekini güncelle</button><button aria-pressed={!merge} className={merge ? '' : 'active'} disabled={busy} onClick={() => setMerge(false)}>Ayrı ilan olarak ekle</button></div></div></div>}
    <div className="ad-source-preview">
      {photos.length > 0 ? <div className="ad-source-photos">{photos.slice(0, 4).map(url => <img key={url} src={small(url)} alt="" width="160" height="120" loading="lazy" referrerPolicy="no-referrer" />)}</div> : <div className="ad-preview-empty-image"><ImagePlus size={32} /><span>Fotoğraf bulunamadı</span></div>}
      <div className="ad-source-facts">
        <span className="ad-eyebrow">{transactionLabels[mapped.transaction]} {propertyLabels[mapped.propertyType]}</span>
        <h3>{existing ? editData(existing).title : mapped.title}</h3>
        <p className="ad-listing-location"><MapPin size={14} />{[mapped.neighborhood, mapped.district, mapped.city].filter(Boolean).join(', ')}</p>
        <div className="ad-preview-price">{priceLabel(mapped)}<small>{periodLabels[mapped.period]}</small></div>
        <div className="ad-preview-facts"><span>{mapped.grossArea || '—'} m²</span>{mapped.rooms && <span>{mapped.rooms}</span>}<span>{photos.length} fotoğraf</span></div>
      </div>
    </div>
    {busy && <div className="ad-bulk-progress" role="status"><Spinner label={progress} /></div>}
    <div className="ad-dialog-actions">
      <button className="ad-button ad-button-secondary" disabled={busy} onClick={onClose}>Vazgeç</button>
      {!existing && <button className="ad-button ad-button-secondary" disabled={busy} onClick={() => void run(false)}>Taslak olarak ekle</button>}
      <button className="ad-button" disabled={busy} onClick={() => void run(true)}><Check size={17} />{existing ? 'Siteyi güncelle' : 'Siteye ekle ve yayınla'}</button>
    </div>
  </Modal>;
}

function InstallHint() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);
  useEffect(() => {
    const standalone = matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    let dismissed = false; try { dismissed = localStorage.getItem(installDismissedKey) === '1'; } catch { /* yerel saklama kapalı */ }
    if (standalone || dismissed) return;
    const iosDevice = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIos(iosDevice); if (iosDevice) setVisible(true);
    const capture = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); setVisible(true); };
    const installed = () => setVisible(false);
    window.addEventListener('beforeinstallprompt', capture); window.addEventListener('appinstalled', installed);
    return () => { window.removeEventListener('beforeinstallprompt', capture); window.removeEventListener('appinstalled', installed); };
  }, []);
  const dismiss = () => { setVisible(false); try { localStorage.setItem(installDismissedKey, '1'); } catch { /* yerel saklama kapalı */ } };
  if (!visible) return null;
  return <div className="ad-install"><span className="ad-install-icon"><Smartphone size={20} /></span><div><strong>Paneli telefonunuza ekleyin</strong><p>{ios ? 'Safari’de alttaki Paylaş düğmesine, ardından “Ana Ekrana Ekle”ye dokunun. Panel bir uygulama gibi tek dokunuşla açılır.' : 'Ana ekranınıza ekleyin; ilan eklemek için paneli bir uygulama gibi tek dokunuşla açın.'}</p></div><div className="ad-inline-actions">{prompt && <button className="ad-button ad-button-small" onClick={async () => { await prompt.prompt(); const choice = await prompt.userChoice; setPrompt(null); if (choice.outcome === 'accepted') setVisible(false); }}><Plus size={15} />Ana ekrana ekle</button>}<button className="ad-icon-button" aria-label="Öneriyi kapat" onClick={dismiss}><X size={17} /></button></div></div>;
}

type ListFilter = 'all' | 'published' | 'draft' | 'closed' | 'trash';
const isClosed = (status: ListingStatus) => status === 'sold' || status === 'rented' || status === 'archived';
const inFilter = (item: AdminListing, filter: ListFilter) => filter === 'all' ? item.status !== 'trash' : filter === 'closed' ? isClosed(item.status) : item.status === filter;
const needsReviewDraft = (item: AdminListing) => item.status === 'draft' && editData(item).needsReview;
const needsTranslation = (item: AdminListing) => item.status === 'published' && pendingLocales(item).length > 0;

function ListingsPanel({ listings, inquiries, busy, storage, onNew, onEdit, onReview, onStartReview, onPublishAll, onTranslate, onAction, onUnpublish, onPrice, onDelete, onExport, onImport, onRefresh, onInquiries }: { onTranslate: () => void; listings: AdminListing[]; inquiries: number; busy: string; storage: StorageUsage | null; onNew: () => void; onEdit: (item: AdminListing) => void; onReview: (item: AdminListing) => void; onStartReview: () => void; onPublishAll: () => void; onAction: (item: AdminListing, action: ListingAction) => unknown; onUnpublish: (item: AdminListing) => void; onPrice: (item: AdminListing) => void; onDelete: (item: AdminListing) => void; onExport: () => void; onImport: () => void; onRefresh: () => void; onInquiries: () => void }) {
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState<ListFilter>('all');
  const [type, setType] = useState('all');
  const search = query.toLocaleLowerCase('tr-TR');
  const filtered = listings.filter(item => { const data = editData(item); return inFilter(item, filter) && (type === 'all' || data.propertyType === type) && `${data.title} ${data.district} ${data.neighborhood}`.toLocaleLowerCase('tr-TR').includes(search); }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const count = (target: ListFilter) => listings.filter(item => inFilter(item, target)).length;
  const reviewCount = listings.filter(needsReviewDraft).length; const untranslated = listings.filter(needsTranslation).length;
  const show = (target: ListFilter) => { setFilter(target); document.getElementById('listing-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const stats = [
    { label: 'Yayındaki ilanlar', value: count('published'), hint: 'Sitede görünenler', Icon: Home, bronze: false, onClick: () => show('published') },
    { label: 'Taslaklar', value: count('draft'), hint: reviewCount ? `${reviewCount} tanesi kontrol bekliyor` : 'Hazırlanmayı bekliyor', Icon: Pencil, bronze: true, onClick: () => show('draft') },
    { label: 'Yayından kalkan', value: count('closed'), hint: 'Satılan, kiralanan, kaldırılan', Icon: FolderArchive, bronze: false, onClick: () => show('closed') },
    { label: 'Yeni talepler', value: inquiries, hint: 'Size ulaşmak isteyenler', Icon: MessageSquare, bronze: true, onClick: onInquiries },
  ];
  return <><div className="ad-page-heading"><div><span className="ad-eyebrow">PORTFÖY YÖNETİMİ</span><h1>İlanlarınız<span>.</span></h1><p>Portföyünüzü tek bir yerden, kolayca yönetin.</p></div><button className="ad-button" onClick={onNew} disabled={!!busy}>{busy === 'new' ? <Spinner label="Hazırlanıyor" /> : <><Plus size={19} />Yeni ilan ekle</>}</button></div>
    <div className="ad-stats">{stats.map(({ label, value, hint, Icon, bronze, onClick }) => <button type="button" className="ad-stat" key={label} onClick={onClick}><div className={`ad-stat-icon ${bronze ? 'ad-stat-bronze' : ''}`}><Icon size={20} /></div><div><span>{label}</span><strong>{value.toString().padStart(2, '0')}</strong></div><small>{hint}</small></button>)}</div>
    {reviewCount > 0 && <div className="ad-review-queue"><span className="ad-install-icon"><CheckCheck size={20} /></span><div><strong>{reviewCount} ilan kontrol bekliyor</strong><p>Hepsini tek seferde yayınlayabilir ya da sırayla açıp gözden geçirebilirsiniz. Yayındaki ilanları sonra da düzenleyebilirsiniz.</p></div><div className="ad-review-actions"><button className="ad-button ad-button-small ad-button-secondary" onClick={onStartReview} disabled={!!busy}>Tek tek kontrol et</button><button className="ad-button ad-button-small" onClick={onPublishAll} disabled={!!busy}><CheckCheck size={15} />Hepsini yayınla</button></div></div>}
    <InstallHint />
    <SourceImportHint />
    {storage?.warning && <div className="ad-banner ad-banner-warning"><CircleAlert size={19} /><span>{storage.blocked ? 'Fotoğraf depolama sınırına ulaşıldı. Yeni fotoğraf yüklemeden önce gereksiz ilanları ve fotoğrafları temizleyin.' : 'Fotoğraf alanınız dolmaya yaklaşıyor.'} {bytesLabel(storage.usedBytes)} / {bytesLabel(storage.limitBytes)}</span></div>}
    <section className="ad-list-section" id="listing-list" aria-label="İlan listesi"><div className="ad-list-heading"><h2>Portföyüm <span>{count('all')} ilan</span></h2><div className="ad-backup-actions"><button className="ad-text-button" onClick={onRefresh} disabled={!!busy}><RefreshCw size={15} />Yenile</button><details className="ad-menu"><summary aria-label="Yedekleme ve çeviri seçenekleri"><Ellipsis size={21} /></summary><div className="ad-menu-items"><button onClick={onExport} disabled={!!busy}><ArrowDownToLine size={16} />Veri yedeği indir</button><button onClick={onImport} disabled={!!busy}><ArrowUpFromLine size={16} />Yedekten içe aktar</button>{untranslated > 0 && <button onClick={onTranslate} disabled={!!busy}><Languages size={16} />Eksik çevirileri tamamla ({untranslated})</button>}</div></details></div></div><div className="ad-filter-tabs" aria-label="İlan durumuna göre filtrele">{([['all', 'Tümü'], ['published', 'Yayında'], ['draft', 'Taslak'], ['closed', 'Yayından kalkan'], ['trash', 'Çöp kutusu']] as const).map(([id, label]) => <button key={id} aria-pressed={filter === id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{id === 'trash' && <Trash2 size={14} />}{label}<b className="ad-tab-count">{count(id)}</b></button>)}</div><div className="ad-list-tools"><label className="ad-search"><Search size={18} /><span className="ad-sr-only">İlan ara</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Başlık, ilçe veya mahalle ara…" /></label><label className="ad-type-filter"><span className="ad-sr-only">Gayrimenkul türü</span><select value={type} onChange={e => setType(e.target.value)}><option value="all">Tüm gayrimenkul türleri</option>{Object.entries(propertyLabels).map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></label></div>
    {filtered.length === 0 ? <div className="ad-empty"><Building2 size={38} /><h3>{query || filter !== 'all' ? 'Bu filtrede ilan bulunamadı.' : 'İlk ilanınızla başlayın.'}</h3><p>{query || filter !== 'all' ? 'Arama veya filtreleri değiştirerek yeniden deneyin.' : 'Fotoğrafları ekleyin, bilgileri tamamlayın ve hazır olduğunuzda yayınlayın.'}</p>{!query && filter === 'all' && <button className="ad-button" onClick={onNew} disabled={!!busy}><Plus size={18} />İlan ekle</button>}</div> : <div className="ad-listings">{filtered.map(item => {
      const data = editData(item);
      // Her durumda tek bir ana işlem görünür; seyrek kullanılanlar ⋯ menüsündedir.
      const primary = item.status === 'trash' ? null
        : item.status === 'draft' ? (data.needsReview ? <button className="ad-button ad-button-small" disabled={!!busy} onClick={() => onReview(item)} aria-label={`${data.title || 'Başlıksız ilan'}: kontrol et`}><CheckCheck size={14} />Kontrol et</button> : <button className="ad-button ad-button-small" disabled={!!busy} onClick={() => onAction(item, 'publish')} aria-label={`${data.title || 'Başlıksız ilan'}: yayınla`}><Check size={14} />Yayınla</button>)
        : item.status === 'published' ? <>{item.draft && <button className="ad-button ad-button-small" disabled={!!busy} onClick={() => onAction(item, 'publish')}><Check size={14} />Değişiklikleri yayınla</button>}<button className="ad-button ad-button-small ad-button-secondary" disabled={!!busy} onClick={() => onUnpublish(item)} aria-label={`${data.title || 'Başlıksız ilan'}: yayından kaldır`}><EyeOff size={14} />Yayından kaldır</button></>
        : <button className="ad-button ad-button-small" disabled={!!busy} onClick={() => onAction(item, 'publish')} aria-label={`${data.title || 'Başlıksız ilan'}: yeniden yayınla`}><RefreshCw size={14} />Yeniden yayınla</button>;
      return <article className={`ad-listing ${busy === item.id ? 'ad-is-busy' : ''}`} key={item.id}><button className="ad-listing-image" onClick={() => onEdit(item)} disabled={item.status === 'trash' || !!busy} aria-label={`${data.title || 'Başlıksız ilan'} düzenle`}>{data.photos[0] ? <img src={data.photos[0].thumbnail || data.photos[0].url} alt="" loading="lazy" width="180" height="132" /> : <ImagePlus size={30} />}{item.featured && <span className="ad-featured-marker"><Star size={13} fill="currentColor" />Öne çıkan</span>}</button><div className="ad-listing-info"><div className="ad-listing-badges"><Status status={item.status} /><span className="ad-type-label">{transactionLabels[data.transaction]} · {propertyLabels[data.propertyType]}</span>{data.needsReview && <span className="ad-review-badge">Kontrol gerekli</span>}{item.status === 'published' && item.draft && <span className="ad-review-badge">Yayınlanmamış değişiklik</span>}</div><button className="ad-listing-title" disabled={item.status === 'trash' || !!busy} onClick={() => onEdit(item)}>{data.title || 'Başlıksız yeni ilan'}</button><p className="ad-listing-location"><MapPin size={13} />{[data.neighborhood, data.district, data.city].filter(Boolean).join(', ') || 'Konum henüz eklenmedi'}</p><div className="ad-listing-facts"><span>{data.grossArea || '—'} m²</span>{data.rooms && <span>{data.rooms} oda</span>}<span>{dateLabel(item.updatedAt)}</span></div></div><div className="ad-listing-end"><button className="ad-listing-price" disabled={!!busy || item.status === 'trash'} onClick={() => onPrice(item)} title="Fiyatı hızlıca güncelle">{priceLabel(data)}<Pencil size={12} /><small>{periodLabels[data.period]}</small></button><div className="ad-listing-actions">{item.status === 'trash' ? <><button className="ad-button ad-button-small ad-button-secondary" disabled={!!busy} onClick={() => onAction(item, 'restore')}><RefreshCw size={15} />Geri al</button><button className="ad-icon-button ad-danger-text" disabled={!!busy} onClick={() => onDelete(item)} aria-label="Kalıcı olarak sil"><Trash2 size={18} /></button></> : <>{primary}<button className="ad-button ad-button-small ad-button-secondary ad-edit-button" disabled={!!busy} onClick={() => onEdit(item)}><Pencil size={14} /><span>Düzenle</span></button><details className="ad-menu"><summary aria-label={`${data.title || 'İlan'} için diğer işlemler`}><Ellipsis size={21} /></summary><div className="ad-menu-items">{item.status === 'published' && <a href={`/ilan/${item.slug}`} target="_blank" rel="noreferrer"><ExternalLink size={16} />Sitede görüntüle</a>}<button onClick={() => onAction(item, 'duplicate')} disabled={!!busy}><Copy size={16} />Kopyasını oluştur</button>{item.status === 'published' && <button onClick={() => onAction(item, 'feature')} disabled={!!busy}><Star size={16} />{item.featured ? 'Ana sayfadan kaldır' : 'Ana sayfada öne çıkar'}</button>}<button className="ad-danger-text" onClick={() => onDelete(item)} disabled={!!busy}><Trash2 size={16} />Çöp kutusuna taşı</button></div></details></>}</div></div></article>;
    })}</div>}<div className="ad-list-bottom"><span>{filtered.length} ilan gösteriliyor</span><span><CloudCheck size={14} />Portföyünüz sizin kontrolünüzde.</span></div></section>
    <button className="ad-fab" onClick={onNew} disabled={!!busy} aria-label="Yeni ilan ekle"><Plus size={22} /><span>Yeni ilan</span></button>
  </>;
}

function QuickPrice({ item, busy, onClose, onSave }: { item: AdminListing | null; busy: boolean; onClose: () => void; onSave: (item: AdminListing, price: number | null) => void }) {
  const [price, setPrice] = useState(''); const [unspecified, setUnspecified] = useState(false); const [error, setError] = useState('');
  useEffect(() => { if (item) { setPrice(String(editData(item).price ?? '')); setUnspecified(editData(item).price === null); setError(''); } }, [item]);
  return <Modal open={!!item} onClose={() => { if (!busy) onClose(); }} title="Fiyatı güncelle" description={item?.title || 'İlan fiyatı'}><form onSubmit={event => { event.preventDefault(); if (!item) return; if (!unspecified && (!Number.isFinite(Number(price)) || Number(price) <= 0)) { setError('Sıfırdan büyük bir fiyat yazın.'); return; } onSave(item, unspecified ? null : Number(price)); }}><InputField name="quick-price" label={`Yeni fiyat (${item?.currency || 'TRY'})`} type="number" min={1} value={price} onChange={setPrice} error={error} /><label className="ad-checkbox"><input type="checkbox" checked={unspecified} onChange={e => setUnspecified(e.target.checked)} />Fiyat için görüşelim</label>{item?.status === 'published' && <p className="ad-help">Hızlı fiyat güncellemesi yayındaki ilana hemen yansır. Diğer taslak değişiklikleriniz korunur.</p>}<div className="ad-dialog-actions"><button type="button" className="ad-button ad-button-secondary" onClick={onClose} disabled={busy}>Vazgeç</button><button className="ad-button" disabled={busy}>{busy ? <Spinner label="Kaydediliyor" /> : <><Check size={17} />Fiyatı güncelle</>}</button></div></form></Modal>;
}

function validateListing(listing: Listing): Record<string, string> {
  const errors: Record<string, string> = {};
  if (listing.title.trim().length < 8) errors.title = 'En az 8 karakterlik açıklayıcı bir başlık yazın.';
  if (!listing.city.trim()) errors.city = 'İl bilgisini yazın.';
  if (!listing.district.trim()) errors.district = 'İlçe bilgisini yazın.';
  if (!listing.neighborhood.trim()) errors.neighborhood = 'Mahalle bilgisini yazın.';
  if (!(listing.grossArea > 0)) errors.grossArea = 'Sıfırdan büyük bir brüt alan yazın.';
  if (listing.netArea !== null && (listing.netArea <= 0 || listing.netArea > listing.grossArea)) errors.netArea = 'Net alan sıfırdan büyük ve brüt alandan küçük veya eşit olmalı.';
  if (listing.price !== null && (!(listing.price > 0) || !Number.isFinite(listing.price))) errors.price = 'Geçerli bir fiyat yazın veya “Fiyat için görüşelim” seçin.';
  if (!listing.photos.length) errors.photos = 'En az bir fotoğraf ekleyin.';
  if (roomsRequired(listing.propertyType) && !listing.rooms.trim()) errors.rooms = 'Oda bilgisini seçin.';
  if (listing.description.trim().length < 30) errors.description = 'En az 30 karakterlik ilan açıklaması yazın.';
  if (listing.needsReview) errors.reviewed = 'İlan bilgilerini kontrol ettiğinizi onaylayın.';
  return errors;
}
type LinkField = 'videoUrl' | 'tourUrl';
const validLink = (value: string) => value === '' || value.length <= 500 && /^https:\/\/[^\s<>"']+$/.test(value);
const linkMessage = 'Bağlantı https:// ile başlamalı ve boşluk içermemeli. Adresi tarayıcının adres çubuğundan kopyalayıp yapıştırın.';
type UploadItem = { id: string; file: File; status: 'waiting' | 'preparing' | 'uploading' | 'done' | 'failed'; error?: string };

function ListingEditor({ initial, storage, places, checkOnOpen = false, startStep = 0, queue, onSaved, onClose, notify }: { initial: AdminListing; storage: StorageUsage | null; places: Pick<Listing, 'district' | 'neighborhood'>[]; checkOnOpen?: boolean; startStep?: number; queue?: { position: number; total: number }; onSaved: (item: AdminListing) => void; onClose: (reason?: 'published' | 'skipped') => void; notify: (text: string, kind?: Notice['kind']) => void }) {
  const [form, setForm] = useState<Listing>(() => editData(initial));
  const neighborhoods = [...new Set(places.filter(place => place.neighborhood && (!form.district || place.district.toLocaleLowerCase('tr-TR') === form.district.toLocaleLowerCase('tr-TR'))).map(place => place.neighborhood))].sort((a, b) => a.localeCompare(b, 'tr'));
  const formRef = useRef(form); const recordRef = useRef(initial); const version = useRef(initial.version);
  const revision = useRef(0); const savedRevision = useRef(0); const inFlight = useRef<Promise<AdminListing | null> | null>(null);
  const [saveState, setSaveState] = useState<'saved' | 'dirty' | 'saving' | 'failed'>('saved');
  const [saveError, setSaveError] = useState(''); const [conflict, setConflict] = useState(false);
  const [step, setStep] = useState(startStep); const [errors, setErrors] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState(false); const [closing, setClosing] = useState(false);
  const [recovery, setRecovery] = useState<Recovery | null>(() => readRecovery(initial.id));
  const [localAvailable, setLocalAvailable] = useState(true);
  const [uploads, setUploads] = useState<UploadItem[]>([]); const uploadQueue = useRef<UploadItem[]>([]); const uploading = useRef(false);
  const removedPhotos = useRef<Photo[]>([]);
  const [photoBusy, setPhotoBusy] = useState(false); const [leaveDialog, setLeaveDialog] = useState(false);
  const [reloadDialog, setReloadDialog] = useState(false);
  const [advanced, setAdvanced] = useState(false); const [mapOpen, setMapOpen] = useState(false); const fileInput = useRef<HTMLInputElement>(null);
  // Bağlantılar yazılırken ayrı tutulur; forma (ve otomatik kayda) yalnız geçerli https adresi ya da boş değer gider.
  const [links, setLinks] = useState({ videoUrl: initial.draft?.videoUrl ?? initial.videoUrl ?? '', tourUrl: initial.draft?.tourUrl ?? initial.tourUrl ?? '' });
  const setLink = (field: LinkField, value: string) => { setLinks(previous => ({ ...previous, [field]: value })); change({ [field]: validLink(value.trim()) ? value.trim() : '' }); };
  // Adres "www…" ya da "http://" ile yazıldıysa alandan çıkınca https'e tamamlanır.
  const tidyLink = (field: LinkField) => { const value = links[field].trim(); const fixed = /^http:\/\//i.test(value) ? value.replace(/^http:/i, 'https:') : value && !/^[a-z][a-z0-9+.-]*:/i.test(value) ? `https://${value}` : value; if (fixed !== links[field]) setLink(field, fixed); };
  const linkError = (field: LinkField) => links[field].trim() && !validLink(links[field].trim()) ? linkMessage : undefined;
  const errorSummary = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  // Listeden yayınlanamayan ilan açıldığında eksikler gösterilir ve ilk eksik adıma gidilir.
  useEffect(() => {
    if (!checkOnOpen) return;
    const validation = validateListing(formRef.current); const keys = Object.keys(validation);
    if (!keys.length) return;
    setErrors(validation); setStep(keys.includes('photos') ? 0 : keys.some(key => key !== 'reviewed') ? 1 : 2);
  }, [checkOnOpen]);
  const cleanRemovedPhotos = useCallback(async () => {
    const pending = [...removedPhotos.current];
    for (const photo of pending) {
      if (formRef.current.photos.some(item => item.id === photo.id)) continue;
      try { await adminApi.removePhoto(photo.id); removedPhotos.current = removedPhotos.current.filter(item => item.id !== photo.id); }
      catch (error) { if (!(error instanceof ApiError && (error.status === 409 || error.status === 404))) notify('Fotoğraf ilandan çıkarıldı; depolama temizliği tamamlanamadı. Veri yedeği ve alan kullanımını kontrol edin.', 'info'); }
    }
  }, [notify]);
  const change = useCallback((patch: Partial<Listing>) => {
    const previous = formRef.current; const next = { ...previous, ...patch };
    // Başlık kullanıcı tarafından yazılmadıkça bilgilerden otomatik üretilir.
    if (!('title' in patch) && (!previous.title.trim() || previous.title === suggestTitle(previous))) next.title = suggestTitle(next);
    formRef.current = next; setForm(next); revision.current++;
    setSaveState('dirty'); setSaveError(''); setLocalAvailable(writeRecovery(next, version.current));
    setErrors(errors => { const nextErrors = { ...errors }; for (const key of Object.keys(patch)) delete nextErrors[key]; if ('needsReview' in patch) delete nextErrors.reviewed; if (next.title !== previous.title) delete nextErrors.title; return nextErrors; });
  }, []);
  const save = useCallback(async (): Promise<AdminListing | null> => {
    if (inFlight.current) return inFlight.current;
    if (savedRevision.current === revision.current) return recordRef.current;
    if (conflict) return null;
    const requestRevision = revision.current; const snapshot = { ...formRef.current };
    setSaveState('saving'); setSaveError('');
    const promise = (async () => {
      try {
        const result = await adminApi.save(initial.id, snapshot, version.current);
        version.current = result.listing.version; recordRef.current = result.listing;
        savedRevision.current = requestRevision; onSaved(result.listing);
        if (mounted.current) {
          if (revision.current === requestRevision) { setSaveState('saved'); clearRecovery(initial.id); }
          else { setSaveState('dirty'); writeRecovery(formRef.current, version.current); }
        }
        void cleanRemovedPhotos(); return result.listing;
      } catch (error) {
        if (mounted.current) { setSaveState('failed'); setSaveError(errorMessage(error)); if (error instanceof ApiError && error.status === 409) setConflict(true); }
        return null;
      } finally { inFlight.current = null; }
    })();
    inFlight.current = promise; return promise;
  }, [initial.id, conflict, onSaved, cleanRemovedPhotos]);
  useEffect(() => { if (revision.current === savedRevision.current || conflict) return; const timer = setTimeout(() => { void save(); }, 1000); return () => clearTimeout(timer); }, [form, conflict, save]);
  useEffect(() => { const before = (event: BeforeUnloadEvent) => { if (revision.current !== savedRevision.current || uploading.current) { event.preventDefault(); event.returnValue = ''; } }; const online = () => { if (!conflict) void save(); }; window.addEventListener('beforeunload', before); window.addEventListener('online', online); return () => { window.removeEventListener('beforeunload', before); window.removeEventListener('online', online); }; }, [save, conflict]);
  const saveLatest = async () => {
    let result = await save();
    if (result && revision.current !== savedRevision.current) result = await save();
    return result;
  };
  const close = async () => {
    if (uploading.current) { notify('Fotoğrafların yüklenmesini bekleyin veya başarısız dosyaları kaldırın.', 'info'); return; }
    setClosing(true); const result = await saveLatest(); setClosing(false);
    if (result) onClose(); else setLeaveDialog(true);
  };
  const skip = async () => {
    if (uploading.current) { notify('Fotoğrafların yüklenmesini bekleyin.', 'info'); return; }
    setClosing(true); const result = await saveLatest(); setClosing(false);
    if (result) onClose('skipped'); else setLeaveDialog(true);
  };
  const startUploads = async () => {
    if (uploading.current) return; uploading.current = true; setPhotoBusy(true);
    while (uploadQueue.current.length && mounted.current) {
      const item = uploadQueue.current.shift()!;
      const update = (status: UploadItem['status'], error?: string) => { if (mounted.current) setUploads(items => items.map(previous => previous.id === item.id ? { ...previous, status, error } : previous)); };
      try {
        if (storage?.blocked) throw new Error('Fotoğraf alanınız dolu. Önce gereksiz fotoğrafları temizleyin.');
        update('preparing'); const file = await preparePhoto(item.file); update('uploading');
        const result = await adminApi.upload(initial.id, file);
        if (!mounted.current) break;
        change({ photos: [...formRef.current.photos, { ...result.photo, alt: formRef.current.title || 'Gayrimenkul fotoğrafı' }] }); update('done');
      } catch (error) { update('failed', errorMessage(error)); }
    }
    uploading.current = false; if (mounted.current) setPhotoBusy(false);
  };
  const addFiles = (files: FileList | File[]) => {
    if (storage?.blocked) { notify('Fotoğraf depolama sınırına ulaşıldı.', 'error'); return; }
    const total = formRef.current.photos.length + uploads.filter(item => item.status !== 'done').length;
    const selected = Array.from(files).slice(0, Math.max(0, 12 - total));
    if (selected.length < files.length) notify('Bir ilana en fazla 12 fotoğraf ekleyebilirsiniz.', 'info');
    const entries = selected.map(file => ({ id: crypto.randomUUID(), file, status: 'waiting' as const }));
    setUploads(items => [...items, ...entries]); uploadQueue.current.push(...entries); void startUploads();
  };
  const movePhoto = (index: number, target: number) => {
    const photos = [...formRef.current.photos]; if (target < 0 || target >= photos.length) return;
    const [photo] = photos.splice(index, 1); photos.splice(target, 0, photo); change({ photos });
  };
  const publish = async () => {
    // Yayın düğmesi son adımdaki önizlemenin altında; “Kontrol ettim, yayınla” onayı da verir.
    if (formRef.current.needsReview) change({ needsReview: false });
    const validation = validateListing(formRef.current);
    for (const field of ['videoUrl', 'tourUrl'] as const) if (linkError(field)) { validation[field] = `${field === 'videoUrl' ? 'Tanıtım videosu' : 'Sanal tur'} bağlantısını düzeltin ya da silin.`; setAdvanced(true); }
    setErrors(validation);
    if (Object.keys(validation).length) { setTimeout(() => errorSummary.current?.focus(), 0); return; }
    if (photoBusy) { notify('Yayınlamadan önce fotoğraf yüklemesinin tamamlanmasını bekleyin.', 'info'); return; }
    if (uploads.some(item => item.status === 'failed')) { notify('Başarısız fotoğrafları tekrar deneyin veya listeden kaldırın.', 'error'); setStep(0); return; }
    setPublishing(true);
    try {
      const saved = await saveLatest(); if (!saved) return;
      const result = await adminApi.action(saved, 'publish'); recordRef.current = result.listing; version.current = result.listing.version;
      onSaved(result.listing); clearRecovery(initial.id); await cleanRemovedPhotos(); notify(queue ? 'İlan yayınlandı. Sıradaki ilan açılıyor.' : 'İlanınız yayınlandı. Sitede görüntüleyebilirsiniz.'); onClose('published');
    } catch (error) { setSaveError(errorMessage(error)); if (error instanceof ApiError && error.status === 409) setConflict(true); notify(errorMessage(error), 'error'); } finally { setPublishing(false); }
  };
  const setNumber = (field: keyof Listing, value: string, nullable = false) => change({ [field]: value === '' && nullable ? null : value === '' ? 0 : Number(value) });
  const fieldError = (name: string) => errors[name];
  return <div className="ad-editor"><div className="ad-editor-heading"><button className="ad-text-button" onClick={close} disabled={publishing || closing || photoBusy}><ArrowLeft size={18} />İlanlara dön</button><div className={`ad-save-status ad-save-${saveState}`} aria-live="polite">{saveState === 'saving' ? <LoaderCircle className="ad-spin" size={16} /> : saveState === 'saved' ? <CloudCheck size={16} /> : saveState === 'failed' ? <CircleAlert size={16} /> : <Pencil size={15} />}{saveState === 'saved' ? 'Taslak kaydedildi' : saveState === 'saving' ? 'Kaydediliyor…' : saveState === 'failed' ? 'Kaydedilemedi' : 'Kaydedilmemiş değişiklik'}</div></div>{queue && <div className="ad-queue-bar" role="status"><span><strong>Sırayla kontrol</strong>{queue.position} / {queue.total}</span><button className="ad-text-button" onClick={skip} disabled={publishing || closing || photoBusy}>Bu ilanı atla<ArrowRight size={15} /></button></div>}<div className="ad-page-heading ad-editor-title"><div><span className="ad-eyebrow">PORTFÖYÜNÜZE YENİ BİR HİKÂYE</span><h1>{initial.title ? 'İlanı düzenle' : 'Yeni ilan ekle'}<span>.</span></h1><p>Üç küçük adım. Yayınlamaya hazır, özenli bir ilan.</p></div><Status status={recordRef.current.status} /></div>
    {initial.status === 'published' && <div className="ad-banner ad-banner-info"><Eye size={18} /><span>Yaptığınız değişiklikler taslak olarak saklanır. <strong>Değişiklikleri yayınla</strong> düğmesine basana kadar sitedeki ilan aynı kalır.</span></div>}
    {recovery && <div className="ad-recovery"><div><CircleAlert size={20} /><span><strong>Bu cihazda kaydedilmemiş bir kopya var.</strong><small>{dateLabel(recovery.savedAt)} · {recovery.version !== version.current ? 'Sunucu sürümü değişmiş. Yerel metni indirip karşılaştırın.' : 'İsterseniz kaldığınız yerden devam edebilirsiniz.'}</small></span></div><div className="ad-inline-actions"><button className="ad-text-button" onClick={() => downloadJson(recovery, `ilan-${initial.id}-yerel-kopya.json`)}>Yerel kopyayı indir</button>{recovery.version === version.current && <button className="ad-button ad-button-small" onClick={() => { change(recovery.listing); setRecovery(null); }}>Değişiklikleri geri al</button>}<button className="ad-text-button" onClick={() => { clearRecovery(initial.id); setRecovery(null); }}>Bu kopyayı kaldır</button></div></div>}
    {!localAvailable && <div className="ad-banner ad-banner-warning">Tarayıcının yerel saklama alanı kullanılamıyor. Kaydedilmemiş değişiklikler cihazda korunamayabilir; bağlantı gelmeden sayfayı kapatmayın.</div>}
    {saveError && <div className="ad-banner ad-banner-error" role="alert"><CircleAlert size={20} /><span>{saveError}</span><div className="ad-inline-actions">{conflict ? <><button className="ad-text-button" onClick={() => downloadJson({ listing: formRef.current, version: version.current }, `ilan-${initial.id}-kaydedilmemis.json`)}>Yerel kopyayı indir</button><button className="ad-text-button" onClick={() => setReloadDialog(true)}>Güncel sürümü yükle</button></> : <button className="ad-text-button" onClick={() => { void save(); }}>Tekrar kaydet</button>}</div></div>}
    <div className="ad-stepper" aria-label="İlan ekleme adımları">{[{ name: 'Fotoğraflar', detail: 'İlk izlenim' }, { name: 'İlan bilgileri', detail: 'Temel detaylar' }, { name: 'Önizle ve yayınla', detail: 'Son bir kontrol' }].map((item, index) => <button key={item.name} className={`${step === index ? 'active' : ''} ${step > index ? 'complete' : ''}`} aria-current={step === index ? 'step' : undefined} onClick={() => setStep(index)} disabled={publishing}><b>{step > index ? <Check size={17} /> : index + 1}</b><span><strong>{item.name}</strong><small>{item.detail}</small></span>{index < 2 && <ChevronRight size={17} />}</button>)}</div>
    {Object.keys(errors).length > 0 && <div className="ad-error-summary" ref={errorSummary} tabIndex={-1} role="alert"><h2>Yayınlamadan önce birkaç eksik bilgiyi tamamlayın.</h2><ul>{Object.entries(errors).map(([key, error]) => <li key={key}><button onClick={() => { setStep(key === 'photos' ? 0 : key === 'reviewed' ? 2 : 1); setTimeout(() => document.getElementById(`listing-${key}`)?.focus(), 40); }}>{error}</button></li>)}</ul></div>}
    <fieldset className="ad-editor-fieldset" disabled={publishing}><AnimatePresence mode="wait" initial={false}><motion.section key={step} className="ad-editor-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
      {step === 0 ? <><div className="ad-section-heading"><div><h2>Fotoğraflar, hikâyeyi anlatır.</h2><p>En iyi fotoğrafınızı kapak yapın. Fotoğraflar yüklenmeden önce küçültülür ve konum bilgileri temizlenir.</p></div><span className="ad-count">{form.photos.length}/12 fotoğraf</span></div><input ref={fileInput} type="file" multiple accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" hidden onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} /><button id="listing-photos" className={`ad-dropzone ${storage?.blocked ? 'ad-disabled' : ''}`} type="button" disabled={storage?.blocked || form.photos.length >= 12} onClick={() => fileInput.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (!storage?.blocked) addFiles(e.dataTransfer.files); }} aria-describedby={errors.photos ? 'listing-photos-error' : undefined}><span className="ad-upload-icon"><ImagePlus size={27} /></span><strong>Fotoğrafları sürükleyin veya seçin</strong><span>Telefonunuzdan birden fazla fotoğraf ekleyebilirsiniz.</span><small>JPG, PNG, WebP, HEIC · en fazla 12 fotoğraf · 35 MB/dosya</small></button>{errors.photos && <p id="listing-photos-error" className="ad-field-error">{errors.photos}</p>}
      {uploads.some(item => item.status !== 'done') && <div className="ad-upload-list" aria-live="polite">{uploads.filter(item => item.status !== 'done').map(item => <div className={`ad-upload-item ${item.status === 'failed' ? 'failed' : ''}`} key={item.id}>{item.status === 'failed' ? <CircleAlert size={17} /> : <LoaderCircle className="ad-spin" size={17} />}<span><strong>{item.file.name}</strong><small>{item.error || (item.status === 'waiting' ? 'Sırada bekliyor' : item.status === 'preparing' ? 'Fotoğraf hazırlanıyor…' : 'Yükleniyor…')}</small></span>{item.status === 'failed' && <><button className="ad-text-button" onClick={() => { const retry = { ...item, status: 'waiting' as const, error: undefined }; setUploads(items => items.map(previous => previous.id === item.id ? retry : previous)); uploadQueue.current.push(retry); void startUploads(); }}>Yeniden dene</button><button className="ad-icon-button" aria-label={`${item.file.name} dosyasını listeden kaldır`} onClick={() => setUploads(items => items.filter(previous => previous.id !== item.id))}><X size={17} /></button></>}</div>)}</div>}
      {form.photos.length > 0 && <div className="ad-photo-grid">{form.photos.map((photo, index) => <div className="ad-photo-card" key={photo.id}><div className="ad-photo-image"><img src={photo.thumbnail || photo.url} alt={photo.alt || `İlan fotoğrafı ${index + 1}`} width="360" height="260" loading="lazy" />{index === 0 && <span><Star size={12} fill="currentColor" />Kapak fotoğrafı</span>}<button type="button" className="ad-photo-remove" aria-label={`${index + 1}. fotoğrafı kaldır`} onClick={() => { removedPhotos.current.push(photo); change({ photos: form.photos.filter(item => item.id !== photo.id) }); }}><X size={15} /></button></div><div className="ad-photo-controls"><span>{String(index + 1).padStart(2, '0')}</span><button type="button" className="ad-text-button" disabled={index === 0} onClick={() => movePhoto(index, 0)}>{index === 0 ? 'Kapak' : 'Kapak yap'}</button><button type="button" className="ad-icon-button" disabled={index === 0} onClick={() => movePhoto(index, index - 1)} aria-label={`${index + 1}. fotoğrafı sola taşı`}><ChevronLeft size={17} /></button><button type="button" className="ad-icon-button" disabled={index === form.photos.length - 1} onClick={() => movePhoto(index, index + 1)} aria-label={`${index + 1}. fotoğrafı sağa taşı`}><ChevronRight size={17} /></button></div><label className="ad-photo-alt"><span className="ad-sr-only">{index + 1}. fotoğrafın açıklaması</span><input value={photo.alt} maxLength={160} placeholder="Fotoğraf açıklaması (ör. geniş salon)" onChange={e => change({ photos: form.photos.map(item => item.id === photo.id ? { ...item, alt: e.target.value } : item) })} /></label></div>)}</div>}<div className="ad-tip"><ShieldCheck size={18} /><p><strong>Küçük bir öneri:</strong> Aydınlık, yatay ve net fotoğraflar ilanınıza daha iyi bir başlangıç sağlar. İlk fotoğraf, sitedeki kapak fotoğrafınızdır.</p></div></> : step === 1 ? <><div className="ad-section-heading"><div><h2>Doğru bilgiler, doğru eşleşme.</h2><p>Seçeneklere dokunun; başlık ve açıklama bilgilerinizden hazırlanır.</p></div><span className="ad-required-note">* Zorunlu alan</span></div><div className="ad-form-grid"><div className="ad-full"><ChoiceField name="listing-transaction" label="İlan türü" value={form.transaction} onChange={value => change({ transaction: value as Listing['transaction'], period: value === 'rent' ? 'month' : 'total' })} options={transactionLabels} required /></div><div className="ad-full"><ChoiceField name="listing-propertyType" label="Gayrimenkul türü" value={form.propertyType} onChange={value => change({ propertyType: value as PropertyType, ...(value === 'land' ? { rooms: '', bathrooms: null, netArea: null, floor: '', buildingAge: '' } : {}) })} options={propertyLabels} required /></div>{form.propertyType !== 'land' && <div className="ad-full"><ChoiceField name="listing-rooms" label="Oda sayısı" value={form.rooms} onChange={rooms => change({ rooms })} options={Object.fromEntries([...roomOptions, ...(form.rooms && !roomOptions.includes(form.rooms) ? [form.rooms] : [])].map(room => [room, room === '1+0' ? 'Stüdyo' : room === '7+' ? '7 ve üzeri' : room]))} required={roomsRequired(form.propertyType)} error={fieldError('rooms')} /></div>}{form.transaction === 'rent' && <div className="ad-full"><ChoiceField name="listing-period" label="Kiralama dönemi" value={form.period} onChange={value => change({ period: value as Listing['period'] })} options={{ day: 'Günlük', week: 'Haftalık', month: 'Aylık', year: 'Yıllık' }} required /></div>}{isSeasonal(form) && <><div className="ad-full ad-help">Günlük ve haftalık kiralıklar sitede “Dönemlik kiralık” bölümünde görünür. Aşağıdaki üç bilgi isteğe bağlıdır; doldurursanız ilanda gösterilir.</div><InputField name="listing-guests" label="Kaç kişilik" value={form.guests ?? ''} type="number" min={1} inputMode="numeric" onChange={value => setNumber('guests', value, true)} placeholder="Örn. 8" /><InputField name="listing-minNights" label="En az kaç gece" value={form.minNights ?? ''} type="number" min={1} inputMode="numeric" onChange={value => setNumber('minNights', value, true)} placeholder="Örn. 3" /><div className="ad-full"><ChoiceField name="listing-pool" label="Havuz" value={form.pool ?? ''} onChange={value => change({ pool: value as Listing['pool'] })} options={poolLabels} /></div></>}<div className="ad-form-divider ad-full"><MapPin size={17} /><h3>Konum</h3></div><InputField name="listing-district" label="İlçe" value={form.district} onChange={district => change({ district })} required error={fieldError('district')} placeholder="Konyaaltı" list="ad-district-options" autoComplete="off" /><InputField name="listing-neighborhood" label="Mahalle" value={form.neighborhood} onChange={neighborhood => change({ neighborhood })} required error={fieldError('neighborhood')} placeholder="Arapsuyu" list="ad-neighborhood-options" autoComplete="off" /><InputField name="listing-city" label="İl" value={form.city} onChange={city => change({ city })} required error={fieldError('city')} placeholder="Antalya" /><datalist id="ad-district-options">{antalyaDistricts.map(name => <option key={name} value={name} />)}</datalist><datalist id="ad-neighborhood-options">{neighborhoods.map(name => <option key={name} value={name} />)}</datalist><div className="ad-full ad-help">Sitede yalnızca mahalle düzeyinde konum gösterilir. Açıklamaya kapı numarası veya özel müşteri bilgileri yazmayın.</div><div className="ad-full"><button type="button" className="ad-advanced-toggle" aria-expanded={mapOpen} aria-controls="location-picker" onClick={() => setMapOpen(!mapOpen)}><MapPin size={17} /><span>{form.latitude !== undefined ? 'Haritadaki konum işaretli' : 'Haritada işaretle'}</span><small>İsteğe bağlı</small></button>{mapOpen && <div id="location-picker" className="ad-advanced-fields"><Suspense fallback={<Spinner label="Harita yükleniyor" />}><LocationPicker value={{ latitude: form.latitude, longitude: form.longitude }} place={[form.neighborhood, form.district, form.city].filter(Boolean).join(', ')} onChange={point => change(point)} /></Suspense></div>}</div><div className="ad-form-divider ad-full"><Home size={17} /><h3>Alan ve fiyat</h3></div><InputField name="listing-grossArea" label={form.propertyType === 'land' ? 'Arsa alanı (m²)' : 'Brüt alan (m²)'} value={form.grossArea || ''} type="number" min={1} inputMode="numeric" onChange={value => setNumber('grossArea', value)} required error={fieldError('grossArea')} />{form.propertyType !== 'land' ? <InputField name="listing-netArea" label="Net alan (m²)" value={form.netArea} type="number" min={1} inputMode="numeric" onChange={value => setNumber('netArea', value, true)} error={fieldError('netArea')} /> : <span />}<InputField name="listing-price" label={`Fiyat (${form.currency})${form.transaction === 'rent' ? ` ${periodLabels[form.period]}` : ''}`} value={formatPriceInput(form.price)} inputMode="numeric" autoComplete="off" onChange={value => change({ price: parsePrice(value) ?? 0 })} error={fieldError('price')} placeholder="Örn. 14.500.000" /><SelectField name="listing-currency" label="Para birimi" value={form.currency} onChange={value => change({ currency: value as Listing['currency'] })} options={{ TRY: 'Türk lirası (₺)', EUR: 'Euro (€)', USD: 'ABD doları ($)' }} /><div className="ad-full"><label className="ad-checkbox"><input type="checkbox" checked={form.price === null} onChange={event => change({ price: event.target.checked ? null : 0 })} />Fiyat yazmayın, “Fiyat için görüşelim” gösterilsin</label></div><div className="ad-form-divider ad-full"><Pencil size={16} /><h3>Başlık ve açıklama</h3></div><div className="ad-full"><InputField name="listing-title" label="İlan başlığı" value={form.title} onChange={title => change({ title })} required maxLength={160} error={fieldError('title')} hint={form.title && form.title === suggestTitle(form) ? 'Seçimlerinizden otomatik oluşturuldu. Değiştirirseniz sizin yazdığınız kalır.' : undefined} /></div><div className="ad-full"><InputField name="listing-description" label="İlan açıklaması" value={form.description} onChange={description => change({ description })} multiline required maxLength={12000} error={fieldError('description')} placeholder="Gayrimenkulün öne çıkan yönlerini, çevresini ve varsa ödeme koşullarını anlatın…" hint={`${form.description.length.toLocaleString('tr-TR')}/12.000 karakter · Yazdıklarınız düz metin olarak gösterilir.`} />{!form.description.trim() && <button type="button" className="ad-button ad-button-secondary ad-button-small ad-suggest-button" onClick={() => change({ description: suggestDescription(form) })}><Sparkles size={15} />Hazır açıklamayla başla</button>}</div><div className="ad-full"><button type="button" className="ad-advanced-toggle" aria-expanded={advanced} aria-controls="advanced-fields" onClick={() => setAdvanced(!advanced)}><Plus size={17} /><span>Diğer detaylar ve özellikler</span><small>İsteğe bağlı</small></button>{advanced && <div id="advanced-fields" className="ad-advanced-fields"><div className="ad-form-grid">{form.propertyType !== 'land' && <><InputField name="listing-bathrooms" label="Banyo sayısı" value={form.bathrooms} type="number" min={0} inputMode="numeric" onChange={value => setNumber('bathrooms', value, true)} /><InputField name="listing-floor" label="Bulunduğu kat" value={form.floor} onChange={floor => change({ floor })} placeholder="Örn. 3 veya bahçe katı" /><InputField name="listing-buildingAge" label="Bina yaşı" value={form.buildingAge} onChange={buildingAge => change({ buildingAge })} placeholder="Örn. 5 veya sıfır bina" /></>}<div className="ad-full"><span className="ad-field-label">Öne çıkan özellikler</span><div className="ad-feature-options">{[...new Set([...featureOptions, ...form.features])].map(feature => <label className={`ad-feature-option ${form.features.includes(feature) ? 'selected' : ''}`} key={feature}><input type="checkbox" checked={form.features.includes(feature)} onChange={e => change({ features: e.target.checked ? [...form.features, feature] : form.features.filter(item => item !== feature) })} />{form.features.includes(feature) && <Check size={13} />}{feature}</label>)}</div></div><InputField name="listing-videoUrl" label="Tanıtım videosu bağlantısı" value={links.videoUrl} type="url" inputMode="url" autoComplete="off" maxLength={500} onChange={value => setLink('videoUrl', value)} onBlur={() => tidyLink('videoUrl')} error={linkError('videoUrl')} placeholder="https://www.youtube.com/watch?v=…" hint="YouTube veya Vimeo’daki videonun adresini yapıştırın." /><InputField name="listing-tourUrl" label="Sanal tur bağlantısı" value={links.tourUrl} type="url" inputMode="url" autoComplete="off" maxLength={500} onChange={value => setLink('tourUrl', value)} onBlur={() => tidyLink('tourUrl')} error={linkError('tourUrl')} placeholder="https://my.matterport.com/show/?m=…" hint="Örneğin Matterport turunun adresini yapıştırın." /><div className="ad-full"><label className="ad-checkbox ad-toggle-row"><input id="listing-investment" type="checkbox" checked={!!form.investment} onChange={event => change({ investment: event.target.checked })} /><span><strong>Yatırıma uygun</strong><small>İşaretlerseniz ilan sitedeki “Yatırım” bölümünde de görünür.</small></span></label></div></div></div>}</div><TranslationsField listingId={initial.id} form={form} onChange={change} /></div></> : <><div className="ad-section-heading"><div><h2>Son bir bakış. Sonra yayındasınız.</h2><p>Fotoğrafı, fiyatı ve konumu kontrol edin. Hazır olduğunuzda ilanınızı yayınlayın.</p></div></div><div className="ad-preview-layout"><div className="ad-property-preview">{form.photos[0] ? <img className="ad-property-preview-image" src={form.photos[0].url} alt={form.photos[0].alt || form.title} width="800" height="500" /> : <div className="ad-preview-empty-image"><ImagePlus size={40} /><span>Henüz fotoğraf eklenmedi</span></div>}<div className="ad-property-preview-content"><span className="ad-eyebrow">{transactionLabels[form.transaction]} {propertyLabels[form.propertyType]}</span><h3>{form.title || 'İlan başlığınız burada görünecek'}</h3><p className="ad-listing-location"><MapPin size={15} />{[form.neighborhood, form.district, form.city].filter(Boolean).join(', ') || 'Konum bilgisi ekleyin'}</p><div className="ad-preview-price">{priceLabel(form)}<small>{periodLabels[form.period]}</small></div><div className="ad-preview-facts"><span>{form.grossArea || '—'} m² brüt</span>{form.netArea && <span>{form.netArea} m² net</span>}{form.propertyType !== 'land' && <span>{form.rooms || '—'} oda</span>}<span>{form.photos.length} fotoğraf</span>{form.videoUrl && <span>Tanıtım videosu var</span>}{form.tourUrl && <span>Sanal tur var</span>}{form.investment && <span>Yatırıma uygun</span>}</div><p className="ad-preview-description">{form.description || 'Gayrimenkul açıklaması burada görünecek.'}</p><div className="ad-feature-options">{form.features.map(item => <span className="ad-feature-preview" key={item}>{item}</span>)}</div></div></div><aside className="ad-publish-checklist"><h3>Yayın kontrolü</h3>{[{ ok: form.photos.length > 0, label: 'En az bir fotoğraf eklendi', go: 0 }, { ok: form.title.trim().length >= 8, label: 'Açıklayıcı bir başlık yazıldı', go: 1 }, { ok: !!form.city && !!form.district && !!form.neighborhood, label: 'Konum bilgileri tamamlandı', go: 1 }, { ok: form.grossArea > 0 && (!roomsRequired(form.propertyType) || !!form.rooms), label: 'Temel özellikler eklendi', go: 1 }, { ok: form.price === null || form.price > 0, label: 'Fiyat tercihi belirlendi', go: 1 }, { ok: form.description.trim().length >= 30, label: 'İlan açıklaması yazıldı', go: 1 }].map(item => <button className={item.ok ? 'ok' : ''} key={item.label} onClick={() => setStep(item.go)}>{item.ok ? <Check size={16} /> : <CircleAlert size={16} />}<span>{item.label}</span></button>)}{form.sourceUrl && <div className="ad-source"><small>İLK VERİ KAYNAĞI</small><a href={/^https?:\/\//i.test(form.sourceUrl) ? form.sourceUrl : '#'} target="_blank" rel="noreferrer">Kaynak ilanı görüntüle<ExternalLink size={13} /></a><p>Kaynakta farklı fiyatlar bulunabilir. Fiyatı, dönemi ve güncel durumu ofis kayıtlarından doğrulayın.</p></div>}<label className="ad-checkbox ad-review-checkbox"><input id="listing-reviewed" type="checkbox" checked={!form.needsReview} onChange={event => change({ needsReview: !event.target.checked })} aria-invalid={!!errors.reviewed} /><span>İlan bilgilerini, fiyatı, kiralama dönemini ve fotoğrafları kontrol ettim.</span></label>{errors.reviewed && <p className="ad-field-error">{errors.reviewed}</p>}<p className="ad-help">Yayınlandığında ziyaretçiler ilanı görebilir ve sizinle iletişime geçebilir.</p></aside></div></>}
    </motion.section></AnimatePresence></fieldset><div className="ad-editor-bottom"><button className="ad-button ad-button-secondary" onClick={() => step > 0 ? setStep(step - 1) : void close()} disabled={publishing || closing || photoBusy}><ArrowLeft size={17} />{step === 0 ? 'Taslakta bırak ve dön' : 'Geri'}</button><div className="ad-inline-actions"><button className="ad-text-button ad-save-manual" onClick={() => { void save(); }} disabled={publishing || saveState === 'saving' || conflict}><Save size={16} />Taslağı kaydet</button>{step < 2 ? <button className="ad-button" onClick={() => setStep(step + 1)} disabled={publishing}>Devam et<ArrowRight size={17} /></button> : <button className="ad-button" onClick={publish} disabled={publishing || photoBusy || conflict}>{publishing ? <Spinner label="Yayınlanıyor" /> : <><Check size={18} />{form.needsReview ? 'Kontrol ettim, yayınla' : initial.status === 'published' ? 'Değişiklikleri yayınla' : 'İlanı yayınla'}</>}</button>}</div></div>
    <Modal open={leaveDialog} onClose={() => setLeaveDialog(false)} title="Değişiklikler henüz kaydedilmedi" description="Metin ve fotoğraf bağlantıları bu cihazda kurtarma kopyası olarak tutuluyor. Fotoğraf dosyalarının kendisi cihaz yedeğine dahil edilmez."><div className="ad-dialog-actions"><button className="ad-button ad-button-secondary" onClick={() => setLeaveDialog(false)}>Düzenlemeye devam et</button><button className="ad-button" onClick={() => { setLeaveDialog(false); onClose(); }}>Yerel kopyayı koru ve çık</button></div></Modal>
    <Modal open={reloadDialog} onClose={() => setReloadDialog(false)} title="Sunucudaki güncel sürümü yükle" description="Kaydedilmemiş değişikliklerinizi önce indirin. Yerel kurtarma kopyası cihazda korunacak; düzenleyicide sunucunun son sürümü açılacak."><div className="ad-dialog-actions"><button className="ad-button ad-button-secondary" onClick={() => downloadJson({ listing: formRef.current, version: version.current }, `ilan-${initial.id}-yerel-kopya.json`)}>Yerel kopyayı indir</button><button className="ad-button" onClick={async () => { try { const result = await adminApi.listings(); const current = result.listings.find(item => item.id === initial.id); if (!current) throw new Error('İlan bulunamadı.'); const data = editData(current); recordRef.current = current; version.current = current.version; revision.current = 0; savedRevision.current = 0; formRef.current = data; setForm(data); setLinks({ videoUrl: data.videoUrl ?? '', tourUrl: data.tourUrl ?? '' }); setSaveState('saved'); setConflict(false); setSaveError(''); setRecovery(readRecovery(initial.id)); onSaved(current); setReloadDialog(false); } catch (error) { notify(errorMessage(error), 'error'); } }}>Güncel sürümü yükle</button></div></Modal>
  </div>;
}

const inquiryKinds: Record<Inquiry['kind'], string> = { callback: 'Geri arama talebi', valuation: 'Gayrimenkul değerleme talebi', land: 'Arsa sahibi başvurusu (kat karşılığı)', renewal: 'Kentsel dönüşüm başvurusu' };
// Formlar ek bilgileri kısa anahtarlarla gönderebilir; tanınmayan anahtar olduğu gibi gösterilir.
const detailLabels: Record<string, string> = { fullName: 'Ad soyad', phone: 'Telefon', applicationType: 'Başvuru türü', city: 'İl', district: 'İlçe', neighborhood: 'Mahalle', neighbourhood: 'Mahalle', address: 'Adres', block: 'Ada', parcel: 'Parsel', area: 'Alan (m²)', areaM2: 'Alan (m²)', zoning: 'İmar durumu', hasBuilding: 'Üzerinde yapı', deed: 'Tapu durumu', owners: 'Malik sayısı', units: 'Bağımsız bölüm sayısı', floors: 'Kat sayısı', buildingAge: 'Bina yaşı', riskReport: 'Riskli yapı raporu', expectation: 'Beklenti', note: 'Not' };
const detailValues: Record<string, string> = { katKarsiligi: 'Kat karşılığı', kentselDonusum: 'Kentsel dönüşüm', degerleme: 'Değerleme', unknown: 'Bilmiyorum', residential: 'Konut', commercial: 'Ticari', mixed: 'Karma', other: 'Diğer', yes: 'Evet', no: 'Hayır' };
function InquiriesPanel({ inquiries, listings, onUpdated, notify }: { inquiries: Inquiry[]; listings: AdminListing[]; onUpdated: (id: string, status: Inquiry['status']) => void; notify: (text: string, kind?: Notice['kind']) => void }) {
  const [filter, setFilter] = useState('new'); const [busy, setBusy] = useState('');
  const visible = inquiries.filter(item => filter === 'all' || item.status === filter).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const labels = { new: 'Yeni', contacted: 'İletişime geçildi', closed: 'Tamamlandı' };
  return <><div className="ad-page-heading"><div><span className="ad-eyebrow">İLK TEMAS, YENİ BİR BAŞLANGIÇ</span><h1>Talepler<span>.</span></h1><p>Geri dönüş bekleyen kişileri görün, görüşmeleri kolayca takip edin.</p></div><span className="ad-count">{inquiries.filter(item => item.status === 'new').length} yeni talep</span></div><section className="ad-list-section"><div className="ad-filter-tabs">{Object.entries({ new: 'Yeni talepler', contacted: 'İletişime geçildi', closed: 'Tamamlandı', all: 'Tümü' }).map(([key, label]) => <button className={filter === key ? 'active' : ''} aria-pressed={filter === key} key={key} onClick={() => setFilter(key)}>{label}</button>)}</div>{visible.length === 0 ? <div className="ad-empty"><MessageSquare size={38} /><h3>Burada henüz bir talep yok.</h3><p>Siteden gelen geri arama, değerleme, arsa ve kentsel dönüşüm başvuruları burada görünür.</p></div> : <div className="ad-inquiries">{visible.map(item => <article className="ad-inquiry" key={item.id}><div className="ad-inquiry-top"><div className="ad-inquiry-avatar">{item.name.slice(0, 1).toLocaleUpperCase('tr-TR')}</div><div><h2>{item.name}</h2><span>{inquiryKinds[item.kind] ?? 'Talep'} · {dateLabel(item.createdAt)}{item.locale && item.locale !== 'tr' && ` · ${item.locale === 'en' ? 'İngilizce' : 'Farsça'} sayfadan`}</span></div><span className={`ad-inquiry-status ad-inquiry-${item.status}`}>{labels[item.status]}</span></div>{item.listingId && <div className="ad-inquiry-property"><Home size={15} />{listings.find(listing => listing.id === item.listingId)?.title || 'İlgili ilan'}</div>}{item.details && Object.keys(item.details).length > 0 && <dl className="ad-inquiry-details">{Object.entries(item.details).map(([key, value]) => <div key={key}><dt>{detailLabels[key] ?? key}</dt><dd>{detailValues[value] ?? value}</dd></div>)}</dl>}<p className="ad-inquiry-message">{item.message || 'Açıklama eklenmemiş.'}</p><div className="ad-inquiry-actions"><a className="ad-button ad-button-secondary ad-button-small" href={`tel:${item.phone.replace(/[^+\d]/g, '')}`}><Phone size={15} />{item.phone}</a><a className="ad-button ad-button-secondary ad-button-small" href={whatsappUrl(item.phone, `Merhaba ${item.name}, KA EMLAK'a ilettiğiniz talep için size ulaşıyorum.`)} target="_blank" rel="noreferrer"><MessageSquare size={15} />WhatsApp</a><label className="ad-inquiry-select"><span className="ad-sr-only">{item.name} talep durumu</span><select value={item.status} disabled={busy === item.id} onChange={async event => { const status = event.target.value as Inquiry['status']; setBusy(item.id); try { await adminApi.updateInquiry(item.id, status); onUpdated(item.id, status); notify('Talep durumu güncellendi.'); } catch (error) { notify(errorMessage(error), 'error'); } finally { setBusy(''); } }}>{Object.entries(labels).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label></div></article>)}</div>}</section></>;
}

function SettingsPanel({ initial, onSaved, notify, storage }: { initial: OfficeSettings; onSaved: (value: OfficeSettings) => void; notify: (text: string, kind?: Notice['kind']) => void; storage: StorageUsage | null }) {
  const [values, setValues] = useState(initial); const [busy, setBusy] = useState(false); const [dirty, setDirty] = useState(false); const [error, setError] = useState('');
  useEffect(() => { setValues(initial); setDirty(false); }, [initial]);
  useEffect(() => { const before = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } }; window.addEventListener('beforeunload', before); return () => window.removeEventListener('beforeunload', before); }, [dirty]);
  const change = (key: keyof OfficeSettings, value: string) => { setValues(previous => ({ ...previous, [key]: value })); setDirty(true); };
  return <><div className="ad-page-heading"><div><span className="ad-eyebrow">GÜVENİN ARKASINDAKİ İSİM</span><h1>Ofis bilgileri<span>.</span></h1><p>Ziyaretçilerinizin sizi tanımasını ve kolayca ulaşmasını sağlayın.</p></div></div><div className="ad-settings-layout"><form className="ad-editor-panel" onSubmit={async event => { event.preventDefault(); setBusy(true); setError(''); try { const result = await adminApi.saveSettings(values); onSaved(result.settings); setDirty(false); notify('Ofis bilgileri güncellendi.'); } catch (error) { setError(errorMessage(error)); } finally { setBusy(false); } }}><div className="ad-section-heading"><div><h2>Ofis ve iletişim</h2><p>Buradaki değişiklikler kaydedildiğinde sitede görünür.</p></div></div>{error && <div className="ad-banner ad-banner-error" role="alert">{error}</div>}<fieldset disabled={busy} className="ad-editor-fieldset"><div className="ad-form-grid"><InputField name="office-name" label="Ofis adı" value={values.name} onChange={value => change('name', value)} required maxLength={100} /><InputField name="office-advisor" label="Danışman adı" value={values.advisor} onChange={value => change('advisor', value)} required maxLength={100} /><InputField name="office-phone" label="Telefon" type="tel" value={values.phone} onChange={value => change('phone', value)} required hint="Ülke koduyla yazın: +90…" /><InputField name="office-whatsapp" label="WhatsApp" type="tel" value={values.whatsapp} onChange={value => change('whatsapp', value)} required hint="Ülke koduyla yazın: +90…" /><InputField name="office-email" label="E-posta" type="email" value={values.email} onChange={value => change('email', value)} required /><InputField name="office-hours" label="Çalışma saatleri" value={values.hours} onChange={value => change('hours', value)} placeholder="Pazartesi–Cumartesi 09.00–18.00" /><div className="ad-full"><InputField name="office-address" label="Ofis adresi" value={values.address} onChange={value => change('address', value)} multiline required maxLength={400} /></div><div className="ad-full"><InputField name="office-about" label="Ofis hakkında" value={values.about} onChange={value => change('about', value)} multiline maxLength={4000} hint="Deneyiminizi, çalışma bölgenizi ve yaklaşımınızı kendi sözlerinizle anlatın." /></div><InputField name="office-instagram" label="Instagram bağlantısı" value={values.instagram} type="url" onChange={value => change('instagram', value)} placeholder="https://www.instagram.com/…" /><InputField name="office-license" label="Taşınmaz ticareti yetki belgesi no." value={values.licenseNumber} onChange={value => change('licenseNumber', value)} maxLength={60} /></div></fieldset><div className="ad-settings-save"><span className="ad-help">{dirty ? 'Kaydedilmemiş değişiklikleriniz var.' : 'Bilgileriniz güncel.'}</span><button className="ad-button" disabled={busy || !dirty}>{busy ? <Spinner label="Kaydediliyor" /> : <><Check size={18} />Değişiklikleri kaydet</>}</button></div></form><aside><div className="ad-settings-note"><ShieldCheck size={24} /><h3>Güven, doğru bilgilerle başlar.</h3><p>Telefon ve WhatsApp numaralarınızı ülke koduyla girin. Yönetici e-posta adresiniz bu formdan değiştirilmez.</p><a href="/iletisim" target="_blank" rel="noreferrer">İletişim sayfasını görüntüle<ExternalLink size={14} /></a></div>{storage && <div className="ad-storage-card"><h3>Fotoğraf alanı</h3><strong>{bytesLabel(storage.usedBytes)}<span> / {bytesLabel(storage.limitBytes)}</span></strong><progress value={storage.usedBytes} max={storage.limitBytes} aria-label="Fotoğraf depolama kullanımı" /><p>{storage.blocked ? 'Alan dolu. Gereksiz fotoğrafları temizleyin.' : storage.warning ? 'Sınıra yaklaşıyorsunuz.' : 'Yalnızca ihtiyaç duyduğunuz fotoğrafları saklayın.'}</p></div>}</aside></div></>;
}
