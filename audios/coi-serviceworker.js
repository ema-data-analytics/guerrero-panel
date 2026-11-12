// Se da de baja sola (12/11/2026): la versión con varios núcleos no anduvo; la página vuelve a funcionar sin service worker.
self.addEventListener('install', function() { self.skipWaiting(); });
self.addEventListener('activate', function(e) {
  e.waitUntil(self.registration.unregister().then(function() { return self.clients.matchAll(); }).then(function(cs) { cs.forEach(function(c) { c.navigate(c.url); }); }));
});
