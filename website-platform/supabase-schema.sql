create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id bigint unique,
  username text,
  first_name text,
  last_name text,
  phone text,
  email text,
  role text not null default 'character',
  mentor_id uuid null,
  character_code text null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists access_level text not null default 'white',
  add column if not exists onboarding_status text not null default 'not_started',
  add column if not exists first_action text not null default 'open_city_map';

create table if not exists public.telegram_registration_codes (
  code_hash text primary key,
  telegram_user_id bigint not null,
  registration_data jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.telegram_registration_codes
  add column if not exists registration_data jsonb not null default '{}'::jsonb;

alter table public.telegram_registration_codes enable row level security;
revoke all on public.telegram_registration_codes from anon, authenticated;
grant all on public.telegram_registration_codes to service_role;

create or replace function public.consume_triznes_registration_code()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_code text;
  v_telegram_user_id bigint;
  v_registration_data jsonb;
begin
  v_code := nullif(trim(new.raw_user_meta_data ->> 'triznes_registration_code'), '');
  if v_code is null or v_code !~ '^[0-9]{6}$' then
    raise exception 'TRIZNES_REGISTRATION_CODE_REQUIRED' using errcode = '23514';
  end if;

  delete from public.telegram_registration_codes
  where code_hash = encode(digest(v_code, 'sha256'), 'hex')
    and expires_at > now()
  returning telegram_user_id, registration_data into v_telegram_user_id, v_registration_data;

  if v_telegram_user_id is null or v_registration_data is null then
    raise exception 'TRIZNES_REGISTRATION_CODE_INVALID_OR_EXPIRED' using errcode = '23514';
  end if;

  if lower(new.email) is distinct from lower(v_registration_data ->> 'email')
    or new.raw_user_meta_data ->> 'first_name' is distinct from v_registration_data ->> 'first_name'
    or new.raw_user_meta_data ->> 'phone' is distinct from v_registration_data ->> 'phone'
    or nullif(new.raw_user_meta_data ->> 'character_code', '') is distinct from nullif(v_registration_data ->> 'character_code', '')
    or new.raw_user_meta_data ->> 'role' is distinct from v_registration_data ->> 'role'
    or new.raw_user_meta_data ->> 'life' is distinct from v_registration_data ->> 'life'
    or new.raw_user_meta_data ->> 'dream' is distinct from v_registration_data ->> 'dream'
    or new.raw_user_meta_data ->> 'skills' is distinct from v_registration_data ->> 'skills'
    or new.raw_user_meta_data ->> 'growth' is distinct from v_registration_data ->> 'growth' then
    raise exception 'TRIZNES_REGISTRATION_DATA_MISMATCH' using errcode = '23514';
  end if;

  new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb) - 'triznes_registration_code';
  return new;
end;
$$;

revoke all on function public.consume_triznes_registration_code() from public, anon, authenticated;
drop trigger if exists triznes_registration_code_gate on auth.users;
create trigger triznes_registration_code_gate
  before insert on auth.users
  for each row execute function public.consume_triznes_registration_code();

create table if not exists public.farm_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  brief text not null,
  kind text not null check (kind in ('text', 'video')),
  format text not null check (format in ('9:16', '16:9', '1:1')),
  status text not null default 'draft' check (status in ('draft', 'script_ready', 'approved', 'processing', 'completed', 'failed')),
  script text not null default '',
  error text,
  drive_url text,
  video_url text,
  provider_task_id text,
  processing_action text,
  last_polled_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists farm_jobs_owner_created_idx on public.farm_jobs (owner_id, created_at desc);

create table if not exists public.farm_settings (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  workspace_name text not null default 'Нейроферма',
  daily_limit integer not null default 10 check (daily_limit between 1 and 1000)
);

create table if not exists public.farm_daily_usage (
  owner_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  count integer not null default 0 check (count >= 0),
  primary key (owner_id, day)
);

create table if not exists public.farm_images (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  prompt text not null,
  format text not null check (format in ('1:1', '16:9', '9:16')),
  model text not null,
  status text not null default 'draft' check (status in ('draft', 'processing', 'completed', 'failed', 'interrupted')),
  object_path text,
  mime_type text,
  description text,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists farm_images_owner_created_idx on public.farm_images (owner_id, created_at desc);

create table if not exists public.farm_montages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  format text not null check (format in ('16:9', '9:16', '1:1')),
  clips jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'submitting', 'processing', 'completed', 'failed')),
  project_id text,
  video_url text,
  error text,
  last_polled_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists farm_montages_owner_created_idx on public.farm_montages (owner_id, created_at desc);

alter table public.farm_jobs enable row level security;
alter table public.farm_settings enable row level security;
alter table public.farm_daily_usage enable row level security;
alter table public.farm_images enable row level security;
alter table public.farm_montages enable row level security;
revoke all on public.farm_jobs, public.farm_settings, public.farm_daily_usage, public.farm_images, public.farm_montages from anon, authenticated;
grant all on public.farm_jobs, public.farm_settings, public.farm_daily_usage, public.farm_images, public.farm_montages to service_role;

