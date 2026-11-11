#!/usr/bin/env bash
# TRIZNES · выложить мобильное приложение на triznes.online/app/ (VPS). 2026-11-11, Claude.
# Запуск на Mac:   curl -fsSL https://raw.githubusercontent.com/dank00-arch/triznes.online/feat/triznes-mobile-app-20261111/deploy/triznes-app-20261111.sh | bash
# Сделать /app/ главной страницей сайта (по желанию, отдельно):  ... | bash -s home
# Откат:           ... | bash -s rollback
# Меняет только папку /var/www/site.com/main/app (и index.html — только в режиме home, с бэкапом).
set -euo pipefail
MODE="${1:-apply}"
BRANCH="${BRANCH:-feat/triznes-mobile-app-20261111}"
KEY="${SSH_KEY:-$HOME/Documents/ТРИЗНЕС-КЛЮЧИ/id_ed25519_deploy}"
[ -f "$KEY" ] || KEY="$HOME/.ssh/id_ed25519_deploy"
[ -f "$KEY" ] || { echo "Нет ключа — укажи SSH_KEY=путь"; exit 1; }
ssh -i "$KEY" -o ConnectTimeout=60 root@31.13.208.206 "MODE=$MODE BRANCH=$BRANCH bash -s" <<'REMOTE'
set -euo pipefail
cd /var/www/site.com/main
TS=$(date +%Y%m%d-%H%M%S)
if [ "$MODE" = "rollback" ]; then
  last=$(ls -d app.bak-* 2>/dev/null | tail -1 || true)
  rm -rf app; [ -n "$last" ] && mv "$last" app && echo "ОТКАТ: app восстановлен из $last" || echo "ОТКАТ: папка app убрана"
  lastidx=$(ls index.html.bak-*-before-app 2>/dev/null | tail -1 || true)
  [ -n "$lastidx" ] && cp "$lastidx" index.html && echo "ОТКАТ: index.html восстановлен"
  exit 0
fi
if [ "$MODE" = "home" ]; then
  cp index.html "index.html.bak-$TS-before-app"
  cat > index.html <<'HTML'
<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=/app/"><title>TRIZNES</title></head><body><a href="/app/">TRIZNES — открыть</a><script>location.replace('/app/'+location.hash)</script></body></html>
HTML
  echo "ГОТОВО: triznes.online открывает приложение /app/ (бэкап index.html.bak-$TS-before-app)"; exit 0
fi
tmp=$(mktemp -d)
curl -fsSL "https://codeload.github.com/dank00-arch/triznes.online/tar.gz/refs/heads/$BRANCH" | tar xz -C "$tmp"
src=$(find "$tmp" -maxdepth 2 -type d -name app | head -1)
[ -f "$src/index.html" ] || { echo "Не нашёл app/ в ветке $BRANCH"; exit 2; }
[ -d app ] && mv app "app.bak-$TS"
cp -r "$src" app && chmod -R a+rX app && rm -rf "$tmp"
grep -q 'webmanifest' /etc/nginx/mime.types 2>/dev/null || echo "Подсказка: в nginx mime.types нет webmanifest — приложение всё равно установится."
echo "ГОТОВО: https://triznes.online/app/  ($(du -sh app | cut -f1))"
REMOTE
