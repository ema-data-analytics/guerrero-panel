// Vulcan · trabajo sin internet (26/11/2026). Las páginas del sistema se piden siempre a internet primero
// (así siempre se ve la versión nueva); solo si no hay señal se abre la última copia guardada en el aparato.
// Las llamadas a la base (Supabase) no pasan por acá: van directo.
var CACHE = 'vulcan-paginas-v1';
self.addEventListener('install', function(e) { self.skipWaiting(); });
self.addEventListener('activate', function(e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var mismo = url.origin === self.location.origin;
  var libreria = url.hostname === 'cdnjs.cloudflare.com';
  var imagen = mismo && /\.(png|jpe?g|svg|ico|webmanifest)$/i.test(url.pathname);
  if (!(mismo && req.mode === 'navigate') && !libreria && !imagen) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(function(r) {
      if (r && r.ok) { var c = r.clone(); caches.open(CACHE).then(function(ca) { ca.put(url.pathname, c); }); }
      return r;
    }).catch(function() {
      return caches.open(CACHE).then(function(ca) { return ca.match(url.pathname).then(function(m) { if (m) return m; var raiz = new URL('./', self.registration.scope).pathname; return ca.match(raiz).then(function(m2) { return m2 || ca.match(raiz + 'index.html'); }); }); });
    }));
    return;
  }
  // Librerías, íconos e imágenes: lo guardado sirve si no hay señal; con señal se renueva
  e.respondWith(caches.open(CACHE).then(function(ca) {
    return ca.match(req).then(function(m) {
      var red = fetch(req).then(function(r) { if (r && (r.ok || r.type === 'opaque')) ca.put(req, r.clone()); return r; }).catch(function() { return m; });
      return m || red;
    });
  }));
});
