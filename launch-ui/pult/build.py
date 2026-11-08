#!/usr/bin/env python3
"""Build the public TRIZNES Pult from the maintained pult-v2.html source."""
from pathlib import Path

here = Path(__file__).parent
src = (here / "pult-v2.html").read_text(encoding="utf-8")
head_end = src.index("</style>") + len("</style>")
head, body = src[:head_end], src[head_end:]
body = body.replace(
    "<span>Пульт показывает, задачи — в ClickUp</span>",
    '<span>Пульт показывает, задачи — в ClickUp · <a href="../pult-legacy.html" style="color:var(--c2)">Старая версия</a></span>',
)
html = (
    '<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
    '<!-- Built from pult-v2.html; keep the source file authoritative. -->\n'
    + head.strip()
    + "\n</head>\n<body>\n"
    + body.strip()
    + '\n<script src="./world-map-overlay.js" defer></script>'
    + '\n<script src="./characters-overlay.js" defer></script>'
    + '\n<script src="./runtime-overlay.js" defer></script>'
    + '\n<script src="./firmware-overlay.js" defer></script>\n</body>\n</html>\n'
)
html = (html.replace("./media/pult-icon-192.png", "../assets/triznes-core-128.png")
            .replace("./media/pult-icon-180.png", "../assets/triznes-core-128.png")
            .replace("./media/sochi-sea-station.jpg", "../assets/archive/mediahub/mediahub-sea-room.webp"))
(here / "index.html").write_text(html, encoding="utf-8")
print("index.html built:", len(html), "bytes")
