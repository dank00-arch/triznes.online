/* Версия снята: приложение переехало в /unified/. Этот файл убирает старый офлайн-кэш у тех, кто ставил прежнюю версию. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
    .then(() => self.registration.unregister())
    .then(() => self.clients.matchAll({ type: 'window' }))
    .then((cs) => cs.forEach((c) => c.navigate(c.url)))
));
