/* TRIZNES · ядро клиента: настройки, состояние на устройстве, резонанс, образ персонажа, небо, слой API. */
window.TZ = window.TZ || {};

TZ.config = {
  version: '0.1.0',
  storageKey: 'triznes-unified-v1',
  lensKey: 'triznes-world-lens-v2',          // тот же ключ, что в Launch UI
  /* Адрес и публичный ключ сервера чтения задаются при развёртывании (не хранятся в открытом репозитории). */
  stage: { url: '', key: '' }
};

/* ---------- состояние ---------- */
(function () {
  const blank = () => ({
    introSeen: false, source: 'snapshot',
    me: { name: '', who: '', want: '', unique: '', colors: ['cyan', 'gold', 'coral'], shape: 'figure' },
    weights: {}, likes: {}, saves: {}, bonds: {}, joined: {},
    posts: [], chats: {}, signals: [], seenSignals: 0,
    consents: {}, level: 1, proofs: {}, uploads: [], jobs: [], tgCode: null,
    stats: { likes: 0, posts: 0, messages: 0 }
  });
  let state = blank();
  try {
    const raw = localStorage.getItem(TZ.config.storageKey);
    if (raw) state = Object.assign(blank(), JSON.parse(raw));
  } catch (e) { /* хранилище недоступно — работаем в памяти */ }
  TZ.state = state;
  TZ.save = function () {
    try { localStorage.setItem(TZ.config.storageKey, JSON.stringify(TZ.state)); } catch (e) {}
  };
  TZ.reset = function () {
    try { localStorage.removeItem(TZ.config.storageKey); } catch (e) {}
    TZ.state = blank();
  };
})();

/* ---------- утилиты ---------- */
TZ.esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
TZ.when = function (iso) {
  const d = new Date(iso); if (isNaN(d)) return '';
  const m = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return d.getUTCDate() + ' ' + m[d.getUTCMonth()];
};
TZ.uid = () => 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
TZ.idempotencyKey = function () {
  const a = new Uint8Array(16); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => (a[i] = Math.random() * 256));
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
};
TZ.sha256 = async function (file) {
  if (!(window.crypto && crypto.subtle)) return null;
  const buf = await file.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
};
TZ.find = (list, slug) => list.find((x) => x.slug === slug);
TZ.asset = (path) => (TZ.assetMap && TZ.assetMap[path]) || path;

