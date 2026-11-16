-- PINK NOIZE editor access: DANIEL only.
-- Run this migration in the Supabase SQL editor.

create or replace function public.is_pink_noize_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'character'
      and upper(trim(first_name)) = 'DANIEL'
  );
$$;

grant execute on function public.is_pink_noize_editor() to authenticated;

drop policy if exists "Users manage own media metadata" on public.media_assets;
create policy "Users manage own media metadata" on public.media_assets
for all to authenticated
using (
  auth.uid() = user_id
  and (context <> 'pink-noize' or public.is_pink_noize_editor())
)
with check (
  auth.uid() = user_id
  and (context <> 'pink-noize' or public.is_pink_noize_editor())
);

drop policy if exists "Users upload own triznes media" on storage.objects;
create policy "Users upload own triznes media" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'triznes-media'
  and (storage.foldername(name))[1] = auth.uid()::text
  and ((storage.foldername(name))[2] <> 'pink-noize' or public.is_pink_noize_editor())
);

drop policy if exists "Users read own triznes media" on storage.objects;
create policy "Users read own triznes media" on storage.objects
for select to authenticated
using (
  bucket_id = 'triznes-media'
  and (storage.foldername(name))[1] = auth.uid()::text
  and ((storage.foldername(name))[2] <> 'pink-noize' or public.is_pink_noize_editor())
);
