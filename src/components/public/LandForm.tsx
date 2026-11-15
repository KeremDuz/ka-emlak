import { useId, useRef, useState } from 'react';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import type { LandApplicationType, LandFormContent, LandFormFieldKey, LandZoning, YesNo } from '../../content/types';
import { direction } from '../../i18n/config';
import type { Locale } from '../../lib/types';

/** Arsa başvuru formu (kat karşılığı, kentsel dönüşüm, değerleme). Metinlerin tamamı src/content/arsa-formu.ts'ten gelir.
    officeOptions: ofise giden `details` değerleri hep Türkçe yazılsın diye Türkçe seçenek adları. */
interface Props {
  locale: Locale;
  content: LandFormContent;
  officeOptions: LandFormContent['options'];
  districts: string[];
  initialType: LandApplicationType;
  privacyHref: string;
  honeypotLabel: string;
}

type Errors = Partial<Record<LandFormFieldKey | 'consent', string>>;
const applicationTypes: LandApplicationType[] = ['katKarsiligi', 'kentselDonusum', 'degerleme'];
const zonings: LandZoning[] = ['unknown', 'residential', 'commercial', 'mixed', 'other'];
const yesNo: YesNo[] = ['yes', 'no'];
const noteLimit = 300;

/** Farsça ve Arapça rakamları 0-9'a çevirir; sunucu yalnız ASCII rakam kabul eder. */
const ascii = (value: string) => value.replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 0x06f0)).replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 0x0660));

