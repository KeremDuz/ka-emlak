import type { Listing, OfficeSettings, Photo } from './types';

// Local preview content only. These records must never be published to a live
// database automatically. The office must review the source data and images.
const previewDate = '2026-10-19T00:00:00.000Z';
const photoSet = (id: string, descriptions: string[], order?: number[]): Photo[] =>
  descriptions.map((alt, index) => {
    const number = order?.[index] ?? index + 1;
    const url = `/images/${id}-${String(number).padStart(2, '0')}.webp`;
    return { id: `${id}-photo-${number}`, url, thumbnail: url, alt };
  });

const previewListing = (
  values: Omit<Listing, 'city' | 'currency' | 'status' | 'createdAt' | 'updatedAt' | 'version' | 'needsReview'>,
): Listing => ({
  city: 'Antalya',
  currency: 'TRY',
  status: 'published',
  createdAt: previewDate,
  updatedAt: previewDate,
  version: 1,
  needsReview: true,
  ...values,
});

export const seedListings: Listing[] = [
  previewListing({
    id: '29750-166', slug: 'altinkale-bahceli-havuzlu-4-1-villa',
    title: 'Altınkale’de bahçeli, özel havuzlu 4+1 villa',
    transaction: 'sale', propertyType: 'villa', price: 32000000, period: 'total',
    district: 'Döşemealtı', neighborhood: 'Altınkale', grossArea: 466, netArea: 350,
    rooms: '4+1', bathrooms: 6, floor: 'Dubleks', buildingAge: 'Sıfır bina',
    description: 'Altınkale’de 466 m² brüt, 350 m² net kullanım alanına sahip 4+1 villa. Özel havuz ve bahçeyi; VRF klima sistemi, yerden ısıtma, sauna ve hamam tamamlıyor. Bahçe kullanımı, arsa payı ve güncel satış koşulları hakkında bilgi almak veya yerinde sunum planlamak için İshak Kahraman ile görüşebilirsiniz.',
    features: ['Özel havuz', 'Bahçe', 'Yerden ısıtma', 'VRF klima', 'Sauna', 'Hamam', 'Açık otopark'],
    photos: photoSet('29750-166', ['Altınkale’deki 4+1 villanın dış cephesi', 'Altınkale villanın salonu ve merdiveni', 'Altınkale villanın kaynak ilandaki iç görünümü'], [2, 1, 3]),
    featured: true,
    sourceUrl: 'https://www.hepsiemlak.com/antalya-dosemealti-altinkale-satilik/villa/29750-166',
  }),
  previewListing({
    id: '29750-172', slug: 'arapsuyu-genis-4-1-satilik-daire',
    title: 'Arapsuyu’nda ferah yaşam alanları sunan 4+1',
    transaction: 'sale', propertyType: 'apartment', price: 14500000, period: 'total',
    district: 'Konyaaltı', neighborhood: 'Arapsuyu', grossArea: 250, netArea: 240,
    rooms: '4+1', bathrooms: 3, floor: '2. kat', buildingAge: '16 yaşında',
    description: 'Arapsuyu Mahallesi’nde, iki katlı binanın ikinci katında 4+1 daire. 250 m² brüt, 240 m² net alan; üç banyo, balkon, kombi ve açık otopark ile geniş bir yaşam düzeni sunuyor. Kullanım durumu kiracılıdır. Güncel satış bedeli ve kira koşulları için danışmanımızla görüşebilirsiniz.',
    features: ['Balkon', 'Kombi', 'Açık otopark', 'Üç cephe', 'Kiracılı'],
    photos: photoSet('29750-172', ['Arapsuyu 4+1 dairenin kaynak ilandaki yaşam alanı', 'Arapsuyu 4+1 dairenin kaynak ilandaki görünümü'], [2, 1]),
    featured: true,
    sourceUrl: 'https://www.hepsiemlak.com/antalya-konyaalti-arapsuyu-satilik/daire/29750-172',
  }),
  previewListing({
    id: '29750-112', slug: 'camyuva-ozel-havuzlu-kiralik-villa',
    title: 'Çamyuva’da özel havuzlu ve bahçeli 3+1 villa',
    transaction: 'rent', propertyType: 'villa', price: 95000, period: 'month',
    district: 'Kemer', neighborhood: 'Çamyuva', grossArea: 350, netArea: 300,
    rooms: '3+1', bathrooms: 3, floor: 'Dubleks', buildingAge: 'Sıfır bina',
    description: 'Çamyuva’da eşyalı, bahçeli ve özel havuzlu 3+1 villa. Aylık 95.000 TL tutarı yıllık peşin kiralama koşuluyla sunulan uzun dönem seçeneğidir. Kısa dönem konaklama, günlük veya haftalık fiyat ve müsaitlik hakkında bilgi almak için danışmanımızla iletişime geçebilirsiniz.',
    features: ['Özel havuz', 'Müstakil bahçe', 'Eşyalı', 'Klima', 'Açık otopark', 'Yıllık peşin kiralama koşulu'],
    photos: photoSet('29750-112', ['Çamyuva’daki kiralık villanın havadan görünümü', 'Çamyuva villanın bahçesi ve dış cephesi', 'Çamyuva villanın kaynak ilandaki görünümü']),
    featured: true,
    sourceUrl: 'https://www.hepsiemlak.com/antalya-kemer-camyuva-kiralik/villa/29750-112',
  }),
  previewListing({
    id: '29750-181', slug: 'yeni-emek-3-2-satilik-dubleks',
    title: 'Yeni Emek’te ferah ve geniş 3+2 dubleks',
    transaction: 'sale', propertyType: 'apartment', price: 5450000, period: 'total',
    district: 'Kepez', neighborhood: 'Yeni Emek', grossArea: 200, netArea: 190,
    rooms: '3+2', bathrooms: 3, floor: '2. kat', buildingAge: '11 yaşında',
    description: 'Yeni Emek Mahallesi’nde iki katlı binanın üst katında 3+2 dubleks daire. 200 m² brüt, 190 m² net kullanım alanı, üç banyo ve balkon ile aile yaşamına uygun geniş bir düzen sunuyor. Kombili, üç cepheli dairenin güncel satış koşulları ve yerinde sunumu için danışmanımızla görüşebilirsiniz.',
    features: ['Dubleks', 'Balkon', 'Kombi', 'Üç cephe', 'Boş'],
    photos: photoSet('29750-181', ['Yeni Emek 3+2 dubleks dairenin kaynak ilandaki görünümü', 'Yeni Emek dubleks dairenin ikinci görünümü']),
    featured: true,
    sourceUrl: 'https://www.hepsiemlak.com/antalya-kepez-yeni-emek-satilik/daire/29750-181',
  }),
  previewListing({
    id: '29750-197', slug: 'liman-esyali-1-1-kiralik-daire',
    title: 'Liman’da eşyalı, doğalgazlı 1+1 daire',
    transaction: 'rent', propertyType: 'apartment', price: 29000, period: 'month',
    district: 'Konyaaltı', neighborhood: 'Liman', grossArea: 50, netArea: 45,
    rooms: '1+1', bathrooms: 1, floor: 'Yüksek giriş', buildingAge: '2 yaşında',
    description: 'Liman Mahallesi’nde 50 m² brüt, 45 m² net kullanım alanına sahip eşyalı 1+1 daire. Doğalgazlı kombi, yüksek giriş katı ve toplu ulaşıma yakın konumuyla kullanışlı bir yaşam alanı sunuyor. Mevcut kullanım durumu kiracılıdır; teslim tarihi, kira koşulları ve güncel müsaitlik için danışmanımızla görüşebilirsiniz.',
    features: ['Eşyalı', 'Doğalgaz', 'Kombi', 'Yüksek giriş', 'Toplu ulaşıma yakın'],
    photos: photoSet('29750-197', ['Liman 1+1 dairenin kaynak ilandaki iç görünümü', 'Liman 1+1 dairenin ikinci iç görünümü']),
    featured: false,
    sourceUrl: 'https://www.hepsiemlak.com/antalya-konyaalti-liman-kiralik/daire/29750-197',
  }),
  previewListing({
    id: '29750-118', slug: 'geyikbayiri-600-metrekare-arsa',
    title: 'Geyikbayırı’nda 600 m² arsa',
    transaction: 'sale', propertyType: 'land', price: 1890000, period: 'total',
    district: 'Konyaaltı', neighborhood: 'Geyikbayırı', grossArea: 600, netArea: null,
    rooms: '', bathrooms: null, floor: '', buildingAge: '',
    description: 'Geyikbayırı Mahallesi’nde 600 m² arsa. Parsel özellikleri, imar durumu ve kullanım olanakları hakkında ayrıntılı bilgi almak için danışmanımızla görüşebilirsiniz. İmar belgeleri, güncel satış ve olası takas koşulları görüşme sırasında paylaşılır.',
    features: ['600 m²', 'Arsa', 'İmar bilgileri teyit edilmeli', 'Takas koşulu teyit edilmeli'],
    photos: photoSet('29750-118', ['Geyikbayırı arsanın kaynak ilandaki görünümü', 'Geyikbayırı arsaya ilişkin kaynak ilandaki görsel']),
    featured: true,
    sourceUrl: 'https://www.hepsiemlak.com/antalya-konyaalti-geyikbayiri-satilik/ozel-kullanim/29750-118',
  }),
  previewListing({
    id: '29750-193', slug: 'ogretmenevleri-ataturk-bulvari-kiralik-ofis',
    title: 'Atatürk Bulvarı’nda plaza içinde kiralık ofis',
    transaction: 'rent', propertyType: 'office', price: 35000, period: 'month',
    district: 'Konyaaltı', neighborhood: 'Öğretmenevleri', grossArea: 60, netArea: 55,
    rooms: '1+1', bathrooms: null, floor: '2. kat', buildingAge: '4 yaşında',
    description: 'Öğretmenevleri Mahallesi Atatürk Bulvarı üzerinde plaza içerisinde 1+1 kullanım planına sahip ofis. 60 m² brüt, 55 m² net alana sahip ikinci kattaki ofis klimalıdır. Aylık kira 35.000 TL’dir. Yerinde sunum, güncel müsaitlik ve kullanım koşulları için danışmanımızla görüşebilirsiniz.',
    features: ['Plaza içinde', 'Klima', '1+1 kullanım planı', 'Atatürk Bulvarı', 'Boş'],
    photos: photoSet('29750-193', ['Öğretmenevleri kiralık ofisin kaynak ilandaki görünümü', 'Öğretmenevleri ofisinin ikinci görünümü']),
    featured: false,
    sourceUrl: 'https://www.hepsiemlak.com/antalya-konyaalti-ogretmenevleri-kiralik/ofis/29750-193',
  }),
  previewListing({
    id: '29750-189', slug: 'altinova-2000-metrekare-kiralik-depo',
    title: 'Altınova’da ofisli 2.000 m² kiralık depo',
    transaction: 'rent', propertyType: 'warehouse', price: 375000, period: 'month',
    district: 'Kepez', neighborhood: 'Altınova Sinan', grossArea: 2000, netArea: 1999,
    rooms: '', bathrooms: null, floor: '', buildingAge: '',
    description: 'Altınova Sinan Mahallesi’nde 2.000 m² brüt alana sahip kiralık depo. Trafo, yangın algılama ve söndürme sistemi, ofis alanları ve yükleme-boşaltmaya uygun girişle iş ihtiyaçlarına yönelik bir çözüm sunuyor. Aylık kira 375.000 TL’dir. Teknik özellikleri ve kiralama koşullarını yerinde incelemek için iletişime geçebilirsiniz.',
    features: ['Ofis alanları', 'Trafo', 'Yangın sistemi', 'Yükleme alanı', 'Araç girişine uygun'],
    photos: photoSet('29750-189', ['Altınova kiralık deponun kaynak ilandaki görünümü', 'Altınova deponun ikinci görünümü']),
    featured: false,
    sourceUrl: 'https://www.hepsiemlak.com/antalya-kepez-altinova-sinan-kiralik/depo/29750-189',
  }),
  previewListing({
    id: '29750-179', slug: 'antalya-kat-karsiligi-portfoy-gorusmesi',
    title: 'Antalya’da kat karşılığı ve dönüşüm portföyleri',
    transaction: 'exchange', propertyType: 'land', price: null, period: 'total',
    district: 'Konyaaltı', neighborhood: 'Hurma', grossArea: 10000, netArea: null,
    rooms: '', bathrooms: null, floor: '', buildingAge: '',
    description: 'Konyaaltı, Muratpaşa, Döşemealtı ve Kepez bölgelerindeki kat karşılığı ve kentsel dönüşüm portföyleri hakkında görüşme çağrısıdır. Kaynaktaki 10.000 m² ve Hurma konumu tek bir kesin parsel olarak yorumlanmamalıdır. Sayısal satış fiyatı belirtilmemiştir. Kapalı portföyler ve iş birliği için danışmanla iletişime geçebilirsiniz.',
    features: ['Kat karşılığı görüşmesi', 'Kentsel dönüşüm', 'Kapalı portföy', 'Fiyat görüşme ile'],
    photos: [], featured: false,
    sourceUrl: 'https://www.hepsiemlak.com/antalya-konyaalti-hurma-kat-karsiligi-satilik/imarli-konut/29750-179',
  }),
];

export const officeSettings: OfficeSettings = {
  name: 'KA EMLAK', advisor: 'İshak Kahraman',
  phone: '+905322247658', whatsapp: '+905322247658', email: '',
  address: 'Konyaaltı / Antalya', hours: '',
  about: 'KA EMLAK, İshak Kahraman danışmanlığında Antalya’da konut, villa, arsa ve iş yeri portföyleri sunar. Konyaaltı, Kepez, Döşemealtı, Muratpaşa ve Kemer bölgelerinde alım, satım, kiralama ve kat karşılığı görüşmeleri için bizimle iletişime geçebilirsiniz.',
  heroImage: '', instagram: '', licenseNumber: '0702648',
};

export const defaultSettings = officeSettings;
