import { Bath, Home, BedDouble, Images, MapPin, Ruler, Users } from 'lucide-react';
import type { Listing, Locale } from '../../lib/types';
import type { Dictionary } from '../../i18n/tr';
import { fill } from '../../i18n/config';
import { areaLabel, isSeasonal, listingUrl, localizedListing, numberLabel, periodSuffix, priceLabel, transactionLabel } from '../../lib/format';

/** locale ve t (sözlüğün card bölümü) sayfadan gelir; verilmezse kart Türkçe çizilir. */
export interface CardText { locale: Locale; t: Dictionary['card']; }

export default function PropertyCard({ listing, priority = false, locale, t }: { listing: Listing; priority?: boolean } & CardText) {
  const photo = listing.photos[0];
  const { title } = localizedListing(listing, locale);
  const suffix = periodSuffix(listing, locale);
  return <article className="property-card">
    <a href={listingUrl(listing, locale)} className="property-main-link">
      <div className="property-photo">
        {photo ? <img src={photo.thumbnail || photo.url} alt={locale === 'tr' ? photo.alt || title : title} loading={priority ? 'eager' : 'lazy'} decoding="async" width="640" height="480" /> : <span className="photo-placeholder" aria-hidden="true"><Home size={32} strokeWidth={1.4} /></span>}
        <span className="property-tag">{transactionLabel(listing, locale)}</span>
        {listing.photos.length > 1 && <span className="photo-count"><Images size={14} aria-hidden="true" /><span className="sr-only">{t.photoCount}</span>{numberLabel(listing.photos.length, locale)}</span>}
      </div>
      <div className="property-body">
        <p className="property-location"><MapPin size={15} aria-hidden="true" />{[listing.neighborhood, listing.district].filter(Boolean).join(', ')}</p>
        {/* Çevirisi olmayan başlık Türkçe kalır; dir="auto" Farsça sayfada Latin başlığı soldan başlatır. */}
        <h3 className="property-title" dir="auto">{title}</h3>
        <div className="property-price">{priceLabel(listing, locale)}{suffix && <small>{suffix}</small>}</div>
        <div className="property-details">
          {listing.rooms && <span><BedDouble size={17} aria-hidden="true" /><span className="sr-only">{t.rooms}</span><bdi>{listing.rooms}</bdi></span>}
          {isSeasonal(listing) && !!listing.guests && <span><Users size={17} aria-hidden="true" />{fill(t.guests, { n: numberLabel(listing.guests, locale) })}</span>}
          {listing.grossArea > 0 && <span><Ruler size={16} aria-hidden="true" />{areaLabel(listing.grossArea, locale)}</span>}
          {listing.bathrooms !== null && listing.bathrooms > 0 && <span><Bath size={17} aria-hidden="true" />{fill(t.baths, { n: numberLabel(listing.bathrooms, locale) })}</span>}
        </div>
      </div>
    </a>
  </article>;
}

export function ListingGrid({ listings, className = '', priority = false, locale, t }: { listings: Listing[]; className?: string; priority?: boolean } & CardText) {
  return <div className={`listing-grid ${className}`}>{listings.map(listing => <PropertyCard listing={listing} priority={priority} locale={locale} t={t} key={listing.id} />)}</div>;
}
