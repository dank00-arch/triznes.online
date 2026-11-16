# TRIZNES × SOCHIWOOD — Unified Cinema App v7
Date: 2026-11-16. Scope: visual and navigational composition across public portal, SOCHIWOOD mini-app, character home, PWA app.

## Design source
- Shared layout from the user-approved TRIZNES / SOCHIWOOD ecosystem concept board (real-world places + cinematic streaming app + compact iPhone profiles).
- Apple HIG 2026: separate translucent navigation/chrome from the content layer, prioritize imagery and legibility. Implement independently; no Apple trademarks/assets.
- Palette: dark navy #070915, lilac #a38aff, PINK NOIZE pink #fb6ace, cyan #78dcec, gold #ebc781. Content-driven rather than decorative glass on every card.
- Real media sources are the pre-existing Wikimedia CC BY-SA 4.0 Sochi panorama with on-page attribution and the confirmed public YouTube channel thumbnails; abstract PINK NOIZE/NEUROFARM imagery is artwork, not a depiction of real people or live events.

## Changed
- New: `launch-ui/triznes-unified-v7.css` — single scoped responsive token/component system for entry, character home, cinema, and app, incl. mobile floating cinema tab bar.
- `launch-ui/entry.html`: activates missing `page-entry` body class (critical CSS fix); simplifies first impression into TRIZNES + panoramic Sochi + core value + 3 portal directions. Preserves registration and existing scripts.
- `launch-ui/sochiwood/index.html`: one compact catalog top menu; 4 high-impact tiles (Кинотеатр / Медиахаб / PINK NOIZE / DANIEL/APOLLON); floating mobile tabs (Главная, Фильмы, Новый мир, Моё); existing real-media features and player unchanged.
- `launch-ui/sochiwood/cinema.js`: tiles follow selected section; disappear during search or when showing saved items, without interfering with player or dynamic approved Neurofarm media.
- `launch-ui/home.html`: applies unified design layer to existing character home without changing data hooks.
- `app/index.html`: redesigned cinema discovery card and 2 mini-cards for MediaHub and Neurofarm, backed by real published thumbnails or labeled artwork. All existing authentication, quest/feed controls, media gateway and card data unchanged.

## Editorial safety
No new publications, creator permissions, cards or payments were made. Current films remain unchanged: published YouTube originals + four previously marked public_ok and confirmed accessible through temporary signed links. Archive imagery never marked LIVE; no face swaps. Authenticity of records and 3rd-party artist consents remain release prerequisites for new items.

## Acceptance and next deployment
- Source inspection: all new files exist, JavaScript parses; new CSS balanced; 4 page styles linked.
- Read-only browser acceptance on isolated branch: entry Sochi hero, 3 destination tiles, 4 film thumbnails and SOCHIWOOD CTA passed; cinema compact navigation, four area tiles, editorial features, search "праздник", film modal, images and CSS/JS passed.
- Browser test at desktop did not establish that mobile tabs are visually present at 390px: they are designed under @media max-width:760px and need a physical iPhone Safari smoke test; YouTube may require anti-bot verification with external fallback.
- After PR merge, verify actual hosting deployment: triznes.online previously served an old redirect to /app/ despite main having new files. GitHub merged status cannot be called production release; hosting must deploy the exact merge commit.
