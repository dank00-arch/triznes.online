# Runtime audit — TRIZNES DANIEL
**Проверено:** 2026-11-11 · **Тип:** read-only инвентаризация · **Изменений в production не выполнялось**

## Главный вывод
Игровой backend уже существует и содержит канонический 13-уровневый путь. DIRTY PARADISE нужно наложить на него как сценарную вселенную, не создавая второй набор уровней, XP, квестов или AR-таблиц.

## Активная Edge Function
`triznes-game-core` — ACTIVE, version 26, `verify_jwt=false` с отдельной проверкой внутреннего заголовка `x-triznes-internal`. Функция использует таблицы/RPC игрового контура и Gemini для генерации ежедневного квеста. Не менять без отдельного security review.

Поддерживаемые actions по фактическому GET response и коду:
- status
- link
- level00_step
- complete_level00
- profile_update
- daily_quest
- complete_daily
- submit_proof
- review_proof
- try_level_up

## Канонический игровой маршрут — 13 активных уровней
Read-only SELECT из `triznes_game_levels` вернул 13 активных записей `creator_path_v1`:
1. СЛОВО — СТИХОТВОРЕНИЕ
2. ГОЛОС — ПЕСНЯ
3. СЦЕНА — ВЫСТУПИ
4. МАСКА — ПЕРСОНАЖ
5. ИМПРОВИЗАЦИЯ
6. ДУЭТ
7. ГОРОД — ЖИВАЯ СЦЕНА
8. КОЛЛАЙДЕР
9. РЕЖИССУРА
10. НОМЕР
11. ЦЕННОСТЬ — ПРОДАЖА
12. СОБЫТИЕ
13. АВТОР ИГРЫ

Уровни имеют активные `slug`, `purpose`, `core_task`, `completion_signal`, а также поля `core_proof`, `min_level_xp`, `daily_quest_min`, `unlocks`. Это действующая механика; не менять семантику заданий при добавлении DIRTY PARADISE.

## Существующие игровые таблицы
- `platform_players` — профиль игрока, alias, intention, preferred_roles, privacy_settings, daily_quest_opt_in.
- `apollon_player_game_state` — текущий уровень, статус, XP, миссия и состояние.
- `triznes_game_levels` — 13-уровневая конфигурация маршрута.
- `apollon_level00_progress` — семишаговый входной маршрут.
- `triznes_daily_quests` — ежедневные квесты.
- `triznes_player_proofs` — доказательства, приватность, согласие, review и XP.
- `apollon_game_events` — журнал игровых событий.

Связанные RPC, используемые функцией: `resolve_player_for_identity`, `sync_apollon_game_memory`, `complete_level00`, `recalculate_player_xp`, `try_player_level_up`, `link_identity_by_registration_code`.

## Существующий WORLD / AR слой
- `triznes_world_places` — реальные POI. Read-only выборка вернула 9 мест; 7 имеют координаты: Media Hub TRIZNES (Приморская, 6/4), Морской вокзал, Набережная Сочи, Мамайка, Красная Поляна, Ахун, Дагомыс. У Villa Poliana и «Мелодии» координат нет.
- `triznes_world_map_layers` — 5 активных публичных слоёв: world-zones, places, communities, scenes, quests.
- `triznes_world_map_features` — 3 активных публичных геометрии: центральная линия живого кино, центральная зона и горная ось. Геометрии имеют `reality_status=ARTISTIC_BRANCH`; это художественные игровые объекты, а не подтверждённая навигация.
- `triznes_world_communities` — 5 активных публичных сообществ, включая PINK NOIZE, ТЕАТР ТУЗ и ЗА ЛЮБОВЬ.
- `sochiwood_life_events` — одна найденная запись; она `status=rejected`, `visibility=private`, `rights_status=owner_only`. Это не опубликованная AR-сцена.
- `sochiwood_ar_layers` — read-only выборка пока пустая; работающий AR-слой в production не подтверждён.
- `triznes_dream_worlds` / `triznes_dream_events` — таблицы персональных миров и журнала событий; данные в проверенной выборке не возвращены.
- `triznes_city_presence` / `triznes_city_connections` — добровольная видимость в городе и связи персонажей.
- `locations` — пользовательская геолокация с точностью и `consent_at`; не путать с публичными POI.

## Связь с производством
- `triznes_impulses` / `triznes_impulse_events` — существующий автобус импульсов.
- `triznes_character_artifacts`, `triznes_media_intake_events`, `neurofarm_request_sources`, `sochiwood_operator_jobs` — артефакты, медиа-приём и производственные задания.

## Архитектурное решение
1. Не создавать вторую таблицу игроков, уровней, квестов, proof, world places или AR layers.
2. Шесть глав UI группируют существующие 13 уровней: 1 / 2–4 / 5–7 / 8–9 / 10–12 / 13. Это навигационная группировка, не новая схема XP.
3. Четыре акта DIRTY PARADISE используют те же уровни: 1–3 / 4–6 / 7–10 / 11–13.
4. Использовать существующие `sochiwood_life_events` и `sochiwood_ar_layers`, но сначала найти действующие policies/API; текущая выборка не доказывает готовность production AR.
5. Использовать `triznes_world_places` и `triznes_world_map_features`; различать REAL POI и `ARTISTIC_BRANCH`. Не выдавать художественную линию за навигационный маршрут.
6. Существующий `triznes-game-core` остаётся источником истины для текущего игрового цикла. Новые actions добавлять обратно совместимо и после тестирования.
7. Для Prompt-to-AR сначала найти существующий backend route/Edge Function; не открывать клиентский доступ к service role.
8. V2V вынести в отдельный GPU worker/WebRTC service. Supabase хранит метаданные, согласия, ссылки и события, но не видеокадры.

## Что не было сделано
- Не менялись таблицы, policies, RPC, Edge Functions, secrets, storage, данные или production deployment.
- Не выполнялись INSERT/UPDATE/DELETE.
- Не создавались новые production POI или AR-события.
- Не запускался live V2V/AR runtime и не измерялась задержка на устройстве.

## Следующие проверки перед первой backend-реализацией
1. Получить RLS policies и RPC definitions для `sochiwood_life_events`, `sochiwood_ar_layers`, `triznes_world_map_features`.
2. Проверить UI-вызовы `triznes-game-core` и map data adapter.
3. Найти существующие Edge Functions для AR/world event creation.
4. Сделать тестовый контракт на staging/dev branch; production менять только после прохождения тестов.
