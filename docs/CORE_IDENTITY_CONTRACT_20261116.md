# TRIZNES CORE — verified identity / entitlement contract
Date: 2026-11-16
Status: READ-ONLY SCHEMA AUDIT; NO PRODUCTION MIGRATION

## Verified PostgreSQL foreign keys (TRIZNES CORE ldxysaezjkxmgbgcaama)
- public.platform_players.identity_id → public.operator_identities.id (ON DELETE CASCADE)
- public.platform_players.profile_id → public.profiles.id (ON DELETE SET NULL)
- public.triznes_dreams.player_id → public.platform_players.id (ON DELETE CASCADE)
- public.triznes_dreams.world_id → public.triznes_dream_worlds.id (ON DELETE CASCADE)
- public.triznes_membership_cards.identity_id → public.operator_identities.id (ON DELETE RESTRICT)

## Verified columns
- platform_players: id, identity_id, profile_id, source_channel, external_user_id, display_name, role, registration_status, metadata, privacy_settings, ...
- triznes_dreams: id, world_id, player_id, title, dream_text, source, state, confirmation_status, confirmed_at, visibility, consent_scope, ...
- triznes_membership_cards: id, tier, identity_id, status, issued_at, expires_at, metadata, ...
- profiles: id, character_code, role, community_access_status, ...

## Implementation contract
1. Never equate auth.uid() to platform_players.id or operator_identities.id. The actual auth→identity binding must be established and tested for web and Telegram channels.
2. Never authorize membership card issuance by accepting a client-provided identity_id. Resolve it from verified auth/session on server, then validate ownership. Enforce one-time White Card issuance and concurrency-safe uniqueness. Do not override existing paid cards.
3. A dream insert needs a verified owned platform_players.id and a valid world_id, not merely user_id and raw_dream. Default visibility must be private and publication consent explicit.
4. Check existing RLS, grants, constraints, and triggers before proposing any SQL migration. SECURITY DEFINER must not become a public privilege escalation route.
5. No client service-role key or Gemini API key; only publishable frontend credentials. No credentials committed.
6. Public cinema uses rights-cleared verified URLs only; metadata rows alone are not playable videos.
7. The trinity-preview page remains a clearly marked demo until all authenticated flows pass integration tests.

## Required tests before production
- User A cannot issue card, read dream, or alter profile for user B.
- Existing BLACK/SILVER/GOLD cards retain status and expiry.
- Concurrent White Card requests cannot issue multiple cards.
- A confirmed private dream persists and is only readable by owner.
- Anonymous user sees only approved public cinema/news.
- Telegram identity cannot be linked by spoofed external_user_id.
- All routes survive refresh, auth expiry, network failure, iPhone Safari.

## Release evidence
Include SQL schema diff, policy test SQL/results, browser tests, PR SHA, rollback plan and staging URL. No production deployment by this document.
