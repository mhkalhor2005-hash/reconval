// Minimal offline-first service worker for the Rekanwal PWA.
// Strategy:
//  - Never touch /api/* — the app's own offline queue (localStorage) handles that.
//  - App shell (navigation) requests: network-first, falling back to the cached
//    shell so the rep app still opens with no connectivity.
//  - Static assets (_next/static, icons, etc): cache-first for speed.

const CACHE_NAME = "rekanwal-shell-v1";
const SHELL_URLS = ["/", "/login", "/app", "/manifest.json", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return; // never intercept API calls

  // Navigation requests: network-first with cached shell fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((res) => res || caches.match("/app")))
    );
    return;
  }

  // Static assets: cache-first.
  if (url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return res;
          })
      )
    );
  }
});
