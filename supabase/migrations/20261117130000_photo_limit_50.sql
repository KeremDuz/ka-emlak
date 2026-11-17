-- Bir ilana en fazla 50 fotoğraf (sahibinden ilanlarındaki bütün fotoğraflar sığsın). Kodda src/lib/limits.ts MAX_PHOTOS.
create or replace function public.ka_reserve_media(p_id uuid,p_listing_id text,p_path text,p_bytes bigint,p_type text,p_limit bigint) returns void
language plpgsql security invoker set search_path='' as $$
declare total bigint;count_for_listing integer;
begin
 perform id from public.storage_quota_lock where id=1 for update;
 if not exists(select 1 from public.listings where id=p_listing_id and status<>'trash') then raise exception 'LISTING_MISSING';end if;
 select coalesce(sum(bytes),0) into total from public.media_objects;
 if p_bytes<=0 or p_bytes>3000000 or p_limit<=0 or (total+p_bytes)::numeric>=p_limit::numeric*0.9 then raise exception 'STORAGE_QUOTA';end if;
 select count(*) into count_for_listing from public.media_objects where listing_id=p_listing_id;
 if count_for_listing>=50 then raise exception 'PHOTO_LIMIT';end if;
 insert into public.media_objects(id,listing_id,path,bytes,type,status) values(p_id,p_listing_id,p_path,p_bytes,p_type,'pending');
end $$;
revoke all on function public.ka_reserve_media(uuid,text,text,bigint,text,bigint) from public,anon,authenticated;
grant execute on function public.ka_reserve_media(uuid,text,text,bigint,text,bigint) to service_role;
