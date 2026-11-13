/* TRIZNES v2 · ядро приложения · 2026-11-12 */
(() => {
'use strict';
const SB = 'https://bbxhhtpmbtgfaxamgksf.supabase.co', ANON = 'sb_publishable_aFTiVGlsJxeeutL_gEZaKA_S9VyKaHS';
const ACCESS = SB + '/functions/v1/triznes-platform-access';
const GW = SB + '/functions/v1/triznes-provider-probe';
const RF = window.TRIZNES_RF_BASE || '/rf-api';
const SKEY = 'triznes-platform-session';
const APOLLON_BOT = 'https://t.me/danielsassis_bot?start=app';
const PREVIEW = window.TRIZNES_PREVIEW || null;

const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ls = { get: k => { try { return localStorage.getItem(k) } catch (e) { return null } }, set: (k, v) => { try { localStorage.setItem(k, v) } catch (e) { } }, del: k => { try { localStorage.removeItem(k) } catch (e) { } } };
const icon = (n, cls = '') => `<svg class="i ${cls}"><use href="#i-${n}"/></svg>`;
const initials = s => { const w = String(s || 'T').trim().split(/[\s·\-_]+/).filter(Boolean); const a = w.map(x => (x.match(/[\p{L}\p{N}]/u) || [''])[0]).filter(Boolean); return (a.length > 1 ? a[0] + a[1] : (a[0] || 'T')).toUpperCase() };
const ago = t => { const s = Math.max(0, (Date.now() - new Date(t).getTime()) / 1000); return s < 60 ? 'только что' : s < 3600 ? Math.round(s / 60) + ' мин' : s < 86400 ? Math.round(s / 3600) + ' ч' : new Date(t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) };
const hhmm = t => new Date(t).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

const TZ = window.TZ = { W: { levels: [], places: [], guides: [], news: [], communities: [] }, ME: null, RF: null, rfOnline: false, token: null, preview: !!PREVIEW };

/* ---------- мелочи интерфейса ---------- */
let toastT;
function toast(msg, ms = 2600) { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), ms) }
function sheet(html) { $('sheetBody').innerHTML = html; $('sheet').classList.add('on') }
function closeSheet() { $('sheet').classList.remove('on'); $('sheetBody').querySelectorAll('video,iframe').forEach(x => x.remove()) }
$('sheet').addEventListener('click', e => { if (e.target.id === 'sheet' || e.target.closest('[data-close]')) closeSheet() });
window.TZ.toast = toast; window.TZ.sheet = sheet; window.TZ.closeSheet = closeSheet; window.TZ.icon = icon; window.TZ.esc = esc;

/* ---------- тема: ночь / рассвет ---------- */
function applyTheme(choice) {
  ls.set('triznes-theme', choice);
  let t = choice;
  if (t === 'auto') { const h = new Date().getHours(); t = (h >= 7 && h < 18) ? 'dawn' : 'night' }
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name=theme-color]').content = t === 'dawn' ? '#f7f2ec' : '#09051a';
  document.querySelectorAll('#themes button').forEach(b => b.classList.toggle('on', b.dataset.t === choice));
  window.City && window.City.restyle && window.City.restyle();
}
document.querySelectorAll('#themes button').forEach(b => b.onclick = () => applyTheme(b.dataset.t));
applyTheme(ls.get('triznes-theme') || 'auto');

/* ---------- сеть ---------- */
async function rpc(fn, body) { const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }); if (!r.ok) throw new Error('rpc_' + r.status); return r.json() }
async function gw(action, extra = {}) {
  if (window.TRIZNES_PERSONAL_AI_ENABLED === true && ['guide','apollon'].includes(action) && TZ.token && !PREVIEW) {
    const personal = await import('./personal-ai.js');
    const state = await personal.requestPersonalAI('status');
    if (state.connected) return personal.requestPersonalAI('chat', {message: extra.message});
  }
  const r = await fetch(GW, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, session_token: TZ.token, ...extra }) }); const d = await r.json().catch(() => ({})); if (!r.ok && !d.error) d.error = 'http_' + r.status; return d }
async function rf(path, opt = {}) {
  const r = await fetch(RF + path, { ...opt, headers: { 'X-Triznes-Session': TZ.token || '', ...(opt.body && !(opt.body instanceof Blob) ? { 'Content-Type': 'application/json' } : {}), ...(opt.headers || {}) } });
  const ct = r.headers.get('content-type') || '';
  if (!ct.includes('application/json')) throw new Error('rf_offline');
  const d = await r.json(); if (!r.ok && !d.error) d.error = 'http_' + r.status; return d;
}

