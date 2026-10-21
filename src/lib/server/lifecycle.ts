import type { AdminListing, Listing } from '../types';
import { slugify } from '../format';
import { assertPublishable } from './validation';
import { HttpError } from './http';

export type ListingAction = 'publish'|'archive'|'sold'|'rented'|'trash'|'restore'|'duplicate'|'feature'|'price';
export function newListing(): AdminListing {
  const now=new Date().toISOString(); const id=crypto.randomUUID();
  return { id, slug: `ilan-${id.slice(0,8)}`, title:'', transaction:'sale', propertyType:'apartment', price:null, currency:'TRY',period:'total',city:'Antalya',district:'',neighborhood:'',grossArea:0,netArea:null,rooms:'',bathrooms:null,floor:'',buildingAge:'',description:'',features:[],photos:[],status:'draft',featured:false,createdAt:now,updatedAt:now,version:1,needsReview:false,draft:null };
}
export function saveDraft(current: AdminListing, incoming: Listing): AdminListing {
  if (current.status==='trash') throw new HttpError(409,'Önce ilanı çöp kutusundan geri alın.','TRASHED');
  const now=new Date().toISOString(); const version=current.version+1;
  const draft={...incoming,id:current.id,slug:current.slug,status:current.status,createdAt:current.createdAt,updatedAt:now,version};
  if(current.status==='draft') return {...draft,draft:null};
  return {...current,version,updatedAt:now,draft};
}
export function transition(current: AdminListing, action: ListingAction, price?: number|null): AdminListing {
  const now=new Date().toISOString(); const version=current.version+1;
  if (action==='duplicate') {
    const original=current.draft ?? current; const duplicate=newListing();
    return {...original,id:duplicate.id,slug:duplicate.slug,title:`${original.title} — kopya`,status:'draft',featured:false,createdAt:now,updatedAt:now,version:1,needsReview:true,draft:null};
  }
  if(current.status==='trash' && action!=='restore') throw new HttpError(409,'Önce ilanı çöp kutusundan geri alın.','TRASHED');
  if(action==='publish') {
    const content={...(current.draft ?? current)}; delete (content as Partial<AdminListing>).draft; assertPublishable(content);
    return {...content,slug:`${slugify(content.title).slice(0,180) || 'ilan'}-${current.id.slice(0,8)}`,status:'published',needsReview:false,version,updatedAt:now,draft:null};
  }
  if(action==='feature') return {...current,featured:!current.featured,version,updatedAt:now,draft:current.draft ? {...current.draft,featured:!current.featured} : null};
  if(action==='price') {
    if(price === undefined || price!==null && (!Number.isFinite(price)||price<0||price>1e13)) throw new HttpError(400,'Geçerli bir fiyat girin.','PRICE');
    return {...current,price,version,updatedAt:now,draft:current.draft ? {...current.draft,price} : null};
  }
  if(action==='restore') {
    if(!['trash','archived','sold','rented'].includes(current.status)) throw new HttpError(409,'Bu ilan geri alınacak durumda değil.','STATUS');
    return {...(current.draft??current),status:'draft',version,updatedAt:now,draft:null};
  }
  if(action==='sold' && current.transaction!=='sale') throw new HttpError(422,'Yalnız satılık ilan satıldı olarak işaretlenebilir.','STATUS');
  if(action==='rented' && current.transaction!=='rent') throw new HttpError(422,'Yalnız kiralık ilan kiralandı olarak işaretlenebilir.','STATUS');
  const status = action==='archive'?'archived':action;
  if(!['archived','sold','rented','trash'].includes(status)) throw new HttpError(400,'İşlem tanınmadı.','ACTION');
  return {...current,status:status as Listing['status'],version,updatedAt:now};
}
