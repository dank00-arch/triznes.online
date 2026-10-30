/* TRIZNES Launch UI — Living World backend adapter.
   Public data only. Real people stay authoritative; absent portraits fall back to initials.
   FACT / archive / artistic origin stay visibly separated by backend fields. */
(() => {
  'use strict';

  const BASE = 'https://bbxhhtpmbtgfaxamgksf.supabase.co/rest/v1/rpc/';
  const KEY = 'sb_publishable_aFTiVGlsJxeeutL_gEZaKA_S9VyKaHS';
  const state = { world:null, liveNews:[], game:[] };

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const arr = (value) => Array.isArray(value) ? value : [];
  const initials = (name='TRIZNES') => String(name).split(/\s+/).filter(Boolean).slice(0,2).map((part) => part[0]).join('').toUpperCase();
  const pick = (object, ...keys) => keys.map((key) => object?.[key]).find((value) => value !== undefined && value !== null && value !== '');
  const path = () => (location.pathname.split('/').pop() || 'home.html').replace('.html','');

  async function rpc(name, body={}) {
    const response = await fetch(BASE + name, {
      method:'POST',
      headers:{ apikey:KEY, 'Content-Type':'application/json' },
      body:JSON.stringify(body),
      cache:'no-store'
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(`${name}_failed`);
    return data;
  }

  function profiles(){ return arr(state.world?.profiles); }
  function publications(){ return arr(state.world?.publications || state.world?.publication_cards); }
  function chronicle(){ return arr(state.world?.news); }
  function places(){ return arr(state.world?.places); }
  function communities(){ return arr(state.world?.communities); }

  function profileId(profile){ return pick(profile,'slug','id') || 'character'; }
  function profileName(profile){ return pick(profile,'display_name','name','title') || 'Персонаж TRIZNES'; }
  function profileRole(profile){ return pick(profile,'role_label','role') || 'Роль раскрывается'; }
  function profileCard(profile){ return pick(profile,'card_label','card') || 'TRIZNES'; }
  function profileCommunity(profile){ return pick(profile,'community_slug','community') || 'TRIZNES'; }
  function profileOrigin(profile){ return String(pick(profile,'visual_origin','origin_type','identity_status') || 'PROFILE').toUpperCase(); }
  function profileIdea(profile){ return pick(profile,'idea','bio') || 'Идея раскрывается самим человеком.'; }
  function profileDream(profile){ return pick(profile,'dream') || 'Путь к мечте формируется вместе с героем.'; }
  function profileAlias(profile){ return pick(profile,'alias') || profileId(profile); }

  function portrait(profile, decorative=false){
    const url = pick(profile,'portrait_url','image_url');
    const name = profileName(profile);
    if (url) {
      return `<img src="${esc(url)}" alt="${decorative ? '' : esc(name)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="tc-monogram" hidden>${esc(initials(name))}</span>`;
    }
    return `<span class="tc-monogram">${esc(initials(name))}</span>`;
  }

  function selectedProfile(){
    const list = profiles();
    if (!list.length) return null;
    const requested = new URLSearchParams(location.search).get('character') || localStorage.getItem('triznes-active-character') || 'daniel';
    return list.find((profile) => profileId(profile) === requested) || list[0];
  }

  function selectedCommunity(){
    const list = communities();
    if (!list.length) return null;
    const requested = new URLSearchParams(location.search).get('community');
    return list.find((community) => pick(community,'slug','id') === requested) || list[0];
  }

  function selectedPlace(){
    const list = places();
    if (!list.length) return null;
    const requested = new URLSearchParams(location.search).get('place');
    return list.find((place) => pick(place,'slug','id') === requested) || list[0];
  }

  function originClass(origin=''){
    const value = String(origin).toUpperCase();
    if (value.includes('REAL')) return 'real';
    if (value.includes('ARCHIVE')) return 'archive';
    if (value.includes('GENERATED')) return 'generated';
    if (value.includes('AI')) return 'ai';
    return '';
  }

  function hydratePersonCard(card, profile){
    if (!card || !profile) return;
    const media = card.querySelector('.media');
    const origin = profileOrigin(profile);
    if (media) media.innerHTML = `<span class="chip ${originClass(origin)} origin"><span class="dot"></span>${esc(origin)}</span>${portrait(profile)}`;
    const name = card.querySelector('.name'); if (name) name.textContent = profileName(profile);
    const role = card.querySelector('.role'); if (role) role.textContent = profileRole(profile);
    const meta = card.querySelector('.muted'); if (meta) meta.textContent = profileCommunity(profile);
    card.tabIndex = 0;
    card.dataset.character = profileId(profile);
    card.onclick = () => location.href = `character.html?character=${encodeURIComponent(profileId(profile))}`;
  }

  function renderPublication(card, item){
    if (!card || !item) return;
    const title = card.querySelector('.title');
    if (title) title.textContent = pick(item,'title','canonical_key') || 'Публикация TRIZNES';
    const meta = card.querySelector('.meta');
    if (meta) {
      const platforms = arr(item.platforms).join(' · ') || pick(item,'platform') || 'TRIZNES';
      meta.textContent = `${pick(item,'content_type','series') || 'Кино'} · ${platforms}`;
    }
    const media = card.querySelector('.media');
    if (media) {
      const origin = String(pick(item,'origin_type') || 'REAL').toUpperCase();
      const chip = media.querySelector('.origin');
      if (chip) { chip.className = `chip ${originClass(origin)} origin`; chip.innerHTML = `<span class="dot"></span>${esc(origin)}`; }
    }
    card.style.cursor = 'pointer';
    card.onclick = () => { location.href = '/watch.html'; };
  }

  function renderPulse(nodes, items){
    nodes.forEach((node,index) => {
      const item = items[index];
      if (!item) return;
      const title = pick(item,'title','headline','name') || 'Событие TRIZNES';
      const status = String(pick(item,'reality_status','news_type','origin_type') || 'ХРОНИКА').toUpperCase();
      node.innerHTML = `<span class="pdot"></span><div class="ptxt"><b>${esc(title)}</b><div class="muted t-caption">${esc(status)} · источник сохранён в Living World</div></div><span class="ptime">хроника</span>`;
    });
  }

  function hydrateEntry(){
    const list = profiles();
    const live = [...document.querySelectorAll('.chip.ok')].find((node) => /в игре/i.test(node.textContent));
    if (live) live.innerHTML = `<span class="dot"></span>${list.length} героев в живом контуре`;
    document.querySelectorAll('.char-card').forEach((card,index) => hydratePersonCard(card,list[index]));
  }

  function hydrateHome(){
    const profile = selectedProfile();
    if (!profile) return;
    const hero = document.querySelector('.hero');
    if (hero) {
      const media = hero.querySelector('.media');
      if (media) media.innerHTML = `<span class="chip ${originClass(profileOrigin(profile))} origin"><span class="dot"></span>${esc(profileOrigin(profile))}</span>${portrait(profile)}`;
      const title = hero.querySelector('h1'); if (title) title.textContent = profileName(profile);
      const alias = title?.nextElementSibling; if (alias) alias.textContent = `@${profileAlias(profile)}`;
      const facts = hero.querySelectorAll('.idline span');
      if (facts[0]) facts[0].textContent = profileIdea(profile);
      if (facts[1]) facts[1].textContent = profileDream(profile);
      const role = hero.querySelector('.t-caption[style*="text-transform"]'); if (role) role.textContent = `Роль · ${profileRole(profile)}`;
      const cardChip = [...hero.querySelectorAll('.chip')].find((node) => /black|silver|gold|доступ|player/i.test(node.textContent));
      if (cardChip) cardChip.textContent = `${profileCard(profile)} · профиль мира`;
      const cta = hero.querySelector('.btn.primary'); if (cta) cta.href = `character.html?character=${encodeURIComponent(profileId(profile))}`;
    }
    const roster = profiles().filter((item) => profileId(item) !== profileId(profile)).slice(0,3);
    document.querySelectorAll('.char-card').forEach((card,index) => hydratePersonCard(card,roster[index]));
    document.querySelectorAll('.film-card').forEach((card,index) => renderPublication(card,publications()[index]));
    renderPulse([...document.querySelectorAll('.pulse .item')], [...chronicle(), ...state.game]);
  }

  function hydrateCharacter(){
    const profile = selectedProfile();
    if (!profile) return;
    localStorage.setItem('triznes-active-character',profileId(profile));
    const cover = document.querySelector('.screen>section:first-of-type .media');
    if (cover) cover.innerHTML = `<span class="chip ${originClass(profileOrigin(profile))} origin" style="top:14px;left:14px"><span class="dot"></span>${esc(profileOrigin(profile))}</span>${portrait(profile)}`;
    const identity = document.querySelector('.screen>section:nth-of-type(2)');
    if (identity) {
      const avatar = identity.querySelector('.avatar'); if (avatar) avatar.innerHTML = portrait(profile,true);
      const chips = identity.querySelectorAll('.chip');
      if (chips[0]) chips[0].innerHTML = `<span class="dot"></span>${esc(profileCard(profile))}`;
      if (chips[1]) chips[1].textContent = profileRole(profile);
      const title = identity.querySelector('h1'); if (title) title.textContent = profileName(profile);
      const alias = title?.nextElementSibling; if (alias) alias.textContent = `@${profileAlias(profile)}`;
      const manifesto = identity.querySelector('p'); if (manifesto) manifesto.textContent = `«${profileIdea(profile)}»`;
    }
    const facets = document.querySelectorAll('.facets .facet p');
    if (facets[0]) facets[0].textContent = profileIdea(profile);
    if (facets[1]) facets[1].textContent = profileDream(profile);
    const existing = document.querySelector('.tc-character-switcher'); if (existing) existing.remove();
    const switcher = document.createElement('nav');
    switcher.className = 'tc-character-switcher';
    switcher.setAttribute('aria-label','Герои Living World');
    switcher.innerHTML = profiles().map((item) => `<a class="${profileId(item) === profileId(profile) ? 'on' : ''}" href="character.html?character=${encodeURIComponent(profileId(item))}" title="${esc(profileName(item))}"><span>${esc(initials(profileName(item)))}</span><b>${esc(profileName(item))}</b></a>`).join('');
    document.querySelector('.screen')?.prepend(switcher);
    document.querySelectorAll('.film-card').forEach((card,index) => renderPublication(card,publications()[index]));
  }

  function hydrateMap(){
    const list = places();
    document.querySelectorAll('.marker .lab').forEach((label,index) => {
      const place = list[index];
      if (place) label.textContent = pick(place,'name','title') || 'Место TRIZNES';
    });
    const place = selectedPlace();
    const sheet = document.querySelector('.sheet');
    if (sheet && place) {
      const title = sheet.querySelector('.t-h2'); if (title) title.textContent = pick(place,'name','title') || 'Место TRIZNES';
      const eyebrow = sheet.querySelector('.t-eyebrow'); if (eyebrow) eyebrow.textContent = `${pick(place,'category') || 'Место'} · ${pick(place,'city') || 'Сочи'}`;
      const origin = String(pick(place,'reality_status','origin_type') || 'REAL').toUpperCase();
      const chip = sheet.querySelector('.origin'); if (chip) { chip.className = `chip ${originClass(origin)} origin`; chip.innerHTML = `<span class="dot"></span>${esc(origin)}`; }
      const status = sheet.querySelector('.statusbar .l'); if (status) status.innerHTML = `<span class="pdot"></span>${esc(pick(place,'description') || 'Реальная точка Living World')}`;
      const cta = sheet.querySelector('.btn.primary'); if (cta) { cta.href = `boards.html?place=${encodeURIComponent(pick(place,'slug','id') || '')}`; cta.lastChild.textContent = ' Продолжить сцену →'; }
    }
  }

  function hydrateSochiwood(){
    const pubs = publications();
    const hero = pubs[0];
    const heroTitle = document.querySelector('.page-sochiwood h1');
    if (heroTitle) heroTitle.textContent = pick(hero,'title') || 'SOCHIWOOD · КИНОТЕАТР МИРА';
    const heroMeta = heroTitle?.nextElementSibling; if (heroMeta?.classList.contains('muted')) heroMeta.textContent = `${pick(hero,'content_type') || 'Кино'} · безопасный публичный каталог`;
    const heroCopy = heroTitle?.parentElement?.querySelector('p'); if (heroCopy) heroCopy.textContent = 'Внутри платформы кино связано с героями, местами и хроникой. Зрительский просмотр остаётся в отдельном кинотеатре.';
    document.querySelectorAll('.page-sochiwood .film-card').forEach((card,index) => renderPublication(card,pubs[index]));
    document.querySelectorAll('.page-sochiwood a.btn').forEach((link) => {
      if (/смотреть|трейлер/i.test(link.textContent)) link.href = '/watch.html';
    });
    const allHall = [...document.querySelectorAll('.page-sochiwood a')].find((link) => /весь зал/i.test(link.textContent));
    if (allHall) allHall.href = '/watch.html';
    if (!document.querySelector('.tc-viewer-boundary')) {
      const section = document.querySelector('.page-sochiwood .section');
      section?.insertAdjacentHTML('beforebegin','<section class="section tc-viewer-boundary"><div class="panel" style="padding:18px"><div class="t-eyebrow">ЗРИТЕЛЬСКИЙ СЛОЙ</div><h2 class="t-h3" style="margin-top:6px">Старая публичная версия остаётся кинотеатром</h2><p class="muted" style="margin-top:8px">Здесь — внутренняя система мира. Для просмотра готового кино открывается отдельный публичный зал.</p><a class="btn primary block" href="/watch.html" style="margin-top:12px">Открыть кинотеатр →</a></div></section>');
    }
  }

  function hydrateCommunity(){
    const community = selectedCommunity();
    if (!community) return;
    const slug = pick(community,'slug','id') || '';
    const name = pick(community,'name','title') || 'Сообщество TRIZNES';
    const title = document.querySelector('.page-community h1'); if (title) title.textContent = name;
    const copy = title?.nextElementSibling; if (copy) copy.textContent = pick(community,'description','summary','idea') || 'Самостоятельный мир внутри TRIZNES.';
    const members = profiles().filter((profile) => profileCommunity(profile) === slug);
    const countChip = [...document.querySelectorAll('.page-community .chip.ok')][0]; if (countChip) countChip.innerHTML = `<span class="dot"></span>${members.length} участников в профилях мира`;
    const facets = document.querySelectorAll('.page-community .facets .facet p');
    if (facets[0]) facets[0].textContent = pick(community,'idea','description') || 'Идея сообщества хранится в Living World.';
    if (facets[1]) facets[1].textContent = pick(community,'dream') || pick(community,'description') || 'Мечта сообщества развивается через реальные действия и сцены.';
    const avatars = document.querySelectorAll('.page-community .avgrid .avatar');
    avatars.forEach((avatar,index) => { if (members[index]) avatar.textContent = initials(profileName(members[index])); });
    const more = document.querySelector('.page-community .avgrid .more'); if (more) more.textContent = members.length > avatars.length ? `+${members.length - avatars.length}` : '';
    document.querySelectorAll('.page-community .film-card').forEach((card,index) => renderPublication(card,publications()[index]));
    const nearby = document.querySelectorAll('.page-community .section:last-of-type .card b');
    communities().filter((item) => pick(item,'slug','id') !== slug).slice(0,nearby.length).forEach((item,index) => { nearby[index].textContent = pick(item,'name','title') || 'Мир TRIZNES'; });
  }

  function hydrateBoards(){
    const news = [...chronicle(), ...state.liveNews].slice(0,3);
    document.querySelectorAll('.page-boards .sigcard .t-h3').forEach((node,index) => { if (news[index]) node.textContent = pick(news[index],'title','headline') || node.textContent; });
    const first = selectedProfile();
    const board = document.querySelector('.page-boards .bcard');
    if (board && first) {
      const name = board.querySelector('b'); if (name) name.textContent = profileName(first);
      const role = board.querySelector('.muted'); if (role) role.textContent = profileRole(first);
    }
    const place = selectedPlace();
    const placeTitle = [...document.querySelectorAll('.page-boards h3')].find((node) => /название места/i.test(node.textContent));
    if (placeTitle && place) placeTitle.textContent = pick(place,'name') || placeTitle.textContent;
  }

  function hydrateNeurofarm(){
    const pubs = publications();
    document.querySelectorAll('.page-neurofarm .film-card').forEach((card,index) => renderPublication(card,pubs[index]));
    document.querySelectorAll('.page-neurofarm *').forEach((node) => {
      if (node.children.length) return;
      if (/Название проекта/i.test(node.textContent) && pubs[0]) node.textContent = node.textContent.replace(/Название проекта/g,pick(pubs[0],'title') || 'Публикация TRIZNES');
    });
  }

  function hydratePult(){
    const list = profiles().slice(0,3);
    document.querySelectorAll('.reqrow').forEach((row,index) => {
      const profile = list[index]; if (!profile) return;
      const avatar = row.querySelector('.avatar'); if (avatar) avatar.textContent = initials(profileName(profile));
      const name = row.querySelector('.who b'); if (name) name.textContent = profileName(profile);
      const sub = row.querySelector('.who small'); if (sub) sub.textContent = `${profileRole(profile)} · ${profileCommunity(profile)}`;
    });
    const signals = [...chronicle(), ...state.game].slice(0,3);
    document.querySelectorAll('.sigcard .t-h3').forEach((node,index) => { if (signals[index]) node.textContent = pick(signals[index],'title','headline') || node.textContent; });
  }

  function connectRoutes(){
    const rules = [
      [/продолжить свою историю|вся история/i,'character.html'],
      [/снять сейчас|новый импульс|все форматы/i,'neurofarm.html'],
      [/движений рядом|события|начать сцену здесь/i,'world-map.html'],
      [/все люди|все персонажи/i,'character.html'],
      [/все проекты/i,'community.html'],
      [/весь зал|смотреть|трейлер/i,'/watch.html'],
      [/вся очередь|весь архив/i,'neurofarm.html'],
      [/сообщества рядом|все миры/i,'community.html'],
      [/написать координатору/i,'https://t.me/danielsassis_bot']
    ];
    document.querySelectorAll('a[href="#"]').forEach((link) => {
      const match = rules.find(([pattern]) => pattern.test(link.textContent.trim()));
      if (match) link.href = match[1];
    });
  }

  function markStatus(ok){
    const status = document.querySelector('.tc-world-status');
    if (!status) return;
    const label = status.querySelector('b');
    if (label) label.textContent = ok ? 'LIVE DATA' : 'UI ONLY';
    status.title = ok ? 'Living World backend подключён' : 'Backend временно недоступен; показан только интерфейс';
  }

  function hydrate(){
    const page = path();
    if (page === 'entry') hydrateEntry();
    if (page === 'home') hydrateHome();
    if (page === 'character') hydrateCharacter();
    if (page === 'world-map') hydrateMap();
    if (page === 'sochiwood') hydrateSochiwood();
    if (page === 'community') hydrateCommunity();
    if (page === 'neurofarm') hydrateNeurofarm();
    if (page === 'boards') hydrateBoards();
    if (page === 'pult') hydratePult();
    connectRoutes();
  }

  async function boot(){
    try {
      const [world, liveNews, game] = await Promise.all([
        rpc('get_triznes_world'),
        rpc('get_triznes_live_news',{p_limit:24}).catch(() => []),
        rpc('get_triznes_game_stories',{p_limit:16}).catch(() => [])
      ]);
      state.world = world || {};
      state.liveNews = arr(liveNews);
      state.game = arr(game);
      hydrate();
      markStatus(true);
      window.TRIZNES_LIVING_WORLD = state;
    } catch (error) {
      console.warn('[TRIZNES] Living World unavailable',error);
      markStatus(false);
      connectRoutes();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();