/* ---------- ВХОД через Аполлона ---------- */
function showLogin(on) { $('gHello').hidden = on; $('gLogin').hidden = !on; if (on) setTimeout(() => $('lName').focus(), 60) }
$('gHave').onclick = () => showLogin(true);
$('gBack').onclick = () => showLogin(false);
const pins = [...document.querySelectorAll('#lPin input')];
pins.forEach((p, i) => {
  p.addEventListener('input', () => { p.value = p.value.replace(/\D/g, '').slice(-1); if (p.value && i < 3) pins[i + 1].focus(); if (pins.every(x => x.value)) $('lBtn').focus() });
  p.addEventListener('keydown', e => { if (e.key === 'Backspace' && !p.value && i > 0) pins[i - 1].focus() });
  p.addEventListener('paste', e => { const d = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 4); if (d.length === 4) { e.preventDefault(); d.split('').forEach((c, k) => pins[k].value = c); $('lBtn').focus() } });
});
$('gLogin').onsubmit = async e => {
  e.preventDefault();
  const b = $('lBtn'), s = $('lStatus'), name = $('lName').value.trim(), pin = pins.map(x => x.value).join('');
  if (!name || pin.length !== 4) { s.textContent = 'Назови имя и 4 цифры кода.'; return }
  b.disabled = true; s.textContent = 'Аполлон узнаёт тебя…';
  try {
    const r = await fetch(ACCESS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'login', name, pin }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.ok || !d.session_token) {
      const er = d.error || '';
      if (/mfa|secure|admin/.test(er)) { s.textContent = 'Для этой роли нужен защищённый вход — открываю…'; setTimeout(() => location.href = '/register.html', 900); return }
      throw new Error(er === 'invalid_credentials' ? 'Не узнаю. Проверь имя и код.' : /pin/.test(er) ? 'Нужны имя и 4 цифры кода.' : er === 'payment_required' ? 'Карта участника неактивна — напиши TRIZNES Assistant.' : 'Вход не удался. Попробуй ещё раз.');
    }
    ls.set(SKEY, d.session_token); TZ.token = d.session_token; pins.forEach(x => x.value = ''); s.textContent = '';
    enterApp(true);
  } catch (err) { s.textContent = String(err.message || err).includes('Failed to fetch') ? 'Вход работает в приложении на triznes.online.' : err.message }
  finally { b.disabled = false }
};

function enterApp(fresh) {
  $('gate').hidden = true; $('app').hidden = false;
  if (fresh) toast('Аполлон: рад тебя видеть. Город открыт.');
  window.City && window.City.init();
  loadWorld().then(loadMe).then(rfInit);
  feedLoad();
  setInterval(pollUnread, 30000);
}

/* ---------- навигация ---------- */
function go(s) {
  document.querySelectorAll('.screen').forEach(x => x.classList.toggle('on', x.id === 's-' + s));
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.s === s));
  if (location.hash !== '#' + s) history.replaceState(null, '', '#' + s);
  if (s === 'city') window.City && window.City.resize();
  if (s === 'chat') loadPlayers();
}
TZ.go = go;
document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => go(b.dataset.s));
document.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) go(g.dataset.go) });

/* ---------- данные мира и игрока ---------- */
async function loadWorld() {
  if (PREVIEW) { TZ.W = PREVIEW.world; renderAll(); return }
  const cached = ls.get('triznes-app-world'); if (cached) { try { TZ.W = JSON.parse(cached) } catch (e) { } }
  if (!TZ.W.levels.length) { try { TZ.W = await (await fetch('./data/world.json')).json() } catch (e) { } }
  renderAll();
  try { const w = await rpc('triznes_app_world'); if (w && w.levels && w.levels.length) { TZ.W = w; ls.set('triznes-app-world', JSON.stringify(w)); renderAll() } } catch (e) { }
}
async function loadMe() {
  if (PREVIEW) { TZ.ME = PREVIEW.me; renderAll(); return }
  const cached = ls.get('triznes-app-me'); if (cached) { try { TZ.ME = JSON.parse(cached); renderAll() } catch (e) { } }
  try {
    const m = await rpc('triznes_app_me', { p_session_token: TZ.token });
    if (m && m.ok) { TZ.ME = m; ls.set('triznes-app-me', JSON.stringify(m)); renderAll() }
    else if (m && m.error === 'session_invalid') logout(true);
  } catch (e) { }
}
function renderAll() { renderHud(); renderPath(); renderMe(); renderComms(); window.City && window.City.update && window.City.update() }

/* ---------- HUD ---------- */
function avatarHtml(url, name) { return url ? `<img src="${esc(url)}" alt="">` : esc(initials(name)) }
function myAvatar() { return TZ.RF && TZ.RF.profile && TZ.RF.profile.avatar ? (TZ.RF.profile.avatar.startsWith('/rf-api') ? RF + TZ.RF.profile.avatar.slice(7) : TZ.RF.profile.avatar) : (TZ.localAvatar || null) }
function myColors() { const c = TZ.RF && TZ.RF.profile && TZ.RF.profile.colors; return c && c.length ? c : ['#ff3dcb', '#33e6ff', '#ffd36e'] }
TZ.myAvatar = myAvatar; TZ.myColors = myColors;
function renderHud() {
  const p = TZ.ME && TZ.ME.player, g = TZ.ME && TZ.ME.game; const lv = g ? g.level : 0;
  const name = p ? (p.alias || p.name) : 'PLAYER';
  $('hName').textContent = name; $('hLvl').textContent = lv;
  $('hRing').style.setProperty('--p', Math.round(lv / 13 * 100));
  $('hXp').style.width = Math.min(100, Math.round(lv / 13 * 100)) + '%';
  $('hAva').innerHTML = avatarHtml(myAvatar(), name);
}

