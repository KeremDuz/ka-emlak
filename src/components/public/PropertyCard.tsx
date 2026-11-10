import { Bath, Home, BedDouble, Images, MapPin, Ruler, Users } from 'lucide-react';
import type { Listing } from '../../lib/types';
import { isSeasonal, listingUrl, periodLabels, priceLabel, transactionLabel } from '../../lib/format';

export default function PropertyCard({ listing, priority = false }: { listing: Listing; priority?: boolean }) {
  const photo = listing.photos[0];
  return <article className="property-card">
    <a href={listingUrl(listing)} className="property-main-link">
      <div className="property-photo">
        {photo ? <img src={photo.thumbnail || photo.url} alt={photo.alt || listing.title} loading={priority ? 'eager' : 'lazy'} decoding="async" width="640" height="480" /> : <span className="photo-placeholder" aria-hidden="true"><Home size={32} strokeWidth={1.4} /></span>}
        <span className="property-tag">{transactionLabel(listing)}</span>
        {listing.photos.length > 1 && <span className="photo-count"><Images size={14} aria-hidden="true" /><span className="sr-only">Fotoğraf sayısı: </span>{listing.photos.length}</span>}
      </div>
      <div className="property-body">
        <p className="property-location"><MapPin size={15} aria-hidden="true" />{[listing.neighborhood, listing.district].filter(Boolean).join(', ')}</p>
        <h3 className="property-title">{listing.title}</h3>
        <div className="property-price">{priceLabel(listing)}{listing.price !== null && listing.transaction === 'rent' && <small>{periodLabels[listing.period]}</small>}</div>
        <div className="property-details">
          {listing.rooms && <span><BedDouble size={17} aria-hidden="true" /><span className="sr-only">Oda: </span>{listing.rooms}</span>}
          {isSeasonal(listing) && !!listing.guests && <span><Users size={17} aria-hidden="true" />{listing.guests} kişi</span>}
          <span><Ruler size={16} aria-hidden="true" />{listing.grossArea.toLocaleString('tr-TR')} m²</span>
          {listing.bathrooms !== null && listing.bathrooms > 0 && <span><Bath size={17} aria-hidden="true" />{listing.bathrooms} banyo</span>}
        </div>
      </div>
    </a>
  </article>;
}

export function ListingGrid({ listings, className = '', priority = false }: { listings: Listing[]; className?: string; priority?: boolean }) {
  return <div className={`listing-grid ${className}`}>{listings.map(listing => <PropertyCard listing={listing} priority={priority} key={listing.id} />)}</div>;
}
