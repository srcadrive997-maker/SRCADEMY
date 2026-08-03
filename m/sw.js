/* SRCADEMY Training — offline service worker.
   Precaches the app on install, then serves cache-first while refreshing in the
   background (stale-while-revalidate): instant + fully offline, and picks up a new
   version on the next launch. Bump CACHE when you publish an update. */
const CACHE = 'srcademy-training-v2.5';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(function (cache) {
    return cache.match(e.request).then(function (hit) {
      var net = fetch(e.request).then(function (res) { try { cache.put(e.request, res.clone()); } catch (_) {} return res; }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});