export default function LandForm({ locale, content, officeOptions, districts, initialType, privacyHref, honeypotLabel }: Props) {
  const uid = useId();
  const started = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState<LandApplicationType>(initialType);
  const [zoning, setZoning] = useState<LandZoning | ''>('');
  const [building, setBuilding] = useState<YesNo | ''>('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [problem, setProblem] = useState('');
  const f = content.fields;
  const v = content.validation;
  const id = (name: string) => `${uid}-${name}`;
  const rtl = direction(locale) === 'rtl';

  const label = (key: LandFormFieldKey, optional = false) => <label htmlFor={id(key)}>{f[key].label}{optional && <span className="land-optional"> ({content.optionalTag})</span>}</label>;
  const help = (key: LandFormFieldKey) => f[key].help ? <small id={id(`${key}-help`)} className="land-help">{f[key].help}</small> : null;
  const error = (key: LandFormFieldKey | 'consent') => errors[key] ? <small id={id(`${key}-error`)} className="land-error" role="alert">{errors[key]}</small> : null;
  const describe = (key: LandFormFieldKey | 'consent') => [f[key as LandFormFieldKey]?.help ? id(`${key}-help`) : '', errors[key] ? id(`${key}-error`) : ''].filter(Boolean).join(' ') || undefined;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? '').trim();
    const fullName = text('fullName'), phone = ascii(text('phone')), district = text('district'), neighbourhood = text('neighbourhood'), block = ascii(text('block')), parcel = ascii(text('parcel'));
    const area = ascii(text('areaM2')).replace(/\s/g, ''), note = text('note');
    const next: Errors = {};
    if (fullName.length < 2) next.fullName = v.fullName;
    if (!/^[+\d\s()-]+$/.test(phone) || phone.replace(/\D/g, '').length < 10) next.phone = v.phone;
    if (!district) next.district = v.district;
    if (!/^\d{1,9}([.,]\d{1,2})?$/.test(area) || Number(area.replace(',', '.')) <= 0) next.areaM2 = v.areaM2;
    if (!zoning) next.zoning = v.zoning;
    if (!building) next.hasBuilding = v.hasBuilding;
    if (note.length > noteLimit) next.note = v.noteTooLong;
    if (!consent) next.consent = v.consent;
    setErrors(next);
    setProblem('');
    const first = (['fullName', 'phone', 'district', 'areaM2', 'zoning', 'hasBuilding', 'note', 'consent'] as const).find(key => next[key]);
    if (first) { formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus(); return; }

    setPending(true);
    // Ofise giden değerler Türkçedir: seçenekler Türkçe adlarıyla, boş isteğe bağlı alanlar hiç gönderilmez.
    const details: Record<string, string> = {
      applicationType: officeOptions.applicationType[type], district, areaM2: area.replace(',', '.'),
      zoning: officeOptions.zoning[zoning as LandZoning], hasBuilding: officeOptions.hasBuilding[building as YesNo],
      ...(neighbourhood ? { neighbourhood } : {}), ...(block ? { block } : {}), ...(parcel ? { parcel } : {}),
    };
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, phone, message: note, details, website: text('website'), consent: true, startedAt: started.current, kind: type === 'kentselDonusum' ? 'renewal' : 'land', locale }),
      });
      if (!response.ok) { setProblem(response.status === 429 ? content.error.tooMany : content.error.generic); return; }
      setDone(true);
    } catch { setProblem(content.error.network); }
    finally { setPending(false); }
  }

  if (done) return <div className="land-success" role="status"><CheckCircle2 size={28} aria-hidden="true" /><div><h3>{content.success.title}</h3><p>{content.success.text}</p></div></div>;

  const [consentBefore, consentAfter] = content.consent.split('{privacy}');
  const dirAuto = { dir: 'auto' as const };
  return <form className="land-form" ref={formRef} onSubmit={submit} noValidate>
    {problem && <div role="alert" className="form-message error"><CircleAlert size={19} aria-hidden="true" /><span>{problem}</span></div>}

    <fieldset className="land-fieldset">
      <legend>{f.applicationType.label}</legend>
      <div className="land-choice" role="radiogroup">
        {applicationTypes.map(value => <label key={value} className={type === value ? 'active' : ''}><input type="radio" name="applicationType" value={value} checked={type === value} onChange={() => setType(value)} data-field="applicationType" /><span>{content.options.applicationType[value]}</span></label>)}
      </div>
    </fieldset>

    <div className="land-grid">
      <div className="form-field">{label('fullName')}<input id={id('fullName')} name="fullName" data-field="fullName" autoComplete="name" maxLength={100} aria-invalid={!!errors.fullName} aria-describedby={describe('fullName')} {...dirAuto} />{error('fullName')}</div>
      <div className="form-field">{label('phone')}<input id={id('phone')} name="phone" data-field="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={25} placeholder={f.phone.placeholder} dir="ltr" style={rtl ? { textAlign: 'right' } : undefined} aria-invalid={!!errors.phone} aria-describedby={describe('phone')} />{help('phone')}{error('phone')}</div>
      <div className="form-field">{label('district')}<input id={id('district')} name="district" data-field="district" list={id('districts')} autoComplete="off" maxLength={40} placeholder={f.district.placeholder} aria-invalid={!!errors.district} aria-describedby={describe('district')} {...dirAuto} /><datalist id={id('districts')}>{districts.map(d => <option key={d} value={d} />)}</datalist>{error('district')}</div>
      <div className="form-field">{label('neighbourhood', true)}<input id={id('neighbourhood')} name="neighbourhood" autoComplete="off" maxLength={60} placeholder={f.neighbourhood.placeholder} {...dirAuto} /></div>
      <div className="form-field">{label('block', true)}<input id={id('block')} name="block" inputMode="numeric" autoComplete="off" maxLength={20} dir="ltr" style={rtl ? { textAlign: 'right' } : undefined} aria-describedby={describe('block')} />{help('block')}</div>
      <div className="form-field">{label('parcel', true)}<input id={id('parcel')} name="parcel" inputMode="numeric" autoComplete="off" maxLength={20} dir="ltr" style={rtl ? { textAlign: 'right' } : undefined} aria-describedby={describe('parcel')} />{help('parcel')}</div>
      <div className="form-field">{label('areaM2')}<input id={id('areaM2')} name="areaM2" data-field="areaM2" inputMode="decimal" autoComplete="off" maxLength={14} placeholder={f.areaM2.placeholder} dir="ltr" style={rtl ? { textAlign: 'right' } : undefined} aria-invalid={!!errors.areaM2} aria-describedby={describe('areaM2')} />{help('areaM2')}{error('areaM2')}</div>
      <div className="form-field">{label('zoning')}<select id={id('zoning')} name="zoning" data-field="zoning" value={zoning} onChange={e => setZoning(e.target.value as LandZoning | '')} aria-invalid={!!errors.zoning} aria-describedby={describe('zoning')}><option value="" />{zonings.map(z => <option key={z} value={z}>{content.options.zoning[z]}</option>)}</select>{error('zoning')}</div>
    </div>

    <fieldset className="land-fieldset">
      <legend>{f.hasBuilding.label}</legend>
      <div className="land-choice" role="radiogroup" aria-describedby={describe('hasBuilding')}>
        {yesNo.map(value => <label key={value} className={building === value ? 'active' : ''}><input type="radio" name="hasBuilding" value={value} checked={building === value} onChange={() => setBuilding(value)} data-field={value === 'yes' ? 'hasBuilding' : undefined} /><span>{content.options.hasBuilding[value]}</span></label>)}
      </div>
      {error('hasBuilding')}
    </fieldset>

    <div className="form-field">{label('note', true)}<textarea id={id('note')} name="note" data-field="note" maxLength={noteLimit + 100} placeholder={f.note.placeholder} aria-invalid={!!errors.note} aria-describedby={describe('note')} {...dirAuto} />{help('note')}{error('note')}</div>

    <div className="honeypot" aria-hidden="true"><label>{honeypotLabel}<input name="website" tabIndex={-1} autoComplete="off" /></label></div>

    <label className="checkbox-line"><input type="checkbox" data-field="consent" checked={consent} onChange={e => setConsent(e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={describe('consent')} /><span>{consentBefore}<a href={privacyHref} target="_blank" rel="noreferrer">{content.privacyLinkLabel}</a>{consentAfter}</span></label>
    {error('consent')}
    <button className="button block land-submit" disabled={pending}>{pending ? content.submitting : content.submit}</button>
  </form>;
}
