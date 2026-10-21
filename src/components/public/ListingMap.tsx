import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapPoint { id: string; lat: number; lng: number; title?: string; price?: string; url?: string; photo?: string; }
export const antalyaCenter: [number, number] = [36.8969, 30.7133];
export const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıcıları';
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/** Tek ilan için yaklaşık bölge dairesi, liste için tıklanabilir noktalar. Tam adres gösterilmez. */
export default function ListingMap({ points, single = false, label = 'İlan konumları haritası' }: { points: MapPoint[]; single?: boolean; label?: string }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: LeafletMap | undefined; let cancelled = false; let observer: ResizeObserver | undefined;
    void import('leaflet').then(L => {
      if (cancelled || !container.current) return;
      map = L.map(container.current, { scrollWheelZoom: false, attributionControl: true }).setView(points[0] ? [points[0].lat, points[0].lng] : antalyaCenter, single ? 14 : 11);
      L.tileLayer(tileUrl, { attribution: tileAttribution, maxZoom: 18 }).addTo(map);
      const style = { color: '#123d34', fillColor: '#123d34', weight: 2 };
      if (single && points[0]) { L.circle([points[0].lat, points[0].lng], { ...style, radius: 350, fillOpacity: .15 }).addTo(map); observer = new ResizeObserver(() => map?.invalidateSize()); observer.observe(container.current); return; }
      const layers = points.map(point => {
        const marker = L.circleMarker([point.lat, point.lng], { ...style, radius: 9, fillColor: '#b89562', fillOpacity: .95, color: '#fff' }).addTo(map!);
        if (point.url) marker.bindPopup(`<a class="map-popup" href="${escapeHtml(point.url)}">${point.photo ? `<img src="${escapeHtml(point.photo)}" alt="" width="200" height="120"/>` : ''}<strong>${escapeHtml(point.title || '')}</strong><span>${escapeHtml(point.price || '')}</span></a>`, { minWidth: 200, maxWidth: 220 });
        return marker;
      });
      const fit = () => { if (layers.length > 1) map!.fitBounds(L.featureGroup(layers).getBounds().pad(0.08), { maxZoom: 14 }); };
      fit();
      // Kutu yerleşim sırasında boyut değiştirirse Leaflet eski boyutla çizer ve noktalar kayar; yeniden ölçülüp sığdırılır.
      // Ziyaretçi haritayı kaydırdıktan sonra görünümü değiştirilmez, yalnız ölçü güncellenir.
      let touched = false; container.current.addEventListener('pointerdown', () => { touched = true; }, { once: true });
      observer = new ResizeObserver(() => { map?.invalidateSize(); if (!touched) fit(); });
      observer.observe(container.current);
    });
    return () => { cancelled = true; observer?.disconnect(); map?.remove(); };
  }, [points, single]);
  return <div ref={container} className={`listing-map ${single ? 'listing-map-single' : ''}`} role="region" aria-label={label} />;
}
