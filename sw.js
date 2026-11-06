var CACHE = 'inter-eyes-v5';
var FILES = [
  'index.html',
  'manifest.json',
  'img/logo-ojo.jpg',
  'img/antes-despues-nina.jpg',
  'img/antes-despues-nino.jpg',
  'img/resultado-hombre.jpg',
  'img/trabajo-1.jpg',
  'img/trabajo-2.jpg',
  'img/trabajo-3.jpg',
  'img/trabajo-4.jpg',
  'img/trabajo-5.jpg',
  'img/trabajo-6.jpg',
  'img/trabajo-7.jpg',
  'img/icon-192.png',
  'img/icon-512.png'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  /* La página principal siempre se pide a la red primero, para que los
     cambios se vean sin quedarse la versión vieja en caché. */
  var url = new URL(e.request.url);
  if (url.pathname === '/' || url.pathname.endsWith('/inter-eyes/') || url.pathname.endsWith('index.html')) {
    e.respondWith(
      fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      }).catch(function () { return caches.match(e.request); })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      }).catch(function () { return hit; });
    })
  );
});
