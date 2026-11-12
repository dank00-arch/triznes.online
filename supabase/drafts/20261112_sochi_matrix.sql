-- TRIZNES · SOCHI MATRIX · ЧЕРНОВИК. НЕ ПРИМЕНЁН. Применять только по отдельному «да» оператора.
-- Адаптация 02_DATABASE_SUPABASE из архива Аргона к существующему ядру (проект TRIZNES DANIEL).
-- Что изменено по сравнению с архивом:
--   * НЕ создаём public.characters / sochi_nodes / factions — в ядре уже есть triznes_character_storage,
--     triznes_character_pult_v и triznes_world_places. Вторая копия персонажей запрещена правилами ядра.
--   * Узлы = triznes_world_places: слой «Матрица» живёт в metadata->'matrix' (без новой таблицы).
--   * Уровень НЕ считается из XP формулой sqrt(xp/100): 13 ступеней канона проходятся заданиями.
--   * Живая геопозиция игроков не пишется и не транслируется. Только узел (slug), только по согласию.
--   * Новая таблица одна: triznes_world_pulses (импульсы проводников на карте), RLS включён,
--     анониму — только чтение публичных активных импульсов; запись — только сервер (service_role).

begin;

-- 1) Слой «Матрица» для существующих точек мира
update public.triznes_world_places set metadata = coalesce(metadata,'{}'::jsonb) || jsonb_build_object('matrix',
  case slug
    when 'mediahub-primorskaya' then '{"title":"ЦИТАДЕЛЬ ЯДРА · NEXUS-01","level":13,"guide":"triznes","color":"#42ecff"}'::jsonb
    when 'naberezhnaya-sochi'   then '{"title":"ВРАТА СОСТОЯНИЯ","level":0,"guide":"apollon","color":"#ffd36e"}'::jsonb
    when 'morport-sochi'        then '{"title":"КИНО-ДОК SOCHIWOOD","level":3,"guide":"dionysus","color":"#ff3dcb"}'::jsonb
  end)
where slug in ('mediahub-primorskaya','naberezhnaya-sochi','morport-sochi');

-- 2) Новая точка из архива Аргона — Навагинская (координаты OpenStreetMap)
insert into public.triznes_world_places (slug, name, city, category, latitude, longitude, reality_status, origin_type, description, active, visibility, source_ref, metadata)
values ('navaginskaya', 'Улица Навагинская', 'Сочи', 'city_scene', 43.58523, 39.72327, 'REAL', 'argon_sochi_matrix',
        'Пальмовая улица, где пересекаются персонажи. Ступень 7 «ГОРОД».', true, 'public', 'OSM Nominatim 2026-11-12',
        '{"matrix":{"title":"КОРИДОР МАРШРУТОВ","level":7,"guide":"bezliki","color":"#caff39"}}'::jsonb)
on conflict (slug) do nothing;
-- ТЕАТР ТУЗ, XPRO, «Школа ремонта» — не добавляем: нет подтверждённых адресов.

-- 3) Импульсы проводников на карте (адаптация world_events)
create table if not exists public.triznes_world_pulses (
  id uuid primary key default gen_random_uuid(),
  place_slug text not null references public.triznes_world_places(slug),
  guide text not null check (guide in ('apollon','triznes','bezliki','dionysus','chivurundu','lubik')),
  kind text not null check (kind in ('entry','quest','media','scene','route','heart')),
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
-- insert/update/delete: политик нет → только service_role (бот-мост и edge-функции).

alter publication supabase_realtime add table public.triznes_world_pulses;

commit;
