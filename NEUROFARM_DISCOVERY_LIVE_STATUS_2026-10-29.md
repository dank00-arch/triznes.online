# НЕЙРОФЕРМА TRIZNES — живой discovery и статус узлов

Дата проверки: 29 октября 2026. Метод: чтение кода + **живая проверка** Supabase-проекта `bbxhhtpmbtgfaxamgksf` (list edge functions + SQL по рабочим таблицам). Ничего не мутировал, платных вызовов не делал.

## Главный вывод

**Конвейер уже существует и реально работает.** Это не набор заготовок — в проде развёрнуто **~90 ACTIVE edge-функций**, и по данным базы через них **реально вышло 28–34 публикации** в соцсети. «Нейроферма» = уже живая сеть узлов в Supabase, а не то, что надо строить заново.

Поэтому задача не «собрать из нуля», а **снять 3 конкретных разрыва** между готовыми узлами. Ни один из четырёх узлов, которые локально выглядели «отсутствующими» (`creatomate-bridge`, `telegram-publisher`, `vk-publisher`, `postmypost-publisher`), на самом деле не отсутствует — все развёрнуты и ACTIVE. Локальный репозиторий содержит исходники лишь **10 из ~90** функций — это снимок, а не вся система.

## Две системы, которые надо держать в голове

| Система | Где | Стек | Что делает |
|---|---|---|---|
| **A. Replit api-server** («Ферма») | `website-platform/neurofarm-replit-source/artifacts/api-server` | Node/Express, Clerk-auth, Drizzle Postgres | Задача → сценарий (Gemini) → утверждение → видео (Kling text2video) → экспорт в Google Drive. Отдельно: монтаж клипов → JSON2Video (с фирменной рамкой TRIZNES), генерация картинок (Gemini). Только для владельца (`FARM_OWNER_USER_ID`). |
| **B. Supabase Edge Functions** (конвейер публикации) | проект `bbxhhtpmbtgfaxamgksf` | Deno, service-role + admin-роль | Приём медиа → подбор/композиция → рендер (Creatomate) → QC видео (Gemini vision) → согласие персонажа → ручное одобрение → публикация (Telegram/VK/PostMyPost → YouTube/TikTok). |

Обе работают, но **между A и B нет автоматического моста**: видео/монтаж, созданные в «Ферме», не попадают сами в очередь публикации B.

## Живой статус узлов

Статусы: `LIVE` / `WORKS_BUT_NOT_CONNECTED` / `PARTIAL` / `BROKEN` / `CREDENTIALS_MISSING` / `UNKNOWN`.

### Генерация (вход)
| Узел | Функция / файл | Статус | Примечание |
|---|---|---|---|
| Gemini (сценарий/текст/картинки) | api-server `providers.ts`, `image-provider.ts` | LIVE | нужен `GEMINI_API_KEY` в Replit Secrets |
| Kling text2video | api-server `providers.ts`; edge `neurofarm-kling-submit`, `neurofarm-kling-probe` | LIVE | `kling-v2-5-turbo`, выдаёт `task_id`, poll по 15с |
| Runway | edge `neurofarm-runway-submit`; статус в `neurofarm-provider-status` | PARTIAL | submit развёрнут; **2 run'а висят в `waiting_for_neuro_shots` с 9 окт** — шоты ушли и не вернулись, никто их не сверяет |
| Veo | edge `neurofarm-veo-submit` | LIVE (ключ/модель), генерация не проверялась | идёт через `GEMINI_API_KEY` |
| JSON2Video (монтаж + рамка TRIZNES) | api-server `montage-provider.ts` | LIVE | защита от двойной оплаты, лимит 180с |

### Сборка / музыка / QC (середина)
| Узел | Функция | Статус | Примечание |
|---|---|---|---|
| Creatomate (сборка) | `creatomate-bridge` v33, `triznes-cinema`/COLLIDER v40 | LIVE | 2 ключа Creatomate (`checkCreatomate(1\|2)`) |
| PINK NOIZE (музыка) | `triznes-cinema` → `operator_music_tracks` (approved) | LIVE | только одобренные приватные треки |
| QC видео | `video-quality-gate` v23 + `triznes-video-qc-cron` | LIVE | Creatomate контакт-листы (32 кадра) + Gemini vision; пишет `video_qc` в очередь |
| OpusClip | статус в `neurofarm-provider-status` | UNKNOWN | ключ проверяется, в цепочку сборки не включён |
| ElevenLabs | — | не найден в коде/подключениях | в текущем конвейере не используется |

