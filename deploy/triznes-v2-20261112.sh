#!/usr/bin/env bash
# TRIZNES · выложить приложение v2 на triznes.online/app/ + сервис фото и мессенджера в РФ. 2026-11-12, Claude.
# Запуск на Mac:
#   curl -fsSL https://raw.githubusercontent.com/dank00-arch/triznes.online/feat/triznes-mobile-app-20261111/deploy/triznes-v2-20261112.sh | bash
# Сразу сделать triznes.online главной страницей приложения:   ... | bash -s home
# Откат приложения и сервиса:                                   ... | bash -s rollback
# Меняет: папку /var/www/site.com/main/app, сервис triznes-rf-social, блок /rf-api/ в nginx (с бэкапом).
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
CONF=$(grep -rl "/var/www/site.com/main" /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null | head -1 || true)
if [ "$MODE" = "rollback" ]; then
  last=$(ls -d app.bak-* 2>/dev/null | tail -1 || true)
  rm -rf app; [ -n "$last" ] && mv "$last" app && echo "ОТКАТ: app восстановлен из $last" || echo "ОТКАТ: папка app убрана"
  systemctl disable --now triznes-rf-social 2>/dev/null || true
  lastc=$(ls "$CONF".bak-*-rfsocial 2>/dev/null | tail -1 || true)
  [ -n "$lastc" ] && cp "$lastc" "$CONF" && nginx -t && systemctl reload nginx && echo "ОТКАТ: nginx восстановлен"
  echo "ОТКАТ: сервис фото и мессенджера остановлен (данные /var/lib/triznes-rf сохранены)"; exit 0
fi
if [ "$MODE" = "home" ]; then
  cp index.html "index.html.bak-$TS-before-app"
  cat > index.html <<'HTML'
<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=/app/"><title>TRIZNES</title></head><body><a href="/app/">TRIZNES — открыть</a><script>location.replace('/app/'+location.hash)</script></body></html>
HTML
  echo "ГОТОВО: triznes.online открывает приложение /app/ (бэкап index.html.bak-$TS-before-app)"; exit 0
fi
# 1) приложение
tmp=$(mktemp -d)
curl -fsSL "https://codeload.github.com/dank00-arch/triznes.online/tar.gz/refs/heads/$BRANCH" | tar xz -C "$tmp"
root=$(find "$tmp" -maxdepth 1 -mindepth 1 -type d | head -1)
[ -f "$root/app/index.html" ] || { echo "Не нашёл app/ в ветке $BRANCH"; exit 2; }
[ -d app ] && mv app "app.bak-$TS"
cp -r "$root/app" app && chmod -R a+rX app
echo "Приложение: https://triznes.online/app/ ($(du -sh app | cut -f1))"
# 2) сервис фото и мессенджера — только если сервер в РФ
COUNTRY=$(curl -fsS --max-time 10 https://ipinfo.io/country 2>/dev/null || echo "?")
echo "Страна сервера по ipinfo: $COUNTRY"
if [ "$COUNTRY" != "RU" ]; then echo "СТОП: сервер не в РФ — фото и сообщения здесь хранить нельзя. Приложение выложено, мессенджер выключен. Напиши Claude."; rm -rf "$tmp"; exit 3; fi
command -v python3 >/dev/null || { echo "Нет python3"; exit 4; }
[ -n "$CONF" ] || { echo "Не нашёл конфиг nginx для /var/www/site.com/main"; exit 5; }
mkdir -p /opt/triznes-rf /var/lib/triznes-rf && chmod 700 /var/lib/triznes-rf
cp "$root/deploy/rf-social/triznes_rf_social.py" /opt/triznes-rf/triznes_rf_social.py
rm -rf "$tmp"
cat > /etc/systemd/system/triznes-rf-social.service <<'UNIT'
[Unit]
Description=TRIZNES RF social (avatars + messenger)
After=network-online.target
[Service]
ExecStart=/usr/bin/python3 /opt/triznes-rf/triznes_rf_social.py
Restart=always
User=root
[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload && systemctl enable triznes-rf-social >/dev/null 2>&1 && systemctl restart triznes-rf-social && sleep 1
curl -fsS http://127.0.0.1:8788/ && echo
if ! grep -q "rf-api" "$CONF"; then
  cp "$CONF" "$CONF.bak-$TS-rfsocial"
  python3 - "$CONF" <<'PY'
import sys,re
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
block="\n    location /rf-api/ { proxy_pass http://127.0.0.1:8788/; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; client_max_body_size 2m; }\n"
s2=re.sub(r'(root\s+/var/www/site\.com/main\s*;)',lambda m:(m.group(1)+block),s)
assert s2.count('location /rf-api/')>=1,"root line not found"
open(p,'w',encoding='utf-8').write(s2); print("nginx: добавлено мест:",s2.count('location /rf-api/'))
PY
  if nginx -t; then systemctl reload nginx; else cp "$CONF.bak-$TS-rfsocial" "$CONF"; echo "nginx -t не прошёл — откатил конфиг"; exit 6; fi
fi
curl -fsS https://triznes.online/rf-api/ && echo
echo "ГОТОВО: приложение v2 и мессенджер работают. Скажи Claude: «v2 выложено»."
REMOTE
