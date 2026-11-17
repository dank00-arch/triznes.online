# TRIZNES — HOME SCREEN V4 / IMPLEMENTATION CONTRACT
Status: DESIGN SPEC, awaiting visual sign-off. Source: user-approved direction and uploaded reference cards (BLACK, SILVER, GOLD). Do not claim the artwork is already deployed.
Target: existing triznes.online, mobile-first responsive PWA. No production deployment before QA.

## Visual hierarchy
1. Header: TRIZNES wordmark, primary navigation (Cinema / Game / Mediahub / Community / Locations), avatar menu. Pink NOIZE lotus belongs to PINK NOIZE; do not silently replace the TRIZNES brand mark with an invented symbol. No user PIN, API key, or private identifiers in the public header.
2. Hero: DANIEL 001 portrait (licensed/user-supplied source), Sochi atmosphere, 'ЖИЗНЬ В ИГРЕ И ИГРА В ЖИЗНИ'; one clear CTA to explore public cinema, another to join with White Card. Mark generated composites GENERATED; do not present concept renders as actual property photos.
3. Content modules: SOCHIWOOD cinema (public), PINK NOIZE music, mediahub studios/podcasts/live, Sochi locations, quest/game, community. Use real verified media where available; otherwise neutral placeholder, never invented real-world persons or published projects.
4. Cards: 4 accessible, responsive tiles. WHITE free creative entry for 7 days. BLACK 7 days / 5,000 RUB. SILVER 1 month / 100,000 RUB partner tier. GOLD investor pool, entry from 300,000 RUB (not 'soon'). User-provided visual references are the definitive material/finish: BLACK black embossed metal + hot pink edge; SILVER brushed silver + cool light; GOLD sculpted warm gold with radiating relief. Their center emblem is a metallic intertwined triple ribbon. White uses a complementary light treatment, pending supplied reference. Avoid image-generated prices: render editable live HTML text.
5. Character cockpit (authenticated): real profile avatar, dream, level, verified points, quest progress and achievements. No fake counts, fabricated 4.9 ratings, invented online users or XP. If no data, show 'Пока нет данных' or onboarding.
6. Quest list: user-specific active quests, status, progress, reward, history; accept only authorized server-side writes.
7. Community: a community space (NOT a single project), people, collaborative initiatives, membership. 'Школа ремонта' is an actual community/reality direction and must be represented with verified official materials; don't fabricate endorsement, metrics or imagery.
8. Projects: 'Сказка.PRO', theatre, Silk Road, 'Нежная сила России', etc only where verified and with factual event status; avoid hardcoded future/past dates.
9. APOLLON assistant: prominent bottom voice/text dock with real mic permission handling, chat history, loading/errors, guest limitations and safe fallback.
10. Mobile: stacked hero, horizontally scrollable cards, fixed bottom nav with safe-area inset, min 44px targets, readable type, reduced-motion support; do not shrink desktop screenshot.

## AI / secrets
Frontend NEVER receives the shared Gemini API key. APOLLON sends authenticated requests to Supabase Edge Function `apollon-core-gateway`, which validates JWT, user/card authorization, rate limits and accesses Gemini using server-side secrets. Optional user-owned Gemini keys must be encrypted at rest and retrievable only via server-side code; never stored in localStorage, logs or public tables. No key is provided in this brief; configure secrets in staging then production after QA. The service must be functional with error/timeout states and a no-key configuration state.

## Suggested component contracts
AppShell, BrandHeader, HeroMedia, FeatureRail, MembershipCard, CharacterPanel, QuestPanel, CommunityPanel, ProjectGrid, SochiMapPreview, ApollonDock, MobileBottomNav.
Every visual tile must define an action, target route, loading/empty/error state, and keyboard focus.
Routes: / (public home), /cinema, /game, /mediahub, /community, /locations, /cards, /profile, /quests, /assistant. Guard authenticated routes; never make public page depend on logged-in session.
Design tokens: background #09050D, panel #170C1E, pink #F527B7, warm gold #E9B75C, silver #B7B8C5, text #F9F5FA. These are draft tokens, to refine against actual card references.
Typography: Russian-capable display sans, normal accessible body text. Respect WCAG AA contrast, avoid neon glow on small copy.

## QA gates before replacing live triznes.online
- Verify build and static asset paths in existing deployment setup; GitHub Actions currently failed at Setup Node.js and did NOT run tests.
- Test on iPhone Safari + desktop; PWA manifest, service worker and cache invalidation.
- Supabase staging RLS for profiles, white-card one-time issuance, no IDOR, existing paid cards preserved, no data migration on production before backup and explicit review.
- Test Gemini gateway with fake key/no key/valid staging secret; never log secrets.
- Verify real media usage permissions and classify REAL / AI ASSISTED / GENERATED / ARCHIVE.
- Merge and production replacement only after green checks and rollback snapshot.

## Gemini / Claude division
Gemini: implement component-by-component pixel-faithful UI using this spec and approved image mockups, keep React/HTML source editable, preserve current routes and data.
Claude: code review, security audit, RLS/migration test, CI repair, deployment diff and rollback review.
The screenshot is a visual reference, not a substitute for working interactions or source code.