/* ---------- резонанс: объяснимый, считается на устройстве ---------- */
TZ.logic = {
  /* лайк даёт +1 каждому измерению мира, к которому относится материал */
  bump(tags, by) {
    (tags || []).forEach((t) => { TZ.state.weights[t] = Math.max(0, (TZ.state.weights[t] || 0) + (by || 1)); });
  },
  tagsOfWorlds(worldSlugs) {
    const out = [];
    (worldSlugs || []).forEach((w) => { const world = TZ.find(TZ.worlds, w); if (world) world.tags.forEach((t) => out.includes(t) || out.push(t)); });
    return out;
  },
  /* косинусная близость моих весов и измерений из собственных слов персонажа */
  resonance(profile) {
    const w = TZ.state.weights; const mine = TZ.tags.map((t) => w[t.id] || 0);
    const theirs = TZ.tags.map((t) => (profile.tags.includes(t.id) ? 1 : 0));
    const dot = mine.reduce((s, v, i) => s + v * theirs[i], 0);
    const a = Math.sqrt(mine.reduce((s, v) => s + v * v, 0)); const b = Math.sqrt(theirs.reduce((s, v) => s + v, 0));
    if (!a || !b) return { pct: null, shared: [] };
    const shared = TZ.tags.filter((t, i) => mine[i] > 0 && theirs[i]).sort((x, y) => (w[y.id] || 0) - (w[x.id] || 0));
    return { pct: Math.round((dot / (a * b)) * 100), shared };
  },
  topTags() {
    const w = TZ.state.weights;
    return TZ.tags.filter((t) => w[t.id] > 0).sort((a, b) => w[b.id] - w[a.id]);
  },
  /* Мягкое отражение моих действий (концепт Resonance Galaxy). Только про меня — о других людях приложение не судит. */
  reflection() {
    const s = TZ.state, w = s.weights, top = this.topTags(), lead = top[0] && top[0].id;
    const breadth = top.length, bonds = Object.keys(s.bonds).filter((k) => s.bonds[k]).length;
    const activity = s.stats.likes + s.stats.posts * 3 + s.stats.messages * 2;
    if (!breadth && !activity) return null;
    const perception = { music: 'Интуитивный', cinema: 'Наблюдательный', stage: 'Чувствителен к деталям', game: 'Интуитивный', city: 'Наблюдательный', love: 'Глубокое восприятие', deed: 'Рациональный', bond: 'Глубокое восприятие' }[lead] || 'Наблюдательный';
    const talk = s.stats.messages >= 6 ? 'Вовлечённый' : s.stats.posts >= 2 ? 'Открыт к диалогу' : s.stats.messages >= 1 ? 'Прямой' : bonds ? 'Избирательный' : 'Сдержанный';
    const social = bonds >= 5 ? 'Легко сближается' : bonds >= 2 ? 'Выбирает круг' : bonds === 1 ? 'Ценит близость' : s.stats.posts ? 'Независимый' : 'Самостоятельный';
    const open = breadth >= 5 ? 'Открыт новому' : breadth >= 3 ? 'Гибкий' : breadth === 2 ? 'Осторожный' : 'Принципиальный';
    const energy = activity >= 24 ? 'Активный' : activity >= 8 ? 'Переменный ритм' : 'Спокойный ритм';
    const dir = { music: 'К поиску', cinema: 'К самореализации', stage: 'К самореализации', game: 'К развитию', city: 'К новым связям', love: 'К новым связям', deed: 'К развитию', bond: 'К новым связям' }[lead] || 'К поиску';
    return [['Восприятие', perception], ['Общение', talk], ['Социальность', social], ['Открытость', open], ['Энергия', energy], ['Направление', dir]];
  },
  /* маршрут к проводнику по словам-намерениям из реестра */
  route(text, current) {
    const t = String(text || '').toLowerCase();
    let best = null, score = 0;
    TZ.agents.forEach((a) => {
      if (a.reactionOnly) return;
      const n = a.intents.filter((k) => t.includes(k)).length;
      if (n > score) { score = n; best = a; }
    });
    return best && best.slug !== current ? best : null;
  },
  stepIndex() { // ИСКРА → … → ГОРОД по тому, что уже прожито в приложении
    const s = TZ.state, bonds = Object.keys(s.bonds).filter((k) => s.bonds[k]).length, joined = Object.keys(s.joined).filter((k) => s.joined[k]).length;
    if (!s.me.name) return -1;
    if (joined && bonds >= 3 && s.posts.length) return 4;
    if (bonds >= 3) return 3;
    if (bonds >= 1) return 2;
    if (s.posts.length || s.stats.likes >= 3) return 1;
    return 0;
  },
  signal(text, link) {
    TZ.state.signals.unshift({ id: TZ.uid(), text, link: link || null, at: new Date().toISOString() });
    TZ.state.signals = TZ.state.signals.slice(0, 60);
  }
};

