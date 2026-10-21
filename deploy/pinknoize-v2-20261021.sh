#!/usr/bin/env bash
# TRIZNES · включить слой PINK NOIZE v2 + ассистенты на живом сайте (VPS). 2026-10-21, Claude.
# Запуск на Mac:  curl -fsSL https://raw.githubusercontent.com/dank00-arch/triznes.online/main/deploy/pinknoize-v2-20261021.sh | bash
# Откат:          curl -fsSL https://raw.githubusercontent.com/dank00-arch/triznes.online/main/deploy/pinknoize-v2-20261021.sh | bash -s rollback
set -euo pipefail
MODE="${1:-apply}"
KEY="${SSH_KEY:-$HOME/Documents/ТРИЗНЕС-КЛЮЧИ/id_ed25519_deploy}"
[ -f "$KEY" ] || { echo "Нет ключа: $KEY — укажи SSH_KEY=путь"; exit 1; }
ssh -i "$KEY" -o ConnectTimeout=60 root@31.13.208.206 "MODE=$MODE bash -s" <<'REMOTE'
set -euo pipefail
cd /var/www/site.com/main
RAW=https://raw.githubusercontent.com/dank00-arch/triznes.online/main/site-layers
if [ "$MODE" = "rollback" ]; then
  python3 - <<'PY'
import re,pathlib
p=pathlib.Path('index.html'); s=p.read_text(encoding='utf-8')
s=re.sub(r'\n?\s*<link rel="stylesheet" href="design-v44-pinknoize-v2\.css[^"]*">','',s)
s=re.sub(r'\n?\s*<script src="design-v44-pinknoize-v2\.js[^"]*"></script>','',s)
p.write_text(s,encoding='utf-8'); print("ОТКАТ: строки design-v44 убраны")
PY
  exit 0
fi
cp index.html "index.html.bak-$(date +%Y%m%d-%H%M%S)-before-pn2"
mkdir -p assets/pinknoize
curl -fsSL "$RAW/design-v44-pinknoize-v2.css" -o design-v44-pinknoize-v2.css
curl -fsSL "$RAW/design-v44-pinknoize-v2.js" -o design-v44-pinknoize-v2.js
curl -fsSL "$RAW/assets/pinknoize/triznes-smile-128.png" -o assets/pinknoize/triznes-smile-128.png
python3 - <<'PY'
import pathlib
p=pathlib.Path('index.html'); s=p.read_text(encoding='utf-8')
V='20261021-1'
if 'design-v44-pinknoize-v2' in s:
    print("УЖЕ ПОДКЛЮЧЕНО — index.html не менялся")
else:
    i=s.rfind('</head>'); j=s.rfind('</body>')
    assert i>0 and j>i, "не найдены </head> или </body>"
    s=s[:j]+f'  <script src="design-v44-pinknoize-v2.js?v={V}"></script>\n'+s[j:]
    s=s[:i]+f'  <link rel="stylesheet" href="design-v44-pinknoize-v2.css?v={V}">\n'+s[i:]
    p.write_text(s,encoding='utf-8'); print("ГОТОВО: PINK NOIZE v2 подключён")
PY
ls -la design-v44-pinknoize-v2.css design-v44-pinknoize-v2.js assets/pinknoize/triznes-smile-128.png
grep -c 'design-v44-pinknoize-v2' index.html
REMOTE
echo "Проверь: https://triznes.online/  (выключить для себя: https://triznes.online/?pn2=0)"
