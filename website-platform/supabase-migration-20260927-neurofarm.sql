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
grant execute on function public.reserve_farm_action(uuid, date) to service_role;create table if not exists public.farm_jobs (
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