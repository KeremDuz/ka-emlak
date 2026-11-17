import { useEffect, useRef, useState } from 'react';
import type { CircleMarker, Map as LeafletMap } from 'leaflet';
import { LoaderCircle, LocateFixed, Trash2 } from 'lucide-react';
import { antalyaCenter, tileAttribution, tileUrl } from '../public/ListingMap';
import 'leaflet/dist/leaflet.css';

type Point = { latitude?: number; longitude?: number };
const round = (value: number) => Math.round(value * 1e5) / 1e5;

/** İlan konumunu haritada seçer. Ziyaretçiye bu nokta yuvarlanarak, yaklaşık daire olarak gösterilir. */
export default function LocationPicker({ value, place, onChange }: { value: Point; place: string; onChange: (point: Point) => void }) {
  const container = useRef<HTMLDivElement>(null); const map = useRef<LeafletMap | null>(null); const marker = useRef<CircleMarker | null>(null);
  const leaflet = useRef<typeof import('leaflet') | null>(null); const resizeObserver = useRef<ResizeObserver | null>(null); const changeRef = useRef(onChange); changeRef.current = onChange;
  const [searching, setSearching] = useState(false); const [message, setMessage] = useState('');
  const place_ = (lat: number, lng: number) => {
    const L = leaflet.current; if (!L || !map.current) return;
    if (marker.current) marker.current.setLatLng([lat, lng]);
    else marker.current = L.circleMarker([lat, lng], { radius: 10, color: '#fff', weight: 3, fillColor: '#123d34', fillOpacity: 1 }).addTo(map.current);
  };
  useEffect(() => {
    let cancelled = false;
    void import('leaflet').then(L => {
      if (cancelled || !container.current) return; leaflet.current = L;
      const start: [number, number] = value.latitude !== undefined && value.longitude !== undefined ? [value.latitude, value.longitude] : antalyaCenter;
      map.current = L.map(container.current).setView(start, value.latitude !== undefined ? 15 : 11);
      L.tileLayer(tileUrl, { attribution: tileAttribution, maxZoom: 19 }).addTo(map.current);
      if (value.latitude !== undefined && value.longitude !== undefined) place_(value.latitude, value.longitude);
      const observer = new ResizeObserver(() => map.current?.invalidateSize()); observer.observe(container.current); resizeObserver.current = observer;
      map.current.on('click', event => { place_(event.latlng.lat, event.latlng.lng); changeRef.current({ latitude: round(event.latlng.lat), longitude: round(event.latlng.lng) }); });
    });
    return () => { cancelled = true; resizeObserver.current?.disconnect(); map.current?.remove(); map.current = null; marker.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const find = async () => {
    setSearching(true); setMessage('');
    try {
      // OpenStreetMap Nominatim: yalnız düğmeye basıldığında tek istek atılır (kullanım politikası gereği otomatik arama yapılmaz).
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=tr&accept-language=tr&q=${encodeURIComponent(place)}`);
      const [result] = response.ok ? await response.json() as { lat: string; lon: string }[] : [];
      if (!result) { setMessage('Mahalle bulunamadı. Haritada kaydırıp doğru yere dokunun.'); return; }
      const lat = round(Number(result.lat)), lng = round(Number(result.lon));
      map.current?.setView([lat, lng], 15); place_(lat, lng); onChange({ latitude: lat, longitude: lng });
      setMessage('Mahallenin merkezi işaretlendi. Gerekirse haritaya dokunarak düzeltin.');
    } catch { setMessage('Harita araması şu an yapılamadı. Haritaya dokunarak işaretleyebilirsiniz.'); }
    finally { setSearching(false); }
  };
  const clear = () => { marker.current?.remove(); marker.current = null; onChange({ latitude: undefined, longitude: undefined }); setMessage(''); };
  const marked = value.latitude !== undefined && value.longitude !== undefined;
  return <div className="kp-location">
    <div className="kp-inline-actions"><button type="button" className="kp-button kp-button-small kp-button-secondary" onClick={find} disabled={searching || !place.trim()}>{searching ? <LoaderCircle className="kp-spin" size={15} /> : <LocateFixed size={15} />}Mahalleyi haritada bul</button>{marked && <button type="button" className="kp-text-button" onClick={clear}><Trash2 size={14} />Konumu kaldır</button>}</div>
    <div ref={container} className="kp-location-map" role="application" aria-label="İlan konumunu seçmek için harita. Konumu işaretlemek için dokunun." />
    <p className="kp-help" aria-live="polite">{message || (marked ? 'Konum işaretli. Sitede yaklaşık 350 metrelik bir alan olarak gösterilir.' : 'Haritaya dokunarak ilanın bulunduğu bölgeyi işaretleyin. Tam adres sitede gösterilmez.')}</p>
  </div>;
}
