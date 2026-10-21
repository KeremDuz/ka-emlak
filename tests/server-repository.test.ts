import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Repository } from '../src/lib/server/repository';
import { exportBackup, importBackup } from '../src/lib/server/backup';

let directory:string;let repo:Repository;
beforeEach(async()=>{directory=await mkdtemp(join(tmpdir(),'ka-server-test-'));vi.stubEnv('DEV',true);vi.stubEnv('KA_PREVIEW_DIR',directory);repo=new Repository({preview:true});});
afterEach(async()=>{vi.unstubAllEnvs();await rm(directory,{recursive:true,force:true});});
describe('durable preview contract and concurrency',()=>{
 it('persists across repository instances and refuses a stale tab save',async()=>{
  const listing=await repo.create();const next=await repo.save(listing.id,{...listing,title:'İlk sekme'},listing.version);
  await expect(repo.save(listing.id,{...listing,title:'İkinci sekme'},listing.version)).rejects.toMatchObject({status:409});
  expect((await new Repository({preview:true}).listing(listing.id)).title).toBe('İlk sekme');expect(next.version).toBe(2);
 });
 it('serializes concurrent edits so precisely one wins',async()=>{
  const listing=await repo.create();const results=await Promise.allSettled([repo.save(listing.id,{...listing,title:'A'},1),repo.save(listing.id,{...listing,title:'B'},1)]);
  expect(results.filter(result=>result.status==='fulfilled')).toHaveLength(1);expect((await repo.listing(listing.id)).version).toBe(2);
 });
 it('makes reservations atomic and retains pending bytes in quota calculation',async()=>{
  const tiny=new Repository({preview:true,env:{STORAGE_LIMIT_BYTES:'1000'}});const listing=await tiny.create();
  const reserve=()=>tiny.reserve({id:crypto.randomUUID(),listingId:listing.id,path:crypto.randomUUID(),bytes:500,type:'image/jpeg',status:'pending',createdAt:new Date().toISOString()});
  const results=await Promise.allSettled([reserve(),reserve()]);expect(results.filter(result=>result.status==='fulfilled')).toHaveLength(1);
  const usage=await tiny.usage();expect(usage.usedBytes).toBe(0);expect(usage.reservedBytes).toBe(500);
 });
 it('round-trips a versioned record backup into new review-required drafts',async()=>{
  const original=await repo.create();await repo.save(original.id,{...original,title:'Yedeklenen kayıt'},1);
  const backup=await exportBackup(repo);const result=await importBackup(repo,backup);expect(result.imported).toBe(backup.listings.length);
  const copies=(await repo.listings()).filter(item=>item.title==='Yedeklenen kayıt');expect(copies).toHaveLength(2);expect(copies.some(item=>item.id!==original.id&&item.needsReview&&item.status==='draft')).toBe(true);
  expect(backup.containsPhotoFiles).toBe(false);
 });
 it('refuses preview state in a production build even if locals are forged',async()=>{
  vi.stubEnv('DEV',false);await expect(new Repository({preview:true}).create()).rejects.toMatchObject({status:503});
 });
});
