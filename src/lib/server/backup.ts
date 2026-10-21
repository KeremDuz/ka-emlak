import { z } from 'zod';
import type { AdminListing } from '../types';
import { listingSchema, settingsSchema } from './validation';
import { Repository } from './repository';
import { newListing } from './lifecycle';
import { HttpError } from './http';

export async function exportBackup(repo:Repository){
  const [listings,settings,inquiries,media]=await Promise.all([repo.listings(),repo.settings(),repo.inquiries(),repo.media()]);
  return {format:'ka-emlak-backup',schemaVersion:1,exportedAt:new Date().toISOString(),mode:repo.preview?'preview':'live',listings,settings,inquiries,media:media.map(item=>({...item,downloadUrl:`/media/${item.id}`})),containsPhotoFiles:false,photoBackupInstructions:'Fotoğraf dosyaları bu JSON içinde bulunmaz. media dizisindeki downloadUrl adreslerini yönetici oturumuyla indirerek JSON ile aynı klasörde saklayın.'};
}
export async function importBackup(repo:Repository,value:unknown){
  const backup=z.object({format:z.literal('ka-emlak-backup').optional(),schemaVersion:z.literal(1).optional(),listings:z.array(listingSchema.extend({draft:listingSchema.nullable().optional()})).max(500),settings:settingsSchema.optional()}).parse(value);
  if(backup.format&&backup.schemaVersion!==1)throw new HttpError(400,'Yedek sürümü desteklenmiyor.','BACKUP_VERSION');
  const knownMedia=new Set((await repo.media()).filter(item=>item.status==='ready').map(item=>item.path));
  const incoming:AdminListing[]=backup.listings.map(item=>{
    const content=item.draft??item;const base=newListing();
    return {...content,id:base.id,slug:base.slug,status:'draft',needsReview:true,featured:false,createdAt:base.createdAt,updatedAt:base.updatedAt,version:1,draft:null,photos:content.photos.filter(photo=>photo.storagePath?knownMedia.has(photo.storagePath):photo.url.startsWith('/images/')||photo.url.startsWith('/assets/'))};
  });
  // Each imported listing is a new, unpublished record; existing live listings are never overwritten.
  await repo.importMany(incoming);
  return {imported:incoming.length,needsReview:true,settingsIncluded:!!backup.settings,settingsApplied:false,warning:'İlanlar kontrol bekleyen taslaklar olarak eklendi. Ofis bilgileri otomatik değiştirilmedi. Bu depoda bulunmayan fotoğrafları ayrıca yükleyin.'};
}
