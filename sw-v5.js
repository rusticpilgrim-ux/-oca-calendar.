const CACHE = 'oca-calendar-v5-20260908';
const ASSETS = ['./?v=5','./index.html?v=5','./styles.css?v=5','./calendar.js?v=5','./reader.js?v=5','./app.js?v=5','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== self.location.origin) { e.respondWith(fetch(e.request)); return; }
  e.respondWith(fetch(e.request, {cache:'no-store'}).then(resp => { const copy = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return resp; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html?v=5'))));
});
