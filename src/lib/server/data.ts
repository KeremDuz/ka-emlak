import type { Listing, PublicData } from '../types';
import { officeSettings } from '../seed';
import { Repository } from './repository';
import { isPreview, type ServerLocals } from './env';
// Ziyaretçiye yalnız yaklaşık konum gider (~100 m); panelde girilen tam nokta paylaşılmaz.
const approximate=(value?:number)=>value===undefined?undefined:Math.round(value*1000)/1000;
export function publicListing<T extends Listing>(listing:T):T{return {...listing,latitude:approximate(listing.latitude),longitude:approximate(listing.longitude)};}
export const publicPageSize=12;
// Aynı Worker örneğinde kısa süreli bellek önbelleği: sık ziyarette her sayfa veritabanına gitmez.
// Paneldeki değişiklik aynı örnekte hemen, ötekilerde en geç 15 sn içinde görünür.
const cacheMs=15_000;
let cached:{at:number;data:PublicData}|undefined;
export function clearPublicDataCache(){cached=undefined;}
export async function getPublicData(locals:ServerLocals={}):Promise<PublicData>{
  const live=!isPreview(locals);
  if(live&&cached&&Date.now()-cached.at<cacheMs)return cached.data;
  const repo=new Repository(locals);
  try {
    const [records,settings]=await Promise.all([repo.listings(true),repo.settings(true)]);
    const listings=records.map(({draft:_,...listing})=>publicListing(listing));
    const data:PublicData={listings,settings,mode:live?'live':'preview',available:true};
    if(live)cached={at:Date.now(),data};
    return data;
  } catch(error) {
    console.error(JSON.stringify({event:'public_data_unavailable',type:error instanceof Error?error.name:'unknown'}));
    return {listings:[],settings:officeSettings,mode:live?'live':'preview',available:false};
  }
}
