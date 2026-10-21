import { ArrowUpRight, Bath, Home, BedDouble, Images, MapPin, MoveUpRight, Ruler } from 'lucide-react';
import type { Listing } from '../../lib/types';
import { listingUrl, periodLabels, priceLabel, transactionLabels } from '../../lib/format';

export default function PropertyCard({ listing, priority = false }: { listing: Listing; priority?: boolean }) {
  const photo = listing.photos[0];
  return <article className="property-card">
    <a href={listingUrl(listing)} className="property-main-link" aria-label={`${listing.title} ilanını incele`}>
      <div className="property-photo">{photo ? <img src={photo.thumbnail || photo.url} alt={photo.alt || listing.title} loading={priority ? 'eager' : 'lazy'} decoding="async" width="640" height="464" /> : <span className="photo-placeholder" aria-hidden="true"><Home size={30} strokeWidth={1.4} /></span>}<span className="property-tag">{transactionLabels[listing.transaction]}</span><span className="photo-count"><Images size={12}/>{listing.photos.length}</span></div>
      <div className="property-body"><p className="property-location"><MapPin size={12}/>{listing.district}, {listing.neighborhood}</p><h3 className="property-title">{listing.title}</h3><div className="property-price">{priceLabel(listing)}{listing.price !== null && listing.transaction === 'rent' && <small>{periodLabels[listing.period]}</small>}</div><div className="property-details">{listing.rooms && <span><BedDouble size={15}/>{listing.rooms}</span>}<span><Ruler size={14}/>{listing.grossArea.toLocaleString('tr-TR')} m²</span>{listing.bathrooms !== null && listing.bathrooms > 0 && <span><Bath size={15}/>{listing.bathrooms}</span>}<span className="view-link"><ArrowUpRight size={17}/></span></div></div>
    </a>
  </article>;
}
export function ListingGrid({ listings, className = '' }: { listings: Listing[]; className?: string }) { return <div className={`listing-grid ${className}`}>{listings.map(listing => <PropertyCard listing={listing} key={listing.id}/>)}</div>; }
