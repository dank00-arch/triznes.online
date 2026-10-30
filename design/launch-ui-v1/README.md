# TRIZNES — Launch UI v1 · система «Ядро»

**LIFE CINEMA OPERATING SYSTEM.** Дизайн-система и 9 launch-экранов платформы TRIZNES — «Жизнь в игре».
Дата: 2026-10-28 · Источник правды: проект Subframe `4fc5f50c012f` (triznes.online), канвас **Launch UI v1**.

> Это **дизайн-передача**, а не код сайта. Ничего в этой папке не подключено к продакшену.
> Реальные фото, видео, постеры, музыку и архивы команда подставляет сама — все рамки готовы под них.

---

## Для Claude Code — как забрать дизайн

Дизайн живёт в Subframe; копии кода экранов в репозиторий намеренно не положены, чтобы не разойтись с макетом.

1. **Компоненты и тема в код** — Subframe CLI (нужен свой токен из Subframe):
   ```bash
   npx @subframe/cli@latest init --projectId 4fc5f50c012f --css-type tailwind-v4 --sync
   # дальше при изменениях дизайна:
   npx @subframe/cli@latest sync --all
   ```
2. **Код экранов** — через Subframe MCP (`get_page_info` по ID ниже) или вкладку Export в Subframe.
   Экраны используют компоненты из шага 1 (`@/ui/components/*`) и иконки (`@/ui/icons/*`).
3. **Тема без CLI** — `theme/theme.css` (Tailwind v4 `@theme` + варианты `laptop:` / `mobile:` / `phone:`).

### Жёсткие ограничения при переносе
- Не менять Supabase, auth, роли, permissions, API, маршрутизацию, бизнес-логику и production data.
- Переносить экраны **по одному**, каждый — после утверждения, в отдельной ветке, без деплоя в production без подтверждения.
- Реальный человек — в центре. **Никаких AI- или стоковых лиц** вместо реальных людей. Пустое фото = нейтральная рамка `MediaFrame` / инициалы `Avatar`.
- Все тексты в макетах — шаблоны («Имя Фамилия», «Название проекта», цифры). Подставлять реальные данные; блоки, для которых данных/API пока нет, не заполнять фейком — сначала согласовать API.
- Каждый медиа-объект маркировать происхождением: **REAL / AI ASSISTED / GENERATED / ARCHIVE**.

---

## Экраны (desktop ≥1440 · laptop 768–1439 · mobile ≤767 · phone ≤430)

| # | Экран | Subframe page ID | PNG |
|---|---|---|---|
| 01 | ENTRY — вход в мир + форма входа | `ff4f4db1-9b9a-45e7-bf70-f12af0fb939d` | `screens/01-entry-*.png` |
| 02 | HOME / CORE — «Ты в игре», живое ядро | `b44702a3-921c-4695-a2d1-4d5d5cd81d5c` | `screens/02-home-core-*.png` |
| 03 | CHARACTER — страница героя фильма | `fd56a1bb-4004-4259-a4c6-ef4fb51fa65c` | `screens/03-character-*.png` |
| 04 | WORLD MAP — карта живого кино (Сочи, РАЙ/CYBER) | `09974e15-e246-4e3b-a73e-a6c40aaeffa8` | `screens/04-world-map-*.png` |
| 05 | SOCHIWOOD — кинотеатр мира | `2d1c47ec-d230-403d-87b6-8bcca22d3a0f` | `screens/05-sochiwood-*.png` |
| 06 | NEUROFARM — фабрика превращения реальности в кино | `0cc00958-d8af-4401-ba72-21dc85d291b7` | `screens/06-neurofarm-*.png` |
| 07 | COMMUNITY — сообщество как мир (шаблон) | `ac9b8434-d6d8-4ad8-9809-45730a1ede40` | `screens/07-community-*.png` |
| 08 | BOARDS — живая доска | `e719d920-8a9c-49cc-b171-ba3da9b0b2eb` | `screens/08-boards-*.png` |
| 09 | MOBILE PULT — игровой пульт (mobile-first) | `7a39658c-f8db-4605-abd8-c13fa47ad6b2` | `screens/09-mobile-pult-*.png` |

Сняты на 1440 px (`*-desktop.png`), 767 px (`*-mobile.png`) и **430 px — телефон** (`*-phone.webp`, полная высота, @2x). Телефонная версия — эталон для переноса mobile-first.

Ранее утверждённые макеты (канвас «Нейроферма — главный экран»): «Ядро — центральный портал» `238f9bcb-df24-43a9-9ab6-b96fdac72253` (реализован в ветке `feat/neuroferma-yadro-20261028`), «Пульт TRIZNES» `3e0e603a-db8b-4d4f-bea5-0e2b7cf5f685`.

---

## Компоненты (14)

| Папка | Компонент | Назначение |
|---|---|---|
| Core | `Button` | primary (сапфир→pink, одна главная CTA на экран) · secondary (стекло) · ghost · destructive · special (gold) |
| Core | `StatusChip` | статусы и метки происхождения REAL / AI ASSISTED / GENERATED / ARCHIVE |
| Core | `Avatar` | фото или инициалы, presence, кольцо brand/gold |
| Core | `MediaFrame` | **универсальная рамка медиа**: portrait 3:4 · landscape 16:9 · vertical 9:16 · square · poster 2:3 · audio · document; состояния loading / empty / locked |
| Core | `SectionHeader` | eyebrow + заголовок + действие |
| Core | `ProgressBar` | прогресс производства / пути |
| Core | `CoreEmblem` | **ядро TRIZNES**: треугольник + глаз + светящееся ядро; idle / active / pulse |
| World | `CharacterCard` | карточка реального человека (compact / default / feature) |
| World | `FilmCard` | фильм / сцена / проект (poster / wide / row) |
| World | `TimelineNode` | узел пути, хроники, pipeline (done / current / upcoming / locked) |
| World | `MapMarker` | маркер карты: person / event / shoot / community / place / story |
| Navigation | `SidebarNav` | компактный desktop-сайдбар (МИР · СОЗДАНИЕ · СИСТЕМА) |
| Navigation | `TopBar` | поиск, пульс мира, переключатель РАЙ / CYBER |
| Navigation | `MobileTabBar` | Я · МИР · **+** · КИНО · ЯДРО; «+» → Снять / Загрузить / Идея / Событие / Человек / Сцена |

Иконки: 55 тонких Lucide (ISC, штрих 1.5) + собственный знак `TriznesCore`. Эмодзи в интерфейсе не используются.

---

Правила системы и логика анимаций — в [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md).
