/* TRIZNES Launch UI V2 — one living shell around the repository screens. */
(() => {
  'use strict';

  const screen = (location.pathname.split('/').pop() || 'home.html').replace('.html', '');
  const pages = [
    ['home', 'Ядро', 'Домой'],
    ['character', 'Персонаж', 'Мой путь'],
    ['world-map', 'Мир', 'Карта Сочи'],
    ['sochiwood', 'Кино', 'SOCHIWOOD'],
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
    'Нейроферма': 'neurofarm.html', 'Кино': 'sochiwood.html', 'Сообщества': 'community.html',
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

  let scheduled = false;
  window.addEventListener('pointermove', (event) => {
    if (scheduled || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    scheduled = true;
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--mx', `${event.clientX}px`);
      document.documentElement.style.setProperty('--my', `${event.clientY}px`);
      scheduled = false;
    });
  }, { passive: true });
})();
