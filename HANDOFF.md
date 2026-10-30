# 📡 HANDOFF · TRIZNES Launch UI v1 → Claude Code / GPT

**Статус:** дизайн готов, передан в разработку · **Дата:** 2026-10-28 · **От:** Subframe (дизайн)
**Кому:** Claude Code (техническая часть), GPT (ядро смыслов, игра, квесты, креативная карта, качество медиа)

> **Обновление 2026-10-28 · телефонная версия.** Добавлен брейкпоинт `phone:` (≤430 px). Все 9 экранов проверены на 430 px и выгружены: `design/launch-ui-v1/screens/*-phone.webp`. Исправлено для телефона: шапка SOCHIWOOD, редактор сцены в NEUROFARM (одна колонка), строки заявок в PULT (кнопки переносятся под имя). Для GPT — отдельный бриф: [`GPT-CORE-BRIEF.md`](design/launch-ui-v1/GPT-CORE-BRIEF.md).

## Что передано

| Ветка | Что внутри | Статус |
|---|---|---|
| `design/launch-ui-v1-20261028` (эта) | Дизайн-система «Ядро» + 9 launch-экранов: `design/launch-ui-v1/` | ✅ готово к переносу |
| `feat/neuroferma-yadro-20261028` | Визуальный слой «Ядро» для `neuroferma.html` (CSS-слой, логика не тронута) | ✅ готово к ревью, не слито |
| `design/neuroferma-home-20261028` | Первые макеты Нейрофермы (Ядро / Кино-ОС) | архив решений |

Начинать с: [`design/launch-ui-v1/README.md`](design/launch-ui-v1/README.md) → [`DESIGN-SYSTEM.md`](design/launch-ui-v1/DESIGN-SYSTEM.md) → `screens/*.png` и `screens/*-phone.webp` (телефон, эталон mobile-first).

## Источник правды
Subframe, проект `4fc5f50c012f`, канвас **Launch UI v1**.
- Тема + 14 компонентов: `npx @subframe/cli@latest init --projectId 4fc5f50c012f --css-type tailwind-v4 --sync`
- Код экранов: Subframe MCP `get_page_info` по page ID (таблица в README).

## Задачи

### Claude Code — техническая часть
- [ ] Добавить вариант `phone:` (≤430 px) из `theme/theme.css`; переносить экраны mobile-first по `*-phone.webp`, проверять на 390 и 430 px.
- [ ] Ревью `feat/neuroferma-yadro-20261028`; при ОК — PR в `main` (без деплоя без подтверждения).
- [ ] Подтянуть тему и компоненты через Subframe CLI.
- [ ] Переносить экраны **по одному**, каждый в своей ветке, в порядке, который утвердит команда.
- [ ] Для каждого экрана: сопоставить блоки с реальными данными/API; блоки без данных — **не заполнять фейком**, а описать нужный API и согласовать.
- [ ] Подставить реальные фото / видео / постеры / музыку команды в `MediaFrame`; маркировать REAL / AI ASSISTED / GENERATED / ARCHIVE.

### GPT — ядро смыслов, игра, квесты, медиа
Полный бриф: [`design/launch-ui-v1/GPT-CORE-BRIEF.md`](design/launch-ui-v1/GPT-CORE-BRIEF.md). Кратко:
- [ ] Ядро смыслов: манифест, определения цепочки ядра, словарь мира.
- [ ] Механика игры: 6 глав, цикл дня, прогресс и карты BLACK/SILVER/GOLD, 10 этапов пути импульса, роль AI.
- [ ] Квесты: формат + стартовые квесты для глав 1–2 и сообществ, привязка к реальным местам Сочи.
- [ ] Креативная карта — схема игры TRIZNES (Mermaid).
- [ ] Качество медиа: стандарты кадра по форматам `MediaFrame`, правила REAL / AI ASSISTED / GENERATED / ARCHIVE, список медиа к съёмке.
- [ ] Финальные тексты вместо шаблонов («Имя Фамилия», «Название проекта») — только по реальным данным.
- Результат → `design/game-core/` в ветке `content/game-core-<дата>`, PR в эту ветку.

## Не трогать
Supabase · auth · роли · permissions · API · маршрутизацию · бизнес-логику · production data · `main` без подтверждения · production-деплой.
Никаких AI- или стоковых лиц вместо реальных людей.

## Следующая волна дизайна (не начата)
Аполлон · Дионис · BEZLIKI · PINK NOIZE / трек · Архив-хроника · Граф связей · Путь импульса · Интеграции · Карты BLACK/SILVER/GOLD · События · System Status · Security · Mobile Camera / Current Scene.