create or replace function public.reserve_farm_action(p_owner_id uuid, p_day date default current_date)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_daily_limit integer;
  v_count integer;
begin
  insert into public.farm_settings (owner_id) values (p_owner_id) on conflict (owner_id) do nothing;
  select daily_limit into v_daily_limit from public.farm_settings where owner_id = p_owner_id for update;
  insert into public.farm_daily_usage (owner_id, day) values (p_owner_id, p_day) on conflict (owner_id, day) do nothing;
  select count into v_count from public.farm_daily_usage where owner_id = p_owner_id and day = p_day for update;
  if v_count >= v_daily_limit then raise exception 'FARM_DAILY_LIMIT_REACHED'; end if;
  update public.farm_daily_usage set count = count + 1 where owner_id = p_owner_id and day = p_day returning count into v_count;
  return v_count;
end;
$$;

revoke all on function public.reserve_farm_action(uuid, date) from public, anon, authenticated;
grant execute on function public.reserve_farm_action(uuid, date) to service_role;

create table if not exists public.telegram_link_tokens (
  token_hash text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.telegram_link_tokens enable row level security;
revoke all on public.telegram_link_tokens from anon, authenticated;
grant all on public.telegram_link_tokens to service_role;

create or replace function public.consume_telegram_link(
  p_token_hash text,
  p_telegram_user_id bigint,
  p_telegram_username text default null
)
returns table (
  linked_profile_id uuid,
  first_name text,
  role text,
  access_level text,
  onboarding_status text,
  first_action text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id uuid;
  v_first_name text;
  v_role text;
  v_access_level text;
  v_onboarding_status text;
  v_first_action text;
begin
  select token.profile_id into v_profile_id
  from public.telegram_link_tokens as token
  where token.token_hash = p_token_hash and token.expires_at > now()
  for update;

  if not found then return; end if;

  update public.profiles as profile
  set telegram_user_id = p_telegram_user_id,
      username = coalesce(nullif(trim(p_telegram_username), ''), profile.username),
      access_level = 'white',
      onboarding_status = case when profile.onboarding_status = 'complete' then 'complete' else 'in_progress' end,
      first_action = coalesce(nullif(profile.first_action, ''), 'open_city_map'),
      updated_at = now()
  where profile.id = v_profile_id
    and (profile.telegram_user_id is null or profile.telegram_user_id = p_telegram_user_id)
  returning profile.first_name, profile.role, profile.access_level, profile.onboarding_status, profile.first_action
  into v_first_name, v_role, v_access_level, v_onboarding_status, v_first_action;

  if not found then return; end if;

  delete from public.telegram_link_tokens as token where token.token_hash = p_token_hash;

  insert into public.user_data as existing_data (user_id, points, coins, xp, state_json)
  values (
    v_profile_id,
    0,
    0,
    0,
    jsonb_build_object('onboarding', jsonb_build_object('level', 'white', 'status', 'in_progress', 'firstAction', v_first_action))
  )
  on conflict (user_id) do update
    set state_json = coalesce(existing_data.state_json, '{}'::jsonb)
      || jsonb_build_object('onboarding', jsonb_build_object('level', 'white', 'status', 'in_progress', 'firstAction', v_first_action)),
        updated_at = now();

  return query select v_profile_id, v_first_name, v_role, v_access_level, v_onboarding_status, v_first_action;
end;
$$;

revoke all on function public.consume_telegram_link(text, bigint, text) from public, anon, authenticated;
grant execute on function public.consume_telegram_link(text, bigint, text) to service_role;

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  terms_accepted boolean not null default false,
  filming_accepted boolean not null default false,
  personal_data_accepted boolean not null default false,
  email_marketing_accepted boolean not null default false,
  location_accepted boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.user_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  points integer not null default 0,
  coins integer not null default 0,
  xp integer not null default 0,
  state_json jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  city text,
  address text,
  latitude double precision,
  longitude double precision,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  latitude double precision,
  longitude double precision,
  accuracy_m double precision,
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  object_path text not null,
  context text not null default 'character',
  original_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create unique index if not exists media_assets_object_path_idx
on public.media_assets (object_path);

create table if not exists public.platform_visits (
  visitor_id text primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

alter table public.platform_visits enable row level security;

create or replace function public.register_platform_visit(p_visitor_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_visitor_id is null or length(trim(p_visitor_id)) < 16 then
    return;
  end if;
  insert into public.platform_visits (visitor_id)
  values (trim(p_visitor_id))
  on conflict (visitor_id) do update set last_seen = now();
end;
$$;

create or replace function public.get_platform_stats()
returns table(visitor_count bigint, registered_count bigint)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*) from public.platform_visits),
    (select count(*) from public.profiles);
$$;

revoke all on table public.platform_visits from anon, authenticated;
grant execute on function public.register_platform_visit(text) to anon, authenticated;
grant execute on function public.get_platform_stats() to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.consents enable row level security;
alter table public.user_data enable row level security;
alter table public.communities enable row level security;
alter table public.locations enable row level security;
alter table public.media_assets enable row level security;

create policy "Allow insert profiles" on public.profiles
for insert with check (true);

create policy "Allow update profiles" on public.profiles
for update using (true);

create policy "Allow select profiles" on public.profiles
for select using (true);

create policy "Allow insert consents" on public.consents
for insert with check (true);

create policy "Allow select consents" on public.consents
for select using (true);

create policy "Allow insert user_data" on public.user_data
for insert with check (true);

create policy "Allow update user_data" on public.user_data
for update using (true);

create policy "Allow select user_data" on public.user_data
for select using (true);

create policy "Allow insert communities" on public.communities
for insert with check (true);

create policy "Allow select communities" on public.communities
for select using (true);

create policy "Allow insert locations" on public.locations
for insert with check (true);

create policy "Allow update locations" on public.locations
for update using (true);

create policy "Allow select locations" on public.locations
for select using (true);

create policy "Users manage own media metadata" on public.media_assets
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.lookup_character(character_name text, character_code text)
returns setof public.profiles
language sql
security definer
set search_path = public
as $$
  select *
  from public.profiles
  where lower(coalesce(first_name, '') || ' ' || coalesce(last_name, '')) = lower(trim(character_name))
    and character_code = trim(character_code)
    and role = 'character';
$$;

create or replace function public.search_mentors(search_text text)
returns table (id uuid, first_name text, last_name text, role text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.first_name, p.last_name, p.role
  from public.profiles p
  where p.role = 'mentor'
    and (coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')) ilike '%' || trim(search_text) || '%'
  order by p.first_name, p.last_name;
$$;

grant execute on function public.lookup_character(text, text) to anon, authenticated;
grant execute on function public.search_mentors(text) to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('triznes-media', 'triznes-media', false)
on conflict (id) do nothing;

create policy "Users upload own triznes media" on storage.objects
for insert to authenticated
with check (bucket_id = 'triznes-media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users read own triznes media" on storage.objects
for select to authenticated
using (bucket_id = 'triznes-media' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.live_streams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  room_name text not null unique,
  title text not null,
  status text not null default 'starting' check (status in ('starting', 'live', 'ended', 'failed')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  ended_at timestamptz
);

create index if not exists live_streams_status_created_idx
on public.live_streams (status, created_at desc);

create unique index if not exists live_streams_one_active_per_owner_idx
on public.live_streams (owner_id)
where status in ('starting', 'live');

alter table public.live_streams enable row level security;
revoke all on public.live_streams from anon, authenticated;
grant all on public.live_streams to service_role;

create or replace function public.reserve_live_stream(
  p_owner_id uuid,
  p_room_name text,
  p_title text,
  p_max_active_streams integer default 15
)
returns setof public.live_streams
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  active_count integer;
begin
  if p_max_active_streams < 1 or p_max_active_streams > 15 then
    raise exception 'LIVE_STREAM_LIMIT_MUST_BE_BETWEEN_1_AND_15';
  end if;

  perform pg_advisory_xact_lock(hashtext('triznes-live-stream-reservations')::bigint);
  select count(*) into active_count
  from public.live_streams
  where status in ('starting', 'live');

  if active_count >= p_max_active_streams then
    raise exception 'MAX_ACTIVE_LIVE_STREAMS_REACHED';
  end if;

  return query
    insert into public.live_streams (owner_id, room_name, title, status)
    values (p_owner_id, p_room_name, p_title, 'starting')
    returning *;
end;
$$;

create or replace function public.activate_live_stream(p_stream_id uuid, p_owner_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  updated_count integer;
begin
  update public.live_streams
  set status = 'live', started_at = coalesce(started_at, now())
  where id = p_stream_id and owner_id = p_owner_id and status = 'starting';
  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

create or replace function public.finish_live_stream(
  p_stream_id uuid,
  p_owner_id uuid,
  p_final_status text default 'ended'
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  updated_count integer;
begin
  if p_final_status not in ('ended', 'failed') then
    raise exception 'INVALID_FINAL_LIVE_STREAM_STATUS';
  end if;

  update public.live_streams
  set status = p_final_status, ended_at = now()
  where id = p_stream_id and owner_id = p_owner_id and status in ('starting', 'live');
  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$$;

revoke all on function public.reserve_live_stream(uuid, text, text, integer) from public, anon, authenticated;
revoke all on function public.activate_live_stream(uuid, uuid) from public, anon, authenticated;
revoke all on function public.finish_live_stream(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.reserve_live_stream(uuid, text, text, integer) to service_role;
grant execute on function public.activate_live_stream(uuid, uuid) to service_role;
grant execute on function public.finish_live_stream(uuid, uuid, text) to service_role;

create trigger profiles_updated_at
before update on public.profiles
for each row execute procedure public.update_updated_at();

create trigger user_data_updated_at
before update on public.user_data
for each row execute procedure public.update_updated_at();

create trigger locations_updated_at
before update on public.locations
for each row execute procedure public.update_updated_at();
