-- TRIZNES CINEMA 24/7 | proposed additive schema | deploy only after production auth mapping has been verified.
-- Safe-by-default: no client table privileges and no change to existing authentication, memberships or media tables.
create table if not exists public.triznes_cinema_submissions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.platform_players(id),
  identity_id uuid not null,
  title text not null check (length(title) between 3 and 130),
  description text not null default '',
  original_filename text not null,
  mime_type text not null check (mime_type in ('video/mp4','video/quicktime','video/webm')),
  size_bytes bigint not null check (size_bytes between 1 and 104857600),
  storage_bucket text not null default 'triznes-media',
  storage_path text not null unique,
  rights_declared boolean not null default false,
  consents_declared boolean not null default false,
  status text not null default 'uploading' check (status in ('uploading','submitted','published','rejected','withdrawn')),
  reviewer_player_id uuid null,
  review_note text,
  rights_evidence_ref text,
  consent_evidence_ref text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists triznes_cinema_submissions_player_status_idx on public.triznes_cinema_submissions(player_id,status);
create index if not exists triznes_cinema_submissions_published_idx on public.triznes_cinema_submissions(status,reviewed_at desc) where status='published';
alter table public.triznes_cinema_submissions enable row level security;
revoke all on table public.triznes_cinema_submissions from public, anon, authenticated;

create table if not exists public.triznes_cinema_review_events (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.triznes_cinema_submissions(id),
  reviewer_player_id uuid not null references public.platform_players(id),
  decision text not null check (decision in ('approve','reject','withdraw')),
  decision_note text not null,
  rights_evidence_ref text,
  consent_evidence_ref text,
  created_at timestamptz not null default now()
);
create index if not exists triznes_cinema_review_events_submission_idx on public.triznes_cinema_review_events(submission_id,created_at desc);
alter table public.triznes_cinema_review_events enable row level security;
revoke all on table public.triznes_cinema_review_events from public, anon, authenticated;
-- Storage uses the existing PRIVATE triznes-media bucket. The Edge Function creates random paths
-- under cinema-intake/{player_uuid}/{random_uuid}.{extension}; never grants broad public storage read.
-- Existing system_admins must be explicitly mapped to player identities before enabling approval.
