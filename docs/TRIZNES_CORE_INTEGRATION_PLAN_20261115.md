# TRIZNES CORE — integration decision (2026-11-15)

Owner confirmed canonical **new** Supabase project: TRIZNES CORE, project ref `ldxysaezjkxmgbgcaama`. Older TRIZNES DANIEL is legacy/read-only reference until migration parity is demonstrated. Never redirect live sessions/webhooks without cutover tests.

## Verified CORE schema
Existing tables include `platform_players`, `profiles`, `triznes_membership_cards`, `triznes_membership_card_policies`, `triznes_media_catalog`, `operator_media_items`, `sochi_news_items`, `triznes_world_live_news`, `apollon_player_game_state`, `apollon_journey_state`, and `telegram_bot_settings`. The media catalog already has `visibility`, `watchable`, `rights_status`, `featured`, `city` fields. News items have `status` and `published_at`. Reuse these, don't duplicate tables.

## Required integration sequence
1. Read-only inventory: original cinema/neurofarm routes, current assets, media storage, existing CORE functions, active paid entitlements, and login flow.
2. Curate original Sochi sea/city footage from approved media records. Never expose `source_ref` or private storage URLs in public API.
3. Create isolated staging environment only after compute-cost approval. No production DDL.
4. Build a public feed endpoint that returns strictly allowlisted fields for published news and watchable, public, rights-cleared media. Explicitly exclude unreviewed/private records.
5. Build idempotent white-card activation bound to the existing authenticated player, with server time and seven-day expiry. Paid entitlements always win; repeat requests must not extend trial.
6. Reuse CORE player identity and APOLLON journey; bind Telegram account via signed one-time challenge, not username matching.
7. Test guest access, RLS denial, existing logins, paid card precedence, expiry, media rights, webhook continuity and rollback. Present evidence before production.

## Read-only observations
- CORE has no existing Supabase development branches at audit time.
- Supabase security advisor reported numerous informational RLS-enabled/no-policy notices. Do not blindly add permissive policies: some are intentionally inaccessible private tables.
- Source branch `feature/guest-cinema-preview-20261115` has static placeholders; do not treat them as production implementation.
- No production data, users, cards, auth or webhooks modified by this document.
