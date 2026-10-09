# TRIZNES CORE / NEUROFARM bootstrap

## Goal
Move production execution away from always-on Replit hosting.

Target flow:

Telegram danielsassis_bot -> Telegram webhook -> TRIZNES CORE -> Supabase/Postgres -> NEUROFARM Generator Router -> Runway -> Telegram / triznes.online

## Identity boundary
- `player_id` is the canonical TRIZNES identity.
- Telegram user id is an external identity linked to `player_id`.
- Supabase Auth user id may also link to the same `player_id`.
- Do not use Telegram id as the canonical player id.

## Character Genesis
1. Collect explicit AI-processing consent.
2. Collect confirmed Character DNA: dream/intention, favorite colors, aesthetic, music/mood, place/environment, desired role/image.
3. Optional user photo only after consent.
4. Create a `generation_job`.
5. Generate image variants first; user reviews/edits/approves.
6. Generate short cinematic shots only from an approved image/world definition.
7. Assemble a mini-film outside the model provider when practical.
8. Link result to STORY and QUEST 001.

Favorite colors are creative input only, never psychological diagnosis.

## Consent model
Keep these permissions separate:
- AI processing consent
- private storage consent
- publication consent
- soundtrack rights/permission

Uploading a file is not publication permission.

## Generator Router
Provider-specific code lives behind a stable server-side interface. The first provider can be Runway, but the data model must support additional providers later.

Suggested job statuses:
`DRAFT -> READY -> QUEUED -> RUNNING -> REVIEW -> APPROVED -> FAILED -> CANCELLED`

If a provider key is absent, create the job with a blocked/waiting status instead of pretending generation succeeded.

## Secrets
Never commit provider or Telegram secrets to GitHub.

Expected server-side secrets:
- `RUNWAY_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- Supabase service credentials supplied by the runtime where required

Store them in Supabase project/Edge Function secrets or the selected production secret store.

## Telegram webhook
Production mode uses Telegram webhook. Polling is development fallback only and must be mutually exclusive with webhook mode to prevent duplicate consumers.

Validate Telegram's webhook secret header before processing an update.

## Founder Task Inbox
Core should later support founder task delivery with states:
`TODAY / DONE / LATER / BLOCKED / REVIEW`

Task categories:
`CORE_BOT / PLATFORM / NEUROFARM / PINK_NOIZE / CONTENT / PARTNERS / BOOK / SOCHI_OS`

## Current constraint
The repository default branch currently does not contain the full VS Code project or existing Supabase implementation. This bootstrap branch must be reconciled with the real project before merging or deploying.