/* ---------- ПУТЬ ---------- */
const PROOF_URL = SB + '/functions/v1/telegram-delete-once';
function renderPath() {
  const W = TZ.W, g = TZ.ME && TZ.ME.game, lv = g ? g.level : 0;
  $('pathCount').textContent = lv + ' / 13';
  const next = W.levels.find(l => l.no === Math.min(lv + 1, 13));
  const creator = lv >= 13;
  if (next) {
    $('nowEy').textContent = creator ? 'Ты прошёл все 13 ступеней' : 'Следующая ступень';
    $('nowTitle').textContent = creator ? 'CREATOR MODE · ТВОРЕЦ' : `LEVEL ${String(next.no).padStart(2, '0')} — ${next.title}`;
    $('nowPurpose').textContent = creator ? 'Ты прокладываешь маршрут другим: веди новичков через вход и первые три ступени, создавай маршруты сезонов.' : next.purpose;
    $('nowTask').textContent = creator ? 'Проведи нового игрока через вход и первые три ступени.' : next.task;
    $('nowProof').textContent = creator ? 'История новичка + маршрут сезона.' : next.proof;
  }
  $('proofBtn').href = PROOF_URL;
  $('askLevel').onclick = () => { openConv({ kind: 'guide' }); setTimeout(() => sendText(creator ? 'Я прошёл 13 ступеней. Как мне вести новичков?' : `Как пройти ступень ${next ? next.no + ' «' + next.title + '»' : ''}? С чего начать сегодня?`), 250) };
  const q = (TZ.ME && TZ.ME.quests) || [];
  $('daily').innerHTML = q.length ? q.slice(0, 3).map(x => `<div class="quest"><div class="qi">${icon('bolt')}</div><div style="min-width:0"><b>${esc(x.title)}</b><p class="sm mut" style="margin-top:3px">${esc(x.description || '')}</p>${x.status ? `<span class="chip" style="margin-top:8px">${esc(x.status)}</span>` : ''}</div><span class="xp">+${x.xp || 0} XP</span></div>`).join('')
    : `<div class="quest"><div class="qi">${icon('spark')}</div><div><b>Квесты дня даёт ДИОНИС</b><p class="sm mut" style="margin-top:3px">Как только для тебя откроется квест, он появится здесь. А пока — задание твоей ступени выше.</p></div></div>`;
  let html = `<div class="act">Вход</div><div class="node ${lv >= 0 ? 'done' : ''}" data-l="0"><div class="dot">${icon('sun')}</div><div class="t"><h4>00 · ВХОД</h4><p>Мечта в разговоре с Аполлоном и видео «Улыбнись прохожему».</p></div></div>`, act = '';
  W.levels.forEach(l => {
    if (l.act !== act) { act = l.act; html += `<div class="act">${esc(act)}</div>` }
    const done = l.no <= lv, cur = (lv < 13 && l.no === lv + 1) || (lv >= 13 && l.no === 13), lock = l.no > lv + 1;
    html += `<div class="node ${done ? 'done' : ''} ${cur ? 'cur' : ''} ${lock ? 'lock' : ''}" data-l="${l.no}"><div class="dot">${done ? icon('check') : lock ? icon('lock') : l.no}</div><div class="t"><h4>${String(l.no).padStart(2, '0')} · ${esc(l.title)}</h4><p>${esc(l.purpose)}</p><div class="more"><div><b>Задание</b>${esc(l.task)}</div><div><b style="color:var(--pink)">Доказательство</b>${esc(l.proof)}</div></div></div></div>`;
  });
  $('track').innerHTML = html;
  $('track').querySelectorAll('.node').forEach(n => n.onclick = () => n.classList.toggle('x'));
}

