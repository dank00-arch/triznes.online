# TRIZNES web P0 architecture

This branch is a safe refactor foundation. Production remains unchanged until review and merge.

## Baseline

The current production source is preserved on `main`. The large legacy file `еее` is treated as the baseline snapshot and must not be deleted or overwritten during the first refactor pass.

## Target structure

```text
index.html
src/
  app.js
  api/
    operator-client.js
  config/
    public-config.js
  modules/
    assistant/
    tasks/
    plans/
    protocols/
    music/
```

## Security boundary

Browser code must never contain the Supabase service-role key, Telegram bot tokens, Gemini keys, or the TRIZNES internal Operator credential. Browser requests should use an authenticated user session and a dedicated web gateway/backend. The gateway resolves the signed-in user to an Operator identity server-side and then calls `triznes-operator`.

## Identity

Do not merge identities merely because display names match. The future identity-link flow must require an authenticated web account plus a short-lived proof generated for Telegram/Alice. Keep channel external IDs namespaced until the link is explicitly verified.

## Operator client contract

Web UI should depend on a small client interface rather than call Supabase internals throughout the application:

```js
operator.send({ message, context })
operator.health()
```

The implementation can later point at `/api/operator` (or an equivalent Edge Function) without changing Assistant UI modules.

## Error states

Every integration surface needs explicit `loading`, `ready`, `degraded`, and `offline` states. Do not silently swallow Operator/network failures.

## Migration sequence

1. Preserve and document baseline.
2. Introduce a minimal `index.html` shell without removing legacy source.
3. Extract public configuration and API client boundaries.
4. Add the authenticated web gateway.
5. Add Assistant first, then plans/tasks/protocols.
6. Add PINK NOIZE music as a separate module.
7. Compare against production behavior before merge.

## Current backend status (2026-10-07)

Supabase currently exposes active `triznes-operator`, `alice-assistant`, `telegram-assistant`, and `telegram-assistant-2` Edge Functions. Telegram Assistant 2 also supports voice/media workflows. This document does not imply that Yandex Dialogs activation, Telegram webhook delivery, or end-user identity linking has been externally verified.