### Публикация (выход)
| Узел | Функция | Статус | Примечание |
|---|---|---|---|
| Оркестратор публикаций | `social-orchestrator` v45 | LIVE | create_run → prepare → review → QC → **ручное одобрение человеком** → dispatch |
| Telegram | `telegram-publisher` v31 | LIVE | 28 публикаций вышло |
| VK | `vk-publisher` v33 | LIVE | |
| PostMyPost (VK/YouTube/TikTok) | `postmypost-publisher` v36, `postmypost-control` v23, `postmypost-bridge` | LIVE | проект PMP `366212` |
| Выпуск ролика персонажа | `triznes-reel-release` v1 (создан ~29 окт) | LIVE | папка Mac `01_РОЛИКИ` → Storage → тексты (Gemini) → очередь → ссылки согласия персонажу → публикация. **Самый свежий и самый сквозной мост.** |

### Пульт / статус
| Узел | Где | Статус | Примечание |
|---|---|---|---|
| Статус провайдеров | `neurofarm-provider-status` v21 (Runway/Kling/Creatomate×2/OpusClip/Veo) | LIVE | есть готовый API здоровья узлов |
| ПУЛЬТ (admin.html) | `website-platform/admin.html` | WORKS_BUT_NOT_CONNECTED | показывает статус ключей «Мозг BEZLIKI» через Replit-прокси. **Не показывает живую очередь конвейера B** (review/failed/generating) |

## Живые данные конвейера (SQL, 29 окт)

```
social_content_queue:   review 102 · published 28 · changes_requested 54 · cancelled 25 · failed 8 · revoked 7 · draft 3
  delivery:             not_started 170 · published 34 · failed 20 · delivered 2 · queued 1
  rights:               public_ok 144 · consent_needed 44 · internal 35 · unknown 4
content_collider_runs:  review 14 · partial_failed 11 · draft 9 · generating 3
triznes_reel_releases:  awaiting_character 4 · changes_requested 1
```

Это доказывает: материал реально проходит путь приём → сборка → QC → одобрение → публикация. Узкие места тоже видны.

## Три реальных разрыва (это и есть «соединить»)

1. **Нет единого статуса в одном ПУЛЬТЕ.** Система A (Ферма, Clerk/Drizzle) и система B (Supabase-очередь) живут раздельно. `admin.html` не видит очередь B, а `social-orchestrator` отдаёт `queue_counts`, но единой доски «Исходник → Отбор → Сценарий → Монтаж → Просмотр → Выпуск» с живыми счётчиками нет. → Нужен **один read-only статус-эндпоинт**, который собирает provider-status + queue_counts + runs + releases, и одна панель в ПУЛЬТЕ, которая его показывает. Самый дешёвый и безопасный мост (только чтение).

2. **Нет сверки застрявших run'ов.** 3 run'а в `generating` (2 — `waiting_for_neuro_shots` с 9 окт) и 11 `partial_failed` висят неделями. Poller (`content-job-poller`) есть, но эти не спасает. → Нужен **reconcile-tick**: дотянуть статус у провайдера, вернуть шоты или пометить run'ы как failed с причиной, чтобы они не висели вечно.

3. **Выход «Фермы» не передаётся в очередь публикации.** Готовое видео Kling / монтаж JSON2Video завершаются в `farmJobs`/`farmMontages` (система A) и дальше не идут. Чтобы «положил материал → само дошло до выпуска», нужен **мост A→B**: по готовности видео создать строку в `social_content_queue` (как это уже делает `triznes-reel-release` для папки Mac).

## Что предлагаю сделать первым (самое безопасное и полезное)

**Мост №1 — единый статус в ПУЛЬТ (только чтение, без риска для живого прода).**
Один агрегирующий эндпоинт + панель «Конвейер» в ПУЛЬТЕ со счётчиками по этапам и списком застрявших/failed. Это сразу даёт то, что просил брифинг: «понятный статус в ПУЛЬТЕ». Не трогает публикацию, согласия и оплату.

Мосты №2 (reconcile) и №3 (A→B) — следующими, по одному, с проверкой на одном тестовом ролике.

> Важно: конвейер B **публикует в реальные соцсети** и завязан на согласие персонажа, проверку прав и ручное одобрение. Любой мост, который что-то отправляет или меняет статусы, делаем по одному и сначала в режиме «показать, не публиковать».
