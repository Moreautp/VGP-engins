// Service worker : met l'appli en cache pour un fonctionnement sans réseau.
// Changer VERSION à chaque mise à jour des fichiers pour forcer le rafraîchissement.
const VERSION = "vgp-engins-v3";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache d'abord (fonctionne hors ligne), mise à jour du cache en arrière-plan quand le réseau est là.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      const net = fetch(e.request)
        .then(resp => {
          if (resp && resp.ok && new URL(e.request.url).origin === location.origin) {
            const copy = resp.clone();
            caches.open(VERSION).then(c => c.put(e.request, copy));
          }
          return resp;
        })
        .catch(() => cached);
      return cached || net;
    })
  );
});
