#!/usr/bin/env python3
"""Собирает unified/ в один HTML-файл для предпросмотра: стили, скрипты, шрифты и картинки встроены.
   python3 unified/tools/bundle.py [--fragment] OUT.html
   --fragment — без <!doctype>/<html>/<head>/<body> (для площадок, которые добавляют каркас сами)."""
import base64, mimetypes, pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent
args = [a for a in sys.argv[1:] if not a.startswith('--')]
fragment = '--fragment' in sys.argv
out = pathlib.Path(args[0] if args else root / 'dist' / 'triznes-unified.html')

def data_uri(path):
    mime = mimetypes.guess_type(path.name)[0] or {'.woff2': 'font/woff2', '.webp': 'image/webp'}.get(path.suffix, 'application/octet-stream')
    return 'data:%s;base64,%s' % (mime, base64.b64encode(path.read_bytes()).decode())

css = (root / 'css' / 'app.css').read_text(encoding='utf-8')
css = re.sub(r"url\('\.\./(assets/[^']+)'\)", lambda m: "url('%s')" % data_uri(root / m.group(1)), css)

js = ''
for name in ['seed-world.js', 'seed-cast.js', 'core.js', 'app.js']:  # порядок загрузки
    js += '\n/* ' + name + ' */\n' + (root / 'js' / name).read_text(encoding='utf-8')
assets = sorted(set(re.findall(r"assets/[A-Za-z0-9_./-]+?\.(?:webp|png)", js)))
table = {a: data_uri(root / a) for a in assets if (root / a).exists()}
# картинки с вычисляемым именем (ключевой арт по оптике)
for extra in ['assets/art/01_keyart_night.webp', 'assets/art/05_dawn_abundance.webp']:
    table[extra] = data_uri(root / extra)
js = "window.TZ=window.TZ||{};TZ.assetMap=" + repr(table).replace("'", '"') + ";\n" + js
# в одно-файловой сборке видео берутся из неизменяемой копии в CDN
js = js.replace("media: 'media/", "media: 'https://cdn.jsdelivr.net/gh/dank00-arch/triznes.online@caf7cc3dcd9173ed1df27e8bd0c00bfa094ec8d0/app/media/")
js = js.replace('</script', '<\\/script')

head = ('<title>TRIZNES Жизнь в игре</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<style>\n' + css + '\n</style>\n')
body = ('<canvas id="sky" aria-hidden="true"></canvas>\n<div class="app" id="app"></div>\n<div class="toasts" id="toasts" aria-live="polite"></div>\n<script>\n' + js + '\n</script>\n')
if fragment:
    html = head + body
else:
    html = ('<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            + head + '</head>\n<body>\n' + body + '</body>\n</html>\n')
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(html, encoding='utf-8')
print(out, round(len(html.encode()) / 1024), 'KB')
