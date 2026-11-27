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
    // cache 'no-cache': siempre le pregunta al servidor si hay versión nueva (GitHub guarda las páginas 10 minutos)
    e.respondWith(fetch(new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' })).then(function(r) {
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

// ── Notificaciones de Vulcan en el celular (27/11/2026): llegan aunque la app esté cerrada; al tocarla se abre la app ──
self.addEventListener('push', function(e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: 'Vulcan Tread', body: e.data ? e.data.text() : '' }; }
  var base = self.registration.scope;
  e.waitUntil(self.registration.showNotification(d.title || 'Vulcan Tread', {
    body: d.body || '', icon: base + 'icono-vulcan-192.png', badge: base + 'icono-vulcan-192.png',
    tag: d.tag || undefined, renotify: !!d.tag, data: { url: new URL(d.url || '/clientes/', base).href }
  }));
});
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || new URL('/clientes/', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(ls) {
    for (var i = 0; i < ls.length; i++) { if (ls[i].url.indexOf('/clientes/') !== -1 && 'focus' in ls[i]) { ls[i].navigate(url).catch(function() {}); return ls[i].focus(); } }
    return self.clients.openWindow(url);
  }));
});