/* ---------- ЛЕНТА ---------- */
let FEED = { youtube: [] }, feedFilter = 'all';
const TG_POSTS = [208, 207, 198]; // трейлер (209) убран до новой версии
const PODS = [['01', 'Вход в игру'], ['02', 'Город-сцена'], ['03', 'Проводники'], ['04', 'Изобилие']];
async function feedLoad() { try { const d = await gw('feed'); if (d && d.ok) { FEED = d; renderFeed() } } catch (e) { } renderFeed() }
document.querySelectorAll('#feedSeg button').forEach(b => b.onclick = () => { feedFilter = b.dataset.f; document.querySelectorAll('#feedSeg button').forEach(x => x.classList.toggle('on', x === b)); renderFeed() });
function videoCard(v) { return `<div class="video" data-yt="${esc(v.id)}" data-title="${esc(v.title)}"><img src="${esc(v.thumb)}" alt="" loading="lazy"><div class="pl">${icon('play')}</div><div class="cap">${esc(v.title)}</div></div>` }
function renderFeed() {
  const f = feedFilter, news = (TZ.W.news || []);
  const vids = (FEED.youtube || []);
  const own = `<div class="video" data-local="./media/player001_reel.mp4" data-title="PLAYER 001 — Даниэль"><img src="./art/player001_card.webp" alt=""><div class="pl">${icon('play')}</div><div class="cap">PLAYER 001 — Даниэль · первый персонаж мира</div></div>`;
  $('feedVideo').innerHTML = (f === 'all' || f === 'video' || f === 'triznes') ? `<div class="row"><div class="ey">Видео PINK NOIZE</div><span class="sp"></span><a class="xs dim" href="${esc(FEED.youtube_channel || 'https://www.youtube.com/channel/UCNntbuhLKAdDvCZcDuFYc4g')}" target="_blank" rel="noopener">все →</a></div><div class="hscroll">${own}${vids.map(videoCard).join('')}</div>` : '';
  let list = '';
  if (f === 'audio') {
    list = `<div class="ey">Подкасты TRIZNES · голос Даниэля</div>` + PODS.map(([n, t]) => `<button class="track-row" data-pod="${n}"><div class="pb">${icon('play')}</div><div><b class="sm">Выпуск ${n}</b><div class="xs mut">${t}</div></div></button>`).join('') + `<audio id="aud" preload="none"></audio>`;
  } else {
    const items = [];
    if (f === 'all' || f === 'triznes') TG_POSTS.forEach((n, i) => items.push({ kind: 'tg', n, at: Date.now() - i * 3.6e6 }));
    if (f === 'all' || f === 'sochi') news.forEach(x => items.push({ kind: 'news', ...x, at: new Date(x.at).getTime() }));
    if (f !== 'video') {
      list = items.sort((a, b) => b.at - a.at).map(x => x.kind === 'tg'
        ? `<div class="card" style="padding:8px" data-tg="${x.n}"><div class="skel"></div></div>`
        : `<a class="post" href="${esc(x.url || '#')}" target="_blank" rel="noopener"><div class="src ${x.category === 'creator' ? '' : 'sochi'}">${esc(initials(x.source))}</div><div style="min-width:0"><h4>${esc(x.headline || x.summary)}</h4><div class="meta">${esc(x.source || '')} · ${ago(x.at)}</div></div></a>`).join('') || '<div class="empty">Новостей пока нет.</div>';
    }
  }
  $('feedList').innerHTML = list;
  hydrateTg();
  bindMedia();
}
function hydrateTg() {
  document.querySelectorAll('[data-tg]').forEach(box => {
    const n = box.dataset.tg; box.innerHTML = '';
    const s = document.createElement('script'); s.async = true; s.src = 'https://telegram.org/js/telegram-widget.js?22';
    s.setAttribute('data-telegram-post', 'triznes/' + n); s.setAttribute('data-width', '100%');
    if (document.documentElement.dataset.theme === 'night') s.setAttribute('data-dark', '1');
    s.onerror = () => { box.innerHTML = `<a class="post" href="https://t.me/triznes/${n}" target="_blank" rel="noopener"><div class="src tg">TG</div><div><h4>Пост @triznes №${n}</h4><div class="meta">открыть в Telegram</div></div></a>` };
    box.appendChild(s);
  });
}
function bindMedia() {
  document.querySelectorAll('[data-yt]').forEach(v => v.onclick = () => sheet(`<div class="ey">YouTube · PINK NOIZE</div><h3 class="h3" style="margin:8px 0 12px">${esc(v.dataset.title)}</h3><iframe src="https://www.youtube-nocookie.com/embed/${esc(v.dataset.yt)}?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe><a class="btn ghost block" style="margin-top:12px" href="https://www.youtube.com/watch?v=${esc(v.dataset.yt)}" target="_blank" rel="noopener">Открыть в YouTube</a>`));
  document.querySelectorAll('[data-local]').forEach(v => v.onclick = () => sheet(`<div class="ey">TRIZNES</div><h3 class="h3" style="margin:8px 0 12px">${esc(v.dataset.title)}</h3><video src="${esc(v.dataset.local)}" controls autoplay playsinline></video>`));
  const a = $('aud'); if (!a) return; let cur = null;
  document.querySelectorAll('[data-pod]').forEach(b => b.onclick = () => {
    const n = b.dataset.pod; document.querySelectorAll('[data-pod]').forEach(x => { x.classList.remove('on'); x.querySelector('.pb').innerHTML = icon('play') });
    if (cur === n && !a.paused) { a.pause(); return }
    if (cur !== n) { a.src = `./media/TRIZNES_podcast_${n}.mp3`; cur = n }
    a.play().catch(() => { }); b.classList.add('on'); b.querySelector('.pb').innerHTML = icon('pause');
  });
  a.onended = () => document.querySelectorAll('[data-pod]').forEach(x => { x.classList.remove('on'); x.querySelector('.pb').innerHTML = icon('play') });
}
function renderComms() {
  const R = { music_production_and_tribe: 'музыка, продакшн, племя', club_and_live_game: 'клуб и живая игра', animation_circus_community: 'анимация и цирк', trade_and_networking: 'торговля и знакомства' };
  $('comms').innerHTML = (TZ.W.communities || []).map(c => `<div class="post"><div class="src">${esc(initials(c.name))}</div><div><h4>${esc(c.name)}</h4><div class="meta">${esc(R[c.role] || c.role || '')}${c.city ? ' · ' + esc(c.city) : ''}</div></div></div>`).join('') || '<div class="empty">—</div>';
}

/* ---------- ЧАТ: Аполлон, ассистент, игроки ---------- */
const GUIDES = {
  apollon: { name: 'Аполлон', sub: 'проводник состояния', img: './img/guide-apollon.webp', quick: ['Мне сейчас непросто', 'Хочу понять свою мечту', 'Какой мой следующий шаг?'], hello: 'Я рядом. Расскажи, что сейчас с тобой — с этого начнём.' },
  guide: { name: 'TRIZNES Assistant', sub: 'как устроен мир', img: './img/guide-triznes.webp', quick: ['Что такое TRIZNES?', 'Что делать на моей ступени?', 'Где медиахаб?', 'Кто такие проводники?', 'Как получить клубную карту?'], hello: 'Привет! Я объясню, как устроен TRIZNES: ступени, город, проводники и приложение. О чём спросишь?' },
};
let conv = null, convTimer = null, convLast = 0, sending = false;
const histKey = k => 'triznes-chat-' + k;
const hist = k => { try { return JSON.parse(ls.get(histKey(k)) || '[]') } catch (e) { return [] } };
const saveHist = (k, h) => ls.set(histKey(k), JSON.stringify(h.slice(-60)));
document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => openConv({ kind: b.dataset.open }));

function msgHtml(m) {
  if (m.role === 'sys') return `<div class="msg sys">${esc(m.text)}</div>`;
  if (m.role === 'handoff') return `<div class="msg handoff"><img src="./img/guide-apollon.webp" alt=""><div><b class="sm">Передаю тебя Аполлону</b><div class="xs" style="opacity:.75">${esc(m.text)}</div></div></div>`;
  if (m.role === 'link') return `<a class="msg them" href="${esc(m.href)}" target="_blank" rel="noopener" style="text-decoration:underline">${esc(m.text)}</a>`;
  return `<div class="msg ${m.role === 'user' || m.mine ? 'me' : 'them'}">${esc(m.text)}${m.at ? `<span class="at">${hhmm(m.at * 1000 || m.at)}</span>` : ''}</div>`;
}
function paint(list) { const box = $('msgs'); box.innerHTML = list.map(msgHtml).join(''); box.scrollTop = box.scrollHeight }
function push(m) { const box = $('msgs'); box.insertAdjacentHTML('beforeend', msgHtml(m)); box.scrollTop = box.scrollHeight }
function typing(on) { const t = $('typing'); if (on && !t) { $('msgs').insertAdjacentHTML('beforeend', '<div class="typing" id="typing"><i></i><i></i><i></i></div>'); $('msgs').scrollTop = 1e9 } else if (!on && t) t.remove() }

