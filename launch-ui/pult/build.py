#!/usr/bin/env python3
"""Собирает pult/index.html из единственного исходника pult/pult-v2.html.
pult-v2.html — тело страницы (без <html>/<head>; так же публикуется как личная страница в Claude).
Смысловой слой подмешивается read-only скриптом firmware-overlay.js из core/firmware-v3.json.
Живое состояние подмешивается runtime-overlay.js: только безопасная проекция, без приватных ID/контактов.
Карта всего проекта подмешивается world-map-overlay.js из обезличенного world-map.json.
Запуск: python3 pult/build.py
"""
import pathlib

here = pathlib.Path(__file__).parent
src = (here / "pult-v2.html").read_text(encoding="utf-8")
head_end = src.index("</style>") + len("</style>")
head, body = src[:head_end], src[head_end:]
body = body.replace(
    "<span>Пульт показывает, задачи — в ClickUp</span>",
    '<span>Пульт показывает, задачи — в ClickUp · <a href="../pult-legacy.html" style="color:var(--c2)">Пульт v15 (архив)</a></span>',
)
html = (
    '<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
    '<!-- СОБРАНО ИЗ pult-v2.html + firmware-v3 + living runtime; правьте исходники, не index.html -->\n'
    + head.strip()
    + "\n</head>\n<body>\n"
    + body.strip()
    + '\n<script src="./world-map-overlay.js" defer></script>'
    + '\n<script src="./characters-overlay.js" defer></script>'
    + '\n<script src="./runtime-overlay.js" defer></script>'
    + '\n<script src="./firmware-overlay.js" defer></script>\n</body>\n</html>\n'
)
html = html.replace("./media/pult-icon-192.png", "../assets/triznes-core-128.png").replace("./media/pult-icon-180.png", "../assets/triznes-core-128.png").replace("./media/sochi-sea-station.jpg", "../assets/archive/mediahub/mediahub-sea-room.webp")\n(here / "index.html").write_text(html, encoding="utf-8")
print("index.html собран:", len(html), "байт")
