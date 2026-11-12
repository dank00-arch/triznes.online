-- TRIZNES · Сочи 3D «Новый мир» + пауза ClickUp · оператор дал «да» 12.11.2026.
-- Как применить: Supabase Dashboard → SQL Editor → вставить весь файл → Run. Повторный запуск безопасен.
update public.triznes_world_places set metadata = coalesce(metadata,'{}'::jsonb) || jsonb_build_object('matrix',
  case slug
    when 'mediahub-primorskaya' then '{"title":"ЦИТАДЕЛЬ ЯДРА · NEXUS-01","level":13,"guide":"triznes","color":"#42ecff"}'::jsonb
    when 'naberezhnaya-sochi'   then '{"title":"ВРАТА СОСТОЯНИЯ","level":0,"guide":"apollon","color":"#ffd36e"}'::jsonb
    when 'morport-sochi'        then '{"title":"КИНО-ДОК SOCHIWOOD","level":3,"guide":"dionysus","color":"#ff3dcb"}'::jsonb
  end), updated_at = now()
where slug in ('mediahub-primorskaya','naberezhnaya-sochi','morport-sochi');

insert into public.triznes_world_places (slug, name, city, category, address, latitude, longitude, reality_status, origin_type, description, active, visibility, source_ref, sort_order, metadata)
values
 ('navaginskaya', 'Улица Навагинская', 'Сочи', 'city_scene', 'улица Навагинская, Сочи', 43.58523, 39.72327, 'REAL', 'argon_sochi_matrix',
  'Пальмовая улица, где пересекаются персонажи. Ступень 7 «ГОРОД».', true, 'public', 'OSM Nominatim 2026-11-12', 15,
  '{"matrix":{"title":"КОРИДОР МАРШРУТОВ","level":7,"guide":"bezliki","color":"#caff39"}}'::jsonb),
 ('xpro-navaginskaya-7', 'XPRO · техно-станция', 'Сочи', 'partner_space', 'улица Навагинская, 7, Сочи', 43.58650, 39.72225, 'REAL', 'operator',
  'Сервис быстрого ремонта техники. Партнёрская техно-станция игроков в центре Сочи.', true, 'public', 'адрес от оператора 12.11.2026 · координаты OSM', 16,
  '{"matrix":{"title":"ЛАБОРАТОРИЯ СВЯЗИ","level":0,"guide":null,"color":"#3399ff"}}'::jsonb)
on conflict (slug) do nothing;

create table if not exists public.triznes_world_pulses (
  id uuid primary key default gen_random_uuid(),
  place_slug text not null references public.triznes_world_places(slug),
  guide text check (guide in ('apollon','triznes','bezliki','dionysus','chivurundu','lubik')),
  kind text not null check (kind in ('entry','quest','media','scene','route','heart','news')),
  title text not null check (char_length(title) <= 140),
  level_no smallint check (level_no between 0 and 13),
  visibility text not null default 'internal' check (visibility in ('public','internal')),
  source text not null default 'assistant',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '4 hours'
);
create index if not exists triznes_world_pulses_active_idx on public.triznes_world_pulses (expires_at desc);
alter table public.triznes_world_pulses enable row level security;
drop policy if exists "pulses public read" on public.triznes_world_pulses;
create policy "pulses public read" on public.triznes_world_pulses
  for select to anon, authenticated using (visibility = 'public' and expires_at > now());
revoke insert, update, delete on public.triznes_world_pulses from anon, authenticated;
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='triznes_world_pulses') then
    alter publication supabase_realtime add table public.triznes_world_pulses;
  end if;
end $$;

-- новый кадр в Нейроферме -> вспышка над медиахабом (без имён и файлов, не чаще раза в 2 минуты)
create or replace function private.triznes_pulse_on_media_intake()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.triznes_world_pulses where source='media_intake' and created_at > now() - interval '2 minutes') then
    insert into public.triznes_world_pulses(place_slug, guide, kind, title, visibility, source, expires_at)
    values ('mediahub-primorskaya','triznes','media','Нейроферма приняла новый кадр','public','media_intake', now() + interval '2 hours');
  end if;
  return new;
exception when others then return new;
end $$;
drop trigger if exists trg_triznes_pulse_media on public.triznes_media_intake_events;
create trigger trg_triznes_pulse_media after insert on public.triznes_media_intake_events
for each row execute function private.triznes_pulse_on_media_intake();

-- мир приложения: + координаты, адрес, слой «Матрица», активные импульсы
create or replace function public.triznes_app_world()
 returns jsonb language sql stable security definer set search_path to 'public','extensions'
as $function$
select jsonb_build_object(
 'levels', coalesce((select jsonb_agg(jsonb_build_object('no',level_no,'title',title,'purpose',purpose,'task',core_task,'proof',core_proof,'act',metadata->>'act') order by level_no) from triznes_game_levels where active),'[]'),
 'places', coalesce((select jsonb_agg(jsonb_build_object('slug',slug,'name',name,'category',category,'description',left(description,300),'x',map_x,'y',map_y,'status',reality_status,'latitude',latitude,'longitude',longitude,'address',address,'matrix',metadata->'matrix') order by sort_order) from triznes_world_places where active and coalesce(visibility,'public')='public'),'[]'),
 'guides', coalesce((select jsonb_agg(g order by o) from (select distinct on (display_name_ru) jsonb_build_object('slug',slug,'name',display_name_ru,'role',family_role,'purpose',left(purpose,300)) g, family_order o from assistant_family_members where enabled order by display_name_ru, family_order) s),'[]'),
 'communities', coalesce((select jsonb_agg(jsonb_build_object('slug',slug,'name',name,'city',city,'role',coalesce(metadata->>'role',metadata->>'method')) order by sort_order) from triznes_world_communities where status='active' and visibility='public'),'[]'),
 'news', coalesce((select jsonb_agg(n) from (select jsonb_build_object('headline',left(headline,160),'summary',left(summary,280),'source',source_name,'url',source_url,'at',published_at,'category',category) n from triznes_world_live_news order by published_at desc nulls last limit 12) s),'[]'),
 'pulses', coalesce((select jsonb_agg(p) from (select jsonb_build_object('place',place_slug,'guide',guide,'kind',kind,'title',title,'level',level_no,'at',created_at) p from triznes_world_pulses where visibility='public' and expires_at > now() order by created_at desc limit 20) s),'[]')
);
$function$;

-- ClickUp выключен оператором 12.11.2026: ставим на паузу синхронизацию (обратимо: active := true)
select cron.alter_job(jobid, active := false) from cron.job
where jobname in ('triznes-clickup-outbox-fill-1m','triznes-clickup-pull-2m','triznes-clickup-resolve-fill-1m','triznes-assign-vsevolod-clickup','triznes-clickup-zone-route-2m');
