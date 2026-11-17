# Структура единого монорепозитория TRIZNES (SIGNAL_013)


Единая сборка сохраняет обратную совместимость с действующими репозиториями:
- `dank00-arch/triznes.online` ← синхронизируется с `apps/web/` (публичный портал, кинозал SOCHIWOOD, карта Сочи, кокпит игрока, профиль, PWA).
- `dank00-arch/TRIZNES` ← синхронизируется с `supabase/` (аддитивные миграции PostgreSQL, RLS-политики, тесты безопасности, Edge Functions `apollon-core-gateway` и `telegram-bot-sync`).
- `dank00-arch/triznes-pult` ← синхронизируется с `apps/pult/` (операторский пульт управления медиа, правами, публикациями и аналитикой).


```text
triznes-unified-platform/
├── package.json
├── .github/
│   └── workflows/
│       └── triznes-staging-ci.yml
├── apps/
│   ├── web/                          # Единое мобильное PWA-приложение (triznes.online)
│   │   ├── manifest.webmanifest
│   │   ├── sw.js
│   │   ├── entry.html                # Сказка.PRO → Реальный Сочи → Киберпространство
│   │   ├── home.html                 # Игровой кокпит (ART/TRADE/CORE, APOLLON, DIONYSUS, BEZLIKI)
│   │   ├── profile.html              # Профиль, фото в triznes-media, мечта, код Telegram
│   │   ├── world-map.html            # Карта локаций, событий и маршрутов Сочи
│   │   ├── sochiwood/
│   │   │   └── index.html            # Кинотеатр SOCHIWOOD, PINK NOIZE и новости без входа
│   │   └── src/
│   │       ├── styles/
│   │       │   └── triznes-unified.css
│   │       └── js/
│   │           └── triznes-core-sdk.js
│   └── pult/                         # Операторский пульт (triznes-pult)
│       ├── control.html
│       └── pult-operator.js
├── supabase/
│   ├── migrations/
│   │   └── 20261117_01_identity_and_white_card_p0.sql
│   ├── tests/
│   │   └── 20261117_identity_rls_card_test.sql
│   └── functions/
│       ├── apollon-core-gateway/
│       │   └── index.ts
│       └── telegram-bot-sync/
│           └── index.ts
├── tests/
│   └── unit/
│       └── triznes-core.test.js
└── docs/
    ├── MONOREPO_STRUCTURE.md
    ├── LOCAL_MAC_SETUP.md
    └── STAGING_DEPLOY_AND_ROLLBACK.md
