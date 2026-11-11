#!/usr/bin/env python3
"""TRIZNES · приём согласий на сервере в РФ (первичная запись), затем передача в базу.
Слушает 127.0.0.1:8787, nginx проксирует /consent-api/ сюда. Только стандартная библиотека Python.
Первичный журнал: /var/lib/triznes-consent/receipts.jsonl (append + fsync).
Секрет читается из /etc/triznes-consent.env (CONSENT_SECRET=...), в git его нет.
"""
import hashlib, json, os, time, uuid, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SB = 'https://bbxhhtpmbtgfaxamgksf.supabase.co'
ANON = 'sb_publishable_aFTiVGlsJxeeutL_gEZaKA_S9VyKaHS'
STORE = '/var/lib/triznes-consent/receipts.jsonl'
HOST = os.environ.get('TRIZNES_HOST', 'triznes.online')


def secret():
    try:
        for line in open('/etc/triznes-consent.env', encoding='utf-8'):
            if line.startswith('CONSENT_SECRET='):
                return line.split('=', 1)[1].strip()
    except OSError:
        pass
    return ''


def append_receipt(rec):
    os.makedirs(os.path.dirname(STORE), exist_ok=True)
    with open(STORE, 'a', encoding='utf-8') as f:
        f.write(json.dumps(rec, ensure_ascii=False) + '\n')
        f.flush()
        os.fsync(f.fileno())


def rpc(fn, body):
    req = urllib.request.Request(f'{SB}/rest/v1/rpc/{fn}', data=json.dumps(body).encode(),
                                 headers={'apikey': ANON, 'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read() or b'{}')


class H(BaseHTTPRequestHandler):
    def _send(self, code, obj):
        b = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def log_message(self, *a):
        pass

    def do_GET(self):
        self._send(200, {'ok': True, 'service': 'TRIZNES consent RF', 'store': 'local_rf', 'secret_configured': bool(secret())})

    def do_POST(self):
        if not self.path.rstrip('/').endswith('/submit'):
            return self._send(404, {'ok': False, 'error': 'not_found'})
        try:
            n = min(int(self.headers.get('Content-Length') or 0), 4096)
            body = json.loads(self.rfile.read(n) or b'{}')
        except Exception:
            return self._send(400, {'ok': False, 'error': 'bad_json'})
        token = str(body.get('token') or '')
        decision = str(body.get('decision') or '')
        if len(token) != 48 or decision not in ('granted', 'declined'):
            return self._send(400, {'ok': False, 'error': 'bad_request'})
        sec = secret()
        if not sec:
            return self._send(503, {'ok': False, 'error': 'not_configured'})
        ip = (self.headers.get('X-Real-IP') or self.headers.get('X-Forwarded-For') or '').split(',')[0].strip()
        ua = (self.headers.get('User-Agent') or '')[:300]
        rid = str(uuid.uuid4())
        rec = {'receipt_id': rid, 'ts': time.strftime('%Y-%m-%dT%H:%M:%S%z'), 'token_sha256': hashlib.sha256(token.encode()).hexdigest(),
               'decision': decision, 'ip': ip, 'user_agent': ua, 'host': HOST}
        try:
            append_receipt(rec)  # первичная запись в РФ — до передачи куда-либо
        except Exception:
            return self._send(500, {'ok': False, 'error': 'rf_store_failed'})
        ref = f'rf:{HOST}:{rid}'
        try:
            res = rpc('triznes_consent_record', {'p_secret': sec, 'p_token': token, 'p_decision': decision, 'p_receipt_ref': ref,
                                                 'p_evidence': {'ip_sha256': hashlib.sha256(ip.encode()).hexdigest(), 'ua': ua[:120]}})
        except Exception:
            res = {'ok': False, 'error': 'sync_failed'}
        append_receipt({'receipt_id': rid, 'sync': res, 'ts': time.strftime('%Y-%m-%dT%H:%M:%S%z')})
        self._send(200 if res.get('ok') else 502, {**res, 'receipt': ref})


if __name__ == '__main__':
    ThreadingHTTPServer(('127.0.0.1', 8787), H).serve_forever()