function openConv(c) {
  conv = c; clearInterval(convTimer); convLast = 0;
  $('conv').classList.add('on'); $('conv').setAttribute('aria-hidden', 'false');
  $('convMore').hidden = c.kind !== 'player';
  if (c.kind === 'player') {
    $('convName').textContent = c.name || 'Игрок'; $('convSub').textContent = c.role || 'игрок TRIZNES';
    $('convAva').innerHTML = avatarHtml(c.avatar ? RF + c.avatar.replace(/^\/rf-api/, '') : null, c.name);
    $('quick').innerHTML = ''; paint([]);
    ensureChatConsent().then(ok => { if (!ok) { closeConv(); return } pollConv(); convTimer = setInterval(pollConv, 4000) });
  } else {
    const g = GUIDES[c.kind];
    $('convName').textContent = g.name; $('convSub').textContent = g.sub;
    $('convAva').innerHTML = `<img src="${g.img}" alt="">`;
    const h = hist(c.kind); paint(h.length ? h : [{ role: 'them', text: g.hello }]);
    $('quick').innerHTML = g.quick.map(q => `<button>${esc(q)}</button>`).join('');
    $('quick').querySelectorAll('button').forEach(b => b.onclick = () => sendText(b.textContent));
  }
  setTimeout(() => $('ctext').focus({ preventScroll: true }), 300);
}
TZ.openConv = openConv;
function closeConv() { $('conv').classList.remove('on'); $('conv').setAttribute('aria-hidden', 'true'); clearInterval(convTimer); conv = null; loadPlayers() }
$('convBack').onclick = closeConv;
$('composer').onsubmit = e => { e.preventDefault(); const t = $('ctext').value.trim(); if (t) { $('ctext').value = ''; autosize(); sendText(t) } };
const autosize = () => { const t = $('ctext'); t.style.height = 'auto'; t.style.height = Math.min(140, t.scrollHeight) + 'px' };
$('ctext').addEventListener('input', autosize);
$('ctext').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !matchMedia('(pointer:coarse)').matches) { e.preventDefault(); $('composer').requestSubmit() } });

async function sendText(text) {
  if (!conv || sending) return;
  if (conv.kind === 'player') return sendPlayer(text);
  const k = conv.kind, h = hist(k); h.push({ role: 'user', text }); saveHist(k, h); push({ role: 'user', text });
  if (PREVIEW) { push({ role: 'sys', text: 'В превью ассистенты не отвечают: разговор заработает на triznes.online.' }); return }
  sending = true; typing(true);
  try {
    if (k === 'guide') {
      const d = await gw('guide', { message: text, history: h.slice(-10) });
      typing(false);
      if (!d.ok) throw new Error(d.error);
      const reply = { role: 'them', text: d.speech }; h.push(reply); saveHist(k, h); push(reply);
      if (d.handoff === 'apollon') {
        const ho = { role: 'handoff', text: 'Аполлон услышит тебя и поможет вернуть опору.' }; h.push(ho); saveHist(k, h); push(ho);
        sending = false;
        setTimeout(() => { openConv({ kind: 'apollon' }); push({ role: 'sys', text: 'Ассистент передал разговор Аполлону' }); sendText(text) }, 1400);
        return;
      }
      if (d.handoff === 'triznes_bot') push({ role: 'link', text: 'Открыть TRIZNES Assistant в Telegram →', href: d.triznes_bot || 'https://t.me/triznes_bot' });
    } else {
      const d = await gw('apollon', { message: text });
      typing(false);
      if (!d.ok && d.error === 'telegram_required') { const m = { role: 'link', text: 'Аполлон пока знает тебя только в Telegram. Открой его там — память общая →', href: d.link || APOLLON_BOT }; h.push(m); saveHist(k, h); push(m); return }
      if (!d.ok) throw new Error(d.error);
      const reply = { role: 'them', text: d.text }; h.push(reply); saveHist(k, h); push(reply);
    }
  } catch (e) {
    typing(false);
    push({ role: 'sys', text: e.message === 'slow_down' ? 'Слишком быстро — подожди минуту.' : e.message === 'session_invalid' ? 'Сессия закончилась — войди снова.' : 'Связь прервалась. Попробуй ещё раз.' });
  } finally { sending = false }
}

