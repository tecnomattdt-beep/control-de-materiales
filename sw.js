// Service worker: instalación de la app y acceso sin conexión desde caché.
// CACHE_NAME cambia con cada versión de index.html; así el navegador detecta el
// service worker nuevo y la app avisa de la actualización.
const CACHE_NAME = 'tecnomat-materiales-v190';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  // {cache:'reload'} evita copias de la caché HTTP del navegador.
  // Sin skipWaiting: la versión nueva espera a que se pulse «Actualizar ahora».
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(APP_SHELL.map(url => fetch(url, {cache:'reload'}).then(resp => cache.put(url, resp))))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('message', event => {
  if(event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(resp => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return resp;
      })
      .catch(() => caches.match(event.request))
  );
});
