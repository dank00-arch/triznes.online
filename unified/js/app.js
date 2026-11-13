/* TRIZNES · единое приложение. Экраны, маршруты, действия. Без сборки, без внешних библиотек. */
(function () {
  'use strict';
  const { esc, when, find } = TZ;
  const S = () => TZ.state;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const app = $('#app');
  const ui = { feedWorld: null, feedTab: 'flow', bondsTab: 'match', place: null, sheet: null, drawer: false, compose: false };

  /* ---------- значки ---------- */
  const I = {
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    me: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>',
    bonds: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="5" cy="7" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="13" r="2.4"/><circle cx="6" cy="19" r="2"/><circle cx="19" cy="18" r="2"/><path d="M6.6 8.2l3.6 3.4M17.4 7.3l-3.7 4M7.6 17.8l2.8-3M17.3 16.9l-3.4-2.6"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0112 0v5l2 2H4z"/><path d="M10 21h4"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.200 2.900 4.500 6.500 4.500c2 0 3.500 1 4.500 2.500h2c1-1.500 2.500-2.500 4.500-2.500 3.600 0 5.600 3.700 4.100 7.200C19.500 16.400 12 21 12 21z"/></svg>',
    heartO: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7-4.300-9-8.600C1.600 8.200 3.400 5 6.600 5c1.900 0 3.300 1 4.400 2.600h2C14.100 6 15.500 5 17.400 5c3.200 0 5 3.200 3.600 6.400C19 15.700 12 20 12 20z"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 4h12v17l-6-4-6 4z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M4 18l5-5 4 4 3-3 4 4"/></svg>',
    text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h9"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5h5v5M19 5l-8 8M11 7H6v11h11v-5"/></svg>'
  };
  const originChip = (o) => {
    const v = String(o || '').toUpperCase();
    if (v === 'REAL') return '<span class="chip prov real">REAL</span>';
    if (v.includes('AI')) return '<span class="chip prov ai">AI ASSISTED</span>';
    if (v === 'GENERATED') return '<span class="chip prov gen">GENERATED</span>';
    if (v === 'ARCHIVE') return '<span class="chip prov arc">ARCHIVE</span>';
    return '';
  };
  const statusChip = (s) => `<span class="status ${s.toLowerCase()}">${s}</span>`;
  const neuroAll = () => TZ.agents.concat(TZ.neuro || []);
  const findNeuro = (slug) => find(neuroAll(), slug);
  const face = (n, size) => n.mirror
    ? `<span class="mini gd holo" style="--g:${n.color};width:${size}px;height:${size}px">${TZ.avatar.mirror(size - 4)}</span>`
    : `<span class="mini gd" style="--g:${n.color};width:${size}px;height:${size}px"><img src="${TZ.asset(n.img)}" alt=""></span>`;
  const mascot = (slug, text) => { const n = findNeuro(slug); return `<div class="card mascot">${face(n, 60)}<p><b>${esc(n.name)}.</b> ${text}</p></div>`; };
  const typeName = { video: 'видео', text: 'текст', story_photo: 'история', photo: 'кадр' };
  const typeIcon = (t) => (t === 'video' ? I.play : t === 'text' ? I.text : I.photo);

  /* ---------- маршруты ---------- */
  const route = () => (location.hash || '#sun').slice(1) || 'sun';
  const go = (name) => { if (route() === name) render(); else location.hash = name; };
  const back = () => { if (history.length > 1) history.back(); else go('sun'); };
  window.addEventListener('hashchange', () => { ui.drawer = false; ui.sheet = null; ui.compose = false; render(); window.scrollTo(0, 0); });

  function toast(text, bad) {
    const box = $('#toasts'); const el = document.createElement('div'); el.className = 'toast' + (bad ? ' bad' : ''); el.textContent = text; box.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }
  function heartAt(x, y) {
    const el = document.createElement('div'); el.className = 'heart'; el.style.left = x + 'px'; el.style.top = y + 'px'; el.innerHTML = `<img src="${TZ.asset(find(TZ.agents, 'lubik').img)}" alt="">`;
    document.body.appendChild(el); setTimeout(() => el.remove(), 750);
  }

  /* ---------- оптика РАЙ / CYBER ---------- */
  function lens() { try { return localStorage.getItem(TZ.config.lensKey); } catch (e) { return null; } }
  function applyLens(v) {
    const r = document.documentElement;
    if (v === 'paradise' || v === 'cyber') r.setAttribute('data-lens', v); else r.removeAttribute('data-lens');
    try { v ? localStorage.setItem(TZ.config.lensKey, v) : localStorage.removeItem(TZ.config.lensKey); } catch (e) {}
    TZ.sky.redraw();
  }
  const isCyber = () => getComputedStyle(document.documentElement).colorScheme.trim() === 'dark';

  /* ---------- лента ---------- */
  function feedItems() {
    const pubs = TZ.publications.map((p) => ({ kind: 'pub', id: p.id, at: p.at, worlds: p.worlds || [], data: p,
      tags: uniq(TZ.logic.tagsOfWorlds(p.worlds).concat(p.type === 'video' ? ['cinema'] : [])) }));
    const news = TZ.news.map((n) => ({ kind: 'news', id: n.id, at: n.at, worlds: ['sochi'], data: n, tags: ['city'] }));
    const mine = S().posts.map((p) => ({ kind: 'mine', id: p.id, at: p.at, worlds: p.world ? [p.world] : [], data: p, tags: TZ.logic.tagsOfWorlds(p.world ? [p.world] : []) }));
    return mine.concat(pubs, news).sort((a, b) => (a.at < b.at ? 1 : -1));
  }
  const uniq = (a) => a.filter((v, i) => a.indexOf(v) === i);
  const itemById = (id) => feedItems().find((x) => x.id === id);

  function postCard(it) {
    const liked = !!S().likes[it.id], saved = !!S().saves[it.id];
    let head = '', body = '', extra = '';
    if (it.kind === 'pub') {
      const p = it.data, prof = p.profile && find(TZ.profiles, p.profile), world = p.worlds[0] && find(TZ.worlds, p.worlds[0]);
      const who = prof ? { act: 'open', arg: 'p-' + prof.slug, av: TZ.avatar.ofProfile(prof, 38), name: prof.name, sub: prof.role }
        : world ? { act: 'open', arg: 'w-' + world.slug, av: `<span class="orbmini">${TZ.avatar.planet(world)}</span>`, name: world.name, sub: 'мир TRIZNES' }
        : { act: 'open', arg: 'worlds', av: '<span class="mini channel" style="--c:var(--sea)">T</span>', name: 'TRIZNES', sub: 'канал проекта' };
      head = `<button class="who" data-act="${who.act}" data-arg="${who.arg}">${who.av}<span class="grow"><b>${esc(who.name)}</b><span>${esc(who.sub)} · ${when(p.at)}</span></span></button>${originChip(p.origin)}`;
      body = `<div class="film"><span class="ic">${typeIcon(p.type)}</span><div><p style="font-weight:800">${esc(p.title)}</p><span class="small">${esc(typeName[p.type] || p.type)}${p.series ? ' · ' + esc(p.series) : ''}${p.platforms && p.platforms.length ? ' · ' + esc(p.platforms.join(', ')) : ''}</span></div></div>`;
      extra = p.media ? `<a class="act" href="${esc(p.media)}" target="_blank" rel="noopener">${I.play}Смотреть</a>` : '';
    } else if (it.kind === 'news') {
      const n = it.data, world = find(TZ.worlds, 'sochi');
      head = `<button class="who" data-act="open" data-arg="w-sochi"><span class="orbmini">${TZ.avatar.planet(world)}</span><span class="grow"><b>${esc(n.source)}</b><span>Сочи сейчас · ${when(n.at)}</span></span></button><span class="chip prov arc">ИСТОЧНИК</span>`;
      body = `<p>${esc(n.text)}</p>`;
      extra = n.url ? `<a class="act" href="${esc(n.url)}" target="_blank" rel="noopener">${I.link}Первоисточник</a>` : '';
    } else {
      const p = it.data, world = p.world && find(TZ.worlds, p.world);
      head = `<button class="who" data-act="open" data-arg="me">${TZ.avatar.mine(38)}<span class="grow"><b>${esc(S().me.name || 'Я')}</b><span>${world ? esc(world.name) + ' · ' : ''}${when(p.at)} · на этом устройстве</span></span></button><button class="act" data-act="post-del" data-arg="${p.id}" aria-label="Убрать пост">×</button>`;
      body = `<p>${esc(p.text)}</p>`;
    }
    return `<article class="card post" data-id="${it.id}">
      <div class="post-head">${head}</div>${body}
      <div class="post-actions">
        <button class="act" data-act="like" data-arg="${it.id}" aria-pressed="${liked}">${liked ? I.heart : I.heartO}<span>${liked ? 'Откликнулось' : 'Откликается'}</span></button>
        <button class="act save" data-act="save" data-arg="${it.id}" aria-pressed="${saved}" aria-label="Сохранить">${I.save}</button>
        <span class="grow"></span>${extra}
      </div></article>`;
  }

  function orbit() {
    const sun = `<button class="orb" data-act="planet" data-arg="" aria-pressed="${!ui.feedWorld}"><span class="body"><span class="sunball"></span></span><b>24/7</b></button>`;
    return `<div class="orbit" role="group" aria-label="Миры">${sun}${TZ.worlds.map((w) =>
      `<button class="orb" data-act="planet" data-arg="${w.slug}" aria-pressed="${ui.feedWorld === w.slug}"><span class="body">${TZ.avatar.planet(w)}</span><b>${esc(w.name)}</b></button>`).join('')}</div>`;
  }

  function viewSun() {
    const world = ui.feedWorld && find(TZ.worlds, ui.feedWorld);
    let items = feedItems();
    if (ui.feedTab === 'mine') items = items.filter((x) => x.kind === 'mine');
    else if (world) items = items.filter((x) => x.worlds.includes(world.slug));
    const space = world
      ? `<div class="card space"><span class="body" style="position:relative;width:56px;height:56px;flex:none">${TZ.avatar.planet(world)}</span><div class="txt"><p class="eyebrow">${world.kind === 'city' ? 'город' : world.kind === 'world' ? 'мир' : 'сообщество'}${world.city ? ' · ' + esc(world.city) : ''}</p><h2 class="h3">${esc(world.full || world.name)}</h2><p class="sub">${esc(world.line)}</p></div><button class="btn sm" data-act="open" data-arg="w-${world.slug}">Войти</button></div>`
      : `<div class="hero"><img class="bg" src="${TZ.asset('assets/art/' + (isCyber() ? '01_keyart_night' : '05_dawn_abundance') + '.webp')}" alt=""><p class="eyebrow">${esc(TZ.canon.cityGoal)}</p><h2 class="h2">${esc(TZ.canon.axiom)}</h2><p style="font-size:13px;opacity:.9">${esc(TZ.canon.cinema)}</p></div>`;
    const composer = ui.compose
      ? `<div class="card stack"><div class="field"><label for="post-text">Твой импульс</label><textarea id="post-text" class="input" maxlength="600" placeholder="Что ты прожил, снял, спел, придумал сегодня?"></textarea></div>
          <div class="field"><label for="post-world">Мир</label><select id="post-world" class="input"><option value="">Без мира — просто Солнце</option>${TZ.worlds.filter((w) => w.kind !== 'city').map((w) => `<option value="${w.slug}" ${ui.feedWorld === w.slug ? 'selected' : ''}>${esc(w.name)}</option>`).join('')}</select></div>
          <p class="small">Пост останется на этом устройстве. Публикация в общий мир — только после сервера и твоего отдельного подтверждения.</p>
          <div class="row"><button class="btn" data-act="compose-off">Отмена</button><button class="btn primary grow" data-act="post-add">Сохранить импульс</button></div></div>`
      : `<button class="btn block" data-act="compose-on">${I.plus}Мой импульс</button>`;
    const list = items.length ? items.map(postCard).join('')
      : ui.feedTab === 'mine' ? mascot('chivurundu', 'Здесь появятся твои импульсы. Начни с одной строки.') : '<div class="card empty">В этом мире пока нет опубликованных материалов.</div>';
    return `${orbit()}${space}
      <div class="tabs" role="tablist"><button role="tab" data-act="feed-tab" data-arg="flow" aria-selected="${ui.feedTab === 'flow'}">Поток</button><button role="tab" data-act="feed-tab" data-arg="mine" aria-selected="${ui.feedTab === 'mine'}">Мои посты</button></div>
      ${composer}${list}
      <p class="note"><b>Что здесь настоящее.</b> Материалы и профили — из публичного мира TRIZNES (${S().source === 'live' ? 'живые данные сервера' : 'снимок 12.11.2026'}). Чужих постов и лайков приложение не выдумывает.</p>`;
  }

  /* ---------- профиль персонажа и профиль резонанса ---------- */
  function worldChip(slug) { const w = find(TZ.worlds, slug); return w ? `<button class="chip" data-act="open" data-arg="w-${w.slug}"><span class="dot" style="background:var(--sun)"></span>${esc(w.name)}</button>` : ''; }
  function tagChips(ids) { return ids.map((id) => { const t = TZ.tags.find((x) => x.id === id); return t ? `<span class="chip">${esc(t.name)}</span>` : ''; }).join(''); }

  function viewProfile(slug) {
    const p = find(TZ.profiles, slug); if (!p) return notFound();
    const pubs = TZ.publications.filter((x) => x.profile === p.slug);
    return `${backBar()}
      <div class="card stack" style="align-items:center;text-align:center">
        ${TZ.avatar.ofProfile(p, 132)}
        <div><p class="eyebrow">${esc(p.alias)}</p><h2 class="h2" style="margin-top:6px">${esc(p.name)}</h2><p class="sub">${esc(p.role)}</p></div>
        <div class="row wrap" style="justify-content:center"><span class="chip">${esc(p.card)}</span>${originChip(p.origin)}${worldChip(p.community)}${p.also ? worldChip(p.also) : ''}</div>
        <button class="btn primary block" data-act="open" data-arg="r-${p.slug}">Профиль резонанса</button>
      </div>
      <div class="card stack"><p class="eyebrow">Идея</p><p>${esc(p.idea)}</p><p class="eyebrow" style="margin-top:6px">Мечта</p><p>${esc(p.dream)}</p></div>
      <div class="card stack"><p class="eyebrow">Факт</p><p class="sub">${esc(p.bio)}</p>
        <p class="small">${p.identity === 'confirmed' ? 'Личность подтверждена.' : 'Профиль заявлен; подтверждение личности впереди.'} ${p.portrait ? 'Портрет — из архива проекта.' : 'Портрета в открытом доступе нет — показан знак персонажа в его цветах, лицо не генерируется.'}</p></div>
      ${pubs.length ? `<p class="eyebrow">Фильмы и материалы</p>${pubs.map((x) => postCard(itemById(x.id))).join('')}` : ''}`;
  }

  function viewResonance(slug) {
    const p = find(TZ.profiles, slug); if (!p) return notFound();
    const r = TZ.logic.resonance(p), bonded = !!S().bonds[p.slug];
    const pct = r.pct == null ? '' : `<span class="pct-badge">${r.pct}%</span>`;
    const why = r.pct == null
      ? `<p class="why">Процент появится, когда ты отметишь, что любишь, или откликнешься на материалы. <button class="link" data-act="open" data-arg="bonds">Отметить</button></p>`
      : `<p class="why">${r.shared.length ? `<b>Что общего:</b> ${r.shared.map((t) => t.name.toLowerCase()).join(', ')}.` : 'Пока ваши направления не пересеклись.'} Процент — не оценка человека, а совпадение твоих откликов с его собственными словами.</p>`;
    return `${backBar()}
      <div class="card stack">
        <div class="stage"><div class="ringpct big" style="--v:${r.pct || 0}">${TZ.avatar.ofProfile(p, 170)}</div>${pct}</div>
        <div style="text-align:center"><p class="eyebrow">Профиль резонанса</p><h2 class="h2" style="margin-top:6px">${esc(p.name)}</h2><p class="sub">${esc(p.role)}</p></div>
        ${why}
        <div class="row"><button class="btn sea grow" data-act="open" data-arg="talk-${p.slug}">Начать диалог</button><button class="btn grow" data-act="bond" data-arg="${p.slug}" aria-pressed="${bonded}">${bonded ? 'В резонансе' : 'Добавить в резонанс'}</button></div>
      </div>
      <div class="card stack"><p class="eyebrow">Направления — из слов персонажа</p><div class="row wrap">${tagChips(p.tags)}</div><p class="sub">«${esc(p.idea)}»</p></div>
      <button class="btn block" data-act="open" data-arg="p-${p.slug}">Материалы и история персонажа</button>`;
  }

  /* ---------- МОИ СВЯЗИ ---------- */
  function lovePicker() {
    const w = S().weights;
    return `<div class="card stack"><p class="eyebrow">${esc(TZ.canon.dialogue[1])}</p><h2 class="h3">Отметь, что тебе откликается</h2>
      <div class="pick">${TZ.tags.map((t) => `<button data-act="love" data-arg="${t.id}" aria-pressed="${(w[t.id] || 0) > 0}">${esc(t.name)}</button>`).join('')}</div>
      <p class="small">Каждый отклик в ленте добавляет вес. Из весов складывается твоё небо.</p></div>`;
  }
  function constellation(rows) {
    const n = rows.length; let lines = '', stars = '';
    rows.forEach((row, i) => {
      const ang = (i / n) * Math.PI * 2 - Math.PI / 2, pct = row.r.pct == null ? 0 : row.r.pct;
      const rad = 43 - pct * 0.24, x = 50 + Math.cos(ang) * rad * 0.98, y = 52 + Math.sin(ang) * rad * 0.86;
      const c = TZ.avatar.hex(row.p.accent[0]), size = 12 + pct * 0.16, bonded = S().bonds[row.p.slug];
      if (bonded || pct >= 50) lines += `<line x1="50%" y1="52%" x2="${x}%" y2="${y}%" stroke="${c}" stroke-width="${bonded ? 1.6 : 0.8}" stroke-opacity="${bonded ? 0.9 : 0.45}" ${bonded ? '' : 'stroke-dasharray="3 4"'}/>`;
      stars += `<button class="starbtn" style="left:${x}%;top:${y}%;--s:${size}px;--c:${c};--d:${(i * 0.37).toFixed(2)}s" data-act="open" data-arg="r-${row.p.slug}" aria-label="${esc(row.p.name)}"><i></i><span>${esc(row.p.name.split(' ')[0])}</span></button>`;
    });
    return `<div class="constel"><svg aria-hidden="true">${lines}</svg>${stars}<span class="me" style="top:52%">${TZ.avatar.mine(40)}</span></div>`;
  }
  function personRow(row) {
    const p = row.p, pct = row.r.pct;
    return `<div class="card"><button class="person" data-act="open" data-arg="r-${p.slug}">${TZ.avatar.ofProfile(p, 46)}<span class="grow"><b style="display:block;font-weight:800">${esc(p.name)}</b><span class="small">${esc(p.role)}</span>${row.r.shared.length ? `<span class="small" style="display:block;color:var(--ink-2)">общее: ${row.r.shared.map((t) => t.name.toLowerCase()).join(', ')}</span>` : ''}</span>${pct == null ? '<span class="chip">—</span>' : `<span class="ringpct" style="--v:${pct}"><b>${pct}</b></span>`}</button></div>`;
  }
  function viewBonds() {
    const rows = TZ.profiles.map((p) => ({ p, r: TZ.logic.resonance(p) })).sort((a, b) => (b.r.pct || 0) - (a.r.pct || 0));
    const has = TZ.logic.topTags().length > 0;
    let list;
    if (ui.bondsTab === 'match') { const m = rows.filter((x) => (x.r.pct || 0) >= 50); list = m.length ? m.map(personRow).join('') : `<div class="card empty">${has ? 'Совпадений выше 50% пока нет — откликайся на материалы, небо меняется.' : 'Отметь, что ты любишь, — и здесь появятся персонажи, с которыми вы совпали.'}</div>`; }
    else if (ui.bondsTab === 'mine') { const m = rows.filter((x) => S().bonds[x.p.slug]); list = m.length ? m.map(personRow).join('') : mascot('chivurundu', 'Ты пока никого не добавил в резонанс. Загляни к тем, чья идея откликается.'); }
    else list = `<div class="card empty">Кто добавил тебя — будет видно, когда сервер резонанса выложен. ${statusChip('PROPOSED')}</div>`;
    return `<div><p class="eyebrow">${esc(TZ.canon.protocol)}</p><h2 class="h2" style="margin-top:6px">Мои связи</h2></div>
      ${constellation(rows)}${has ? '' : lovePicker()}
      <div class="tabs" role="tablist">${[['match', 'Совпали с тобой'], ['mine', 'В резонансе'], ['in', 'Добавили тебя']].map(([k, n]) => `<button role="tab" data-act="bonds-tab" data-arg="${k}" aria-selected="${ui.bondsTab === k}">${n}</button>`).join('')}</div>
      ${list}
      ${ui.bondsTab === 'match' && has ? `<p class="eyebrow">Все персонажи первой и второй волны</p>${rows.filter((x) => (x.r.pct || 0) < 50).map(personRow).join('')}` : ''}
      ${has ? lovePicker() : ''}`;
  }

  /* ---------- диалоги ---------- */
  function chatOf(id) { return (S().chats[id] = S().chats[id] || { msgs: [], step: 0 }); }
  function viewDialogs() {
    const talks = Object.keys(S().chats).filter((k) => k.startsWith('talk-') && S().chats[k].msgs.length);
    return `<div><p class="eyebrow">Нейроперсонажи TRIZNES</p><h2 class="h2" style="margin-top:6px">Диалоги</h2></div>
      <div class="guides">${neuroAll().map((a) => `<button class="guide" data-act="open" data-arg="${a.reactionOnly || a.artist ? 'n-' + a.slug : 'chat-' + a.slug}">${face(a, 62)}<b>${esc(a.name)}</b><span>${esc(a.role.split('·')[0].trim())}</span></button>`).join('')}</div>
      <p class="eyebrow">Персонажи</p>
      ${talks.length ? talks.map((k) => { const p = find(TZ.profiles, k.slice(5)); const c = S().chats[k]; return p ? `<div class="card"><button class="person" data-act="open" data-arg="${k}">${TZ.avatar.ofProfile(p, 44)}<span class="grow"><b style="display:block;font-weight:800">${esc(p.name)}</b><span class="small">${esc(c.msgs[c.msgs.length - 1].text.slice(0, 60))}</span></span></button></div>` : ''; }).join('')
        : '<div class="card empty">Диалог с персонажем начинается из его профиля резонанса.</div>'}
      <p class="note"><b>Режим без шлюза.</b> Проводники отвечают по прошивке и твоим действиям, без нейросети. Сообщения людям сохраняются на устройстве и не отправляются. ${statusChip('PROPOSED')}</p>`;
  }
  function agentOpening(a) {
    const c = chatOf('chat-' + a.slug);
    if (c.msgs.length) return;
    let t;
    if (a.slug === 'apollon') t = TZ.canon.firstQuestion;
    else if (a.slug === 'dionysus') t = levelLine();
    else if (a.slug === 'bezliki') t = 'Один шаг. ' + nextStep();
    else if (a.slug === 'chivurundu') t = introduce();
    else t = 'Спрашивай про вход, профиль, карты, согласия, Нейроферму, события. Отвечу по фактам проекта.';
    c.msgs.push({ from: 'them', text: t, at: Date.now() });
  }
  function levelLine() { const l = TZ.seedWorld.levels[Math.min(S().level, 13) - 1]; return `УРОВЕНЬ ${l.no} · ${l.title}. ${l.task} Доказательство: ${l.proof}`; }
  function nextStep() {
    const s = S();
    if (!s.me.name) return 'Назови своего персонажа в разделе «Я».';
    if (!TZ.logic.topTags().length) return 'Отметь, что ты любишь, в «Моих связях».';
    if (!Object.keys(s.bonds).some((k) => s.bonds[k])) return 'Добавь в резонанс одного персонажа, чья идея тебе откликается.';
    if (!s.posts.length) return 'Запиши первый импульс в ленте 24/7.';
    return `${TZ.canon.impulse.code} · ${TZ.canon.impulse.title}: ${TZ.canon.impulse.text.toLowerCase()}`;
  }
  function introduce() {
    const rows = TZ.profiles.filter((p) => !S().bonds[p.slug]).map((p) => ({ p, r: TZ.logic.resonance(p) })).sort((a, b) => (b.r.pct || 0) - (a.r.pct || 0));
    const x = rows[0]; if (!x) return 'Ты уже знаком со всеми персонажами первой волны. Красиво.';
    return `Знакомься: ${x.p.name} — ${x.p.role}. Мечта: «${x.p.dream}» Загляни в профиль резонанса.`;
  }
  const FAQ = [
    [['вход', 'войти', 'pin', 'пин', 'логин'], 'Вход по имени и PIN и по email работает в действующей системе. В этом приложении он подключится через единый шлюз — шлюз ещё не выложен.'],
    [['карт', 'black', 'silver', 'gold', 'оплат', 'купить', 'цена', 'стоит'], 'Карты: BLACK — 7 дней, SILVER — 1 месяц, GOLD — полный доступ к Media Hub. Оплата планируется через Telegram; сквозной платёж ещё не проверен.'],
    [['соглас', 'персональн', 'образ'], 'Согласий четыре вида: обработка данных, использование образа, распространение данных, лицензия на творческие материалы. Тексты — черновики; сбор включится после утверждения текстов и сервера в РФ.'],
    [['нейроферм', 'загруз', 'файл', 'монтаж', 'медиа'], 'Нейроферма: оригинал не изменяется, загрузка — не публикация, публикация — только после твоего подтверждения и одобрения оператора.'],
    [['гео', 'карта город', 'рядом', 'присутств'], 'Карта города и места работают. Присутствие «я рядом» закрыто: нет согласия на геолокацию.'],
    [['telegram', 'телеграм', 'бот'], 'Telegram привязывается только одноразовым кодом, не по имени и не по username.'],
    [['уровн', 'квест', 'доказательств'], 'Тринадцать уровней открыты для чтения. Отправка доказательств закрыта до исправления игрового сервиса.']
  ];
  function agentReply(a, text) {
    const c = chatOf('chat-' + a.slug), say = (t, extra) => c.msgs.push(Object.assign({ from: 'them', text: t, at: Date.now() }, extra || {}));
    const hand = a.slug === 'apollon' && c.step < 3 ? null : TZ.logic.route(text, a.slug);
    if (a.slug === 'apollon') {
      const m = S().me, low = text.toLowerCase();
      if (c.step === 0) { m.who = text; c.step = 1; say(TZ.canon.dialogue[1] + '?'); }
      else if (c.step === 1) {
        const hit = { music: ['музык', 'песн', 'петь', 'пою', 'звук'], cinema: ['кино', 'фильм', 'снима', 'камер'], stage: ['сцен', 'театр', 'танц', 'цирк'], game: ['игр', 'квест'], city: ['город', 'сочи', 'море', 'гор'], love: ['люб', 'семь', 'близк'], deed: ['дел', 'работ', 'созда', 'строи', 'ремесл'], bond: ['люд', 'друз', 'общен', 'связ', 'знаком'] };
        const got = Object.keys(hit).filter((k) => hit[k].some((w) => low.includes(w)));
        TZ.logic.bump(got, 2); c.step = 2;
        say((got.length ? 'Слышу: ' + got.map((g) => TZ.tags.find((t) => t.id === g).name.toLowerCase()).join(', ') + '. Это уже в твоём небе. ' : '') + TZ.canon.dialogue[2] + '?');
      } else if (c.step === 2) { m.want = text; c.step = 3; say(TZ.canon.dialogue[3] + '?'); }
      else if (c.step === 3) { m.unique = text; c.step = 4; say('Твои слова сохранены в профиле — они твои, их видишь только ты. Когда захочешь действия, дальше ведёт ДИОНИС.', { handoff: 'dionysus' }); TZ.logic.signal('АПОЛЛОН сохранил твои ответы в профиле', 'me'); }
      else say('Я рядом. ' + (hand ? '' : 'Живой разговор откроется со шлюзом; сейчас я храню твои слова.'));
    } else if (a.slug === 'dionysus') say(levelLine() + ' Игра предлагает, а не приказывает.');
    else if (a.slug === 'bezliki') say('Один шаг. ' + nextStep());
    else if (a.slug === 'chivurundu') say(introduce());
    else { const low = text.toLowerCase(); const f = FAQ.find((x) => x[0].some((k) => low.includes(k))); say(f ? f[1] : 'По этому вопросу у меня нет подтверждённого факта. Спроси про вход, карты, согласия, Нейроферму, Telegram или уровни.'); }
    if (hand) c.msgs.push({ from: 'them', text: 'Это ближе к проводнику ' + hand.name + '.', handoff: hand.slug, at: Date.now() });
  }
  function viewChat(id) {
    const isAgent = id.startsWith('chat-'), slug = id.slice(5);
    const a = isAgent ? find(TZ.agents, slug) : null, p = isAgent ? null : find(TZ.profiles, slug);
    if (!a && !p) return notFound();
    if (a) agentOpening(a);
    const c = chatOf(id);
    const head = a
      ? `<div class="row"><button data-act="open" data-arg="n-${a.slug}" aria-label="О персонаже">${face(a, 52)}</button><div class="grow"><h2 class="h3">${esc(a.name)}</h2><p class="small">${esc(a.job)}</p></div></div>`
      : `<div class="row"><button data-act="open" data-arg="r-${p.slug}">${TZ.avatar.ofProfile(p, 48)}</button><div class="grow"><h2 class="h3">${esc(p.name)}</h2><p class="small">${esc(p.role)}</p></div></div>`;
    const msgs = c.msgs.map((m) => m.handoff
      ? `<div class="msg out">${esc(m.text)}</div><button class="handoff" data-act="open" data-arg="chat-${m.handoff}">Перейти к проводнику ${esc(find(TZ.agents, m.handoff).name)} →</button>`
      : `<div class="msg ${m.from === 'me' ? 'in' : 'out'}">${esc(m.text)}</div>`).join('');
    const empty = p && !c.msgs.length ? `<div class="card empty"><p class="eyebrow">Вопрос для начала</p><p class="h3" style="margin-top:8px">${esc(TZ.canon.finalQuestion)}</p></div>` : '';
    const note = p ? `<p class="note">Сообщение сохранится на этом устройстве. Доставка людям появится вместе с сервером диалогов. ${statusChip('PROPOSED')}</p>` : '';
    return `${backBar()}${head}<div class="chat" id="chat">${empty}${msgs}</div>${note}
      <form class="composer" data-form="msg" data-arg="${id}"><input class="input" name="text" autocomplete="off" maxlength="500" placeholder="${a ? 'Напиши проводнику' : 'Напиши первым'}" aria-label="Сообщение"><button class="btn primary" aria-label="Отправить">${I.send}</button></form>`;
  }

  /* ---------- сигналы ---------- */
  function viewSignals() {
    S().seenSignals = S().signals.length; TZ.save();
    const im = TZ.canon.impulse;
    return `<div><p class="eyebrow">Лёгкие сигналы без давления</p><h2 class="h2" style="margin-top:6px">Сигналы</h2></div>
      <div class="card stack"><p class="eyebrow">${esc(im.code)}</p><h3 class="h3">${esc(im.title)}</h3><p class="sub">${esc(im.text)}</p><button class="btn sm" data-act="open" data-arg="farm" style="align-self:flex-start">В Нейроферму</button></div>
      ${S().signals.length ? S().signals.map((s) => `<div class="card"><button class="person" ${s.link ? `data-act="open" data-arg="${s.link}"` : ''}><span class="mini channel" style="--c:var(--sun)">✦</span><span class="grow"><b style="display:block;font-weight:700;font-size:14px">${esc(s.text)}</b><span class="small">${when(s.at)}</span></span></button></div>`).join('')
        : mascot('lubik', 'Сигналы появятся, когда ты начнёшь действовать: отклик, резонанс, шаг пути.')}`;
  }

  /* ---------- Я ---------- */
  function steps() { const i = TZ.logic.stepIndex(); return `<div class="steps">${TZ.canon.progression.map((s, k) => `<span class="${k <= i ? 'on' : ''}">${s}</span>`).join('')}</div>`; }
  function viewMe() {
    const m = S().me;
    if (!m.name) {
      return `<div class="card stack" style="align-items:center;text-align:center">${TZ.avatar.mine(120)}
          <p class="eyebrow">${esc(TZ.canon.name)}</p><h2 class="h2">${esc(TZ.canon.firstQuestion)}</h2>
          <p class="sub">${esc(TZ.canon.rules[0])}</p></div>
        <form class="card stack" data-form="name"><div class="field"><label for="nm">Имя твоего персонажа</label><input id="nm" name="name" class="input" maxlength="32" autocomplete="off" placeholder="Как тебя зовут в игре"></div>
          <button class="btn primary block">Войти в мир</button>
          <p class="small">Гостевой режим: профиль живёт на этом устройстве. Вход по имени и PIN подключится через шлюз. ${statusChip('PROPOSED')}</p></form>`;
    }
    const ref = TZ.logic.reflection(), top = TZ.logic.topTags(), max = top.length ? S().weights[top[0].id] : 1;
    return `<div class="card stack" style="align-items:center;text-align:center">
        ${TZ.avatar.mine(128)}
        <div><p class="eyebrow">персонаж · гость</p><h2 class="h2" style="margin-top:6px">${esc(m.name)}</h2><p class="sub">LEVEL ${S().level} · XP 0 · LUBICOIN 0</p></div>
        ${steps()}
        <div class="row" style="width:100%"><button class="btn grow" data-act="open" data-arg="path">Мой мир</button><button class="btn grow" data-act="sheet" data-arg="mask">Образ</button></div>
      </div>
      ${ref ? `<div class="card stack"><div class="row between"><p class="eyebrow">Отражение</p><button class="hint" data-act="sheet" data-arg="hint" aria-label="Что это">?</button></div><div class="blocks">${ref.map((b) => `<div class="block"><small>${b[0]}</small><b>${b[1]}</b></div>`).join('')}</div></div>`
        : `<div class="card stack"><p class="eyebrow">Отражение</p><p class="sub">Появится из твоих действий: откликов, связей, импульсов. Это не диагноз, а мягкое зеркало.</p></div>`}
      <div class="card stack"><div class="row between"><p class="eyebrow">${esc(TZ.canon.dialogue[1])}</p><button class="link" data-act="open" data-arg="bonds">Изменить</button></div>
        ${top.length ? `<div class="bars">${top.map((t) => `<div class="barrow"><span>${esc(t.name)}</span><i><u style="--w:${Math.round((S().weights[t.id] / max) * 100)}"></u></i><span>${S().weights[t.id]}</span></div>`).join('')}</div>` : '<p class="sub">Пока пусто. Откликайся на материалы или отметь направления в «Моих связях».</p>'}</div>
      <div class="card stack"><p class="eyebrow">Мои слова</p>
        <dl class="kv"><dt>${esc(TZ.canon.dialogue[0])}</dt><dd>${esc(m.who || '—')}</dd><dt>${esc(TZ.canon.dialogue[2])}</dt><dd>${esc(m.want || '—')}</dd><dt>${esc(TZ.canon.dialogue[3])}</dt><dd>${esc(m.unique || '—')}</dd></dl>
        <button class="btn sm" data-act="open" data-arg="chat-apollon" style="align-self:flex-start">${m.who ? 'Продолжить с АПОЛЛОНОМ' : 'Ответить АПОЛЛОНУ'}</button></div>
      <div class="card stack"><p class="eyebrow">Доступ</p>
        ${[['cards', 'Клубная карта', 'BLACK · SILVER · GOLD'], ['consents', 'Согласия', 'четыре раздельных согласия'], ['saved', 'Сохранённое', Object.keys(S().saves).filter((k) => S().saves[k]).length + ' материалов'], ['prefs', 'Настройки', 'оптика, источник данных']].map((r) => `<button class="menu-item" data-act="open" data-arg="${r[0]}"><span class="grow">${r[1]}<small>${r[2]}</small></span><span aria-hidden="true">›</span></button>`).join('')}</div>`;
  }
  function viewCards() {
    return `${backBar()}<div><p class="eyebrow">Клуб TRIZNES</p><h2 class="h2" style="margin-top:6px">Карты</h2><p class="sub">Карта, деньги и статус — инструменты, а не идея.</p></div>
      ${TZ.cards.map((c) => `<div class="clubcard ${c.tier === 'black' ? '' : c.tier}"><div class="row between"><span class="t">${c.name}</span><span class="n">${esc(c.term)}</span></div><div><p style="font-weight:800;font-size:14px">${esc(c.label)}</p><p style="font-size:12px;opacity:.82;margin-top:4px">${esc(c.note)}</p></div></div>`).join('')}
      <p class="note"><b>У тебя сейчас карты нет.</b> Наличие и срок карты определяет сервер. Оплата планируется через Telegram и в приложении не подключена. ${statusChip('PROPOSED')}</p>`;
  }
  function viewConsents() {
    const c = S().consents;
    return `${backBar()}<div><p class="eyebrow">Раздельно, добровольно, с правом отзыва</p><h2 class="h2" style="margin-top:6px">Согласия</h2></div>
      <div class="card stack">${TZ.consentKinds.map((k) => `<div class="row"><span class="grow"><b style="font-size:14px">${esc(k.name)}</b><span class="small" style="display:block">${c[k.kind] ? 'намерение отмечено ' + when(c[k.kind]) : 'не отмечено'}</span></span><button class="switch" role="switch" aria-checked="${!!c[k.kind]}" data-act="consent" data-arg="${k.kind}" aria-label="${esc(k.name)}"><i></i></button></div>`).join('')}
        <div class="row"><span class="grow"><b style="font-size:14px">Геолокация</b><span class="small" style="display:block">шаблона согласия нет — постоянного отслеживания нет и не будет без отдельного согласия</span></span>${statusChip('BLOCKED')}</div></div>
      <p class="note"><b>Юридической силы отметки пока не имеют.</b> Тексты согласий — черновики; приём включится после утверждения текстов и сервера в РФ. Отметка здесь — только твоё намерение на этом устройстве. ${statusChip('BLOCKED')}</p>`;
  }

  /* ---------- МОЙ МИР: путь ---------- */
  function viewPath() {
    const lv = TZ.seedWorld.levels, cur = S().level; let act = '', html = '';
    lv.forEach((l) => {
      if (l.act !== act) { act = l.act; html += `<p class="act-title">${esc(act)}</p>`; }
      const cls = l.no < cur ? 'done' : l.no === cur ? 'now' : '';
      html += `<div class="level ${cls}"><span class="no">${l.no < cur ? '✓' : String(l.no).padStart(2, '0')}</span><div class="stack" style="gap:6px"><b class="h3">${esc(l.title)}</b><span class="sub">${esc(l.purpose)}</span>
        ${l.no === cur ? `<span style="font-size:14px"><b>Задание.</b> ${esc(l.task)}</span><span class="small"><b>Доказательство.</b> ${esc(l.proof)}</span><button class="btn sm primary" data-act="level-done" style="align-self:flex-start">Прожил — отметить для себя</button>` : ''}</div></div>`;
    });
    return `${backBar()}
      <div class="card row"><div class="pathring" style="--v:${Math.round(((cur - 1) / 13) * 100)}"><div><b>${cur - 1}</b><small>из 13</small></div></div><div class="grow stack" style="gap:8px"><p class="eyebrow">Мой мир</p><h2 class="h3">Путь творца</h2>${steps()}</div></div>
      <div class="stack">${html}</div>
      <p class="note">Отметка — личная, на этом устройстве. Приём доказательств сервером закрыт до исправления игрового сервиса. ${statusChip('BLOCKED')}</p>`;
  }

  /* ---------- НАШ ГОРОД ---------- */
  function viewCity() {
    const places = TZ.seedWorld.places, sel = find(places, ui.place) || places[0], pal = ['#ffc24d', '#35e9ff', '#ff7a9c', '#b6f23c', '#a58bff', '#58d6c4', '#ff9a7a', '#58c9ff'];
    const order = places.slice().sort((a, b) => a.x - b.x), path = order.map((p, i) => (i ? 'L' : 'M') + (p.x * 100).toFixed(1) + ' ' + (p.y * 100).toFixed(1)).join(' ');
    return `${backBar()}<div><p class="eyebrow">${esc(TZ.canon.cityGoal)}</p><h2 class="h2" style="margin-top:6px">Наш город</h2></div>
      <div class="citymap"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 26 L12 14 L24 22 L38 8 L52 20 L66 6 L80 16 L100 4 L100 0 L0 0Z" fill="var(--mute)"/>
          <path d="M0 74 C22 66 40 84 62 76 S90 70 100 80 L100 100 L0 100Z" fill="color-mix(in srgb,var(--sea) 26%,transparent)"/>
          <path d="M0 84 C24 78 44 92 66 86 S92 82 100 90 L100 100 L0 100Z" fill="color-mix(in srgb,var(--sea) 30%,transparent)"/>
          <path d="${path}" fill="none" stroke="var(--sun)" stroke-width=".5" stroke-dasharray="1.5 1.8" vector-effect="non-scaling-stroke" opacity=".8"/></svg>
        ${places.map((p, i) => `<button class="beam" style="left:${p.x * 100}%;top:${p.y * 100}%;--c:${pal[i % 8]};--h:${46 + (i % 3) * 16}px;--d:${(i * 0.4).toFixed(1)}s" data-act="place" data-arg="${p.slug}" aria-pressed="${sel.slug === p.slug}" aria-label="${esc(p.name)}"><i></i><u></u></button>`).join('')}</div>
      <div class="card stack">${sel.photo ? `<img class="placephoto" src="${TZ.asset(sel.photo)}" alt="">` : ''}<div class="row between"><h3 class="h3">${esc(sel.name)}</h3>${originChip(sel.status)}</div><p class="sub">${esc(sel.description)}</p></div>
      ${TZ.assetMap ? '' : '<a class="btn block" href="matrix/">Сочи 3D · Два мира</a>'}
      <div class="scroller">${places.map((p) => `<button class="chip" data-act="place" data-arg="${p.slug}" style="${sel.slug === p.slug ? 'border-color:var(--sun)' : ''}">${esc(p.name)}</button>`).join('')}</div>
      <p class="note"><b>Точки — реальные места проекта.</b> Схема условная, не навигационная. Присутствие «я рядом» закрыто: нет согласия на геолокацию. ${statusChip('BLOCKED')}</p>
      <p class="eyebrow">Сочи сейчас</p>${feedItems().filter((x) => x.kind === 'news').map(postCard).join('')}`;
  }

  /* ---------- НЕЙРОФЕРМА ---------- */
  function viewFarm() {
    const up = S().uploads, jobs = S().jobs;
    return `${backBar()}
      <div class="hero"><img class="bg" src="${TZ.asset('assets/art/01_keyart_night.webp')}" alt=""><p class="eyebrow">Нейроферма · закулисье</p><h2 class="h2">Преврати реальность в кино</h2><p style="font-size:13px;opacity:.9">Убирает техническую рутину и собирает производственный результат.</p></div>
      <div class="card stack"><p class="eyebrow">От импульса до следующего квеста</p><div class="row wrap">${TZ.canon.characterLoop.map((s, i) => `<span class="chip"><span class="dot" style="background:var(--sun)"></span>${i + 1}. ${esc(s)}</span>`).join('')}</div></div>
      <div class="card stack"><p class="eyebrow">Оригинал</p>
        <p class="sub">Файл не покидает устройство: приложение считает его отпечаток SHA-256 — так сервер позже проверит, что оригинал не изменён.</p>
        <label class="btn primary block" style="cursor:pointer">${I.plus}Выбрать файл<input type="file" id="file" hidden></label>
        ${up.length ? up.map((u) => `<div class="plain"><b style="font-size:14px;overflow-wrap:anywhere">${esc(u.name)}</b><span class="small" style="display:block">${esc(u.type || 'файл')} · ${(u.size / 1048576).toFixed(2)} МБ · приватно</span><span class="small" style="display:block;font-family:ui-monospace,monospace;overflow-wrap:anywhere">sha256: ${esc(u.sha || 'не посчитан')}</span>
          ${jobs.find((j) => j.upload === u.id) ? `<span class="chip" style="margin-top:8px">заявка: черновик</span>` : `<button class="btn sm" data-act="job" data-arg="${u.id}" style="margin-top:8px">Создать заявку на монтаж</button>`}</div>`).join('') : ''}</div>
      <div class="card stack"><p class="eyebrow">Правила, которые не обходятся</p>
        ${['Оригинал не изменяется: любая обработка — новый файл со ссылкой на оригинал.', 'Загрузка — не публикация. Материал приватен по умолчанию.', 'Публикация — только после твоего подтверждения, одобрения оператора и согласий всех людей в кадре.', 'Происхождение видно всегда: REAL / AI ASSISTED / GENERATED / ARCHIVE.', 'Реальные лица не заменяются сгенерированными.'].map((r) => `<p style="font-size:14px">· ${r}</p>`).join('')}</div>
      <p class="note">Передача файлов и заявок на сервер подключится через шлюз. ${statusChip('PROPOSED')} Публикация материалов с людьми закрыта, пока не включён приём согласий. ${statusChip('BLOCKED')}</p>`;
  }

  /* ---------- миры ---------- */
  function viewWorlds() {
    return `${backBar()}<div><p class="eyebrow">Миры и сообщества</p><h2 class="h2" style="margin-top:6px">Галактика TRIZNES</h2></div>
      ${TZ.worlds.map((w) => `<div class="card"><button class="person" data-act="open" data-arg="w-${w.slug}"><span style="position:relative;width:52px;height:52px;flex:none">${TZ.avatar.planet(w)}</span><span class="grow"><b style="display:block;font:700 13px/1.25 var(--font-display)">${esc(w.name)}</b><span class="small">${esc(w.line)}</span></span>${S().joined[w.slug] ? '<span class="chip">ты здесь</span>' : ''}</button></div>`).join('')}`;
  }
  function viewWorld(slug) {
    const w = find(TZ.worlds, slug); if (!w) return notFound();
    const cast = TZ.profiles.filter((p) => p.community === slug || p.also === slug);
    const items = feedItems().filter((x) => x.worlds.includes(slug)), joined = !!S().joined[slug];
    return `${backBar()}
      <div class="card stack" style="align-items:center;text-align:center"><span style="position:relative;width:120px;height:120px;margin:10px 0">${TZ.avatar.planet(w)}</span>
        <div><p class="eyebrow">${w.kind === 'city' ? 'город' : w.kind === 'world' ? 'мир' : 'сообщество'}${w.city ? ' · ' + esc(w.city) : ''}</p><h2 class="h2" style="margin-top:6px">${esc(w.full || w.name)}</h2><p class="sub">${esc(w.line)}</p></div>
        <div class="row wrap" style="justify-content:center">${tagChips(w.tags)}</div>
        ${w.kind === 'community' ? `<button class="btn ${joined ? '' : 'primary'} block" data-act="join" data-arg="${slug}">${joined ? 'Ты в этом мире · выйти' : 'Войти в мир'}</button><p class="small">Отметка на устройстве; членство на сервере — ${statusChip('PROPOSED')}</p>` : ''}
        ${w.kind === 'city' ? `<button class="btn block" data-act="open" data-arg="city">Открыть карту города</button>` : ''}
      </div>
      ${neuroAll().some((n) => n.world === slug) ? `<p class="eyebrow">Нейроперсонажи мира</p><div class="scroller">${neuroAll().filter((n) => n.world === slug).map((n) => `<button class="castcard" data-act="open" data-arg="n-${n.slug}">${face(n, 66)}<b>${esc(n.name)}</b><span>${esc(n.role.split('·')[0].trim())}</span></button>`).join('')}</div>` : ''}
      ${cast.length ? `<p class="eyebrow">Персонажи мира</p><div class="scroller">${cast.map((p) => `<button class="castcard" data-act="open" data-arg="p-${p.slug}">${TZ.avatar.ofProfile(p, 62)}<b>${esc(p.name)}</b><span>${esc(p.alias)}</span></button>`).join('')}</div>` : ''}
      <p class="eyebrow">Материалы мира</p>${items.length ? items.map(postCard).join('') : '<div class="card empty">Опубликованных материалов этого мира пока нет.</div>'}`;
  }
  function viewNeuro(slug) {
    const n = findNeuro(slug); if (!n) return notFound();
    const world = n.world && find(TZ.worlds, n.world);
    const action = n.reactionOnly ? '<p class="sub">ЛЮБИК не ведёт диалог. Он вспыхивает, когда тебе что-то откликается в ленте.</p>'
      : n.artist ? (world ? `<button class="btn primary block" data-act="open" data-arg="w-${world.slug}">В мир ${esc(world.name)}</button>` : '')
      : `<button class="btn primary block" data-act="open" data-arg="chat-${n.slug}">Написать</button>`;
    return `${backBar()}
      ${n.mirror
        ? `<div class="neurohero mirrorhero" style="--g:${n.color}"><div class="mirrorstage"><span class="mini gd holo" style="--g:${n.color};width:188px;height:188px">${TZ.avatar.mirror(184)}</span><p class="who-now" data-mirror-name>сейчас это ты</p></div><div class="cap"><p class="eyebrow">нейроперсонаж · зеркало</p><h2 class="h2">${esc(n.name)}</h2><p>${esc(n.role)}</p></div></div>`
        : `<div class="neurohero" style="--g:${n.color}"><img src="${TZ.asset(n.card)}" alt="${esc(n.name)}"><div class="cap"><p class="eyebrow">нейроперсонаж</p><h2 class="h2">${esc(n.name)}</h2><p>${esc(n.role)}</p></div></div>`}
      <div class="card stack"><div class="row wrap">${n.mirror ? '<span class="chip">ОБРАЗ — КАЖДЫЙ ИЗ НАС</span>' : '<span class="chip prov gen">GENERATED</span>'}${world ? worldChip(world.slug) : ''}</div>
        <p>${esc(n.look)}</p><p class="eyebrow" style="margin-top:4px">Дело</p><p>${esc(n.job)}</p>${action}</div>
      <p class="eyebrow">Все нейроперсонажи</p><div class="scroller">${neuroAll().filter((x) => x.slug !== n.slug).map((x) => `<button class="castcard" data-act="open" data-arg="n-${x.slug}">${face(x, 66)}<b>${esc(x.name)}</b><span>${esc(x.role.split('·')[0].trim())}</span></button>`).join('')}</div>`;
  }
  function viewPodcast() {
    const pc = TZ.podcast, d = find(TZ.profiles, pc.profile), mm = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    return `${backBar()}
      <div class="card row">${d ? `<button data-act="open" data-arg="p-${d.slug}">${TZ.avatar.ofProfile(d, 64)}</button>` : ''}<div class="grow"><p class="eyebrow">подкаст</p><h2 class="h3" style="margin-top:6px">${esc(pc.title)}</h2><p class="small">${esc(pc.author)} · ${pc.episodes.length} эпизода</p></div></div>
      ${pc.episodes.map((e) => `<div class="card stack"><div class="row"><span class="level"><span class="no" style="width:40px;height:40px">${String(e.no).padStart(2, '0')}</span></span><div class="grow"><b style="font-weight:800">${esc(e.title)}</b><span class="small" style="display:block">${mm(e.sec)}</span></div></div>
        ${TZ.assetMap ? `<a class="btn sm" href="${esc(e.media)}" target="_blank" rel="noopener" style="align-self:flex-start">${I.play}Слушать</a>` : `<audio controls preload="none" src="${esc(e.media)}" style="width:100%"></audio>`}</div>`).join('')}
      <p class="note">Названия и длительность взяты из меток файлов. Происхождение голоса в метках не указано — до уточнения метка REAL / GENERATED не ставится.</p>`;
  }
  function viewSaved() {
    const items = feedItems().filter((x) => S().saves[x.id]);
    return `${backBar()}<div><h2 class="h2">Сохранённое</h2></div>${items.length ? items.map(postCard).join('') : mascot('bezliki', 'Сохраняй материалы из ленты — они соберутся здесь, по порядку.')}`;
  }
  function viewPrefs() {
    const l = lens();
    return `${backBar()}<div><h2 class="h2">Настройки</h2></div>
      <div class="card stack"><p class="eyebrow">Оптика мира</p><div class="tabs">${[['paradise', 'РАЙ'], ['cyber', 'CYBER'], ['', 'Как в системе']].map(([k, n]) => `<button data-act="lens" data-arg="${k}" aria-selected="${(l || '') === k}">${n}</button>`).join('')}</div><p class="small">Оптика меняет только художественный язык. Факты, личности, права и происхождение материалов остаются теми же.</p></div>
      <div class="card stack"><p class="eyebrow">Источник мира</p><div class="tabs"><button data-act="source" data-arg="snapshot" aria-selected="${S().source !== 'live'}">Снимок 12.11</button><button data-act="source" data-arg="live" aria-selected="${S().source === 'live'}">Живые данные</button></div><p class="small">«Живые данные» читают публичный мир с сервера, адрес которого задаётся при развёртывании. Личное всегда остаётся на устройстве, пока не выложен шлюз.</p></div>
      <div class="card stack"><p class="eyebrow">Что уже работает на сервере</p>
        ${[['Мир, места, уровни, проводники', 'world'], ['Ленты и новости', 'feeds'], ['Мой профиль и вход', 'me'], ['Резонанс и связи', 'resonance'], ['Диалоги с людьми', 'messages'], ['Проводники в приложении', 'assistants'], ['Загрузка и заявки', 'media'], ['Согласия', 'consents'], ['Присутствие на карте', 'presence'], ['Доказательства уровней', 'proofs'], ['Оплата через Telegram', 'payments']].map((r) => `<div class="row between"><span style="font-size:14px;font-weight:700">${r[0]}</span>${statusChip(TZ.api.status[r[1]])}</div>`).join('')}</div>
      <div class="card stack"><button class="btn block" data-act="intro">Показать вступление</button><button class="btn block" data-act="reset">Стереть мои данные на этом устройстве</button><p class="small">TRIZNES · единое приложение · ${TZ.config.version} · прошивка ${TZ.canon.version}</p></div>`;
  }
  const notFound = () => `${backBar()}<div class="card empty">Такого экрана нет.</div>`;
  const backBar = () => `<button class="back" data-act="back">${I.back}Назад</button>`;

  /* ---------- каркас ---------- */
  const TITLES = { sun: ['SOCHIWOOD 24/7', 'жизнь в игре'], me: ['Я', 'мой персонаж'], bonds: ['МОИ СВЯЗИ', 'резонанс'], dialogs: ['ДИАЛОГИ', 'проводники и персонажи'], signals: ['СИГНАЛЫ', 'что произошло'] };
  function render() {
    const r = route(); let body, tab = r;
    if (r === 'sun') body = viewSun();
    else if (r === 'me') body = viewMe();
    else if (r === 'bonds') body = viewBonds();
    else if (r === 'dialogs') body = viewDialogs();
    else if (r === 'signals') body = viewSignals();
    else if (r === 'path') { body = viewPath(); tab = 'me'; }
    else if (r === 'cards') { body = viewCards(); tab = 'me'; }
    else if (r === 'consents') { body = viewConsents(); tab = 'me'; }
    else if (r === 'saved') { body = viewSaved(); tab = 'me'; }
    else if (r === 'prefs') { body = viewPrefs(); tab = 'me'; }
    else if (r === 'city') { body = viewCity(); tab = 'sun'; }
    else if (r === 'farm') { body = viewFarm(); tab = 'sun'; }
    else if (r === 'worlds') { body = viewWorlds(); tab = 'sun'; }
    else if (r === 'podcast') { body = viewPodcast(); tab = 'sun'; }
    else if (r.startsWith('w-')) { body = viewWorld(r.slice(2)); tab = 'sun'; }
    else if (r.startsWith('n-')) { body = viewNeuro(r.slice(2)); tab = 'dialogs'; }
    else if (r.startsWith('p-')) { body = viewProfile(r.slice(2)); tab = 'bonds'; }
    else if (r.startsWith('r-')) { body = viewResonance(r.slice(2)); tab = 'bonds'; }
    else if (r.startsWith('chat-') || r.startsWith('talk-')) { body = viewChat(r); tab = 'dialogs'; }
    else { body = viewSun(); tab = 'sun'; }
    const t = TITLES[tab] || TITLES.sun, unseen = Math.max(0, S().signals.length - S().seenSignals);
    const nav = (k, icon, label) => `<button data-act="open" data-arg="${k}" ${tab === k ? 'aria-current="page"' : ''}>${icon}<span>${label}</span>${k === 'signals' && unseen ? `<span class="badge-n">${unseen}</span>` : ''}</button>`;
    app.innerHTML = `
      <header class="bar"><button class="icon-btn" data-act="drawer" aria-label="Меню">${I.menu}</button>
        <div class="bar-title"><h1>${t[0]}</h1><p>${t[1]}</p></div>
        <button class="lens" data-act="lens-flip" aria-label="Оптика: ${isCyber() ? 'CYBER' : 'РАЙ'}"><i></i></button></header>
      <main>${body}</main>
      <nav class="nav" aria-label="Основное"><div class="nav-in">
        ${nav('me', I.me, 'Я')}${nav('bonds', I.bonds, 'СВЯЗИ')}
        <button class="sunbtn" data-act="open" data-arg="sun" ${tab === 'sun' ? 'aria-current="page"' : ''}><span class="body"><span class="sunball"></span></span><span>24/7</span></button>
        ${nav('dialogs', I.chat, 'ДИАЛОГИ')}${nav('signals', I.bell, 'СИГНАЛЫ')}</div></nav>
      ${ui.drawer ? drawer() : ''}${ui.sheet ? sheet() : ''}`;
    const chat = $('#chat'); if (chat) window.scrollTo(0, document.body.scrollHeight);
  }
  function drawer() {
    const item = (k, name, sub, world) => `<button class="menu-item" data-act="open" data-arg="${k}">${world ? `<span class="body">${TZ.avatar.planet(world)}</span>` : '<span class="body"><span class="sunball" style="animation:none"></span></span>'}<span class="grow">${name}<small>${sub}</small></span></button>`;
    const W = (s) => find(TZ.worlds, s);
    return `<div class="scrim" data-act="close"></div><aside class="drawer" aria-label="Меню">
      <p class="eyebrow" style="padding:4px 12px 8px">${esc(TZ.canon.axiom)}</p>
      ${item('path', 'МОЙ МИР', 'путь творца · 13 уровней', W('theatre-tuz'))}
      ${item('city', 'НАШ ГОРОД', 'карта мест · Сочи сейчас', W('sochi'))}
      ${item('worlds', 'МИРЫ', 'сообщества и планеты', W('pink-noize'))}
      ${item('farm', 'НЕЙРОФЕРМА', 'оригиналы, монтаж, заявки', W('sochiwood'))}
      ${item('podcast', 'ПОДКАСТ', 'Жизнь в игре · 4 эпизода', W('za-lyubov'))}
      ${item('saved', 'Сохранённое', 'мои материалы', W('masskazhka-yana-rut'))}
      ${item('cards', 'Клубная карта', 'BLACK · SILVER · GOLD', W('andrey-dragunov-trading-house'))}
      ${item('consents', 'Согласия', 'раздельно и с правом отзыва', W('sochi'))}
      ${item('prefs', 'Настройки', 'оптика, источник данных')}
    </aside>`;
  }
  function sheet() {
    let inner = '';
    if (ui.sheet === 'hint') inner = `<h3 class="h3">Отражение</h3><p>Это мягкое описание, сформированное на основе твоих действий.</p><p class="sub">Оно не диагноз и не оценка. Оно есть только у тебя и только про тебя: о других людях приложение таких выводов не делает.</p><button class="btn block" data-act="close">Понятно</button>`;
    else if (ui.sheet === 'mask') {
      const m = S().me;
      inner = `<h3 class="h3">Образ персонажа</h3><p class="sub">Уровень 4 «МАСКА»: три цвета — твой личный свет. Лицо не используется; фото ты добавишь сам, когда решишь.</p>
        <div style="display:grid;place-items:center">${TZ.avatar.mine(110)}</div>
        ${[0, 1, 2].map((i) => `<p class="swlabel">${['Цвет образа', 'Цвет пути', 'Личный свет'][i]}</p><div class="swatches">${Object.keys(TZ.colors).filter((c) => c !== 'white').map((c) => `<button class="swatch" style="--c:${TZ.colors[c]}" data-act="color" data-arg="${i}:${c}" aria-pressed="${m.colors[i] === c}" aria-label="${c}"></button>`).join('')}</div>`).join('')}
        <div class="tabs"><button data-act="shape" data-arg="figure" aria-selected="${m.shape !== 'star'}">Человечек</button><button data-act="shape" data-arg="star" aria-selected="${m.shape === 'star'}">Звезда</button></div>
        <button class="btn primary block" data-act="close">Готово</button>`;
    }
    return `<div class="scrim" data-act="close"></div><section class="sheet"><div class="sheet-in">${inner}</div></section>`;
  }

  /* ---------- действия ---------- */
  const acts = {
    open: (a) => go(a), back, close: () => { ui.drawer = false; ui.sheet = null; render(); },
    drawer: () => { ui.drawer = true; render(); },
    sheet: (a) => { ui.sheet = a; render(); },
    planet: (a) => { ui.feedWorld = a || null; ui.feedTab = 'flow'; render(); },
    'feed-tab': (a) => { ui.feedTab = a; render(); }, 'bonds-tab': (a) => { ui.bondsTab = a; render(); },
    'compose-on': () => { ui.compose = true; render(); const t = $('#post-text'); if (t) t.focus(); }, 'compose-off': () => { ui.compose = false; render(); },
    'post-add': () => {
      const text = ($('#post-text').value || '').trim(), world = $('#post-world').value || null;
      if (!text) return toast('Напиши хотя бы одну строку');
      S().posts.unshift({ id: TZ.uid(), text, world, at: new Date().toISOString() }); S().stats.posts++;
      ui.compose = false; ui.feedTab = 'mine'; TZ.save(); render(); toast('Импульс сохранён');
    },
    'post-del': (a) => { S().posts = S().posts.filter((p) => p.id !== a); TZ.save(); render(); },
    like: (a, ev) => {
      const it = itemById(a); if (!it) return; const on = !S().likes[a]; S().likes[a] = on;
      TZ.logic.bump(it.tags, on ? 1 : -1); S().stats.likes += on ? 1 : -1;
      if (on) { heartAt(ev.clientX, ev.clientY); if (it.tags.length) toast('+1 · ' + it.tags.map((t) => TZ.tags.find((x) => x.id === t).name).join(' · ')); }
      TZ.save(); render();
    },
    save: (a) => { S().saves[a] = !S().saves[a]; TZ.save(); render(); },
    love: (a) => { const w = S().weights; w[a] = w[a] > 0 ? 0 : 2; TZ.save(); render(); },
    bond: (a) => {
      const on = !S().bonds[a]; S().bonds[a] = on; const p = find(TZ.profiles, a);
      if (on) { TZ.logic.signal(p.name + ' — в твоём резонансе', 'r-' + a); toast('В резонансе'); }
      TZ.save(); render();
    },
    join: (a) => { const on = !S().joined[a]; S().joined[a] = on; if (on) TZ.logic.signal('Ты вошёл в мир ' + find(TZ.worlds, a).name, 'w-' + a); TZ.save(); render(); },
    consent: (a) => { const c = S().consents; if (c[a]) delete c[a]; else c[a] = new Date().toISOString(); TZ.save(); render(); },
    'level-done': () => { if (S().level <= 13) { const l = TZ.seedWorld.levels[S().level - 1]; TZ.logic.signal('Уровень ' + l.no + ' · ' + l.title + ' — отмечен тобой', 'path'); S().level++; TZ.save(); render(); toast('Отмечено'); } },
    place: (a) => { ui.place = a; render(); },
    job: (a) => { S().jobs.push({ id: TZ.uid(), upload: a, state: 'draft', key: TZ.idempotencyKey(), at: new Date().toISOString() }); TZ.save(); render(); toast('Заявка — черновик на устройстве'); },
    color: (a) => { const [i, c] = a.split(':'); S().me.colors[+i] = c; TZ.save(); render(); },
    shape: (a) => { S().me.shape = a; TZ.save(); render(); },
    lens: (a) => { applyLens(a || null); render(); },
    'lens-flip': () => { applyLens(isCyber() ? 'paradise' : 'cyber'); render(); },
    source: async (a) => {
      if (a === 'live') {
        toast('Читаю публичный мир…');
        try { await TZ.api.refreshWorld(); S().source = 'live'; toast('Живые данные загружены'); }
        catch (e) { S().source = 'snapshot'; toast(String(e.message) === 'server_not_configured' ? 'Адрес сервера не задан в этой сборке — остаётся снимок' : 'Сервер недоступен отсюда — остаётся снимок', true); }
      } else { S().source = 'snapshot'; toast('Снимок 12.11 вернётся после перезапуска'); }
      TZ.save(); render();
    },
    intro: () => intro(true),
    reset: (a, ev, el) => { if (el.dataset.sure) { TZ.reset(); toast('Данные стёрты'); go('sun'); render(); } else { el.dataset.sure = '1'; el.textContent = 'Нажми ещё раз — стереть безвозвратно'; } }
  };
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-act]'); if (!el) return;
    const fn = acts[el.dataset.act]; if (fn) { ev.preventDefault(); fn(el.dataset.arg, ev, el); }
  });
  document.addEventListener('submit', (ev) => {
    const f = ev.target.closest('[data-form]'); if (!f) return; ev.preventDefault();
    if (f.dataset.form === 'name') {
      const name = (f.elements.name.value || '').trim(); if (!name) return toast('Назови персонажа');
      S().me.name = name; TZ.logic.signal('ИСКРА: персонаж ' + name + ' вошёл в мир', 'me'); TZ.save(); render();
    } else if (f.dataset.form === 'msg') {
      const text = (f.elements.text.value || '').trim(); if (!text) return; const id = f.dataset.arg, c = chatOf(id);
      c.msgs.push({ from: 'me', text, at: Date.now() }); S().stats.messages++;
      if (id.startsWith('chat-')) agentReply(find(TZ.agents, id.slice(5)), text);
      TZ.save(); render(); const inp = $('.composer input'); if (inp) inp.focus();
    }
  });
  document.addEventListener('change', async (ev) => {
    if (ev.target.id !== 'file' || !ev.target.files[0]) return;
    const f = ev.target.files[0]; toast('Считаю отпечаток…');
    let sha = null; try { sha = f.size <= 300 * 1048576 ? await TZ.sha256(f) : null; } catch (e) {}
    S().uploads.unshift({ id: TZ.uid(), name: f.name, type: f.type, size: f.size, sha, at: new Date().toISOString() }); S().uploads = S().uploads.slice(0, 20);
    TZ.save(); render(); toast(sha ? 'Оригинал принят на устройстве' : 'Файл большой — отпечаток посчитает сервер');
  });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && (ui.drawer || ui.sheet)) acts.close(); });

  /* ---------- вступление: короткое, пропускается касанием ---------- */
  function intro(force) {
    if (!force && S().introSeen) return;
    const el = document.createElement('div'); el.className = 'intro'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Вступление');
    el.innerHTML = `<div><div class="orbz"><span class="sunball"></span></div><h2>${esc(TZ.canon.axiom)}</h2><p>ЖИЗНЬ В ИГРЕ · ${esc(TZ.canon.cityGoal)}</p></div>`;
    const done = () => { el.remove(); S().introSeen = true; TZ.save(); };
    el.addEventListener('click', done); el.addEventListener('animationend', (e) => { if (e.animationName === 'introout') done(); });
    document.body.appendChild(el); setTimeout(done, 4200);
  }

  /* ---------- запуск ---------- */
  applyLens(lens());
  TZ.sky.start();
  render();
  TZ.avatar.startMirror();
  intro(false);
  if (S().source === 'live') TZ.api.refreshWorld().then(render).catch(() => {});
})();
