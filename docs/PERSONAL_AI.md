# Personal Gemini / BYOK — implementation and activation

Status: draft implementation; NOT deployed. Existing app, sessions, webhooks and role assignments remain unchanged.

## User experience

With the feature flag enabled, the character profile has «Моя нейронка · Gemini». The participant supplies their Gemini API key from Google AI Studio, sees the cost/data-transfer notice and explicitly connects. A short generation request validates inference access before replacing an existing key. Disconnect removes the encrypted key and preserves conversation history. The provider key is never saved in browser storage, returned by the API, included in model context or logged by this implementation.

Existing platform session resolves the owner on the server. User-supplied player IDs and client history are ignored. AES-256-GCM binds each encrypted credential to the owner UUID. All database tables are denied to anon/authenticated, RLS enabled, service-role only. Fixed provider host and configured model prevent arbitrary key exfiltration URLs. Atomic limit: six connect/chat attempts per player per minute. No shared-key fallback after a personal-provider failure.

Context: shared TRIZNES principles plus this player's profile, latest 12 existing daily quests and last five personal conversation turns. This is read-only quest access. Suggestions do not create, accept or complete quests. The existing ClickUp task source remains authoritative; this patch does not introduce a second task dispatcher.

## Verified integration target

The existing app uses Supabase `bbxhhtpmbtgfaxamgksf`, `platform_players`, and hashed `triznes_platform_sessions`. These table shapes were inspected read-only. `TRIZNES CORE` also exists; migration to it is NOT assumed complete. Do not deploy this patch to the other project without verifying equivalent schema and session contracts.

## Activation prerequisites and sequence

1. Review this draft and run tests. This patch uses existing platform authentication; it does not implement Google OAuth or bind Google accounts to characters.
2. Apply `edge/triznes-personal-ai/setup.sql` once after checking for name collisions. This is deployment SQL, not a generated Supabase migration; capture it in the project's normal migration process. Verify grants/RLS with anon and authenticated sessions before activation.
3. Generate a random 32-byte encryption key using a password manager or trusted local tool, base64-encode it and set `BYOK_MASTER_KEY` in Supabase Edge Function Secrets. Never put it in Git, SQL, logs or chat. Keep an encrypted backup; changing it without re-encrypting rows makes saved keys unreadable.
4. Set `BYOK_GEMINI_MODEL` to an actually available generateContent model, and `BYOK_ALLOWED_ORIGIN=https://triznes.online`. Standard `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are required. No service-wide Gemini key is used by this feature.
5. Deploy the NEW `triznes-personal-ai` function with platform JWT verification disabled, because it performs its own custom `X-Triznes-Session` validation. Do not disable the handler's validation. Existing functions are not replaced.
6. Test with two real low-privilege character sessions and a test Gemini API key entered through the form. Verify cross-account isolation, expiry/revocation, quota errors, persistence after reload and disconnect. No real key was available for this validation during authoring.
7. Enable `window.TRIZNES_PERSONAL_AI_ENABLED=true` before loading app.js only AFTER backend and database validation. Default is off. Confirm guide/apollon responses and no regression in feed and login.

Rollback: turn the feature flag off. Leave encrypted data intact for recovery; do not drop tables or reset webhooks.

## Remaining work for the full Unified AI Gateway

- Google OAuth provider configuration and a verified, non-email-only account-linking flow into existing characters. Never infer founder privilege from a name or user-editable metadata.
- Authorized quest write tools, proof submission and reviewer gate through the canonical task system.
- Shared event access lists and explicit publication to COMMAND CENTER; raw personal conversations are not a shared feed.
- Audio recording/transcription/TTS in the platform routed through the same actor authorization. Existing Telegram audio is separate and unchanged.
- Retention/export/delete policy for private conversation history, key rotation procedure and usage/cost reporting.
- Provider adapter for the future self-hosted model. Current implementation accepts Gemini only.

## Validation

`node --test tests/personal-ai.test.mjs` — 10 tests passed: encryption and owner binding, missing/expired/revoked session, invalid-key replacement, owner spoofing, safe status, scoped quests/history, rate limit, foreign origin, canonical platform/MFA denial.

`node --check app/js/app.js` and `node --check app/js/personal-ai.js` passed.

Browser test: `node tests/personal-ai-ui.cjs`. In the authoring runtime Chromium could not start because socket creation was denied; UI test is included but NOT counted as passed. Database deployment, live provider calls and Google sign-in remain untested.

References: https://ai.google.dev/gemini-api/docs/api-key and https://supabase.com/docs/guides/auth/social-sign-in/auth-google
