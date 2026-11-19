/** Ofisin sitede gösterilen dış bağlantıları ve konumu. Bağlantılardaki izleme ekleri (utm, s=qt…) atıldı. */
export const officeLinks = {
  /** Google Haritalar işletme kaydı: yorumlar ve fotoğraflar burada. */
  maps: 'https://maps.app.goo.gl/6XSE8gPvtF5ZUgyx6',
  /** Ofis noktası (Google Haritalar kaydındaki konum); tek dokunuşla yol tarifi bundan açılır. */
  location: { latitude: 36.8731254, longitude: 30.6412084 },
  whatsappChannel: 'https://whatsapp.com/channel/0029Va9yBBJ1CYoL0HsltF1m',
  whatsappGroup: 'https://chat.whatsapp.com/IryKU9CJLX7GUPIgZG2IfQ',
  facebook: 'https://www.facebook.com/ikayapii',
  sahibinden: 'https://kaemlak.sahibinden.com/',
  hepsiemlak: 'https://www.hepsiemlak.com/emlak-ofisi/ka-emlak-29750',
  emlakjet: 'https://www.emlakjet.com/emlak-ofisleri/ka-emlak-1628298',
} as const;
const { latitude, longitude } = officeLinks.location;
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
/** OpenStreetMap gömülü haritası (ücretsiz, anahtar istemez). */
export const officeMapEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.006},${latitude - 0.0035},${longitude + 0.006},${latitude + 0.0035}&layer=mapnik&marker=${latitude},${longitude}`;
