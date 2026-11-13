-- Deployment SQL, not applied automatically. Existing data and webhooks are untouched.
begin;
create table public.triznes_personal_ai_keys (
 player_id uuid primary key references public.platform_players(id) on delete cascade,
 iv text not null, ciphertext text not null, updated_at timestamptz not null default now()
);
create table public.triznes_personal_ai_messages (
 id uuid primary key default gen_random_uuid(),
 player_id uuid not null references public.platform_players(id) on delete cascade,
 user_text text not null check(length(user_text)<=6000),
 assistant_text text not null check(length(assistant_text)<=16000),
 created_at timestamptz not null default now()
);
create index on public.triznes_personal_ai_messages(player_id,created_at desc);
create table public.triznes_personal_ai_limits (
 player_id uuid primary key references public.platform_players(id) on delete cascade,
 window_start timestamptz not null, requests integer not null
);
alter table public.triznes_personal_ai_keys enable row level security;
alter table public.triznes_personal_ai_messages enable row level security;
alter table public.triznes_personal_ai_limits enable row level security;
revoke all on public.triznes_personal_ai_keys,public.triznes_personal_ai_messages,public.triznes_personal_ai_limits from public,anon,authenticated;
grant select,insert,update,delete on public.triznes_personal_ai_keys,public.triznes_personal_ai_messages,public.triznes_personal_ai_limits to service_role;
create function public.triznes_personal_ai_take_slot(p_player uuid) returns boolean
language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 insert into public.triznes_personal_ai_limits as l values(p_player,now(),1)
 on conflict(player_id) do update set
 requests=case when l.window_start<now()-interval '1 minute' then 1 else l.requests+1 end,
 window_start=case when l.window_start<now()-interval '1 minute' then now() else l.window_start end
 returning requests into n;
 return n<=6;
end; $$;
revoke all on function public.triznes_personal_ai_take_slot(uuid) from public,anon,authenticated;
grant execute on function public.triznes_personal_ai_take_slot(uuid) to service_role;
commit;
