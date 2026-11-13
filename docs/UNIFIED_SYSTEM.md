# Единая система сайта · 13.11.2026

Ветка `claude/unified-app-20261112`. В `main` ничего не менялось; слияние — отдельным решением владельца.

## Что теперь одно

`/unified/` — единое приложение TRIZNES (см. `unified/README.md`). Корень сайта и старые входы ведут в него.

## Что взято из прежних версий

| Откуда | Что | Куда |
|---|---|---|
| `app/` (PWA v2) | шрифты, ключевой арт, значки, уровни-места-проводники, Сочи 3D, видео и подкасты | `unified/assets`, `unified/js/seed-world.js`, `unified/matrix`, `unified/media` |
| `launch-ui/` | оптики РАЙ / CYBER и ключ `triznes-world-lens-v2`, строение страницы персонажа, три подтверждённых портрета, модель «Я · Мои связи · Мой мир · Наш город» | `unified/css`, `unified/js`, `unified/assets/cast` |
| Архив проекта на Google Диске | канонические образы нейроперсонажей | `unified/assets/neuro`, `unified/matrix/img` |
| Концепт Resonance Galaxy | лента-солнце, планеты, профиль резонанса, отражение | `unified/js` |

## Что убрано из ветки

| Что | Почему |
|---|---|
| `launch-ui/` — экраны entry, home, character, world-map, sochiwood, neurofarm, community, communities, boards, city-objects, их стили и скрипты | заменены единым приложением |
| `app/` — index, js, css, game, vendor, fonts, icons, img, art, data, manifest | заменены единым приложением; нужное перенесено |
| `design/` (макеты и скриншоты Launch UI и Нейрофермы) | исходник дизайна прежней версии, не часть сайта |
| `archive/argon-sochi-matrix-20261112/` | архив; рабочая часть уже живёт в `unified/matrix` |
| `assets/new-city-sochi/`, `assets/living-world.js` | не используются (спрайт к тому же повреждён) |
| файл `еее` | случайный черновик |

Всё удалённое остаётся в истории git (коммит `d8da02d` в `main`).

## Что оставлено без изменений — рабочие инструменты

`register.html`, `forgot-password.html`, `profile.html`, `security.html`, `node.html`, `life.html`, `smile.html`, `control.html` (Игровой Пульт), `deals.html`, `contract-sign.html`, все `neuroferma*` (включая `neuroferma3-v1`), `pink-noize-editor.html`, их манифесты и service worker'ы, `app/consent.html`, `app/privacy.html`, `launch-ui/pult/` и `launch-ui/pult.html` (Пульт-обсерватория), `site-layers/`, `deploy/`, `supabase/`, `triznes-firmware.json`, `assets/firmware-v3-runtime.js`, `assets/brand/`.

Эти страницы ходят в действующий сервер или нужны развёртыванию — их замена возможна только после шлюза и проверки.

## Переадресации

| Адрес | Куда |
|---|---|
| `/`, `/launch-ui/`, `/launch-ui/entry.html`, `/app/`, `/new-world.html` | `/unified/` |
| `/app.html` | `/unified/#me` |
| `/watch.html` | `/unified/#sun` |
| `/sochi-game.html` | `/unified/#bonds` |
| `/sochi-news.html`, `/new-city-sochi.html` | `/unified/#city` |
| `/family.html` | `/unified/#dialogs` |
| `/launch-ui/pult-legacy.html` | `/launch-ui/pult/index.html` |

`launch-ui/sw.js` и `app/sw.js` заменены на файлы, которые снимают старый офлайн-кэш у тех, кто ставил прежние версии.

## Что проверено

Локальный сервер, ширина 390 px: 10 переадресаций, 27 экранов приложения в двух оптиках без ошибок консоли и без горизонтального вылета, Сочи 3D открывается, 17 оставленных страниц загружают свои файлы без 404.
Не проверялось: реальный телефон, живой сервер, поведение у пользователей с установленной старой версией.

## Что нужно учесть перед слиянием

- Скрипты `deploy/triznes-v2-20261112.sh` и `deploy/triznes-app-20261111.sh` выкладывают папку `app/`, которой больше нет, — их нужно переписать под `unified/`.
- `docs/SOCHI_MATRIX_INTEGRATION.md` обновлён под новый путь `unified/matrix`.
- Запрос `matrix/data/core-characters.json` в Сочи 3D отдавал 404 и раньше — файл в репозитории не существовал.
- В `unified/media/` лежат четыре подкаста; в приложении они пока не показаны: у них нет названий и статуса публикации.
