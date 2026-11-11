#!/usr/bin/env python3
"""TRIZNES · фото персонажей и мессенджер на сервере в РФ (первичное хранение). 2026-11-12, Claude.

Слушает 127.0.0.1:8788, nginx проксирует /rf-api/ сюда. Только стандартная библиотека Python 3.
Хранение: /var/lib/triznes-rf/social.db (SQLite) и /var/lib/triznes-rf/avatars/.
Вход: заголовок X-Triznes-Session — токен приложения. Проверяется через шлюз TRIZNES (whoami),
результат кэшируется на 5 минут. В Supabase отсюда ничего не пишется: фото и сообщения остаются в РФ.
"""
import json, os, re, sqlite3, threading, time, uuid, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

GATEWAY = os.environ.get('TRIZNES_GATEWAY', 'https://bbxhhtpmbtgfaxamgksf.supabase.co/functions/v1/triznes-provider-probe')
ROOT = os.environ.get('TRIZNES_RF_ROOT', '/var/lib/triznes-rf')
DB = os.path.join(ROOT, 'social.db')
AV = os.path.join(ROOT, 'avatars')
PORT = int(os.environ.get('TRIZNES_RF_PORT', '8788'))
MAX_AVATAR = 1_600_000
MAX_TEXT = 2000
ARCHETYPES = {'voice', 'stage', 'director', 'maker', 'connector', 'healer', 'explorer', 'creator'}
COLOR = re.compile(r'^#[0-9a-fA-F]{6}$')
UUID = re.compile(r'^[0-9a-f-]{36}$')
LOCK = threading.Lock()
CACHE = {}


def db():
    c = sqlite3.connect(DB, timeout=10)
    c.row_factory = sqlite3.Row
    return c


def init():
    os.makedirs(AV, exist_ok=True)
    os.chmod(ROOT, 0o700)
    with db() as c:
        c.executescript('''
        create table if not exists players(id text primary key, alias text, role text, level int, xp int,
            last_seen int, visible int default 1);
        create table if not exists profiles(player_id text primary key, archetype text, colors text, motto text,
            bio text, avatar_key text, photo_consent_at int, chat_consent_at int, updated_at int);
        create table if not exists messages(id integer primary key autoincrement, sender text, recipient text,
            body text, created_at int, read_at int);
        create index if not exists messages_pair on messages(sender, recipient, id);
        create index if not exists messages_recipient on messages(recipient, read_at);
        create table if not exists blocks(player_id text, blocked text, created_at int, primary key(player_id, blocked));
        create table if not exists reports(id integer primary key autoincrement, reporter text, target text,
            message_id int, reason text, created_at int);
        ''')


