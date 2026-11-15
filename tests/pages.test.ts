import { describe, expect, it } from 'vitest';
import { mediaEmbed } from '../src/lib/format';
import { arsaFormu } from '../src/content/arsa-formu';
import { katKarsiligi } from '../src/content/kat-karsiligi';
import { kentselDonusum } from '../src/content/kentsel-donusum';
import { yatirim } from '../src/content/yatirim';
import { dictionary } from '../src/i18n';

describe('ilan videosu ve sanal tur', () => {
  it('YouTube ve Vimeo adreslerini çerezsiz gömme adresine çevirir', () => {
    expect(mediaEmbed('https://www.youtube.com/watch?v=abcdEFGH123', 'video')?.src).toBe('https://www.youtube-nocookie.com/embed/abcdEFGH123?autoplay=1&rel=0');
    expect(mediaEmbed('https://youtu.be/abcdEFGH123?t=4', 'video')?.src).toContain('/embed/abcdEFGH123');
    expect(mediaEmbed('https://youtube.com/shorts/abcdEFGH123', 'video')?.src).toContain('/embed/abcdEFGH123');
    expect(mediaEmbed('https://vimeo.com/123456789', 'video')?.src).toBe('https://player.vimeo.com/video/123456789?autoplay=1&dnt=1');
  });
  it('https olmayan, bozuk ya da kimlik bilgili adresi reddeder', () => {
    expect(mediaEmbed('http://youtu.be/abcdEFGH123', 'video')).toBeNull();
    expect(mediaEmbed('javascript:alert(1)', 'video')).toBeNull();
    expect(mediaEmbed('https://user:pw@youtu.be/abcdEFGH123', 'video')).toBeNull();
    expect(mediaEmbed('', 'video')).toBeNull();
    expect(mediaEmbed(undefined, 'tour')).toBeNull();
  });
  it('bilinmeyen siteler gömülmez, düz bağlantı olur', () => {
    expect(mediaEmbed('https://ornek.test/tur', 'tour')).toEqual({ href: 'https://ornek.test/tur', host: 'ornek.test', src: null });
    expect(mediaEmbed('https://evil.test/embed/abcdEFGH123', 'video')?.src).toBeNull();
    expect(mediaEmbed('https://my.matterport.com/show/?m=AbC123', 'tour')?.src).toBe('https://my.matterport.com/show/?m=AbC123');
    expect(mediaEmbed('https://my.matterport.com/other', 'tour')?.src).toBeNull();
  });
});

describe('yeni sayfa içerikleri', () => {
  it('üç dilde de başlık, form ve metin var', () => {
    for (const locale of ['tr', 'en', 'fa'] as const) {
      expect(katKarsiligi[locale].sections.length).toBeGreaterThan(0);
      expect(kentselDonusum[locale].formTitle).toBeTruthy();
      expect(yatirim[locale].notes.length).toBeGreaterThan(0);
      expect(arsaFormu[locale].consent).toContain('{privacy}');
      expect(dictionary(locale).footer.landValuation).toBeTruthy();
      expect(dictionary(locale).media.loadVideo).toBeTruthy();
    }
  });
  it('ofise giden Türkçe seçenek adları tüm başvuru türlerini kapsar', () => {
    expect(Object.keys(arsaFormu.tr.options.applicationType).sort()).toEqual(['degerleme', 'katKarsiligi', 'kentselDonusum']);
  });
});
