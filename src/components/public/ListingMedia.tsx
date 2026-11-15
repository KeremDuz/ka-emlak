import { useState } from 'react';
import { ExternalLink, Play, View } from 'lucide-react';
import type { MediaEmbed } from '../../lib/format';
import type { Dictionary } from '../../i18n/tr';
import { fill } from '../../i18n/config';

/** Video ve sanal tur: iframe yalnız tıklanınca eklenir; öncesinde üçüncü taraf adrese istek gitmez.
    Gömülemeyen adres (src yok) düz dış bağlantı olur. */
interface Item { kind: 'video' | 'tour'; media: MediaEmbed; }
export default function ListingMedia({ items, title, t }: { items: Item[]; title: string; t: Dictionary['media'] }) {
  const [active, setActive] = useState<Record<string, boolean>>({});
  return <>{items.map(({ kind, media }) => {
    const heading = kind === 'video' ? t.video : t.tour;
    const open = active[kind] && media.src;
    return <section className="detail-section" key={kind} aria-label={heading}>
      <h2>{heading}</h2>
      {open
        ? <div className="media-frame"><iframe src={media.src!} title={fill(kind === 'video' ? t.videoTitle : t.tourTitle, { title })} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox" allow={kind === 'video' ? 'autoplay; fullscreen; picture-in-picture' : 'autoplay; fullscreen; xr-spatial-tracking; accelerometer; gyroscope'} allowFullScreen /></div>
        : media.src
          ? <button type="button" className="media-poster" onClick={() => setActive(a => ({ ...a, [kind]: true }))}>{kind === 'video' ? <Play size={34} aria-hidden="true" /> : <View size={34} aria-hidden="true" />}<strong>{kind === 'video' ? t.loadVideo : t.loadTour}</strong><small>{fill(t.note, { host: media.host })}</small></button>
          : <a className="button outline" href={media.href} target="_blank" rel="noopener noreferrer"><ExternalLink size={17} aria-hidden="true" /><span>{heading}</span><bdi dir="ltr" className="media-host">{media.host}</bdi></a>}
    </section>;
  })}</>;
}
