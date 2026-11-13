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

  new.id := coalesce(new.id, gen_random_uuid());
  new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb) - 'triznes_registration_code';

  insert into public.profiles (
    id, telegram_user_id, first_name, last_name, phone, email, role,
    character_code, status, access_level, onboarding_status, first_action
  ) values (
    new.id,
    v_telegram_user_id,
    v_registration_data ->> 'first_name',
    'Участник',
    v_registration_data ->> 'phone',
    new.email,
    v_registration_data ->> 'role',
    nullif(v_registration_data ->> 'character_code', ''),
    'pending',
    'white',
    'awaiting_confirmation',
    'open_city_map'
  ) on conflict (id) do update set
    telegram_user_id = excluded.telegram_user_id,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone = excluded.phone,
    email = excluded.email,
    role = excluded.role,
    character_code = excluded.character_code,
    access_level = excluded.access_level,
    onboarding_status = excluded.onboarding_status,
    first_action = excluded.first_action;

  insert into public.user_data (user_id, points, coins, xp, state_json)
  values (
    new.id,
    0,
    0,
    0,
    jsonb_build_object('profile', jsonb_build_object(
      'life', coalesce(v_registration_data ->> 'life', ''),
      'dream', coalesce(v_registration_data ->> 'dream', ''),
      'skills', coalesce(v_registration_data ->> 'skills', ''),
      'growth', coalesce(v_registration_data ->> 'growth', '')
    ))
  ) on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.consume_triznes_registration_code() from public, anon, authenticated;
drop trigger if exists triznes_registration_code_gate on auth.users;
create trigger triznes_registration_code_gate
  before insert on auth.users
  for each row execute function public.consume_triznes_registration_code();