/* ---------- образ: человечек из трёх цветов (уровень 4 «МАСКА») или звезда ---------- */
TZ.colors = {
  cyan: '#35e9ff', violet: '#8058ff', gold: '#e8c879', red: '#ff4d5e', black: '#23233a', sapphire: '#2b5cff', magenta: '#ff2ec8',
  diamond: '#dff6ff', silver: '#c9d2dc', lime: '#b6f23c', amber: '#ffb347', coral: '#ff7a59', rose: '#ff8fb1', mint: '#78e1bd', sea: '#1fb7c4', white: '#ffffff'
};
TZ.avatar = {
  hex(name) { return TZ.colors[name] || name || '#35e9ff'; },
  figure(colors, size, shape) {
    const [a, b, c] = (colors || ['cyan', 'gold', 'coral']).map(this.hex); const s = size || 40; const id = 'g' + Math.random().toString(36).slice(2, 8);
    if (shape === 'star') {
      return `<span class="fig" style="width:${s}px;height:${s}px"><svg viewBox="0 0 100 100" width="${s}" height="${s}" aria-hidden="true">
        <defs><radialGradient id="${id}"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${a}"/><stop offset="1" stop-color="${b}" stop-opacity="0"/></radialGradient></defs>
        <circle cx="50" cy="50" r="46" fill="url(#${id})"/><path d="M50 8 L57 43 L92 50 L57 57 L50 92 L43 57 L8 50 L43 43Z" fill="#fff" opacity=".95"/>
        <circle cx="50" cy="50" r="9" fill="${c}"/></svg></span>`;
    }
    return `<span class="fig" style="width:${s}px;height:${s}px"><svg viewBox="0 0 100 100" width="${s}" height="${s}" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
      <circle class="halo" style="--h:${c}" cx="50" cy="33" r="27" fill="none" stroke="${c}" stroke-width="3" opacity=".9"/>
      <path d="M14 104 C14 72 30 58 50 58 C70 58 86 72 86 104Z" fill="url(#${id})"/>
      <circle cx="50" cy="35" r="17" fill="${a}"/>
      <path d="M37 31 a13 13 0 0 1 14 -10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>
      <circle cx="50" cy="74" r="5" fill="${c}"/></svg></span>`;
  },
  /* реальный портрет, если он подтверждён; иначе — человечек в цветах персонажа. Лицо не генерируется. */
  ofProfile(p, size) {
    const s = size || 44, [a, b, c] = p.accent.map(this.hex);
    const inner = p.portrait
      ? `<img class="portrait" src="${TZ.esc(TZ.asset(p.portrait))}" alt="" width="${s}" height="${s}" style="width:${s}px;height:${s}px">`
      : `<span style="width:${s}px;height:${s}px">${this.figure(p.accent, Math.round(s * 0.92))}</span>`;
    return `<span class="halo-ring" style="--a1:${a};--a2:${b};--a3:${c}">${inner}</span>`;
  },
  mine(size) {
    const m = TZ.state.me, s = size || 44, [a, b, c] = m.colors.map(this.hex);
    return `<span class="halo-ring" style="--a1:${a};--a2:${b};--a3:${c}"><span style="width:${s}px;height:${s}px;place-items:${m.shape === 'star' ? 'center' : 'end center'}">${this.figure(m.colors, Math.round(s * 0.92), m.shape)}</span></span>`;
  },
  planet(world, extra) {
    return `<span class="planet ${world.look}"></span>${world.ring ? '<span class="ringed front"></span>' : ''}${world.moon ? '<span class="moon"></span>' : ''}${extra || ''}`;
  }
};

