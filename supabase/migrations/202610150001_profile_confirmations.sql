create table if not exists public.triznes_player_profile_confirmations (
  player_id uuid primary key references public.platform_players(id) on delete cascade,
  confirmed_at timestamptz not null default now(),
  snapshot_sha256 text not null check (snapshot_sha256 ~ '^[0-9a-f]{64}$')
);

alter table public.triznes_player_profile_confirmations enable row level security;
revoke all on public.triznes_player_profile_confirmations from anon, authenticated;

