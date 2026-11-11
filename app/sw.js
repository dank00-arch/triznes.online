// TRIZNES app v2 · офлайн-оболочка. Медиа (mp3/mp4), /rf-api/ и тайлы карты не кэшируются здесь.
const CACHE='triznes-app-v2-20261112';
const SHELL=['/app/','/app/index.html','/app/manifest.webmanifest','/app/css/app.css?v=2.0.0','/app/js/app.js?v=2.0.0','/app/js/city.js?v=2.0.0','/app/vendor/maplibre-gl.js','/app/vendor/maplibre-gl.css','/app/data/world.json','/app/fonts/unbounded-cyrillic-wght-normal.woff2','/app/fonts/manrope-cyrillic-wght-normal.woff2','/app/icons/icon-192.png','/app/icons/icon-512.png','/app/art/01_keyart_night.webp','/app/art/05_dawn_abundance.webp','/app/art/02_live_to_game.webp','/app/img/guide-apollon.webp','/app/img/guide-triznes.webp'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('triznes-app-')&&x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin||!u.pathname.startsWith('/app/'))return;
  if(/\.(mp3|mp4)$/.test(u.pathname))return;
  if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put('/app/index.html',c));return r}).catch(()=>caches.match('/app/index.html')));return}
  e.respondWith(caches.match(e.request).then(hit=>{const net=fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r}).catch(()=>hit);return hit||net}));
});
