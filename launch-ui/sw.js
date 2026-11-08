const CACHE = 'triznes-launch-ui-v12-pult-v2-20261108';
const CORE = [
  './','./index.html','./entry.html','./home.html','./character.html','./world-map.html','./city-objects.html','./communities.html',
  './sochiwood.html','./neurofarm.html','./community.html','./boards.html','./pult.html','./pult/index.html','./pult-legacy.html',
  './triznes-core.css','./triznes-visual-v2.css','./triznes-visual-v4.css','./world-themes.css','./world-themes-polish.css','./navigation-v3.css','./paradise-neon-v2.css','./archive-media-v1.css','./visual-boost-v5.css','./world-visual-polish-v6.css','./map-v3.css',
  './triznes-shell-v2.js','./triznes-data-v2.js','./city-directory.js','./map-live-v2.js','./map-media-v1.js','./living-ideas.js','./cinema-unify.js','./spline-config.js',
  './assets/triznes-core-128.png','./assets/triznes-core.png','./assets/archive/mediahub/mediahub-cover.webp','./assets/archive/mediahub/mediahub-sea-room.webp',
  './pult/current-impulse.json','./pult/signal-status.json','./pult/system-status.json','./pult/content-queue.json','./pult/characters.json','./pult/world-map.json','./pult/design/tokens.json','./pult/world-map-overlay.js','./pult/characters-overlay.js','./pult/runtime-overlay.js','./pult/firmware-overlay.js','./core/firmware-v3.json','./assets/characters-v4/daniel-cinematic-v1.webp','./assets/characters-v4/vsevolod-kim-collider-v1.webp','./assets/characters-v4/liberty-abundance-v1.webp','./manifest.webmanifest'
];

self.addEventListener('install',(event)=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',(event)=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('triznes-launch-ui-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',(event)=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;
  const url=new URL(event.request.url);
  const freshAsset=/\.(?:js|css)$/i.test(url.pathname);
  if(event.request.mode==='navigate'||freshAsset){
    event.respondWith(fetch(event.request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
      return response;
    }).catch(()=>caches.match(event.request).then(cached=>cached||(event.request.mode==='navigate'?caches.match('./entry.html'):Promise.reject()))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return response;
  })));
});
