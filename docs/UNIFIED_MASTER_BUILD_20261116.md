# TRIZNES Unified Master Build — 2026-11-16

Status: integration branch created; NOT DEPLOYED.

## Ground truth
- Base: feature/trinity-v2-safe-20261116 (do not assume its files match main).
- Source architecture: SIGNAL_008_THREE_SNAILS_ARCHITECTURE_ACCEPTANCE.
- Candidate source package: SIGNAL_009_THREE_SNAILS_IMPLEMENTATION.
- Coordinator instruction: SIGNAL_010_TRIZNES_UNIFIED_MASTER_BUILD.
- Canonical brand TRIZNES. Three Snails = ART / TRADE / CORE. SOCHIWOOD = cinema, PINK NOIZE = media, APOLLON = assistant.
- Existing Supabase CORE project ldxysaezjkxmgbgcaama; separate TRIZNES DANIEL project bbxhhtpmbtgfaxamgksf. Confirm actual deployment configuration before touching either.

## Release gates (all required)
- [ ] Inventory actual routes and branch diff against main; document deployed origin and current release SHA.
- [ ] Consolidate CSS tokens and shell; responsive iPhone/desktop screenshots and accessibility review.
- [ ] Preserve existing identity, paid membership, cinema, Telegram webhooks and user data.
- [ ] Validate auth.users / platform_players / operator_identities mapping and RLS.
- [ ] REJECT unmodified SIGNAL_009 issue_white_card_once(p_identity_id): authenticated callers can supply arbitrary identity ID to SECURITY DEFINER function. Replace with server-derived identity and atomic one-time issuance; test concurrency.
- [ ] Review existing policies before altering them. No blind DROP POLICY on production.
- [ ] Real media manifest: provenance, consent, source, rights, status, render URL, publication scope. No private or consent-needed media publicly accessible.
- [ ] Keep DANIEL and NEO as separate characters.
- [ ] End-to-end tests: guest cinema; auth; White Card; dream consent; character; APOLLON; quests; operator review.
- [ ] Mobile PWA and actual production smoke tests.
- [ ] CI checks pass, reviewer approves, merge/release explicitly authorized.

## Definition of done
One working triznes.online experience, no parallel demo site; deployed SHA and URL recorded; verified real media; user journey works across reload and devices; no regression in paid cards, RLS, or existing members.

## Gemini handoff
https://docs.google.com/document/d/1eZHnlMXkobX1MKApQflo5K3_ucIasyMQe9NyWAHDcws/edit
Gemini must provide RESPONSE_010 with concrete diffs/PRs, verified asset list, and tests. Candidate files are NOT production changes.

## Current action
This document records the integration safety contract. No runtime files or database schemas changed by this commit.
