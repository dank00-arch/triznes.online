# QUEST 001.1 — AUTH CALLBACK TEST GATE
Date: 2026-11-16
Branch: codex/unified-master-build-20261116
Target: trinity-preview/login.html
Production: DO NOT MODIFY

## Implementation
- Email OTP request with email_redirect_to pointing at current login.html URL.
- Implicit callback reads access_token from URL fragment, removes fragment immediately, verifies token with GET /auth/v1/user.
- Verified email is displayed only after 200 response and user.id + user.email are present.
- Token held in JS memory only; no persistence and no refresh; reload ends session.
- Logout clears local state immediately and attempts Auth logout.
- No membership issuance, profile association, or dream writes.
- Only public Supabase publishable key is embedded.

## Manual Supabase dashboard gate — not yet verified
1. Open https://supabase.com/dashboard/project/ldxysaezjkxmgbgcaama/auth/url-configuration
2. Confirm Site URL and Additional Redirect URLs include EXACT HTTPS staging login URL (not merely triznes.online root).
3. Confirm email provider and email link template work for staging, email delivery/rate limits, and allowed redirects.
4. If staging page is hosted on a different origin, add only that precise origin/path. Do not use a broad wildcard for production.
5. Do not send a login email until this is checked.

## Required staging browser tests
T01 Valid email -> link arrives -> redirect returns to staging login.html -> verified user email shown.
T02 Invalid/expired token -> no account UI, no data access.
T03 Forged hash access_token -> /auth/v1/user rejects it.
T04 Refresh after verified login -> logged out (by design; memory-only).
T05 Sign out -> account UI hidden; server logout attempted.
T06 Network failure -> informative error, no fake success.
T07 Unapproved redirect -> Supabase refuses it; no unintended production redirect.
T08 iPhone Safari -> callback fragment is processed and removed from browser URL.
T09 Browser console/network -> no service_role, no player PIN, no API key for Gemini.
T10 Existing paid card entitlements unchanged.
T11 Auth email template uses implicit flow; PKCE code callback is NOT implemented in this staging screen.

## Remaining before production
- Use supported Supabase JS auth client and persistent session with PKCE and refresh, plus explicit session lifecycle and cross-tab handling.
- Establish verified auth.user.id -> operator_identities.id -> platform_players.id ownership binding; do not trust external_user_id from client.
- Run RLS cross-user tests and duplicate White Card concurrency tests.
- Add actual hosted staging URL and end-to-end browser evidence.
- No claim of a completed user login until the manual tests pass.

## Static source assertions (verified)
- /auth/v1/user validation present
- URL fragment removed
- No localStorage/sessionStorage/document.cookie token persistence
- No card issuance
- email_redirect_to included
- No service_role key
