# TRIZNES · Триединство — release gate (2026-11-16)

Source: SIGNAL_007_TRIZNES_ARGON_DEEP_ARCHITECTURE
https://docs.google.com/document/d/1vwW1co0RpbCXl6t4g2afYFHCoXl5_dEZ7IvpBuNQKz4/edit

Status: PREVIEW PREPARATION ONLY. Not deployed.

## Verified CORE state
Supabase project ldxysaezjkxmgbgcaama: platform_players 87; triznes_membership_cards 14; triznes_media_catalog 407; triznes_media_intake_events 233; triznes_dreams 0. All three known Storage buckets are private. triznes-media bucket has 0 objects.

Media catalog rights labels: 264 restricted/consent_needed, 121 private/consent_needed, 18 restricted/internal, 4 player/public_ok. Do not turn private records public without individual provenance/rights validation. The owner's blanket authorization does not replace rights of third parties.

## Compatibility blockers
1. Existing triznes_dreams has player_id/dream_text; SIGNAL 007 defines a different schema with user_id/raw_dream. CREATE TABLE IF NOT EXISTS does not migrate columns.
2. Existing membership source is triznes_membership_cards with issued_at/expires_at/status. Do not replace paid entitlements with profiles.card_tier default unpaid.
3. Validate all SECURITY DEFINER grants and RLS using separate authenticated users. Never accept user_id from request body as authority.
4. Do not pass Gemini API keys through the browser. Server secrets only, and never commit them.
5. SIGNAL 007 references ./assets/*; these are unresolved paths, not verified files or live media URLs.
6. Frontend demo interactions must not claim persistence unless server writes succeed.

## Implementation sequence
- Build isolated staging from reviewed schema and synthetic/consented test data; preserve original CORE.
- Generate a compatibility migration based on the actual columns and constraints; test apply and rollback in staging.
- Map media catalog rows to real storage paths/external sources; check access and public rights before creating signed URLs.
- Integrate Trinity frontend in a feature branch with REAL/CYBER attribution, safe placeholders, and reduced-motion.
- Test auth, White Card 7-day expiry, paid cards, dream persistence, quests, iPhone layout, prompt injection, failures.
- Release only after passing CI, security review, rollback rehearsal and explicit go-live approval.

No SQL, Edge Function or production deploy is authorized by this document.
