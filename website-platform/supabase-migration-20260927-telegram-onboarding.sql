alter table public.profiles
  add column if not exists access_level text not null default 'white',
  add column if not exists onboarding_status text not null default 'not_started',
  add column if not exists first_action text not null default 'open_city_map';

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
  if p_telegram_user_id is null then return; end if;

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