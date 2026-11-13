# TRIZNES Telegram MVP backend

This folder contains the minimal working backend needed to move registration out of the browser and into a Telegram flow.

## Setup

1. Copy `.env.example` to `.env`.
2. For the platform API `.env`, fill in `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_REGISTRATION_API_SECRET`, `GEMINI_API_KEY`, and `PORT`. For the separate Replit bot worker, set only `TELEGRAM_BOT_TOKEN`, `PUBLIC_SITE_URL`, `TRIZNES_BACKEND_URL`, and the matching `TELEGRAM_REGISTRATION_API_SECRET` in Replit Secrets.
3. Install dependencies:

```bash
npm install
npm start
```

Run the Telegram polling worker separately with `npm run bot`. On Replit deploy only this worker; the Express API stays on the platform server.

## Start bot

```bash
npm run bot
```

## Start API

```bash
npm start
```

## API examples

### Get profile

```bash
curl "http://localhost:3000/api/profile?telegram_user_id=123456789"
```

### Create profile

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "telegram_user_id": 123456789,
    "first_name": "Иван",
    "username": "ivan",
    "phone": "+79990001122",
    "email": "ivan@example.com",
    "role": "character",
    "character_code": "1234",
    "consents": {
      "terms_accepted": true,
      "filming_accepted": true,
      "personal_data_accepted": true,
      "email_marketing_accepted": true,
      "location_accepted": true
    }
  }'
```

### BEZLIKI admin chat

```bash
curl -X POST http://localhost:3000/api/bezliki/chat \
  -H "Content-Type: application/json" \
  -d '{"mode":"admin","message":"Кто сейчас требует внимания?","context":{"source":"control-room"}}'
```

### BEZLIKI character chat

```bash
curl -X POST http://localhost:3000/api/bezliki/character-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Я снова стою на месте","context":{"playerId":"uuid игрока"}}'
```

## Important

Do not expose the Telegram bot token in frontend code. Keep it on the backend in a `.env` file.

## LiveKit Public Streams

The live API supports up to 15 concurrent rooms by default and one active room per publisher. The provider plan still determines available bandwidth and concurrent participants; this room limit is not a capacity guarantee.

1. Create a LiveKit Cloud project and set `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` in `backend/.env`. Never put the API secret in `index.html`.
2. Set `LIVEKIT_MAX_ACTIVE_STREAMS` to a value from 1 to 15. `LIVEKIT_MAX_PARTICIPANTS_PER_STREAM` defaults to 100; lower it to fit the selected plan and expected audience.
3. Run `supabase-schema.sql` in the Supabase SQL editor. It creates the private `live_streams` registry and atomic reservation functions used to enforce the concurrency limit.
4. Set `FRONTEND_ORIGIN` to the deployed website origin, then run `npm install` and `npm start` in this directory.
5. Proxy the website's `/api/` path to this Express server, or define `window.TRIZNES_BACKEND_URL` before the main script in `index.html` to point at its HTTPS origin.

Publisher tokens require a valid Supabase Auth session and a profile with the `character`, `community`, `admin`, or `administrator` role. The four-digit character-code login is not a Supabase Auth session and cannot publish a stream. Viewers receive subscribe-only tokens. Streams are advertised only after the publisher joins the LiveKit room and the backend marks it live.

## Website-to-Telegram Onboarding

Set `TELEGRAM_BOT_USERNAME` (without `@`) and `PUBLIC_SITE_URL` in `backend/.env`. For an existing database, apply `supabase-migration-20260927-telegram-onboarding.sql` in the Supabase SQL editor; fresh installs also get these objects from `supabase-schema.sql`. A signed-in website profile can then request a 10-minute, one-use Telegram deep link. The bot consumes the token, attaches that Telegram ID to the existing profile, and sends the White-level intro card with the first action. The raw token is never stored in the database.

The website-to-bot link requires a verified Supabase Auth session. If email confirmation is enabled, the participant confirms their email and signs in before requesting the Telegram link. Payment status remains separate: automatic activation requires a documented acquiring-provider webhook and its server-side signature settings.

## First-Time Registration via Telegram

Configure `TELEGRAM_BOT_TOKEN`, `PUBLIC_SITE_URL`, `TRIZNES_BACKEND_URL`, and `TELEGRAM_REGISTRATION_API_SECRET` in the Replit bot runtime; set the same `TELEGRAM_REGISTRATION_API_SECRET` on this API. Generate a long random secret and never send it in chat or commit it. Keep `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` only on the platform API server, not in Replit. The bot runs the introduction, shares the TRIZNES videos and song, asks the participant to complete the first map task, then collects role, name, phone, email, and profile answers. The bot sends the completed questionnaire to `POST /api/telegram-registration/submit` over HTTPS; the API stores it and returns a six-digit one-time registration code, valid for 30 minutes.

Apply `supabase-migration-20261002-telegram-registration-gate.sql` and then `supabase-migration-20261002-telegram-registration-handoff.sql` in the Supabase SQL editor. The Auth trigger rejects signups without a valid code, checks that the submitted profile matches the Telegram questionnaire, consumes the code, creates a pending profile linked to the Telegram user ID, and removes the code from Auth metadata. Questionnaire data and code hashes are held in a table available only to `service_role`; expired drafts are purged hourly. The website loads the form draft through `/api/telegram-registration/draft`. After email confirmation and successful platform login, the profile status becomes `registered`; the bot checks this through `GET /api/telegram-registration/status` and only then offers level 2. Passwords and legal consent are collected only on the website. Existing-profile Telegram linking is handled by `POST /api/telegram/link/consume`; the bot does not connect directly to Supabase.

Restart the bot and API after configuring `.env`, then deploy `index.html` and the updated backend. The website and API must share the same `/api/` origin, or define `window.TRIZNES_BACKEND_URL` to point to the API over HTTPS.

The current Black Card checkout URL does not provide a verified payment callback in this backend. Do not mark a payment as paid based on a browser redirect; keep it pending until the acquirer webhook is implemented and signature-verified.
