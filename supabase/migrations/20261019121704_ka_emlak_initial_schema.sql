-- KA EMLAK: the Worker verifies Firebase identity. Only service_role may write.
create table public.listings (
  id text primary key,
  data jsonb not null,
  draft jsonb,
  status text not null check(status in ('draft','published','sold','rented','archived','trash')),
  version integer not null default 1 check(version>0),
  updated_at timestamptz not null default now(),
  check(data->>'id'=id),
  check(data->>'status'=status),
  check(jsonb_typeof(data)='object'),
  check(draft is null or jsonb_typeof(draft)='object')
);
create index listings_public_status_date on public.listings(status,updated_at desc);
create index listings_photo_lookup on public.listings using gin(data jsonb_path_ops) where status='published';
create table public.office_settings (id text primary key check(id='main'),data jsonb not null check(jsonb_typeof(data)='object'));
create table public.inquiries (id text primary key,data jsonb not null,created_at timestamptz not null default now());
create index inquiries_created on public.inquiries(created_at desc);
create table public.media_objects (
 id uuid primary key,listing_id text not null,path text not null unique,bytes bigint not null check(bytes>0 and bytes<=3000000),
 type text not null check(type in ('image/jpeg','image/png','image/webp')),status text not null check(status in ('pending','ready')),
 created_at timestamptz not null default now()
);
create index media_by_listing on public.media_objects(listing_id);
-- A lockable singleton serializes reservations across all Worker isolates.
create table public.storage_quota_lock (id integer primary key check(id=1));
insert into public.storage_quota_lock(id) values(1);
create table public.request_limits (key text primary key,count integer not null,expires_at timestamptz not null);
alter table public.listings enable row level security;
alter table public.office_settings enable row level security;
alter table public.inquiries enable row level security;
alter table public.media_objects enable row level security;
alter table public.storage_quota_lock enable row level security;
alter table public.request_limits enable row level security;
revoke all on public.listings,public.office_settings,public.inquiries,public.media_objects,public.storage_quota_lock,public.request_limits from anon,authenticated;
grant select(id,data,status,version,updated_at) on public.listings to anon,authenticated;
grant select on public.office_settings to anon,authenticated;
grant all on public.listings,public.office_settings,public.inquiries,public.media_objects,public.storage_quota_lock,public.request_limits to service_role;
create policy listings_published_read on public.listings for select to anon,authenticated using(status='published');
create policy office_public_read on public.office_settings for select to anon,authenticated using(true);

create function public.ka_commit_listing(p_id text,p_version integer,p_data jsonb,p_draft jsonb default null) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare result public.listings;
begin
 if p_data->>'id'<>p_id then raise exception 'INVALID_ID';end if;
 if p_version=0 then
  insert into public.listings(id,data,draft,status,version) values(p_id,p_data,p_draft,p_data->>'status',1) returning * into result;
 else
  update public.listings set data=p_data,draft=p_draft,status=p_data->>'status',version=p_version+1,updated_at=now()
   where id=p_id and version=p_version returning * into result;
  if not found then raise sqlstate 'PT409' using message='VERSION_CONFLICT';end if;
 end if;
 return to_jsonb(result);
end $$;

create function public.ka_delete_listing(p_id text,p_version integer) returns void
language plpgsql security invoker set search_path='' as $$
begin
 delete from public.listings where id=p_id and version=p_version and status='trash';
 if not found then raise sqlstate 'PT409' using message='VERSION_CONFLICT';end if;
end $$;

create function public.ka_import_listings(p_rows jsonb) returns void
language plpgsql security invoker set search_path='' as $$
declare item jsonb;
begin
 if jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows)>500 then raise exception 'INVALID_IMPORT';end if;
 for item in select * from jsonb_array_elements(p_rows) loop
  if item->'data'->>'status'<>'draft' or item->'data'->>'needsReview'<>'true' then raise exception 'IMPORT_MUST_BE_REVIEWED';end if;
  perform public.ka_commit_listing(item->>'id',0,item->'data',null);
 end loop;
end $$;

create function public.ka_reserve_media(p_id uuid,p_listing_id text,p_path text,p_bytes bigint,p_type text,p_limit bigint) returns void
language plpgsql security invoker set search_path='' as $$
declare total bigint;count_for_listing integer;
begin
 perform id from public.storage_quota_lock where id=1 for update;
 if not exists(select 1 from public.listings where id=p_listing_id and status<>'trash') then raise exception 'LISTING_MISSING';end if;
 select coalesce(sum(bytes),0) into total from public.media_objects;
 if p_bytes<=0 or p_bytes>3000000 or p_limit<=0 or (total+p_bytes)::numeric>=p_limit::numeric*0.9 then raise exception 'STORAGE_QUOTA';end if;
 select count(*) into count_for_listing from public.media_objects where listing_id=p_listing_id;
 if count_for_listing>=12 then raise exception 'PHOTO_LIMIT';end if;
 insert into public.media_objects(id,listing_id,path,bytes,type,status) values(p_id,p_listing_id,p_path,p_bytes,p_type,'pending');
end $$;

create function public.ka_rate_limit(p_key text,p_limit integer,p_seconds integer) returns void
language plpgsql security invoker set search_path='' as $$
declare attempts integer;
begin
 delete from public.request_limits where expires_at<now();
 insert into public.request_limits(key,count,expires_at) values(p_key,1,now()+make_interval(secs=>p_seconds))
 on conflict(key) do update set count=public.request_limits.count+1 returning count into attempts;
 if attempts>p_limit then raise exception 'RATE_LIMIT';end if;
end $$;

revoke all on function public.ka_commit_listing(text,integer,jsonb,jsonb),public.ka_delete_listing(text,integer),public.ka_import_listings(jsonb),public.ka_reserve_media(uuid,text,text,bigint,text,bigint),public.ka_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.ka_commit_listing(text,integer,jsonb,jsonb),public.ka_delete_listing(text,integer),public.ka_import_listings(jsonb),public.ka_reserve_media(uuid,text,text,bigint,text,bigint),public.ka_rate_limit(text,integer,integer) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('ka-photos','ka-photos',false,3000000,array['image/jpeg','image/png','image/webp']);
-- No anon/authenticated storage-object policy is granted. Worker media proxy is the only public path.
