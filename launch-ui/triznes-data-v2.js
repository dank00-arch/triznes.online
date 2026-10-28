/* TRIZNES Launch UI V2 — canonical public registry + route bridge. No private data. */
(() => {
  'use strict';

  const ASSET = 'https://triznes.online/';
  const characters = [
    { id:'daniel', name:'DANIEL', alias:'APOLLON', role:'Автор · режиссёр · герой в кадре', card:'PLAYER 001', community:'PINK NOIZE', image:'assets/triznes-v48/daniel-player-0001.webp', origin:'REAL', idea:'Превратить путь города в кино, музыку и пространство для раскрытия людей.', dream:'Живой SOCHIWOOD, где путь каждого становится его фильмом.', color:'#45e9ff' },
    { id:'vsevolod-kim', name:'ВСЕВОЛОД КИМ', alias:'ТЕАТР ТУЗ', role:'Ментор · режиссёр ТАК/ТИК', card:'MENTOR', community:'ТЕАТР ТУЗ', image:'assets/triznes-v46/vsevolod-kim.webp', origin:'REAL', idea:'Театральный игровой Коллайдер: восприятие, действие и трансформация.', dream:'Театр, в котором человек учится присутствовать и становится актёром своей жизни.', color:'#d7b5ff' },
    { id:'liberty', name:'LIBERTY', alias:'СВОБОДА', role:'Артистка · персонаж PINK NOIZE', card:'BLACK', community:'PINK NOIZE', image:'assets/triznes-v49/liberty-real-portrait-v1.webp', origin:'REAL', idea:'Свобода быть собой, соединённая с музыкой, образом и личным кино.', dream:'Собственный узнаваемый музыкальный мир и фильм пути.', color:'#ff84cb' },
    { id:'neo', name:'NEO', alias:'НОВЫЙ ВЗГЛЯД', role:'Игрок · герой кибер-мира', card:'BLACK', community:'PINK NOIZE', image:'assets/triznes-v63/neo-game.png', origin:'AI ASSISTED', idea:'Переход из привычной реальности в яркий образ через действие, музыку и город.', dream:'Раскрыть новый взгляд и вывести его на живую сцену.', color:'#8e7dff' },
    { id:'saphir', name:'SAPHIR', alias:'САПФИР', role:'Артист · герой сцены', card:'BLACK', community:'PINK NOIZE', image:'assets/triznes-v63/saphir-stage.png', origin:'AI ASSISTED', idea:'Сценическая энергия и фиолетовый мир, собранные в музыкальный персонаж.', dream:'Премьера, после которой образ узнают с первого кадра.', color:'#b576ff' },
    { id:'dragunov', name:'АНДРЕЙ ДРАГУНОВ', alias:'ТОРГОВЫЙ ДОМ', role:'Предприниматель · проводник инициатив', card:'BLACK', community:'ТОРГОВЫЙ ДОМ', image:'', origin:'PROFILE', idea:'Соединять людей, торговые инициативы и ресурсы в устойчивые проекты.', dream:'Торговый дом нового мира, в котором ценность создают отношения.', color:'#ffc85c' },
    { id:'artem-love', name:'АРТЁМ ЗА ЛЮБОВЬ', alias:'СОЗДАТЕЛЬ', role:'Автор игры · предприниматель', card:'CREATOR', community:'ЗА ЛЮБОВЬ', image:'', origin:'PROFILE', idea:'Масштабировать игру о здоровой, счастливой и осознанной жизни.', dream:'Сообщество, которое выбирает любовь действием.', color:'#ff709f' },
    { id:'dima-neon', name:'ДИМА NEON FUTURIST', alias:'РЕДАКТОР', role:'Редактор контента · артист', card:'EDITOR', community:'PINK NOIZE', image:'', origin:'PROFILE', idea:'Превращать поток городской жизни в ясную визуальную историю.', dream:'Живой монтаж города двадцать четыре на семь.', color:'#42ffbd' },
    { id:'lev', name:'ЛЕВ', alias:'МУЗЫКАНТ', role:'Игрок · музыкальный герой', card:'PLAYER', community:'PINK NOIZE', image:'', origin:'PROFILE', idea:'Музыкальный персонаж с гитарой и собственным визуальным знаком.', dream:'Своя песня и первая сцена.', color:'#ff4fc8' },
    { id:'yana-rut', name:'ЯНА RUT', alias:'ПЕРСОНАЖ', role:'Игрок · участница первой волны', card:'PLAYER', community:'PINK NOIZE', image:'', origin:'PROFILE', idea:'Личный путь формируется вместе с участницей — без навязанного образа.', dream:'Найти точную роль и снять первый эпизод.', color:'#74d9ff' }
  ];

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('');
  const image = (character, decorative = false) => character.image
    ? `<img src="${ASSET}${esc(character.image)}" alt="${decorative ? '' : esc(character.name)}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="tc-monogram" hidden style="--person:${esc(character.color)}">${esc(initials(character.name))}</span>`
    : `<span class="tc-monogram" style="--person:${esc(character.color)}">${esc(initials(character.name))}</span>`;

  function selected() {
    const requested = new URLSearchParams(location.search).get('character') || localStorage.getItem('triznes-active-character') || 'daniel';
    return characters.find((character) => character.id === requested) || characters[0];
  }

  function personCard(card, character) {
    const media = card.querySelector('.media');
    if (media) media.innerHTML = `<span class="chip ${character.origin === 'REAL' ? 'real' : 'ai'} origin"><span class="dot"></span>${esc(character.origin)}</span>${image(character)}`;
    const name = card.querySelector('.name');
    if (name) name.textContent = character.name;
    const role = card.querySelector('.role');
    if (role) role.textContent = character.role;
    const common = card.querySelector('.muted');
    if (common) common.textContent = character.community;
    card.tabIndex = 0;
    card.dataset.character = character.id;
    card.addEventListener('click', () => location.href = `character.html?character=${encodeURIComponent(character.id)}`);
  }

  function hydrateEntry() {
    const live = [...document.querySelectorAll('.chip.ok')].find((node) => node.textContent.includes('в игре'));
    if (live) live.innerHTML = '<span class="dot"></span>10 героев первой волны';
    document.querySelectorAll('.char-card').forEach((card, index) => personCard(card, characters[index]));
  }

  function hydrateHome() {
    const character = selected();
    const hero = document.querySelector('.hero');
    if (hero) {
      const media = hero.querySelector('.media');
      if (media) media.innerHTML = `<span class="chip ${character.origin === 'REAL' ? 'real' : 'ai'} origin"><span class="dot"></span>${esc(character.origin)}</span>${image(character)}`;
      const title = hero.querySelector('h1'); if (title) title.textContent = character.name;
      const alias = title?.nextElementSibling; if (alias) alias.textContent = `@${character.alias.toLowerCase().replace(/\s+/g, '_')}`;
      const facts = hero.querySelectorAll('.idline span');
      if (facts[0]) facts[0].textContent = character.idea;
      if (facts[1]) facts[1].textContent = character.dream;
      const role = hero.querySelector('.t-caption[style*="text-transform"]'); if (role) role.textContent = `Роль · ${character.role}`;
      const card = [...hero.querySelectorAll('.chip')].find((node) => node.textContent.includes('Black')); if (card) card.textContent = `${character.card} · доступ открыт`;
      const cta = hero.querySelector('.btn.primary'); if (cta) cta.href = `character.html?character=${encodeURIComponent(character.id)}`;
    }
    const roster = [characters[2], characters[1], characters[3]];
    const cards = document.querySelectorAll('.char-card');
    cards.forEach((card, index) => personCard(card, roster[index] || characters[index]));
    const scenes = document.querySelectorAll('.film-card .title');
    ['Первое проявление', 'Голос мечты', 'Встреча у Мелодии'].forEach((title, index) => { if (scenes[index]) scenes[index].textContent = title; });
    const sceneMeta = document.querySelectorAll('.film-card .meta');
    ['Квест · можно выполнить сегодня', 'Личная сцена · в своём темпе', 'Городская сцена · маршрут Сочи'].forEach((meta, index) => { if (sceneMeta[index]) sceneMeta[index].textContent = meta; });
    const projects = document.querySelectorAll('.film-card.wide .title');
    ['Жизнь в игре · Сезон 00', 'LIBERTY · Свобода', 'SAPHIR · Фиолетовый знак'].forEach((title, index) => { if (projects[index]) projects[index].textContent = title; });
    const pulse = document.querySelectorAll('.pulse .item');
    if (pulse[0]) pulse[0].innerHTML = '<span class="pdot"></span><div class="ptxt"><b>SOCHIWOOD собирает истории первой волны</b><div class="muted t-caption">Кино · архив проекта</div></div><span class="chip live" style="height:20px">Процесс</span>';
    if (pulse[1]) pulse[1].innerHTML = '<span class="pdot" style="background:var(--violet);box-shadow:0 0 10px var(--violet)"></span><div class="ptxt"><b>PINK NOIZE · музыка персонажей</b><div class="muted t-caption">Сообщество · сцены и клипы</div></div><span class="ptime">архив</span>';
    if (pulse[2]) pulse[2].innerHTML = '<span class="pdot" style="background:var(--gold);box-shadow:0 0 10px var(--gold)"></span><div class="ptxt"><b>Театр ТУЗ · Коллайдер</b><div class="muted t-caption">Восприятие · действие · трансформация</div></div><span class="ptime">путь</span>';
  }

  function hydrateCharacter() {
    const character = selected();
    localStorage.setItem('triznes-active-character', character.id);
    const cover = document.querySelector('.screen>section:first-of-type .media');
    if (cover) cover.innerHTML = `<span class="chip ${character.origin === 'REAL' ? 'real' : 'ai'} origin" style="top:14px;left:14px"><span class="dot"></span>${esc(character.origin)}</span>${image(character)}`;
    const identity = document.querySelector('.screen>section:nth-of-type(2)');
    if (identity) {
      const avatar = identity.querySelector('.avatar'); if (avatar) avatar.innerHTML = image(character, true);
      const chips = identity.querySelectorAll('.chip'); if (chips[0]) chips[0].innerHTML = `<span class="dot"></span>${esc(character.card)} · доступ`; if (chips[1]) chips[1].textContent = character.role;
      const title = identity.querySelector('h1'); if (title) title.textContent = character.name;
      const alias = title?.nextElementSibling; if (alias) alias.textContent = `@${character.alias.toLowerCase().replace(/\s+/g, '_')}`;
      const manifesto = identity.querySelector('p'); if (manifesto) manifesto.textContent = `«${character.idea}»`;
    }
    const facets = document.querySelectorAll('.facets .facet p');
    if (facets[0]) facets[0].textContent = character.idea;
    if (facets[1]) facets[1].textContent = character.dream;
    const switcher = document.createElement('nav');
    switcher.className = 'tc-character-switcher';
    switcher.setAttribute('aria-label', 'Персонажи первой волны');
    switcher.innerHTML = characters.map((item) => `<a class="${item.id === character.id ? 'on' : ''}" href="character.html?character=${encodeURIComponent(item.id)}" title="${esc(item.name)}"><span style="--person:${esc(item.color)}">${esc(initials(item.name))}</span><b>${esc(item.name)}</b></a>`).join('');
    document.querySelector('.screen')?.prepend(switcher);
    const sceneTitles = document.querySelectorAll('.scene .t-h3');
    ['Улыбка · первый сигнал', 'Голос мечты', 'Присутствие в городе'].forEach((title, index) => { if (sceneTitles[index]) sceneTitles[index].textContent = title; });
    const sceneMeta = document.querySelectorAll('.scene .meta');
    ['Мелодия · открытая точка', 'Личная сцена · в своём темпе', 'Медиахаб · маршрут раскрытия'].forEach((meta, index) => { if (sceneMeta[index]) sceneMeta[index].innerHTML = `<svg width="14" height="14"><use href="#i-pin"/></svg>${meta}`; });
    const films = document.querySelectorAll('.film-card .title');
    ['Жизнь в игре · Сезон 00', `${character.name} · путь героя`, 'Город говорит'].forEach((title, index) => { if (films[index]) films[index].textContent = title; });
  }

  function hydrateMap() {
    const labels = document.querySelectorAll('.marker .lab');
    ['DANIEL · APOLLON', 'Медиахаб · персонажи', 'Мелодия · живая сцена', 'Великий Шёлковый путь', 'Театр ТУЗ · Коллайдер', 'Морской вокзал', 'PINK NOIZE'].forEach((label, index) => { if (labels[index]) labels[index].textContent = label; });
    const sheet = document.querySelector('.sheet');
    const title = sheet?.querySelector('.t-h2'); if (title) title.textContent = 'Морской вокзал · Сочи';
    const eyebrow = sheet?.querySelector('.t-eyebrow'); if (eyebrow) eyebrow.textContent = 'Реальная локация · Морпорт';
    const status = sheet?.querySelector('.statusbar'); if (status) status.innerHTML = '<span class="l"><span class="pdot"></span>Точка маршрута · сцена открыта</span><span class="r">квест</span>';
    const count = sheet?.querySelector('.astack')?.nextElementSibling; if (count) count.textContent = 'герои маршрута';
  }

  function hydrateSochiwood() {
    const mainTitle = document.querySelector('.page-sochiwood h1'); if (mainTitle) mainTitle.textContent = 'ЖИЗНЬ В ИГРЕ · СЕЗОН 00';
    const heroCopy = mainTitle?.parentElement?.querySelector('p'); if (heroCopy) heroCopy.textContent = 'Реальные люди Сочи превращают собственный путь, музыку и встречи в общее кино города.';
    const titles = document.querySelectorAll('.film-card .title');
    ['Жизнь в игре', 'Коллайдер ТУЗ', 'LIBERTY · Свобода', 'SAPHIR · Знак', 'Жизнь в игре · Сезон 00', 'PINK NOIZE · Первая волна'].forEach((title, index) => { if (titles[index]) titles[index].textContent = title; });
    const detail = [...document.querySelectorAll('.page-sochiwood h3')].find((node) => node.textContent.includes('Название фильма')); if (detail) detail.textContent = 'ЖИЗНЬ В ИГРЕ · ПЕРВАЯ ВОЛНА';
    document.querySelectorAll('.page-sochiwood .char-card').forEach((card, index) => personCard(card, characters[index]));
    document.querySelectorAll('.page-sochiwood .worldrow small').forEach((node, index) => {
      node.textContent = ['Город · точки, персонажи и реальные истории', 'Коллайдер · восприятие и актёрский путь', 'Музыка · артисты · сообщество'][index] || node.textContent;
    });
    document.querySelectorAll('.page-sochiwood .facet').forEach((facet) => {
      if (facet.textContent.includes('Имя Фамилия')) facet.innerHTML = facet.innerHTML.replace(/Имя Фамилия/g, 'DANIEL').replace(/АБ/g, 'ВК').replace(/ВГ/g, 'LB');
      if (facet.textContent.includes('Название проекта')) facet.innerHTML = facet.innerHTML.replace('Название проекта', 'Жизнь в игре · Сезон 00');
      if (facet.textContent.includes('Название трека')) facet.innerHTML = facet.innerHTML.replace('Название трека', 'PINK NOIZE · музыка фильма');
      if (facet.textContent.includes('214 материалов')) facet.innerHTML = facet.innerHTML.replace('214 материалов', 'архив собирается');
    });
  }

  function hydrateCommunity() {
    const title = document.querySelector('.page-community h1'); if (title) title.textContent = 'ТЕАТР ТУЗ';
    const copy = title?.nextElementSibling; if (copy) copy.textContent = 'Театральный игровой Коллайдер: восприятие, действие и трансформация через искусство.';
    document.querySelectorAll('.page-community .chip.ok').forEach((chip) => { chip.innerHTML = '<span class="dot"></span>первая волна'; });
    const facets = document.querySelectorAll('.page-community .facets .facet p');
    if (facets[0]) facets[0].textContent = 'Настроить восприятие человека и оптику видения действия и смысла через искусство и систему образов.';
    if (facets[1]) facets[1].textContent = 'Провести героя из предлагаемых обстоятельств к осознанному актёрскому и трансформационному опыту.';
    const events = document.querySelectorAll('.page-community .eventrow .ev');
    [['Восприятие · шлюз 01','Коллайдер · Медиахаб'],['Двенадцать сюжетов · шлюз 02','Игровой театральный процесс'],['Трансформация · шлюз 03','Путь из тьмы в свет']].forEach(([name, meta], index) => { if (events[index]) events[index].innerHTML = `<b>${name}</b><small>${meta}</small>`; });
    const projects = document.querySelectorAll('.page-community .film-card .title');
    ['Коллайдер · Восприятие', 'ТАК–ТИК · путь актёра', 'Театр ТУЗ · кино процесса'].forEach((name, index) => { if (projects[index]) projects[index].textContent = name; });
    const nearby = document.querySelectorAll('.page-community .section:last-of-type .card b');
    ['PINK NOIZE', 'ТОРГОВЫЙ ДОМ АНДРЕЯ ДРАГУНОВА', 'SOCHIWOOD'].forEach((name, index) => { if (nearby[index]) nearby[index].textContent = name; });
    document.querySelectorAll('.page-community .section:last-of-type .muted').forEach((node) => { node.textContent = 'мир проекта · профиль сообщества'; });
  }

  function hydrateNeurofarm() {
    document.querySelectorAll('.page-neurofarm *').forEach((node) => {
      if (node.children.length) return;
      if (node.textContent.includes('Название проекта')) node.textContent = node.textContent.replace(/Название проекта/g, 'Жизнь в игре · Сезон 00');
      if (node.textContent.includes('Название сцены')) node.textContent = node.textContent.replace(/Название сцены/g, 'Первое проявление');
    });
  }

  function hydrateBoards() {
    const brand = document.querySelector('.page-boards .brand small'); if (brand) brand.textContent = 'Доска · Жизнь в игре';
    const board = document.querySelector('.page-boards .bcard');
    if (board) {
      const name = board.querySelector('b'); if (name) name.textContent = 'DANIEL · APOLLON';
      const role = board.querySelector('.muted'); if (role) role.textContent = 'Автор · режиссёр · герой';
    }
    const place = [...document.querySelectorAll('.page-boards h3')].find((node) => node.textContent.includes('Название места')); if (place) place.textContent = 'Медиахаб ТРИЗНЕС';
    const track = [...document.querySelectorAll('.page-boards .muted')].find((node) => node.textContent.includes('Название трека')); if (track) track.textContent = 'PINK NOIZE · музыка сцены';
    const responsible = [...document.querySelectorAll('.page-boards .muted')].find((node) => node.textContent.includes('ответственный')); if (responsible) responsible.textContent = 'DANIEL · режиссура';
  }

  function connectRoutes() {
    const platform = location.hostname === '127.0.0.1' || location.hostname === 'localhost' ? '../../website-platform/index.html' : '/index.html';
    document.querySelectorAll('a[href="register.html"]').forEach((link) => { link.href = `${platform}?entry=login#profile`; });
    const rules = [
      [/продолжить свою историю|вся история/i, 'character.html'], [/снять сейчас|новый импульс|все форматы/i, 'neurofarm.html'],
      [/движений рядом|события|начать сцену здесь/i, 'world-map.html'], [/все люди|все персонажи/i, 'character.html'],
      [/все проекты|весь зал|смотреть|трейлер/i, 'sochiwood.html'], [/вся очередь|весь архив/i, 'neurofarm.html'],
      [/сообщества рядом|все миры/i, 'community.html'], [/написать координатору/i, 'https://t.me/danielsassis_bot']
    ];
    document.querySelectorAll('a[href="#"]').forEach((link) => {
      const text = link.textContent.trim();
      const match = rules.find(([pattern]) => pattern.test(text));
      if (match) link.href = match[1];
      else {
        link.setAttribute('aria-disabled', 'true');
        link.addEventListener('click', (event) => { event.preventDefault(); toast('Этот шаг откроется вместе с данными твоего профиля'); });
      }
    });
  }

  function toast(message) {
    document.querySelector('.tc-toast')?.remove();
    const node = document.createElement('div'); node.className = 'tc-toast'; node.textContent = message; document.body.append(node);
    requestAnimationFrame(() => node.classList.add('show'));
    setTimeout(() => node.remove(), 2800);
  }

  function boot() {
    const page = document.body.className.match(/page-([\w-]+)/)?.[1];
    if (page === 'entry') hydrateEntry();
    if (page === 'home') hydrateHome();
    if (page === 'character') hydrateCharacter();
    if (page === 'world-map') hydrateMap();
    if (page === 'sochiwood') hydrateSochiwood();
    if (page === 'community') hydrateCommunity();
    if (page === 'neurofarm') hydrateNeurofarm();
    if (page === 'boards') hydrateBoards();
    connectRoutes();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true }); else boot();
})();
