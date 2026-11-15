# TRIZNES Unified App — safe integration audit (2026-11-15)

## Verified baseline
- Source branch: feature/guest-cinema-preview-20261115 (4 commits ahead of main, 0 behind).
- Existing app/index.html is a substantial PWA; preserve its CSS, navigation, MapLibre assets and existing auth.
- app/discover.html is a static guest preview with placeholder cinema/news, not a live catalog.
- app/white-card.html saves alias/dream to localStorage, previews photo locally; no server activation, no photo upload, no embedded APOLLON.
- Existing Supabase projects: TRIZNES DANIEL (bbxhhtpmbtgfaxamgksf), TRIZNES CORE (ldxysaezjkxmgbgcaama). Do not assume which is canonical for new writes.
- Existing TRIZNES DANIEL functions include triznes-cinema, apollon-register, apollon-direct-message, telegram-assistant-core, triznes-card-verify, triznes-media-signed-url.
- Existing data and entitlements MUST remain untouched. Do not expose private storage via public pages.

## Implementation gates (do not bypass)
1. Inventory original cinema, neurofarm, Sochi city/sea media, existing routing and media catalog. Verify publication consent and public visibility per asset.
2. Identify canonical identity/entitlement tables and Supabase environment. Compare migrations and authorization before adding schema.
3. Implement guest cinema/news using a dedicated read-only public feed of approved published records; never query private media or messages directly.
4. Implement white card as authenticated, idempotent server activation, 7 days from server timestamp, with upgrade-safe entitlement precedence; test repeat activation and paid-card preservation.
5. Persist character alias, voluntarily provided dream and optional photo in private RLS-protected storage with explicit consent and deletion flow. Never derive sensitive traits from photos.
6. Embed APOLLON through authenticated backend gateway; reuse existing identity/session, do not expose service keys or create duplicate accounts.
7. Telegram link requires explicit identity proof and anti-replay nonce; preserve existing webhooks and bot routing.
8. Tests: guest read without auth; private assets inaccessible; old login works; paid cards unchanged; RLS isolation; 7-day expiry; idempotency; rollback.
9. Require staging evidence and explicit approval before production merge or deployment.

## Current status
Audit only. No production database writes, migrations, webhook changes, or deployments performed.
