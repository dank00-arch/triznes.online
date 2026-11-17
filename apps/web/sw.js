/* ============================================================================
   TRIZNES PWA SERVICE WORKER (v13.0.0)
   - Кэширует только статическую оболочку интерфейса (HTML/CSS/JS/Manifest).
   - Никогда не кэширует /auth/, /rest/, /functions/, Supabase API и видеопотоки.
   ============================================================================ */
const CACHE_NAME = 'triznes-shell-v13-0-0';
const SHELL_ASSETS = [
  '/entry.html',
  '/home.html',
  '/sochiwood/index.html',
  '/world-map.html',
  '/profile.html',
  '/manifest.webmanifest',
  '/src/styles/triznes-unified.css',
  '/src/js/triznes-core-sdk.js'
];


self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});


self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});


self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;


  const url = new URL(req.url);


  // Строгий обход кэша для Supabase Auth/REST/Functions и медиафайлов
  if (
    url.hostname.endsWith('supabase.co') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/rest/') ||
    url.pathname.startsWith('/functions/') ||
    url.pathname.endsWith('.mp4')
  ) {
    return;
  }


  // Навигация HTML: Network-First с безопасным возвратом кэшированной оболочки
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('/entry.html')))
    );
    return;
  }


  // Статика интерфейса: Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200 && url.origin === self.location.origin) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkRes;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