/* ---------- небо: звёзды в CYBER, блики воздуха и моря в РАЕ ---------- */
TZ.sky = {
  start() {
    const cv = document.getElementById('sky'); if (!cv) return; const ctx = cv.getContext('2d');
    const still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, pts = [], raf = 0;
    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 9000);
      pts = Array.from({ length: Math.min(n, 150) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.4 + 0.3, p: Math.random() * 6.28, v: Math.random() * 0.6 + 0.2 }));
    };
    const cyber = () => getComputedStyle(document.documentElement).colorScheme.trim() === 'dark';
    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      const night = cyber();
      if (night) {
        pts.forEach((s) => {
          const a = 0.35 + 0.55 * Math.abs(Math.sin(s.p + t * 0.0006 * s.v));
          ctx.fillStyle = `rgba(210,225,255,${a})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.28); ctx.fill();
        });
      } else {
        const g = ctx.createRadialGradient(w * 0.78, h * 0.1, 0, w * 0.78, h * 0.1, Math.max(w, h) * 0.55);
        g.addColorStop(0, 'rgba(255,214,120,.55)'); g.addColorStop(1, 'rgba(255,214,120,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        pts.slice(0, 46).forEach((s) => {
          const y = h * 0.62 + (s.y / h) * h * 0.38, len = 10 + s.r * 16, a = 0.12 + 0.3 * Math.abs(Math.sin(s.p + t * 0.0009 * s.v));
          ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 1.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(s.x, y); ctx.lineTo(s.x + len, y); ctx.stroke();
        });
      }
      if (!still) raf = requestAnimationFrame(draw);
    };
    seed(); draw(0);
    window.addEventListener('resize', () => { seed(); if (still) draw(0); });
    this.redraw = () => { if (still) draw(0); };
    document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden && !still) raf = requestAnimationFrame(draw); });
  },
  redraw() {}
};

/* ---------- слой API: имена — как в docs/openapi.yaml; пока шлюз не выложен, личное остаётся на устройстве ---------- */
TZ.api = {
  status: {
    world: 'VERIFIED', feeds: 'VERIFIED', me: 'PROPOSED', resonance: 'PROPOSED', messages: 'PROPOSED',
    assistants: 'PROPOSED', media: 'PROPOSED', consents: 'BLOCKED', presence: 'BLOCKED', proofs: 'BLOCKED', payments: 'PROPOSED'
  },
  async rpc(name, body) {
    const c = TZ.config.stage;
    if (!c.url || !c.key) throw new Error('server_not_configured');
    const res = await fetch(c.url + '/rest/v1/rpc/' + name, {
      method: 'POST', headers: { apikey: c.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}), cache: 'no-store'
    });
    if (!res.ok) throw new Error(name + '_' + res.status);
    return res.json();
  },
  /* GET /v1/matrix/world + /v1/feeds/* — чтение публичного мира. Возвращает true, если снимок заменён живыми данными. */
  async refreshWorld() {
    const w = await this.rpc('get_triznes_world');
    if (!w || !Array.isArray(w.profiles)) throw new Error('world_shape');
    const known = {}; TZ.profiles.forEach((p) => (known[p.slug] = p));
    TZ.profiles = w.profiles.filter((p) => p.visibility === 'public').map((p) => {
      const k = known[p.slug] || {};
      return { slug: p.slug, name: p.display_name, alias: p.alias, card: p.card_label, role: p.role_label, idea: p.idea, dream: p.dream, bio: p.bio,
        community: p.community_slug, origin: p.visual_origin || 'NONE', identity: p.identity_status, wave: p.wave,
        portrait: k.portrait || null, accent: k.accent || ['cyan', 'violet', 'gold'], tags: k.tags || TZ.logic.tagsOfWorlds([p.community_slug]), also: k.also };
    });
    if (Array.isArray(w.publications)) {
      const old = {}; TZ.publications.forEach((p) => (old[p.title] = p));
      TZ.publications = w.publications.map((p) => {
        const k = old[p.title] || {};
        return { id: k.id || 'pub-' + String(p.id).slice(0, 8), title: p.title, origin: p.origin_type, type: p.content_type, at: p.published_at,
          series: p.series_key, platforms: p.platforms || [], worlds: k.worlds || [], profile: k.profile, media: k.media };
      });
    }
    try {
      const a = await this.rpc('triznes_app_world');
      if (a && Array.isArray(a.news)) TZ.news = a.news.slice(0, 8).map((n, i) => ({ id: 'news-live-' + i, source: n.source, at: n.at, url: n.url, text: n.headline }));
      if (a && Array.isArray(a.levels) && a.levels.length) TZ.seedWorld.levels = a.levels;
      if (a && Array.isArray(a.places) && a.places.length) TZ.seedWorld.places = a.places;
    } catch (e) { /* лента города останется из снимка */ }
    return true;
  }
};
