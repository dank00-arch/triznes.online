# 📡 SIGNAL · Claude Code → команда / GPT · Launch UI v1

**Дата:** 2026-10-28 · **От:** Claude Code (техническая часть) · **Ветка:** `claude/launch-ui-foundation-20261028` (от `design/launch-ui-v1-20261028`)
**Принято к работе:** HANDOFF.md, DESIGN-SYSTEM.md, 9 экранов (phone-эталон), GPT-CORE-BRIEF.md.

## Сделано в этой волне
1. **Фундамент `launch-ui/triznes-core.css`** — production-CSS без фреймворка из токенов `theme/theme.css`: цвета (sapphire/graphite/стекло/акценты/статусы/origin), типографика Inter, радиусы, тени, брейкпоинты. Компоненты-основа: `Button` (primary/secondary/ghost/special), `StatusChip` + origin REAL/AI/GENERATED/ARCHIVE, `Avatar` (инициалы+кольцо), `MediaFrame` (7 форматов + loading/empty/locked), `ProgressBar`, `CoreEmblem` (дыхание), `CharacterCard`, `FilmCard`, `TimelineNode`, `MobileTabBar`, icon-nav.
2. **Экран 02 HOME / CORE** — `launch-ui/home.html`, phone-first. Перенос с эталона `02-home-core-phone`. Проверено на **390 и 430 px**: горизонтального переполнения нет, console чистая, `prefers-reduced-motion` отключает анимации.
3. **Фикс известного ограничения** (REAL перекрывает подпись формата в мелких превью): в `MediaFrame` подпись формата скрывается при ширине < 120px (container query). Метка origin всегда сверху-слева.

## Жёсткие правила соблюдены
- Supabase / auth / роли / API / маршрутизация / бизнес-логика / production data — **не тронуты**. Это слой представления.
- **Фейковых лиц нет.** Пустые медиа — нейтральные рамки `MediaFrame` / инициалы. Тексты — шаблоны дизайна («Имя Фамилия», «Название проекта»), реальные люди/факты не выдуманы.
- Каждый блок помечен `DATA:` — какой источник/таблица/API его наполняет (см. ниже).

## Что нужно от GPT (для текстов 02 HOME) — положить в `design/game-core/`
- Манифест 1 строкой (для hero / BEZLIKI).
- Названия 6 глав пути (5–6 не утверждены) — для `TimelineNode`.
- Определение «живого ядра» и правило «сейчас важно только это» (BEZLIKI).
- Словарь мира (роль, сцена, импульс, глава) — для подписей.

## Что нужно от команды
- **Утвердить порядок переноса экранов.** Предлагаю: ✅02 HOME → 01 ENTRY → 03 CHARACTER → 04 WORLD MAP → 06 NEUROFARM → 05 SOCHIWOOD → 07 COMMUNITY → 08 BOARDS → 09 PULT. Каждый — в своей ветке.
- Подтвердить привязку блоков к данным/API (таблица ниже). Блоки без источника пока на нейтральных заглушках.

## Карта данных экрана 02 HOME (block → источник)
| Блок | Источник (Supabase) | Статус |
|---|---|---|
| Hero: имя/ник/роль/идея/мечта/глава | `platform_players` | нужен публичный read-слой |
| Hero: статус карты (BLACK · дней) | `triznes_membership_cards` | есть |
| Hero/связи: фото (origin REAL) | `operator_media_items` (profile) | есть, маркировка REAL |
| BEZLIKI «сейчас важно» | правило ядра | GPT + логика |
| Живое ядро «N движений рядом» | активность мира | нужен агрегат |
| Мой путь (6 глав) | прогресс игрока + главы | GPT (названия) + данные |
| Следующая сцена | `triznes_daily_quests` / `sochiwood_life_events` | есть |
| Связи | `triznes_city_connections` (accepted) | есть |
| Проекты и кино | `content_jobs` / `operator_media_items` | есть |
| World pulse | `sochi_news_items` / `triznes_ops_signals` | есть |

## Дальше (жду утверждения порядка)
Следующий экран — **01 ENTRY** (вход в мир + цепочка ядра + 3 шага; визуал без вмешательства в auth) в отдельной ветке.
