export async function preparePhoto(input: File): Promise<File> {
  if (input.size > 35 * 1024 * 1024) throw new Error('Fotoğraf 35 MB sınırını aşıyor. Daha küçük bir dosya seçin.');
  let blob: Blob = input;
  if (/\.(heic|heif)$/i.test(input.name) || /image\/hei[cf]/.test(input.type)) {
    const { default: heic2any } = await import('heic2any');
    const result = await heic2any({ blob: input, toType: 'image/jpeg', quality: 0.85 });
    blob = Array.isArray(result) ? result[0] : result;
  } else if (!['image/jpeg', 'image/png', 'image/webp'].includes(input.type)) {
    throw new Error('JPG, PNG, WebP veya HEIC fotoğraf seçin.');
  }
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image(); image.decoding = 'async';
    await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('Fotoğraf okunamadı. Başka bir dosya deneyin.')); image.src = url; });
    if (!image.width || !image.height) throw new Error('Fotoğraf boyutları okunamadı.');
    const ratio = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Bu tarayıcı fotoğraf hazırlamayı desteklemiyor.');
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const encoded = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Fotoğraf hazırlanamadı.')), 'image/webp', 0.84));
    const extension = encoded.type === 'image/webp' ? 'webp' : 'png';
    canvas.width = 1; canvas.height = 1;
    return new File([encoded], `${input.name.replace(/\.[^.]+$/, '')}.${extension}`, { type: encoded.type });
  } finally { URL.revokeObjectURL(url); }
}
