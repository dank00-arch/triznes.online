/* TRIZNES Launch UI V2 — one living shell around the repository screens. */
(() => {
  'use strict';

  const screen = (location.pathname.split('/').pop() || 'home.html').replace('.html', '');
  if (!document.querySelector('link[href*="triznes-visual-v4.css"]')) {
    const visualV4 = document.createElement('link');
    visualV4.rel = 'stylesheet';
    visualV4.href = './triznes-visual-v4.css?v=20261030-wordmark-harmony-v6';
    document.head.appendChild(visualV4);
  }
  const pages = [
    ['home', 'Ядро', 'Домой'],
    ['character', 'Персонаж', 'Мой путь'],
    ['world-map', 'Мир', 'Карта Сочи'],
    ['sochiwood', 'Кинотеатр', 'SOCHIWOOD'],
    ['neurofarm', 'Ферма', 'Медиа → кино'],
    ['community', 'Связи', 'Сообщества'],
    ['boards', 'Пульт', 'Соединить мир']
  ];

  document.body.classList.add(`page-${screen}`);

  const manifest = document.createElement('link');
  manifest.rel = 'manifest';
  manifest.href = './manifest.webmanifest';
  document.head.appendChild(manifest);
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./sw.js', { scope:'./' }).catch(() => {});
  }

  function mountSpline() {
    if (!['entry', 'home'].includes(screen) || !window.TRIZNES_SPLINE_PUBLIC_URL) return;
    let url;
    try {
      url = new URL(window.TRIZNES_SPLINE_PUBLIC_URL, location.href);
      if (url.protocol !== 'https:' || !(url.hostname === 'spline.design' || url.hostname.endsWith('.spline.design'))) return;
    } catch (_) { return; }
    const hero = screen === 'entry' ? document.querySelector('.screen>section:first-of-type') : document.querySelector('.hero');
    if (!hero) return;
    const stage = document.createElement('div');
    stage.className = 'tc-spline-live';
    stage.innerHTML = `<iframe title="Живой 3D-мир TRIZNES" src="${url.href}" loading="eager" allow="fullscreen; autoplay" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    hero.prepend(stage);
    hero.classList.add('has-spline');
  }

  if (screen !== 'entry') {
    const rail = document.createElement('aside');
    rail.className = 'tc-rail';
    rail.setAttribute('aria-label', 'Миры TRIZNES');
    rail.innerHTML = `
      <a class="tc-rail-brand" href="home.html"><img src="./assets/triznes-core-128.png" alt=""><span><b>TRIZNES</b><small>ЖИЗНЬ В ИГРЕ</small></span></a>
      <div class="tc-rail-state"><i></i><span>МИР АКТИВЕН</span><b>СОЧИ · 01</b></div>
      <nav>${pages.map(([id, title, copy], index) => `<a href="${id}.html" class="${screen === id ? 'on' : ''}" ${screen === id ? 'aria-current="page"' : ''}><em>0${index + 1}</em><span><b>${title}</b><small>${copy}</small></span></a>`).join('')}</nav>
      <a class="tc-rail-apollon" href="https://t.me/danielsassis_bot?start=register" target="_blank" rel="noopener"><i>✦</i><span><b>APOLLON</b><small>начать диалог</small></span></a>
    `;
    document.body.prepend(rail);
  }

  const routes = ['character.html', 'world-map.html', 'boards.html', 'sochiwood.html', 'home.html'];
  document.querySelectorAll('.tabbar a').forEach((link, index) => {
    if (routes[index]) link.href = routes[index];
  });

  const iconRoutes = {
    'Люди': 'character.html', 'Идеи': 'boards.html', 'События': 'world-map.html',
    'Нейроферма': 'neurofarm.html', 'Кино': 'sochiwood.html', 'Кинотеатр': 'sochiwood.html', 'Сообщества': 'community.html',
    'Игра': 'world-map.html', 'Архив': 'neurofarm.html', 'Город': 'world-map.html'
  };
  document.querySelectorAll('.iconnav a').forEach((link) => {
    const route = iconRoutes[link.textContent.trim()];
    if (route) link.href = route;
  });

  const status = document.createElement('div');
  status.className = 'tc-world-status';
  status.innerHTML = '<i></i><span>TRIZNES WORLD</span><b>ONLINE</b>';
  document.body.appendChild(status);
  mountSpline();

  let scheduled = false;
  window.addEventListener('pointermove', (event) => {
    if (scheduled || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    scheduled = true;
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--mx', `${event.clientX}px`);
      document.documentElement.style.setProperty('--my', `${event.clientY}px`);
      const nx = (event.clientX / Math.max(innerWidth, 1) - .5) * 12;
      const ny = (event.clientY / Math.max(innerHeight, 1) - .5) * 8;
      document.documentElement.style.setProperty('--word-x', `${nx}px`);
      document.documentElement.style.setProperty('--word-y', `${ny}px`);
      scheduled = false;
    });
  }, { passive: true });
})();