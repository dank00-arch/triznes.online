#!/usr/bin/env bash
# TRIZNES · включить приём согласий на сервере triznes.online (первичная запись в РФ). 2026-11-11, Claude.
# Запуск на Mac (после triznes-app-20261111.sh):
#   curl -fsSL https://raw.githubusercontent.com/dank00-arch/triznes.online/feat/triznes-mobile-app-20261111/deploy/triznes-consent-rf-20261111.sh -o /tmp/consent.sh && bash /tmp/consent.sh
# Скрипт попросит вставить секрет consent_rf_secret: открой Supabase Dashboard → Table Editor →
# telegram_bot_settings → строка setting_key = consent_rf_secret → скопируй setting_value. В чат его не присылай.
# Откат: bash /tmp/consent.sh rollback
set -euo pipefail
MODE="${1:-apply}"
BRANCH="${BRANCH:-feat/triznes-mobile-app-20261111}"
KEY="${SSH_KEY:-$HOME/Documents/ТРИЗНЕС-КЛЮЧИ/id_ed25519_deploy}"
[ -f "$KEY" ] || KEY="$HOME/.ssh/id_ed25519_deploy"
[ -f "$KEY" ] || { echo "Нет ключа — укажи SSH_KEY=путь"; exit 1; }
SECRET=""
if [ "$MODE" = "apply" ]; then
  read -r -s -p "Вставь consent_rf_secret из Supabase и нажми Enter: " SECRET; echo
  [ ${#SECRET} -ge 32 ] || { echo "Секрет слишком короткий"; exit 1; }
fi
ssh -i "$KEY" -o ConnectTimeout=60 root@31.13.208.206 "MODE=$MODE BRANCH=$BRANCH SECRET=$SECRET bash -s" <<'REMOTE'
set -euo pipefail
TS=$(date +%Y%m%d-%H%M%S)
CONF=$(grep -rl "/var/www/site.com/main" /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null | head -1 || true)
if [ "$MODE" = "rollback" ]; then
  systemctl disable --now triznes-consent 2>/dev/null || true
  last=$(ls "$CONF".bak-*-consent 2>/dev/null | tail -1 || true)
  [ -n "$last" ] && cp "$last" "$CONF" && nginx -t && systemctl reload nginx && echo "ОТКАТ: nginx восстановлен"
  echo "ОТКАТ: сервис согласий остановлен (журнал /var/lib/triznes-consent сохранён)"; exit 0
fi
COUNTRY=$(curl -fsS --max-time 10 https://ipinfo.io/country 2>/dev/null || echo "?")
echo "Страна сервера по ipinfo: $COUNTRY"
if [ "$COUNTRY" != "RU" ]; then echo "СТОП: сервер не в РФ — согласия здесь хранить нельзя. Напиши Claude."; exit 3; fi
command -v python3 >/dev/null || { echo "Нет python3"; exit 4; }
[ -n "$CONF" ] || { echo "Не нашёл конфиг nginx для /var/www/site.com/main"; exit 5; }
mkdir -p /opt/triznes-consent /var/lib/triznes-consent && chmod 700 /var/lib/triznes-consent
curl -fsSL "https://raw.githubusercontent.com/dank00-arch/triznes.online/$BRANCH/deploy/consent-rf/triznes_consent_rf.py" -o /opt/triznes-consent/triznes_consent_rf.py
umask 077; printf 'CONSENT_SECRET=%s\n' "$SECRET" > /etc/triznes-consent.env; umask 022
cat > /etc/systemd/system/triznes-consent.service <<'UNIT'
[Unit]
Description=TRIZNES consent RF receipts
After=network-online.target
[Service]
ExecStart=/usr/bin/python3 /opt/triznes-consent/triznes_consent_rf.py
Restart=always
User=root
[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload && systemctl enable --now triznes-consent && sleep 1
curl -fsS http://127.0.0.1:8787/ && echo
if ! grep -q "consent-api" "$CONF"; then
  cp "$CONF" "$CONF.bak-$TS-consent"
  python3 - "$CONF" <<'PY'
import sys,re
p=sys.argv[1]; s=open(p,encoding='utf-8').read()
block="\n    location /consent-api/ { proxy_pass http://127.0.0.1:8787/; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; client_max_body_size 8k; }\n"
out=[];n=0
for m in re.finditer(r'root\s+/var/www/site\.com/main\s*;',s): pass
s2=re.sub(r'(root\s+/var/www/site\.com/main\s*;)',lambda m:(m.group(1)+block),s)
n=s2.count('location /consent-api/')
assert n>=1,"root line not found"
open(p,'w',encoding='utf-8').write(s2); print("nginx: добавлено мест:",n)
PY
  if nginx -t; then systemctl reload nginx; else cp "$CONF.bak-$TS-consent" "$CONF"; echo "nginx -t не прошёл — откатил конфиг"; exit 6; fi
fi
curl -fsS https://triznes.online/consent-api/ && echo
echo "ГОТОВО: приём согласий работает. Скажи Claude: «согласия включены»."
REMOTE
