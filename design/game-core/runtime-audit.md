# Runtime audit — TRIZNES DANIEL
**Проверено:** 2026-11-11 · **Тип:** read-only инвентаризация · **Изменений в production не выполнялось**

## Главный вывод
Игровой backend уже существует. Нельзя начинать с создания нового Game Engine или дублирующих таблиц. Следующий этап — интеграция DIRTY PARADISE в существующий игровой контур и точечное расширение только после проверки реального API.

## Подтверждённые существующие компоненты

### Активная Edge Function
`triznes-game-core` — ACTIVE, version 26, verify_jwt=false с отдельной проверкой внутреннего заголовка `x-triznes-internal`. Внутри использует таблицы/ RPC игрового контура и Gemini для генерации ежедневного квеста. Не менять без отдельного security review.

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

### Игровой цикл
- `platform_players` — игровой профиль, alias, intention, preferred_roles, privacy_settings, daily_quest_opt_in.
- `apollon_player_game_state` — текущий уровень, статус, XP, миссия и состояние.
- `triznes_game_levels` — описание уровня, цель, guidance, completion signal, core task/proof, XP threshold, unlocks.
- `apollon_level00_progress` — семишаговый входной маршрут.
- `triznes_daily_quests` — ежедневные квесты.
- `triznes_player_proofs` — доказательства, приватность, согласие, review и XP.
- `apollon_game_events` — журнал игровых событий.
- Связанные RPC, используемые функцией: `resolve_player_for_identity`, `sync_apollon_game_memory`, `complete_level00`, `recalculate_player_xp`, `try_player_level_up`, `link_identity_by_registration_code`.

### Уже существующий мир и AR
- `triznes_world_places` — места и координаты.
- `triznes_world_map_layers` / `triznes_world_map_features` — слои карты и геометрия объектов.
- `sochiwood_life_events` — жизненные/кинематографические события, включая `consent_filming`, `consent_ar`, `rights_status`, `visibility`, `ar_payload`.
- `sochiwood_ar_layers` — AR-слои с типом якоря, anchor payload и content payload.
- `triznes_dream_worlds` / `triznes_dream_events` — персональные миры и журнал событий.
- `triznes_city_presence` / `triznes_city_connections` — добровольная видимость в городе и связи персонажей.
- `triznes_world_profiles` / `triznes_world_communities` — публичная витрина персонажей и сообществ.
- `locations` — пользовательская геолокация с точностью и consent_at; не путать с публичными POI.

### Связь с производством
- `triznes_impulses` / `triznes_impulse_events` — уже существующий автобус импульсов.
- `triznes_character_artifacts`, `triznes_media_intake_events`, `neurofarm_request_sources`, `sochiwood_operator_jobs` — артефакты, медиа-приём и производственные задания.

## Наблюдения по схеме
В инвентаризации 11 ноября все перечисленные выше таблицы имели RLS enabled. Счётчики строк в list_tables показывали:
- 2 записи в `apollon_level00_progress`, `triznes_daily_quests`, `apollon_player_game_state`, `apollon_game_events`;
- 0 для `triznes_game_levels`, `triznes_world_places`, `triznes_world_map_layers`, `triznes_world_map_features`, `sochiwood_life_events`, `sochiwood_ar_layers`, `triznes_dream_worlds`, `triznes_dream_events`, `triznes_city_presence`, `triznes_city_connections`, `triznes_impulses`, `triznes_impulse_events`, `triznes_world_profiles`, `triznes_world_communities`.
Эти счётчики — ориентир инвентаризации, а не доказательство отсутствия данных при всех возможных RLS/visibility контекстах. Перед наполнением нужно проверить выборки в правильном admin/service контексте и не копировать/перезаписывать существующие записи.

## Архитектурное решение
1. Не создавать вторую таблицу игроков, глав, уровней, квестов, proof или событий.
2. Сопоставить 6 глав и 13 уровней DIRTY PARADISE с существующим `triznes_game_levels` только после просмотра seed/config и текущей логики level-up. Не подменять существующие игровые уровни DP-уровнями.
3. Использовать `sochiwood_life_events` и `sochiwood_ar_layers` для жизненных сцен и AR, если их действующие policies/API подходят.
4. Использовать `triznes_world_places` и `triznes_world_map_features` для подтверждённых POI/геометрии; не писать координаты из визуальных макетов.
5. Использовать текущий `triznes-game-core` для текущего игрового цикла. Новые actions добавлять обратно совместимо и после тестирования.
6. Для Prompt-to-AR сначала определить/найти уже существующий backend route/Edge Function и контракт; не открывать прямой клиентский доступ к service role.
7. V2V вынести в отдельный GPU worker/WebRTC service. Supabase хранит метаданные, согласия, ссылки и игровые события, но не видеокадры.

## Что не было сделано
- Не менялись таблицы, policies, RPC, Edge Functions, secrets, storage, данные или production deployment.
- Не выполнялись INSERT/UPDATE/DELETE.
- Не подтверждались реальные POI координаты и доступность локаций.
- Не запускался live V2V/AR runtime и не измерялась задержка на устройстве.

## Следующие read-only проверки перед первой backend-реализацией
1. Прочитать определения `triznes_game_levels` и seed данных, сверить текущую модель уровней.
2. Получить политики RLS и RPC definition для `sochiwood_life_events` и `sochiwood_ar_layers`.
3. Проверить UI вызовы `triznes-game-core` и map data adapter.
4. Найти существующие Edge Functions для AR/world event creation, чтобы избежать дублей.
5. Сделать тестовый контракт на staging/dev branch; production менять только после прохождения тестов.
