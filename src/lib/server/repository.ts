import type { AdminListing, Inquiry, Listing, OfficeSettings, Photo } from '../types';
import { isPreview, storageLimit, type ServerLocals } from './env';
import { withPreview, deleteLocalAsset, type MediaRecord } from './preview';
import { rpc, supabase, storageRequest } from './database';
import { HttpError } from './http';
import { newListing, saveDraft, transition, type ListingAction } from './lifecycle';
import { listingSchema, settingsSchema } from './validation';

type ListingRow={id:string;data:Listing;draft:Listing|null;version:number};
const decode=(row:ListingRow):AdminListing=>({...listingSchema.parse(row.data),version:row.version,draft:row.draft?listingSchema.parse(row.draft):null});
function snapshot(value:AdminListing):Listing {const {draft:_,...data}=value;return data;}
function expected(current:AdminListing,version:number){if(current.version!==version)throw new HttpError(409,'İlan başka bir sekmede değişti. Son sürümü yeniden yükleyin.','VERSION_CONFLICT',{version:current.version});}
export class Repository {
  constructor(public locals:ServerLocals){}
  get preview(){return isPreview(this.locals);}
  async listings(publicOnly=false):Promise<AdminListing[]> {
    if(this.preview)return withPreview(state=>structuredClone(state.listings.filter(item=>!publicOnly||item.status==='published')).map(item=>publicOnly?{...item,draft:null}:item));
    const rows=await supabase<ListingRow[]>(this.locals,`/rest/v1/listings?select=${publicOnly?'id,data,version':'id,data,draft,version'}${publicOnly?'&status=eq.published':''}&order=updated_at.desc`,{},!publicOnly);
    return rows.map(row=>decode({...row,draft:publicOnly?null:row.draft}));
  }
  async listing(id:string){
    if(!this.preview){const rows=await supabase<ListingRow[]>(this.locals,`/rest/v1/listings?id=eq.${encodeURIComponent(id)}&select=id,data,draft,version&limit=1`);if(!rows[0])throw new HttpError(404,'İlan bulunamadı.','NOT_FOUND');return decode(rows[0]);}
    const item=await withPreview(state=>structuredClone(state.listings.find(listing=>listing.id===id)));if(!item)throw new HttpError(404,'İlan bulunamadı.','NOT_FOUND');return item;
  }
  async publishedPhoto(id:string){
    if(this.preview)return withPreview(state=>state.listings.some(item=>item.status==='published'&&item.photos.some(photo=>photo.id===id)));
    const filter=encodeURIComponent(JSON.stringify({photos:[{id}]}));
    const rows=await supabase<{id:string}[]>(this.locals,`/rest/v1/listings?status=eq.published&data=cs.${filter}&select=id&limit=1`,{},false);return rows.length>0;
  }
  async commit(value:AdminListing,version:number):Promise<AdminListing>{
    if(this.preview)return withPreview(state=>{const index=state.listings.findIndex(item=>item.id===value.id);if(version===0){if(index>=0)throw new HttpError(409,'İlan zaten var.','VERSION_CONFLICT');state.listings.unshift(value);}else{if(index<0)throw new HttpError(404,'İlan bulunamadı.');expected(state.listings[index],version);state.listings[index]=value;}return structuredClone(value);},true);
    return decode(await rpc<ListingRow>(this.locals,'ka_commit_listing',{p_id:value.id,p_version:version,p_data:snapshot(value),p_draft:value.draft}));
  }
  async create(){return this.commit(newListing(),0);}
  async importMany(values:AdminListing[]){
    if(this.preview)return withPreview(state=>{if(values.some(value=>state.listings.some(item=>item.id===value.id)))throw new HttpError(409,'İlan zaten var.');state.listings.unshift(...values);},true);
    await rpc(this.locals,'ka_import_listings',{p_rows:values.map(value=>({id:value.id,data:snapshot(value),draft:null}))});
  }
  async validatePhotos(photos:Photo[]){
    const media=await this.media();
    for(const photo of photos){
      if(photo.storagePath){if(!media.some(item=>item.path===photo.storagePath&&item.id===photo.id&&item.status==='ready'))throw new HttpError(422,'Bir fotoğraf henüz yüklenmedi veya bu depoya ait değil.','PHOTO_INVALID');if(photo.url!==`/media/${photo.id}`)throw new HttpError(422,'Fotoğraf adresi geçersiz.','PHOTO_INVALID');}
      else if(!photo.url.startsWith('/images/') && !photo.url.startsWith('/assets/'))throw new HttpError(422,'Fotoğrafları panelden yükleyin.','PHOTO_INVALID');
    }
  }
  async save(id:string,listing:Listing,version:number){const current=await this.listing(id);expected(current,version);await this.validatePhotos(listing.photos);return this.commit(saveDraft(current,listing),version);}
  async action(id:string,action:ListingAction,version:number,price?:number|null){const current=await this.listing(id);expected(current,version);const next=transition(current,action,price);if(action==='publish')await this.validatePhotos(next.photos);return this.commit(next,action==='duplicate'?0:version);}
  async remove(id:string,version:number){
    const current=await this.listing(id);expected(current,version);if(current.status!=='trash')throw new HttpError(409,'Kalıcı silmeden önce ilanı çöp kutusuna taşıyın.','NOT_TRASHED');
    if(this.preview)await withPreview(state=>{const row=state.listings.find(item=>item.id===id);if(!row)throw new HttpError(404,'İlan bulunamadı.');expected(row,version);state.listings=state.listings.filter(item=>item.id!==id);},true);
    else await rpc(this.locals,'ka_delete_listing',{p_id:id,p_version:version});
    const others=await this.listings();const retained=new Set(others.flatMap(item=>[...item.photos,...(item.draft?.photos??[])].map(photo=>photo.id)));
    for(const media of await this.media())if(media.listingId===id&&!retained.has(media.id))await this.removeMedia(media);
  }
  async settings(publicOnly=false):Promise<OfficeSettings>{
    if(this.preview)return withPreview(state=>structuredClone(state.settings));
    const rows=await supabase<{data:OfficeSettings}[]>(this.locals,'/rest/v1/office_settings?id=eq.main&select=data',{},!publicOnly);
    if(!rows[0]){const {officeSettings}=await import('../seed');return structuredClone(officeSettings);}return settingsSchema.parse(rows[0].data);
  }
  async saveSettings(value:OfficeSettings){
    if(this.preview)return withPreview(state=>{state.settings=value;return structuredClone(value);},true);
    await supabase(this.locals,'/rest/v1/office_settings?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:'main',data:value})});return value;
  }
  async inquiries():Promise<Inquiry[]>{if(this.preview)return withPreview(state=>structuredClone(state.inquiries));const rows=await supabase<{data:Inquiry}[]>(this.locals,'/rest/v1/inquiries?select=data&order=created_at.desc&limit=500');return rows.map(row=>row.data);}
  async saveInquiry(inquiry:Inquiry){if(this.preview)return withPreview(state=>{const i=state.inquiries.findIndex(item=>item.id===inquiry.id);if(i<0)state.inquiries.unshift(inquiry);else state.inquiries[i]=inquiry;return inquiry;},true);await supabase(this.locals,'/rest/v1/inquiries?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:inquiry.id,data:inquiry,created_at:inquiry.createdAt})});return inquiry;}
  async rateLimit(key:string,limit:number,seconds:number){
    if(this.preview)return withPreview(state=>{const now=Date.now();state.rates=Object.fromEntries(Object.entries(state.rates).filter(([,item])=>item.expires>now));const item=state.rates[key]??{count:0,expires:now+seconds*1000};if(item.count>=limit)throw new HttpError(429,'Çok fazla talep gönderildi. Biraz sonra tekrar deneyin.','RATE_LIMIT');item.count++;state.rates[key]=item;},true);
    await rpc(this.locals,'ka_rate_limit',{p_key:key,p_limit:limit,p_seconds:seconds});
  }
  async media():Promise<MediaRecord[]>{if(this.preview)return withPreview(state=>structuredClone(state.media));const rows=await supabase<{id:string;listing_id:string;path:string;bytes:number;type:string;status:'pending'|'ready';created_at:string}[]>(this.locals,'/rest/v1/media_objects?select=*&order=created_at.desc');return rows.map(row=>({id:row.id,listingId:row.listing_id,path:row.path,bytes:row.bytes,type:row.type,status:row.status,createdAt:row.created_at}));}
  async mediaById(id:string):Promise<MediaRecord|undefined>{
    if(this.preview)return withPreview(state=>structuredClone(state.media.find(item=>item.id===id)));
    const rows=await supabase<{id:string;listing_id:string;path:string;bytes:number;type:string;status:'pending'|'ready';created_at:string}[]>(this.locals,`/rest/v1/media_objects?id=eq.${encodeURIComponent(id)}&select=*&limit=1`);const row=rows[0];return row?{id:row.id,listingId:row.listing_id,path:row.path,bytes:row.bytes,type:row.type,status:row.status,createdAt:row.created_at}:undefined;
  }
  async reserve(media:MediaRecord){
    if(this.preview)return withPreview(state=>{const current=state.media.reduce((sum,item)=>sum+item.bytes,0);if((current+media.bytes)/storageLimit(this.locals)>=.9)throw new HttpError(413,'Fotoğraf alanının %90 sınırına ulaşıldı.','STORAGE_QUOTA');if(state.media.filter(item=>item.listingId===media.listingId).length>=12)throw new HttpError(422,'Bir ilana en fazla 12 fotoğraf ekleyebilirsiniz.','PHOTO_LIMIT');state.media.push(media);},true);
    await rpc(this.locals,'ka_reserve_media',{p_id:media.id,p_listing_id:media.listingId,p_path:media.path,p_bytes:media.bytes,p_type:media.type,p_limit:storageLimit(this.locals)});
  }
  async finalize(id:string){if(this.preview)return withPreview(state=>{const item=state.media.find(row=>row.id===id);if(item)item.status='ready';},true);await supabase(this.locals,`/rest/v1/media_objects?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({status:'ready'})});}
  async removeMedia(media:MediaRecord){
    if(this.preview){await deleteLocalAsset(media.id);await withPreview(state=>{state.media=state.media.filter(item=>item.id!==media.id);},true);return;}
    const response=await storageRequest(this.locals,`object/ka-photos/${media.path.split('/').map(encodeURIComponent).join('/')}`,{method:'DELETE'});
    if(!response.ok&&response.status!==404)throw new HttpError(503,'Fotoğraf silinemedi. Alan rezervasyonu korunuyor.','STORAGE_DELETE');
    await supabase(this.locals,`/rest/v1/media_objects?id=eq.${encodeURIComponent(media.id)}`,{method:'DELETE',headers:{Prefer:'return=minimal'}});
  }
  async usage(){const media=await this.media();const usedBytes=media.filter(row=>row.status==='ready').reduce((sum,row)=>sum+row.bytes,0);const reservedBytes=media.filter(row=>row.status==='pending').reduce((sum,row)=>sum+row.bytes,0);const limitBytes=storageLimit(this.locals);const ratio=(usedBytes+reservedBytes)/limitBytes;return {usedBytes,reservedBytes,limitBytes,ratio,warning:ratio>=.8,blocked:ratio>=.9,mode:this.preview?'preview':'live'};}
}
