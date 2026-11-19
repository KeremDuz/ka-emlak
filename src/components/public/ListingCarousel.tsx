import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCard from './PropertyCard';
import type { Listing, Locale } from '../../lib/types';
import type { Dictionary } from '../../i18n';

interface Props { listings: Listing[]; locale: Locale; t: Dictionary['card']; label: string; prev: string; next: string; }

/**
 * Ana sayfadaki ilan şeridi: telefonda parmakla kaydırılır, masaüstünde ok düğmeleriyle bir sayfa ilerler.
 * Kendiliğinden kaymaz (okuyan ziyaretçinin elinden kartı kaçırmamak için). Farsça ve Arapçada (RTL) yön tersine döner.
 */
export default function ListingCarousel({ listings, locale, t, label, prev, next }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: listings.length <= 1 });

  const measure = () => {
    const el = track.current; if (!el) return;
    const offset = Math.abs(el.scrollLeft);
    setEdges({ start: offset < 4, end: offset + el.clientWidth >= el.scrollWidth - 4 });
  };
  useEffect(() => {
    measure();
    const el = track.current; if (!el) return;
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => { el.removeEventListener('scroll', measure); window.removeEventListener('resize', measure); };
  }, []);

  const move = (direction: 1 | -1) => {
    const el = track.current; if (!el) return;
    const rtl = getComputedStyle(el).direction === 'rtl';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: direction * (rtl ? -1 : 1) * el.clientWidth * 0.9, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div className="carousel" role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="carousel-track" ref={track} tabIndex={0}>
        {listings.map((listing, index) => <div className="carousel-item" key={listing.id}><PropertyCard listing={listing} priority={index < 3} locale={locale} t={t} /></div>)}
      </div>
      {listings.length > 1 && <div className="carousel-controls">
        <button type="button" className="carousel-button" onClick={() => move(-1)} disabled={edges.start} aria-label={prev}><ChevronLeft size={22} aria-hidden="true" /></button>
        <button type="button" className="carousel-button" onClick={() => move(1)} disabled={edges.end} aria-label={next}><ChevronRight size={22} aria-hidden="true" /></button>
      </div>}
    </div>
  );
}
