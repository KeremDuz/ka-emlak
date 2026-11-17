import { describe, expect, it } from 'vitest';
import { newListing, saveDraft, transition } from '../src/lib/server/lifecycle';
import { filterListings } from '../src/lib/server/filters';
import { listingSchema, imageKind } from '../src/lib/server/validation';
import { HttpError, boundedBody, sameOrigin } from '../src/lib/server/http';
import type { AdminListing } from '../src/lib/types';

function complete():AdminListing {return {...newListing(),title:'Bahçeli villa',city:'Antalya',district:'Konyaaltı',rooms:'4+1',description:'Bahçe ve geniş yaşam alanı sunan villa.',grossArea:220,price:8_000_000,photos:[{id:'photo',url:'/images/photo.webp',alt:'Bahçe'}]};}
describe('published snapshots and reversible lifecycle',()=>{
 it('autosave never changes the published public snapshot before explicit publish',()=>{
  const published=transition(complete(),'publish');const edited=saveDraft(published,{...published,title:'Yeni başlık',price:9_000_000});
  expect(edited.title).toBe('Bahçeli villa');expect(edited.price).toBe(8_000_000);expect(edited.draft?.title).toBe('Yeni başlık');
  const republished=transition(edited,'publish');expect(republished.title).toBe('Yeni başlık');expect(republished.draft).toBeNull();expect(republished.version).toBe(published.version+2);
 });
 it('requires publish fields, restores a trashed record as a draft and duplicates unpublished',()=>{
  expect(()=>transition(newListing(),'publish')).toThrow(HttpError);
  const live=transition(complete(),'publish');const trashed=transition(live,'trash');expect(()=>transition(trashed,'publish')).toThrow();
  expect(transition(trashed,'restore').status).toBe('draft');const copy=transition(live,'duplicate');expect(copy.id).not.toBe(live.id);expect(copy.status).toBe('draft');expect(copy.needsReview).toBe(true);
 });
 it('supports negotiated price and rejects a sold action for rentals',()=>{
  expect(transition(complete(),'price',null).price).toBeNull();expect(()=>transition({...complete(),transaction:'rent'},'sold')).toThrow();
 });
 it('lets a sold listing return to draft but never restores a live one',()=>{
  const live=transition(complete(),'publish');expect(()=>transition(live,'restore')).toThrow(HttpError);
  const reopened=transition(transition(live,'sold'),'restore');expect(reopened.status).toBe('draft');expect(reopened.title).toBe('Bahçeli villa');
 });
});
describe('public filters and input boundaries',()=>{
 it('does not leak draft or archived listings and respects currency/period',()=>{
  const live=transition(complete(),'publish');const euro={...live,id:'euro',currency:'EUR' as const,price:200_000};const archived={...live,id:'archive',status:'archived' as const};
  expect(filterListings([archived,newListing(),live,euro],{currency:'TRY',minPrice:'7000000'})).toEqual([live]);
  expect(filterListings([live,euro],{sort:'price-asc'}).map(item=>item.id)).toEqual([live.id,'euro']);
 });
 it('rejects hostile URLs, negative prices, too many photos and spoofed image extensions',()=>{
  const listing=complete();expect(listingSchema.safeParse({...listing,price:-1}).success).toBe(false);
  expect(listingSchema.safeParse({...listing,photos:Array(51).fill(listing.photos[0])}).success).toBe(false);
  expect(listingSchema.safeParse({...listing,photos:[{id:'x',url:'javascript:alert(1)',alt:''}]}).success).toBe(false);
  expect(imageKind(new TextEncoder().encode('<svg onload="alert(1)">'))).toBeNull();expect(imageKind(new Uint8Array([0xff,0xd8,0xff,0]))).toBe('image/jpeg');
 });
 it('rejects cross-origin writes and bounds chunked bodies without trusting Content-Length',async()=>{
  expect(()=>sameOrigin(new Request('https://ka.example/api/admin/listings',{method:'POST',headers:{Origin:'https://evil.example'}}))).toThrow();
  expect(()=>sameOrigin(new Request('https://ka.example/api/admin/listings',{method:'POST'}))).toThrow();
  const request=new Request('https://ka.example/api',{method:'POST',body:new Uint8Array(100)});await expect(boundedBody(request,50)).rejects.toMatchObject({status:413});
 });
});
