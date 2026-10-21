import type { Listing, PublicData } from '../types';
import { officeSettings } from '../seed';
import { Repository } from './repository';
import { isPreview, type ServerLocals } from './env';
// Ziyaretçiye yalnız yaklaşık konum gider (~100 m); panelde girilen tam nokta paylaşılmaz.
const approximate=(value?:number)=>value===undefined?undefined:Math.round(value*1000)/1000;
export function publicListing<T extends Listing>(listing:T):T{return {...listing,latitude:approximate(listing.latitude),longitude:approximate(listing.longitude)};}
export const publicPageSize=12;
export async function getPublicData(locals:ServerLocals={}):Promise<PublicData>{
  const repo=new Repository(locals);
  try {
    const [records,settings]=await Promise.all([repo.listings(true),repo.settings(true)]);
    const listings=records.map(({draft:_,...listing})=>publicListing(listing));
    return {listings,settings,mode:isPreview(locals)?'preview':'live',available:true};
  } catch(error) {
    console.error(JSON.stringify({event:'public_data_unavailable',type:error instanceof Error?error.name:'unknown'}));
    return {listings:[],settings:officeSettings,mode:isPreview(locals)?'preview':'live',available:false};
  }
}