/* --- игроки (сервер в РФ) --- */
async function rfInit() {
  if (PREVIEW) { $('rfState').textContent = 'мессенджер — после выкладки'; return }
  try { const d = await rf('/me'); if (d.ok) { TZ.RF = d; TZ.rfOnline = true; $('rfState').textContent = '● серверы в РФ'; renderMe(); renderHud(); window.City && window.City.update(); loadPlayers(); pollUnread() } }
  catch (e) { TZ.rfOnline = false; $('rfState').textContent = 'мессенджер включится после выкладки v2' }
}
async function loadPlayers() {
  if (!TZ.rfOnline) { $('threads').innerHTML = ''; $('players').innerHTML = `<div class="empty">Чат между игроками и фото персонажей работают на сервере TRIZNES в России — включатся, как только v2 будет выложено.</div>`; return }
  try {
    const [t, p] = await Promise.all([rf('/threads'), rf('/players')]);
    const ths = (t.threads || []);
    $('threads').innerHTML = ths.map(x => `<button class="player-row" data-pl='${esc(JSON.stringify({ id: x.with, name: x.alias, role: x.role, avatar: x.avatar }))}'><div class="ava-s">${avatarHtml(x.avatar ? RF + x.avatar.slice(7) : null, x.alias)}</div><div style="min-width:0"><b>${esc(x.alias)}</b><div class="sub">${x.mine ? 'ты: ' : ''}${esc(x.last)}</div></div>${x.unread ? `<span class="unread">${x.unread}</span>` : `<span class="xs dim" style="margin-left:auto">${ago(x.at * 1000)}</span>`}</button>`).join('');
    const seen = new Set(ths.map(x => x.with));
    const rest = (p.players || []).filter(x => !seen.has(x.id));
    $('players').innerHTML = rest.length ? `<div class="ey" style="margin:14px 0 4px">В игре</div>` + rest.map(x => `<button class="player-row" data-pl='${esc(JSON.stringify({ id: x.id, name: x.alias, role: x.role, avatar: x.avatar }))}'><div class="ava-s" style="${x.colors && x.colors.length ? `background:linear-gradient(135deg,${x.colors.join(',')})` : ''}">${avatarHtml(x.avatar ? RF + x.avatar.slice(7) : null, x.alias)}</div><div style="min-width:0"><b>${esc(x.alias)}</b><div class="sub">${esc(x.motto || x.role || '')} · ступень ${x.level}</div></div></button>`).join('') : (ths.length ? '' : '<div class="empty">Пока здесь только ты. Игроки появятся, когда откроют приложение.</div>');
    document.querySelectorAll('[data-pl]').forEach(b => b.onclick = () => openConv({ kind: 'player', ...JSON.parse(b.dataset.pl) }));
  } catch (e) { }
}
async function pollConv() {
  if (!conv || conv.kind !== 'player') return;
  try { const d = await rf(`/messages?with=${conv.id}&after=${convLast}`); (d.messages || []).forEach(m => { push({ mine: m.mine, text: m.text, at: m.at }); convLast = Math.max(convLast, m.id) }) } catch (e) { }
}
async function sendPlayer(text) {
  sending = true;
  try { const d = await rf('/messages', { method: 'POST', body: JSON.stringify({ to: conv.id, text }) }); if (!d.ok) throw new Error(d.error); await pollConv() }
  catch (e) { push({ role: 'sys', text: e.message === 'blocked' ? 'Игрок ограничил сообщения.' : e.message === 'slow_down' ? 'Слишком быстро — подожди минуту.' : 'Не отправилось. Попробуй ещё раз.' }) }
  finally { sending = false }
}
function consentSheet(kind) {
  return new Promise(res => {
    const isPhoto = kind === 'photos';
    sheet(`<div class="ey pink">${isPhoto ? 'Фото персонажа' : 'Сообщения игрокам'}</div><h3 class="h2" style="margin:8px 0 10px">${isPhoto ? 'Твоё фото увидят игроки TRIZNES' : 'Перед первым сообщением'}</h3>
      <p class="sm mut">${isPhoto ? 'Фото станет лицом твоего персонажа: на карте города, в чате и в списке игроков. Оно хранится на сервере TRIZNES в России. Удалить можно в любой момент в настройках.' : 'Сообщения хранятся на сервере TRIZNES в России и видны только тебе и собеседнику. Будь добр к людям: за оскорбления можно получить блокировку. Удалить переписку можно в настройках.'}</p>
      <label class="consent" style="margin:16px 0"><input type="checkbox" id="cOk"><span>Я согласен(на) на обработку ${isPhoto ? 'моего фото' : 'моих сообщений'} оператором ИП Глазунов Д. Л. по <a href="./privacy.html" target="_blank" rel="noopener">политике</a></span></label>
      <button class="btn primary block" id="cGo" disabled>Согласен(на)</button><button class="btn ghost block" style="margin-top:8px" data-close>Не сейчас</button>`);
    $('cOk').onchange = () => $('cGo').disabled = !$('cOk').checked;
    $('cGo').onclick = async () => { try { const d = await rf('/me/consent', { method: 'POST', body: JSON.stringify({ [kind]: true }) }); if (d.ok) { TZ.RF.profile = d.profile; closeSheet(); res(true); return } } catch (e) { } toast('Не получилось сохранить согласие'); res(false) };
    const obs = new MutationObserver(() => { if (!$('sheet').classList.contains('on')) { obs.disconnect(); res(false) } }); obs.observe($('sheet'), { attributes: true });
  });
}
async function ensureChatConsent() { if (!TZ.rfOnline) return false; if (TZ.RF.profile.chat_consent) return true; return consentSheet('messages') }
$('convMore').onclick = () => {
  if (!conv || conv.kind !== 'player') return;
  sheet(`<div class="ey">${esc(conv.name)}</div><h3 class="h3" style="margin:8px 0 14px">Что сделать?</h3><button class="btn ghost block" id="rep">${icon('flag')}Пожаловаться</button><button class="btn ghost block" style="margin-top:8px;color:var(--pink)" id="blk">Заблокировать</button>`);
  $('rep').onclick = async () => { await rf('/report', { method: 'POST', body: JSON.stringify({ player: conv.id, reason: 'from_app' }) }).catch(() => { }); closeSheet(); toast('Жалоба отправлена модераторам TRIZNES') };
  $('blk').onclick = async () => { await rf('/block', { method: 'POST', body: JSON.stringify({ player: conv.id }) }).catch(() => { }); closeSheet(); closeConv(); toast('Игрок заблокирован') };
};
async function pollUnread() { if (!TZ.rfOnline) return; try { const d = await rf('/unread'); const b = $('chatBadge'); b.hidden = !d.unread; b.textContent = d.unread } catch (e) { } }

