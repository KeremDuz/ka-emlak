// Site içerikleri için ortak tipler. Yalnız düz veri; uygulamadan içe aktarma yok.

export type Locale = 'tr' | 'en' | 'fa';

/** Her dilde aynı yapıda içerik. */
export type Localized<T> = Record<Locale, T>;

export interface ContentSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  /** true ise `bullets` sıralı adımlardır; numaralı liste (<ol>) olarak gösterilmeli. */
  ordered?: boolean;
}

/** Kat karşılığı ve kentsel dönüşüm sayfaları. */
export interface OwnerPageContent {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  sections: ContentSection[];
  formTitle: string;
  formIntro: string;
  cta: string;
}

/** Yatırım bölümü girişi. */
export interface InvestmentContent {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  notesTitle: string;
  notes: string[];
}

export interface FormFieldText {
  label: string;
  /** Boş dize: yer tutucu gösterme. */
  placeholder: string;
  /** Boş dize: yardım metni gösterme. */
  help: string;
}

export type LandFormFieldKey =
  | 'fullName'
  | 'phone'
  | 'applicationType'
  | 'district'
  | 'neighbourhood'
  | 'block'
  | 'parcel'
  | 'areaM2'
  | 'zoning'
  | 'hasBuilding'
  | 'note';

export type LandApplicationType = 'katKarsiligi' | 'kentselDonusum' | 'degerleme';
export type LandZoning = 'unknown' | 'residential' | 'commercial' | 'mixed' | 'other';
export type YesNo = 'yes' | 'no';

export interface LandFormContent {
  title: string;
  intro: string;
  fields: Record<LandFormFieldKey, FormFieldText>;
  options: {
    applicationType: Record<LandApplicationType, string>;
    zoning: Record<LandZoning, string>;
    hasBuilding: Record<YesNo, string>;
  };
  /** İsteğe bağlı alanların etiketine eklenen kısa not. */
  optionalTag: string;
  /** `{privacy}` yer tutucusu `privacyLinkLabel` metnini taşıyan bağlantıyla değiştirilir. */
  consent: string;
  privacyLinkLabel: string;
  submit: string;
  submitting: string;
  validation: {
    required: string;
    fullName: string;
    phone: string;
    applicationType: string;
    district: string;
    areaM2: string;
    zoning: string;
    hasBuilding: string;
    noteTooLong: string;
    consent: string;
  };
  success: { title: string; text: string };
  error: { generic: string; network: string; tooMany: string };
}

export interface LegalDocument {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  /** Yayından önce gerçek tarihle değiştirilecek: 'PLACEHOLDER_DATE'. */
  updated: string;
  /** Çevirilerde Türkçe metnin esas alındığını söyler. */
  languageNote: string;
  sections: ContentSection[];
}

export interface CookieBanner {
  text: string;
  accept: string;
  reject: string;
  settings: string;
  analyticsLabel: string;
  analyticsHelp: string;
  necessaryLabel: string;
  necessaryHelp: string;
  save: string;
}

export interface CookieDocument extends LegalDocument {
  banner: CookieBanner;
}

export interface LegalContent {
  kvkk: LegalDocument;
  privacy: LegalDocument;
  cookies: CookieDocument;
}