def whoami(token):
    now = time.time()
    hit = CACHE.get(token)
    if hit and now - hit[0] < 300:
        return hit[1]
    req = urllib.request.Request(GATEWAY, data=json.dumps({'action': 'whoami', 'session_token': token}).encode(),
                                 headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            d = json.loads(r.read() or b'{}')
    except Exception:
        return None
    p = d.get('player') if d.get('ok') else None
    if p and UUID.match(str(p.get('id', ''))):
        CACHE[token] = (now, p)
        with LOCK, db() as c:
            c.execute('insert into players(id, alias, role, level, xp, last_seen) values(?,?,?,?,?,?) '
                      'on conflict(id) do update set alias=excluded.alias, role=excluded.role, level=excluded.level, '
                      'xp=excluded.xp, last_seen=excluded.last_seen',
                      (p['id'], str(p.get('alias') or '')[:120], str(p.get('role') or '')[:160],
                       int(p.get('level') or 0), int(p.get('xp') or 0), int(now)))
        return p
    return None


def profile_row(c, pid):
    r = c.execute('select * from profiles where player_id=?', (pid,)).fetchone()
    if not r:
        return {'archetype': None, 'colors': [], 'motto': '', 'bio': '', 'avatar': None,
                'photo_consent': False, 'chat_consent': False}
    return {'archetype': r['archetype'], 'colors': json.loads(r['colors'] or '[]'), 'motto': r['motto'] or '',
            'bio': r['bio'] or '', 'avatar': f"/rf-api/a/{r['avatar_key']}.img" if r['avatar_key'] else None,
            'photo_consent': bool(r['photo_consent_at']), 'chat_consent': bool(r['chat_consent_at'])}


def sniff(b):
    if b[:3] == b'\xff\xd8\xff':
        return 'image/jpeg'
    if b[:8] == b'\x89PNG\r\n\x1a\n':
        return 'image/png'
    if b[:4] == b'RIFF' and b[8:12] == b'WEBP':
        return 'image/webp'
    return None


class H(BaseHTTPRequestHandler):
    server_version = 'TRIZNES-RF/1'

    def log_message(self, *a):  # без логов содержимого
        pass

    def out(self, code, body, ctype='application/json; charset=utf-8', extra=None):
        raw = body if isinstance(body, bytes) else json.dumps(body, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(raw)))
        self.send_header('Cache-Control', 'no-store' if ctype.startswith('application/json') else 'public, max-age=86400')
        self.send_header('X-Content-Type-Options', 'nosniff')
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(raw)

    def me(self):
        t = (self.headers.get('X-Triznes-Session') or '').strip()
        return whoami(t) if 24 <= len(t) <= 400 else None

    def body(self, limit=20000):
        n = int(self.headers.get('Content-Length') or 0)
        if n <= 0 or n > limit:
            return None
        return self.rfile.read(n)

    def jbody(self):
        raw = self.body()
        try:
            return json.loads(raw or b'{}')
        except Exception:
            return {}

    def do_GET(self):
        u = urlparse(self.path)
        path = u.path.rstrip('/') or '/'
        if path in ('/', ''):
            return self.out(200, {'ok': True, 'service': 'TRIZNES RF social', 'version': 1, 'storage': 'RU'})
        m = re.match(r'^/a/([0-9a-f]{32})\.img$', path)
        if m:
            f = os.path.join(AV, m.group(1))
            if not os.path.isfile(f):
                return self.out(404, {'ok': False})
            b = open(f, 'rb').read()
            return self.out(200, b, sniff(b) or 'application/octet-stream')
        p = self.me()
        if not p:
            return self.out(401, {'ok': False, 'error': 'session_invalid'})
        q = {k: v[0] for k, v in parse_qs(u.query).items()}
        with db() as c:
            if path == '/me':
                return self.out(200, {'ok': True, 'player': p, 'profile': profile_row(c, p['id'])})
            if path == '/players':
                rows = c.execute('select * from players where visible=1 and id<>? order by last_seen desc limit 200', (p['id'],)).fetchall()
                blocked = {r['blocked'] for r in c.execute('select blocked from blocks where player_id=?', (p['id'],))}
                res = []
                for r in rows:
                    if r['id'] in blocked:
                        continue
                    pr = profile_row(c, r['id'])
                    res.append({'id': r['id'], 'alias': r['alias'], 'role': r['role'], 'level': r['level'],
                                'archetype': pr['archetype'], 'colors': pr['colors'], 'motto': pr['motto'],
                                'avatar': pr['avatar'], 'last_seen': r['last_seen'], 'chat': pr['chat_consent']})
                return self.out(200, {'ok': True, 'players': res})
            if path == '/threads':
                rows = c.execute('''select case when sender=? then recipient else sender end other, max(id) last_id
                                    from messages where sender=? or recipient=? group by other order by last_id desc limit 100''',
                                 (p['id'], p['id'], p['id'])).fetchall()
                res = []
                for r in rows:
                    last = c.execute('select * from messages where id=?', (r['last_id'],)).fetchone()
                    unread = c.execute('select count(*) from messages where sender=? and recipient=? and read_at is null',
                                       (r['other'], p['id'])).fetchone()[0]
                    o = c.execute('select alias, role from players where id=?', (r['other'],)).fetchone()
                    res.append({'with': r['other'], 'alias': o['alias'] if o else 'Игрок', 'role': o['role'] if o else '',
                                'avatar': profile_row(c, r['other'])['avatar'], 'last': last['body'][:140],
                                'at': last['created_at'], 'mine': last['sender'] == p['id'], 'unread': unread})
                return self.out(200, {'ok': True, 'threads': res})
            if path == '/messages':
                other = q.get('with', '')
                if not UUID.match(other):
                    return self.out(400, {'ok': False, 'error': 'with_required'})
                after = int(q.get('after') or 0)
                rows = c.execute('''select id, sender, body, created_at from messages where id>? and
                                    ((sender=? and recipient=?) or (sender=? and recipient=?)) order by id desc limit 80''',
                                 (after, p['id'], other, other, p['id'])).fetchall()
                with LOCK:
                    c.execute('update messages set read_at=? where sender=? and recipient=? and read_at is null',
                              (int(time.time()), other, p['id']))
                return self.out(200, {'ok': True, 'messages': [{'id': r['id'], 'mine': r['sender'] == p['id'],
                                                               'text': r['body'], 'at': r['created_at']} for r in reversed(rows)]})
            if path == '/unread':
                n = c.execute('select count(*) from messages where recipient=? and read_at is null', (p['id'],)).fetchone()[0]
                return self.out(200, {'ok': True, 'unread': n})
        return self.out(404, {'ok': False, 'error': 'not_found'})

    def do_POST(self):
        path = urlparse(self.path).path.rstrip('/')
        p = self.me()
        if not p:
            return self.out(401, {'ok': False, 'error': 'session_invalid'})
        now = int(time.time())
        if path == '/me/avatar':
            raw = self.body(MAX_AVATAR)
            if not raw or not sniff(raw):
                return self.out(400, {'ok': False, 'error': 'image_required'})
            with LOCK, db() as c:
                pr = c.execute('select avatar_key, photo_consent_at from profiles where player_id=?', (p['id'],)).fetchone()
                if not pr or not pr['photo_consent_at']:
                    return self.out(403, {'ok': False, 'error': 'photo_consent_required'})
                key = uuid.uuid4().hex
                tmp = os.path.join(AV, key + '.tmp')
                with open(tmp, 'wb') as f:
                    f.write(raw)
                    f.flush()
                    os.fsync(f.fileno())
                os.replace(tmp, os.path.join(AV, key))
                if pr['avatar_key']:
                    try:
                        os.remove(os.path.join(AV, pr['avatar_key']))
                    except OSError:
                        pass
                c.execute('update profiles set avatar_key=?, updated_at=? where player_id=?', (key, now, p['id']))
            return self.out(200, {'ok': True, 'avatar': f'/rf-api/a/{key}.img'})
        b = self.jbody()
        with LOCK, db() as c:
            c.execute('insert or ignore into profiles(player_id, colors, updated_at) values(?,?,?)', (p['id'], '[]', now))
            if path == '/me/consent':
                if b.get('photos') is True:
                    c.execute('update profiles set photo_consent_at=? where player_id=?', (now, p['id']))
                if b.get('messages') is True:
                    c.execute('update profiles set chat_consent_at=? where player_id=?', (now, p['id']))
                return self.out(200, {'ok': True, 'profile': profile_row(c, p['id'])})
            if path == '/me/profile':
                arch = b.get('archetype') if b.get('archetype') in ARCHETYPES else None
                colors = [x for x in (b.get('colors') or []) if isinstance(x, str) and COLOR.match(x)][:3]
                motto = str(b.get('motto') or '')[:160]
                bio = str(b.get('bio') or '')[:1200]
                c.execute('update profiles set archetype=?, colors=?, motto=?, bio=?, updated_at=? where player_id=?',
                          (arch, json.dumps(colors), motto, bio, now, p['id']))
                if 'visible' in b:
                    c.execute('update players set visible=? where id=?', (1 if b.get('visible') else 0, p['id']))
                return self.out(200, {'ok': True, 'profile': profile_row(c, p['id'])})
            if path == '/messages':
                to, text = str(b.get('to') or ''), str(b.get('text') or '').strip()[:MAX_TEXT]
                if not UUID.match(to) or not text or to == p['id']:
                    return self.out(400, {'ok': False, 'error': 'bad_message'})
                mine = c.execute('select chat_consent_at from profiles where player_id=?', (p['id'],)).fetchone()
                if not mine or not mine['chat_consent_at']:
                    return self.out(403, {'ok': False, 'error': 'chat_consent_required'})
                if not c.execute('select 1 from players where id=?', (to,)).fetchone():
                    return self.out(404, {'ok': False, 'error': 'player_not_found'})
                if c.execute('select 1 from blocks where player_id=? and blocked=?', (to, p['id'])).fetchone():
                    return self.out(403, {'ok': False, 'error': 'blocked'})
                recent = c.execute('select count(*) from messages where sender=? and created_at>?', (p['id'], now - 60)).fetchone()[0]
                if recent >= 20:
                    return self.out(429, {'ok': False, 'error': 'slow_down'})
                cur = c.execute('insert into messages(sender, recipient, body, created_at) values(?,?,?,?)', (p['id'], to, text, now))
                return self.out(200, {'ok': True, 'id': cur.lastrowid, 'at': now})
            if path == '/block':
                who = str(b.get('player') or '')
                if UUID.match(who):
                    c.execute('insert or ignore into blocks values(?,?,?)', (p['id'], who, now))
                return self.out(200, {'ok': True})
            if path == '/report':
                who = str(b.get('player') or '')
                c.execute('insert into reports(reporter, target, message_id, reason, created_at) values(?,?,?,?,?)',
                          (p['id'], who[:40], int(b.get('message_id') or 0), str(b.get('reason') or '')[:500], now))
                return self.out(200, {'ok': True})
            if path == '/me/delete':
                pr = c.execute('select avatar_key from profiles where player_id=?', (p['id'],)).fetchone()
                if pr and pr['avatar_key']:
                    try:
                        os.remove(os.path.join(AV, pr['avatar_key']))
                    except OSError:
                        pass
                c.execute('delete from profiles where player_id=?', (p['id'],))
                c.execute('delete from messages where sender=? or recipient=?', (p['id'], p['id']))
                c.execute('delete from players where id=?', (p['id'],))
                return self.out(200, {'ok': True, 'deleted': True})
        return self.out(404, {'ok': False, 'error': 'not_found'})


if __name__ == '__main__':
    init()
    ThreadingHTTPServer(('127.0.0.1', PORT), H).serve_forever()
