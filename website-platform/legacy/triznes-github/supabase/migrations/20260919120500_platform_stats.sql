create table if not exists public.platform_visits (
  visitor_id text primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

alter table public.platform_visits enable row level security;

create or replace function public.register_platform_visit(p_visitor_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_visitor_id is null or length(trim(p_visitor_id)) < 16 then
    return;
  end if;
  insert into public.platform_visits (visitor_id)
  values (trim(p_visitor_id))
  on conflict (visitor_id) do update set last_seen = now();
end;
$$;

create or replace function public.get_platform_stats()
returns table(visitor_count bigint, registered_count bigint)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*) from public.platform_visits),
    (select count(*) from public.profiles);
$$;

revoke all on table public.platform_visits from anon, authenticated;
grant execute on function public.register_platform_visit(text) to anon, authenticated;
grant execute on function public.get_platform_stats() to anon, authenticated;
