const CACHE = 'triznes-launch-ui-v6-wordmark-3d-20261030-1';
const CORE = [
  './', './index.html', './entry.html', './home.html', './character.html', './world-map.html',
  './sochiwood.html', './neurofarm.html', './community.html', './boards.html',
  './triznes-core.css', './triznes-visual-v2.css', './triznes-visual-v4.css', './triznes-shell-v2.js', './triznes-data-v2.js', './spline-config.js',
  './assets/triznes-core-128.png', './assets/triznes-core.png',
  './assets/characters-v4/daniel-cinematic-v1.webp', './assets/characters-v4/vsevolod-kim-collider-v1.webp',
  './assets/characters-v4/liberty-abundance-v1.webp', './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('triznes-launch-ui-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./entry.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); }
    return response;
  })));
});
