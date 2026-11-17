# SIGNAL 016 · Smiles v4.16.2 — verified archive QA

Source ZIP: https://drive.google.com/file/d/1YTVmkpAdsuzyJs0kmPfeir_xktY2uIuk/view
Source documents: https://docs.google.com/document/d/1DEmVe8zCl49lvnwP9mb-Li94nSALpQr-fG9BB0AlaMw/edit

## Verified locally (2026-11-17)
- ZIP exists, 2,645,804 bytes, 22 files including 6 app-icon assets.
- `npm test` exits 0: `verify:manifest` PASS and `verify:no-secrets` PASS.
- `apps/web/index.html` includes Smiles brand and local icon links.
- Source archive does NOT contain `.github/workflows/triznes-staging-ci.yml`, although README and SIGNAL_016 describe CI as part of package. Must supply/fix CI.
- Frontend SDK has empty `supabaseUrl` and `supabaseAnonKey` defaults. Runtime configuration and auth flow must be connected before APOLLON is functional.
- Home has `DESIGN_PLACEHOLDER` label; source is not final pixel-perfect design.
- Current tests do not validate Supabase migration, RLS, login, white-card issuance, voice, UI click routes, mobile viewport, or production deployment.

## Required before production
1. Compare and integrate 22 files against EXISTING application, not replace repo wholesale. Preserve all live user data and paid cards.
2. Repair CI and verify production build/deploy adapter and asset paths.
3. Verify secure Supabase auth, Edge Functions, RLS, migrations in isolated environment.
4. Connect actual approved user images/cards and review logo; test iOS icon rendering and PWA.
5. Verify every control works, mobile Safari 390px and desktop 1440px.
6. Obtain QA PASS and backup/rollback before merging to main.

Status: ARCHIVE_VERIFIED, BASIC_PACKAGE_TESTS_PASS, PRODUCTION_NOT_READY. No deployment or migration performed by this audit.
