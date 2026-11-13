#!/usr/bin/env bash
# TRIZNES · выложить единое приложение на triznes.online/unified/. 2026-11-13.
# Запускает только владелец, со своего Mac. Ничего не запускается само.
#   bash deploy/triznes-unified-20261113.sh            — выложить папку unified/ (главная страница не меняется)
#   bash deploy/triznes-unified-20261113.sh home       — сделать triznes.online входом в приложение (с бэкапом index.html)
#   bash deploy/triznes-unified-20261113.sh rollback   — вернуть прежнюю папку unified/ и прежний index.html
# Ветка по умолчанию — main; другая: BRANCH=имя-ветки bash deploy/triznes-unified-20261113.sh
# Меняет только: /var/www/site.com/main/unified и (в режиме home) /var/www/site.com/main/index.html.
# Сервисы, nginx и остальные страницы сайта не трогает.
set -euo pipefail
MODE="${1:-apply}"
BRANCH="${BRANCH:-main}"
KEY="${SSH_KEY:-$HOME/Documents/ТРИЗНЕС-КЛЮЧИ/id_ed25519_deploy}"
[ -f "$KEY" ] || KEY="$HOME/.ssh/id_ed25519_deploy"
[ -f "$KEY" ] || { echo "Нет ключа — укажи SSH_KEY=путь"; exit 1; }
ssh -i "$KEY" -o ConnectTimeout=60 root@31.13.208.206 "MODE=$MODE BRANCH=$BRANCH bash -s" <<'REMOTE'
set -euo pipefail
cd /var/www/site.com/main
TS=$(date +%Y%m%d-%H%M%S)
if [ "$MODE" = "rollback" ]; then
  last=$(ls -d unified.bak-* 2>/dev/null | tail -1 || true)
  rm -rf unified
  if [ -n "$last" ]; then mv "$last" unified; echo "ОТКАТ: unified восстановлен из $last"; else echo "ОТКАТ: папка unified убрана"; fi
  lasti=$(ls index.html.bak-*-before-unified 2>/dev/null | tail -1 || true)
  if [ -n "$lasti" ]; then cp "$lasti" index.html; echo "ОТКАТ: index.html восстановлен из $lasti"; fi
  exit 0
fi
if [ "$MODE" = "home" ]; then
  [ -f unified/index.html ] || { echo "Сначала выложи приложение (запуск без параметров)"; exit 2; }
  cp index.html "index.html.bak-$TS-before-unified"
  cat > index.html <<'HTML'
<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=/unified/"><title>TRIZNES · Жизнь в игре</title></head><body><p>Открываем TRIZNES… <a href="/unified/">войти</a></p><script>location.replace('/unified/')</script></body></html>
HTML
  echo "ГОТОВО: triznes.online открывает /unified/ (бэкап index.html.bak-$TS-before-unified)"; exit 0
fi
tmp=$(mktemp -d)
curl -fsSL "https://codeload.github.com/dank00-arch/triznes.online/tar.gz/refs/heads/$BRANCH" | tar xz -C "$tmp"
root=$(find "$tmp" -maxdepth 1 -mindepth 1 -type d | head -1)
[ -f "$root/unified/index.html" ] || { echo "Не нашёл unified/ в ветке $BRANCH"; rm -rf "$tmp"; exit 3; }
[ -d unified ] && mv unified "unified.bak-$TS"
cp -r "$root/unified" unified && rm -rf unified/tools && chmod -R a+rX unified
rm -rf "$tmp"
echo "ГОТОВО: https://triznes.online/unified/ ($(du -sh unified | cut -f1)). Прежняя версия, если была: unified.bak-$TS"
REMOTE