/* ---------- Я: персонаж ---------- */
const ARCH = [['voice', 'Голос', 'mic'], ['stage', 'Сцена', 'stage'], ['director', 'Режиссёр', 'film'], ['maker', 'Мастер', 'hammer'], ['connector', 'Связной', 'link'], ['healer', 'Хранитель', 'leaf'], ['explorer', 'Исследователь', 'map'], ['creator', 'Творец', 'crown']];
const PALETTE = ['#ff3dcb', '#33e6ff', '#ffd36e', '#c6ff3d', '#8e5bff', '#ffb38a', '#ff6b6b', '#2be3a0', '#3d7bff', '#ff9f1c', '#ffffff', '#1b1030'];
const STATS = [['voice', 'Слово и голос'], ['stage', 'Сцена и образ'], ['courage', 'Смелость'], ['bonds', 'Связи'], ['vision', 'Видение'], ['value', 'Ценность']];
const LV_STAT = { 1: 'voice', 2: 'voice', 3: 'stage', 4: 'stage', 5: 'courage', 6: 'bonds', 7: 'bonds', 8: 'courage', 9: 'vision', 10: 'stage', 11: 'value', 12: 'bonds', 13: 'vision' };
let draft = { archetype: null, colors: [] };
function renderMe() {
  if (window.TRIZNES_PERSONAL_AI_ENABLED === true && !PREVIEW) import('./personal-ai.js').then(m => m.mountPersonalAI()).catch(() => {});
  const p = TZ.ME && TZ.ME.player, g = TZ.ME && TZ.ME.game, lv = g ? g.level : 0, pr = TZ.RF && TZ.RF.profile;
  const name = p ? (p.alias || p.name) : 'PLAYER';
  $('meName').textContent = name; $('meRole').textContent = p ? (p.role || 'Игрок') : 'Игрок';
  $('meAva').innerHTML = avatarHtml(myAvatar(), name);
  const cols = myColors(); const hc = $('heroCard'); ['--c1', '--c2', '--c3'].forEach((k, i) => hc.style.setProperty(k, cols[i] || cols[0]));
  document.querySelector('.big-ava').style.cssText = `--c1:${cols[0]};--c2:${cols[1] || cols[0]};--c3:${cols[2] || cols[0]}`;
  $('kLvl').textContent = lv; $('kXp').textContent = (g && g.xp || 0).toLocaleString('ru-RU'); $('kQ').textContent = ((TZ.ME && TZ.ME.quests) || []).filter(q => /done|complete|выполн/i.test(q.status || '')).length;
  const c = TZ.ME && TZ.ME.card; $('meCard').textContent = c ? `Карта ${String(c.tier || '').toUpperCase()} · ${c.status === 'expired' ? 'истекла' : c.status === 'active' ? 'активна' : (c.status || '')}` : 'Без карты';
  const a = ARCH.find(x => x[0] === (pr && pr.archetype)); $('meArchTag').textContent = a ? a[1].toUpperCase() : '';
  $('meMotto').textContent = pr && pr.motto ? '«' + pr.motto + '»' : '';
  if (p && p.intention) { $('dreamCard').hidden = false; $('meDream').textContent = p.intention } else $('dreamCard').hidden = true;
  // характеристики — только из реального прогресса
  const score = {}, max = {}; STATS.forEach(([k]) => { score[k] = 1; max[k] = 1 });
  Object.entries(LV_STAT).forEach(([n, k]) => { max[k]++; if (+n <= lv) score[k]++ });
  $('stats').innerHTML = STATS.map(([k, label]) => `<div class="stat"><span>${label}</span><div class="bar"><i style="width:${Math.round(score[k] / max[k] * 100)}%"></i></div><b>${score[k]}</b></div>`).join('');
  // редактор
  if (!draft._init && pr) { draft = { archetype: pr.archetype, colors: (pr.colors || []).slice(), _init: true }; $('motto').value = pr.motto || ''; $('bio').value = pr.bio || '' }
  $('arch').innerHTML = ARCH.map(([k, t, ic]) => `<button data-a="${k}" class="${draft.archetype === k ? 'on' : ''}">${icon(ic)}${t}</button>`).join('');
  $('arch').querySelectorAll('button').forEach(b => b.onclick = () => { draft.archetype = draft.archetype === b.dataset.a ? null : b.dataset.a; renderMe() });
  $('swatches').innerHTML = PALETTE.map(col => { const i = draft.colors.indexOf(col); return `<button style="background:${col}" data-c="${col}" data-n="${i + 1}" class="${i >= 0 ? 'on' : ''}" aria-label="цвет ${col}"></button>` }).join('');
  $('swatches').querySelectorAll('button').forEach(b => b.onclick = () => { const c2 = b.dataset.c, i = draft.colors.indexOf(c2); if (i >= 0) draft.colors.splice(i, 1); else { if (draft.colors.length >= 3) draft.colors.shift(); draft.colors.push(c2) } renderMe() });
  $('profileNote').textContent = TZ.rfOnline ? 'Фото и анкета хранятся на сервере TRIZNES в России.' : 'Сохранение анкеты и фото включится после выкладки v2 (сервер в России).';
  $('visT').classList.toggle('on', ls.get('triznes-visible') !== '0');
  // пульт создателя
  if (TZ.ME && TZ.ME.stats) { const st = TZ.ME.stats, q = st.queue || {}; $('creator').hidden = false; $('creator').innerHTML = `<div class="ey lime">Пульт создателя</div><div class="kpis" style="margin-top:10px">${[['Игроков', st.players], ['Карт активно', st.cards_active ?? st.cards], ['Вышло · 7 дн', st.published_7d], ['На проверке', q.review ?? st.review], ['Согласий', st.consents_granted ?? st.consents], ['Ступень', lv]].map(([a, b]) => `<div><b>${b ?? 0}</b><span>${a}</span></div>`).join('')}</div>` } else $('creator').hidden = true;
}
$('saveProfile').onclick = async () => {
  if (!TZ.rfOnline) { toast('Сохранение заработает после выкладки v2'); return }
  const b = $('saveProfile'); b.disabled = true;
  try { const d = await rf('/me/profile', { method: 'POST', body: JSON.stringify({ archetype: draft.archetype, colors: draft.colors, motto: $('motto').value, bio: $('bio').value, visible: ls.get('triznes-visible') !== '0' }) }); if (!d.ok) throw 0; TZ.RF.profile = d.profile; renderMe(); renderHud(); window.City && window.City.update(); toast('Персонаж сохранён ✦') }
  catch (e) { toast('Не сохранилось. Попробуй ещё раз.') } finally { b.disabled = false }
};
$('visRow').onclick = async () => { const on = ls.get('triznes-visible') === '0'; ls.set('triznes-visible', on ? '1' : '0'); $('visT').classList.toggle('on', on); if (TZ.rfOnline) rf('/me/profile', { method: 'POST', body: JSON.stringify({ archetype: draft.archetype, colors: draft.colors, motto: $('motto').value, bio: $('bio').value, visible: on }) }).catch(() => { }) };
$('photoBtn').onclick = () => $('photoInput').click();
$('photoInput').onchange = async e => {
  const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
  const blob = await shrink(f, 640).catch(() => null); if (!blob) { toast('Не получилось прочитать фото'); return }
  if (!TZ.rfOnline) { TZ.localAvatar = URL.createObjectURL(blob); renderMe(); renderHud(); window.City && window.City.update(); toast('Фото показано только здесь: сохранится после выкладки v2'); return }
  if (!TZ.RF.profile.photo_consent && !(await consentSheet('photos'))) return;
  toast('Загружаю фото…');
  try { const r = await fetch(RF + '/me/avatar', { method: 'POST', headers: { 'X-Triznes-Session': TZ.token, 'Content-Type': 'image/jpeg' }, body: blob }); const d = await r.json(); if (!d.ok) throw 0; TZ.RF.profile.avatar = d.avatar; renderMe(); renderHud(); window.City && window.City.update(); toast('Фото персонажа обновлено ✦') }
  catch (err) { toast('Фото не загрузилось. Попробуй ещё раз.') }
};
function shrink(file, max) {
  return new Promise((res, rej) => { const img = new Image(); img.onload = () => { const s = Math.min(1, max / Math.max(img.width, img.height)); const w = Math.round(img.width * s), h = Math.round(img.height * s); const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h); c.toBlob(b => b ? res(b) : rej(), 'image/jpeg', .86); URL.revokeObjectURL(img.src) }; img.onerror = rej; img.src = URL.createObjectURL(file) });
}
$('wipeRow').onclick = () => {
  if (!TZ.rfOnline) { toast('На сервере пока нет твоих данных'); return }
  sheet(`<div class="ey pink">Удаление</div><h3 class="h2" style="margin:8px 0 10px">Удалить фото, анкету и переписку?</h3><p class="sm mut">С сервера в России удалятся твоё фото, анкета персонажа и все твои сообщения игрокам. Уровень, XP и разговоры с Аполлоном это не затронет.</p><button class="btn primary block" style="margin-top:16px" id="wipeGo">Удалить</button><button class="btn ghost block" style="margin-top:8px" data-close>Отмена</button>`);
  $('wipeGo').onclick = async () => { try { await rf('/me/delete', { method: 'POST', body: '{}' }); closeSheet(); toast('Удалено'); draft = { archetype: null, colors: [] }; await rfInit(); renderMe(); renderHud() } catch (e) { toast('Не получилось удалить') } };
};
function logout(silent) {
  const t = TZ.token; if (t && !silent) fetch(ACCESS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout', session_token: t }) }).catch(() => { });
  [SKEY, 'triznes-app-me', 'triznes-chat-guide', 'triznes-chat-apollon'].forEach(ls.del); location.hash = ''; location.reload();
}
$('logout').onclick = () => logout(false);

/* ---------- установка на экран ---------- */
let deferred = null; const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
if (!standalone) {
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) { $('installRow').hidden = false; $('installHint').textContent = 'Safari → «Поделиться» → «На экран Домой»'; $('installRow').onclick = () => sheet(`<div class="ey">Установка</div><h3 class="h2" style="margin:8px 0 10px">TRIZNES на экран «Домой»</h3><p class="mut">В Safari нажми <b>Поделиться</b> ⬆︎ → <b>«На экран Домой»</b> → <b>Добавить</b>. TRIZNES откроется с иконки на весь экран.</p>`) }
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; $('installRow').hidden = false; $('installHint').textContent = 'одно нажатие'; $('installRow').onclick = async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice.catch(() => { }); deferred = null; $('installRow').hidden = true } });
}
if ('serviceWorker' in navigator && location.protocol === 'https:' && !PREVIEW) navigator.serviceWorker.register('./sw.js').catch(() => { });

/* ---------- старт ---------- */
function start() {
  if (PREVIEW) { $('pvBanner').hidden = false; TZ.token = 'preview'; enterApp(false) }
  else { TZ.token = ls.get(SKEY); if (TZ.token) enterApp(false) }
  const h = (location.hash || '').slice(1); if (/^(city|path|feed|chat|me)$/.test(h)) go(h);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else setTimeout(start, 0);
})();

