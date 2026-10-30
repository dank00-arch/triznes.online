-- Characters registered by the Telegram bot log in on the website with name + 4-digit code.
-- Character names must be unique because the name identifies the profile at login.
create unique index if not exists profiles_character_name_unique
  on public.profiles (lower(first_name))
  where role = 'character';

-- Parameters are qualified so the code is compared with the stored value, not with itself.
create or replace function public.lookup_character(character_name text, character_code text)
returns setof public.profiles
language sql
security definer
set search_path = public
as $$
  select p.*
  from public.profiles p
  where p.role = 'character'
    and p.character_code = trim(lookup_character.character_code)
    and (
      lower(trim(coalesce(p.first_name, ''))) = lower(trim(lookup_character.character_name))
      or lower(trim(concat_ws(' ', p.first_name, p.last_name))) = lower(trim(lookup_character.character_name))
    );
$$;

grant execute on function public.lookup_character(text, text) to anon, authenticated;
