/* TRIZNES Launch UI V3 — one city, clear navigation, two deterministic visual lenses. */
(() => {
  'use strict';

  const screen = (location.pathname.split('/').pop() || 'home.html').replace('.html', '');
  const WORLD_KEY = 'triznes-world-lens-v2';
  const VALID_WORLDS = new Set(['paradise','cyber']);
  const requestedWorld = (() => {
    const q = new URLSearchParams(location.search).get('world');
    if (VALID_WORLDS.has(q)) return q;
    try { const saved = localStorage.getItem(WORLD_KEY); if (VALID_WORLDS.has(saved)) return saved; } catch (_) {}
    return 'paradise';
  })();

  document.body.classList.add(`page-${screen}`);
  document.body.dataset.world = requestedWorld;
  document.documentElement.dataset.world = requestedWorld;

  const css = [
    ['./triznes-visual-v4.css?v=20261030-wordmark-harmony-v6','triznes-visual-v4.css'],
    ['./world-themes.css?v=20261030-world-split-v2','world-themes.css'],
    ['./world-themes-polish.css?v=20261030-world-split-v2','world-themes-polish.css'],
    ['./navigation-v3.css?v=20261030-nav-v4','navigation-v3.css']
  ];
  css.forEach(([href,key]) => {
    if (document.querySelector(`link[href*="${key}"]`)) return;
    const link=document.createElement('link'); link.rel='stylesheet'; link.href=href; document.head.appendChild(link);
  });

  const manifest = document.createElement('link'); manifest.rel='manifest'; manifest.href='./manifest.webmanifest'; document.head.appendChild(manifest);
  if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});

  const active = (ids) => ids.includes(screen) ? 'on' : '';
  const navGroups = [
    {label:'ЛИЧНОЕ',items:[['home','◉','Ядро','Домой'],['character','◎','Персонаж','Мой путь']]},
    {label:'ГОРОД',items:[['world-map','⌖','Карта','Живой Сочи'],['city-objects','◇','Объекты','Партнёры и места'],['communities','◌','Сообщества','Миры людей']]},
    {label:'СОЗДАНИЕ',items:[['neurofarm','✦','Нейроферма','Медиа → кино'],['boards','⌘','Пульт','Сцены и сигналы'],['sochiwood','▶','Кинотеатр','SOCHIWOOD']]}
  ];

  function navLink(id,icon,title,copy){
    const ids=id==='communities'?['communities','community']:[id];
    return `<a href="${id}.html" class="${active(ids)}" ${active(ids)?'aria-current="page"':''}><em>${icon}</em><span><b>${title}</b><small>${copy}</small></span></a>`;
  }

  function mountRail(){
    if(screen==='entry') return;
    const rail=document.createElement('aside'); rail.className='tc-rail'; rail.setAttribute('aria-label','Навигация TRIZNES');
    rail.innerHTML=`<a class="tc-rail-brand" href="home.html"><img src="./assets/triznes-core-128.png" alt=""><span><b>TRIZNES</b><small>ЖИЗНЬ В ИГРЕ</small></span></a><div class="tc-rail-state"><i></i><span>МИР АКТИВЕН</span><b>СОЧИ · ${requestedWorld==='paradise'?'РАЙ':'CYBER'}</b></div><nav>${navGroups.map(group=>`<div class="tc-nav-section">${group.label}</div>${group.items.map(item=>navLink(...item)).join('')}`).join('')}</nav><a class="tc-rail-apollon" href="https://t.me/danielsassis_bot?start=register" target="_blank" rel="noopener"><i>✦</i><span><b>APOLLON</b><small>идея · мечта · вход</small></span></a>`;
    document.body.prepend(rail);
  }

  function modeSwitch(cls='world-mini'){
    return `<div class="${cls}" role="group" aria-label="Режим мира"><button type="button" data-world-choice="paradise">РАЙ</button><button type="button" data-world-choice="cyber">CYBER</button></div>`;
  }

  function mountCityBar(){
    if(screen==='entry') return;
    const root=document.querySelector('.screen'); if(!root) return;
    const routeOn=(id,also=[])=>[id,...also].includes(screen)?'on':'';
    const bar=document.createElement('nav'); bar.className='tc-citybar'; bar.setAttribute('aria-label','Город TRIZNES');
    bar.innerHTML=`<a class="${routeOn('world-map')}" href="world-map.html"><i>⌖</i>Карта</a><a class="${routeOn('city-objects')}" href="city-objects.html"><i>◇</i>Объекты Сочи</a><a class="${routeOn('communities',['community'])}" href="communities.html"><i>◌</i>Сообщества</a><a class="${routeOn('neurofarm')}" href="neurofarm.html"><i>✦</i>Нейроферма</a><a class="${routeOn('boards')}" href="boards.html"><i>⌘</i>Пульт</a><a class="${routeOn('sochiwood')}" href="sochiwood.html"><i>▶</i>Кино</a><span class="spacer"></span>${modeSwitch()}`;
    root.prepend(bar);
  }

  function mountEntrySwitch(){
    if(screen!=='entry') return;
    const wrap=document.createElement('div'); wrap.className='tc-entry-world'; wrap.innerHTML=`<span>ОПТИКА МИРА</span>${modeSwitch('world-mini')}`; document.body.appendChild(wrap);
  }

  function mountMobileDock(){
    if(screen==='entry') return;
    const dock=document.createElement('nav'); dock.className='tc-mobile-dock'; dock.setAttribute('aria-label','Основная навигация');
    const item=(href,id,icon,label,also=[])=>`<a href="${href}" class="${[id,...also].includes(screen)?'on':''}"><i>${icon}</i><span>${label}</span></a>`;
    dock.innerHTML=[item('character.html','character','◎','Я',['home']),item('world-map.html','world-map','⌖','Карта'),item('city-objects.html','city-objects','◇','Объекты'),item('communities.html','communities','◌','Миры',['community']),item('sochiwood.html','sochiwood','▶','Кино')].join('');
    document.body.appendChild(dock);
  }

  function recolorMap(mode){
    const map=document.querySelector('.page-world-map .mapwrap'); if(!map) return;
    const pairs=mode==='paradise'?[['#78e1bd','#e8c879'],['#b4d88d','#78e1bd']]:[['#2877ff','#ff2ec8'],['#8058ff','#35e9ff']];
    ['#gl1','#gl2'].forEach((sel,i)=>{const grad=map.querySelector(sel);const stops=grad?.querySelectorAll('stop');if(stops?.[0])stops[0].setAttribute('stop-color',pairs[i][0]);if(stops?.[1])stops[1].setAttribute('stop-color',pairs[i][1]);});
  }

  function applyWorld(mode,persist=true){
    if(!VALID_WORLDS.has(mode)) mode='paradise';
    document.body.dataset.world=mode;document.documentElement.dataset.world=mode;
    if(persist){try{localStorage.setItem(WORLD_KEY,mode)}catch(_){}}
    document.querySelectorAll('[data-world-choice]').forEach(btn=>{const on=btn.dataset.worldChoice===mode;btn.classList.toggle('on',on);btn.setAttribute('aria-pressed',String(on));btn.setAttribute('aria-selected',String(on));});
    const state=document.querySelector('.tc-rail-state b');if(state)state.textContent=`СОЧИ · ${mode==='paradise'?'РАЙ':'CYBER'}`;
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=mode==='paradise'?'#07110c':'#02040c';
    recolorMap(mode);window.dispatchEvent(new CustomEvent('triznes:world-change',{detail:{world:mode}}));
  }

  function bindWorldControls(){
    const seg=document.querySelector('.page-world-map .seg');
    seg?.querySelectorAll('button').forEach(btn=>{const t=btn.textContent.toLowerCase();if(/рай/.test(t))btn.dataset.worldChoice='paradise';if(/cyber/.test(t))btn.dataset.worldChoice='cyber';});
    document.addEventListener('click',event=>{const btn=event.target.closest('[data-world-choice]');if(!btn)return;event.preventDefault();applyWorld(btn.dataset.worldChoice,true);});
    applyWorld(requestedWorld,false);
  }

  function mountSpline(){
    if(!['entry','home'].includes(screen)||!window.TRIZNES_SPLINE_PUBLIC_URL)return;
    let url;try{url=new URL(window.TRIZNES_SPLINE_PUBLIC_URL,location.href);if(url.protocol!=='https:'||!(url.hostname==='spline.design'||url.hostname.endsWith('.spline.design')))return}catch(_){return}
    const hero=screen==='entry'?document.querySelector('.screen>section:first-of-type'):document.querySelector('.hero');if(!hero)return;
    const stage=document.createElement('div');stage.className='tc-spline-live';stage.innerHTML=`<iframe title="Живой 3D-мир TRIZNES" src="${url.href}" loading="eager" allow="fullscreen; autoplay" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;hero.prepend(stage);hero.classList.add('has-spline');
  }

  mountRail();mountCityBar();mountEntrySwitch();mountMobileDock();bindWorldControls();mountSpline();

  document.querySelectorAll('.tabbar').forEach(node=>node.setAttribute('aria-hidden','true'));
  const iconRoutes={'Люди':'character.html','Идеи':'boards.html','События':'world-map.html','Нейроферма':'neurofarm.html','Кино':'sochiwood.html','Кинотеатр':'sochiwood.html','Сообщества':'communities.html','Игра':'world-map.html','Архив':'neurofarm.html','Город':'world-map.html','Объекты':'city-objects.html'};
  document.querySelectorAll('.iconnav a').forEach(link=>{const route=iconRoutes[link.textContent.trim()];if(route)link.href=route;});

  const status=document.createElement('div');status.className='tc-world-status';status.innerHTML='<i></i><span>TRIZNES WORLD</span><b>ONLINE</b>';document.body.appendChild(status);
  const ideas=document.createElement('script');ideas.src='./living-ideas.js?v=20261030-1';ideas.async=false;document.body.appendChild(ideas);
  if(screen==='world-map'){const mapLive=document.createElement('script');mapLive.src='./map-live-v2.js?v=20261030-1';mapLive.async=false;document.body.appendChild(mapLive)}
  if(screen==='sochiwood'){const cinema=document.createElement('script');cinema.src='./cinema-unify.js?v=20261030-1';cinema.async=false;document.body.appendChild(cinema)}

  let scheduled=false;window.addEventListener('pointermove',event=>{if(scheduled||matchMedia('(prefers-reduced-motion: reduce)').matches)return;scheduled=true;requestAnimationFrame(()=>{document.documentElement.style.setProperty('--mx',`${event.clientX}px`);document.documentElement.style.setProperty('--my',`${event.clientY}px`);const nx=(event.clientX/Math.max(innerWidth,1)-.5)*12;const ny=(event.clientY/Math.max(innerHeight,1)-.5)*8;document.documentElement.style.setProperty('--word-x',`${nx}px`);document.documentElement.style.setProperty('--word-y',`${ny}px`);scheduled=false})},{passive:true});
})();