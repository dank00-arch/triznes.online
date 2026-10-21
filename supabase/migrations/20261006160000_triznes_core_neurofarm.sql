create extension if not exists pgcrypto;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  alias text,
  current_level integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.player_identities (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  provider text not null check (provider in ('telegram','supabase_auth')),
  provider_user_id text not null,
  created_at timestamptz not null default now(),
  unique(provider, provider_user_id)
);

create table if not exists public.player_consents (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  consent_type text not null check (consent_type in ('ai_processing','private_storage','publication','soundtrack')),
  granted boolean not null,
  scope jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now()
);

create table if not exists public.character_dna (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  version integer not null default 1,
  dream text,
  favorite_colors text[] not null default '{}',
  aesthetic text,
  music_mood text,
  environment text,
  desired_role text,
  desired_image text,
  source_payload jsonb not null default '{}'::jsonb,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(player_id, version)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete set null,
  asset_type text not null check (asset_type in ('photo','image','video','audio','document')),
  storage_ref text not null,
  visibility text not null default 'private' check (visibility in ('private','internal','consent_needed','game','public')),
  ai_processing_allowed boolean not null default false,
  publication_allowed boolean not null default false,
  rights jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  character_dna_id uuid references public.character_dna(id) on delete set null,
  source_asset_id uuid references public.media_assets(id) on delete set null,
  provider text not null default 'runway',
  job_kind text not null check (job_kind in ('character_image','world_image','cinematic_shot','mini_film')),
  status text not null default 'draft' check (status in ('draft','ready','waiting_for_generator','queued','running','review','approved','failed','cancelled')),
  request_payload jsonb not null default '{}'::jsonb,
  provider_job_id text,
  result_payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists generation_jobs_player_status_idx on public.generation_jobs(player_id, status);
create index if not exists identities_player_idx on public.player_identities(player_id);
