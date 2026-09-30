// Service worker mínimo: permite instalar la app y, sin conexión, servirla desde caché
// en vez de dejar la pantalla en blanco.
//
// El número de versión de CACHE_NAME cambia con cada index.html nuevo — es lo que
// hace que el navegador detecte un service worker distinto y arranque la actualización
// (el propio index.html avisa al usuario cuando eso ocurre).
const CACHE_NAME = 'tecnomat-materiales-v156';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  // Cachea el esqueleto de la app al instalarse. {cache:'reload'} fuerza la copia real
  // del servidor, no una guardada en la caché HTTP del navegador.
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(APP_SHELL.map(url => fetch(url, {cache:'reload'}).then(resp => cache.put(url, resp))))
    )
  );
  // Sin self.skipWaiting() aquí a propósito: la versión nueva queda en espera hasta
  // que el usuario pulsa "Actualizar ahora" en la app, en vez de activarse a mitad de sesión.
});

self.addEventListener('activate', event => {
  // Limpia cachés de versiones antiguas.
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Dispara la actualización real: la página envía este mensaje al service worker
// nuevo (que estaba en espera) para que pase a ser el activo.
self.addEventListener('message', event => {
  if(event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  // Solo se interceptan peticiones GET; el resto (POST a Firebase, etc.) pasa sin tocar.
  if(event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(resp => {
        // Petición de red correcta: actualiza la copia en caché.
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return resp;
      })
      .catch(() => caches.match(event.request)) // Sin conexión: sirve lo que haya en caché.
  );
});
