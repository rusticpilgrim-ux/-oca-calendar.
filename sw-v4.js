const CACHE = 'oca-calendar-v4-20260908';
const ASSETS = ['./?v=4','./index.html?v=4','./styles.css?v=4','./calendar.js?v=4','./reader.js?v=4','./app.js?v=4','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== self.location.origin) { e.respondWith(fetch(e.request)); return; }
  e.respondWith(fetch(e.request, {cache:'no-store'}).then(resp => { const copy = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return resp; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html?v=4'))));
});
