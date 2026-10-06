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