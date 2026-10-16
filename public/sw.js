/* ZORAEL & CO. — service worker
 * App-shell + offline fallback. Private routes are never cached.
 */
// Bumping VERSION purges every previous cache on activate — required whenever
// the caching rules change, so clients drop entries the old rules poisoned.
const VERSION = "zorael-v2";
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;
const OFFLINE_URL = "/offline";

// Routes that must never be cached (private / transactional). A cached admin
// or account page would be re-served without the server's auth check.
const PRIVATE = ["/admin", "/account", "/checkout", "/bag", "/api"];

/**
 * Only full, successful, non-redirected responses are safe to cache. Caching a
 * 404/500 under cache-first pins the failure permanently, and `cache.put`
 * throws outright on a 206 partial response.
 */
function isCacheable(response) {
  return (
    response &&
    response.ok &&
    response.status === 200 &&
    !response.redirected &&
    response.type !== "opaqueredirect"
  );
}

function putIfCacheable(request, response) {
  if (!isCacheable(response)) return;
  const copy = response.clone();
  caches
    .open(RUNTIME_CACHE)
    .then((cache) => cache.put(request, copy))
    .catch(() => {});
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, "/"]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isPrivate(url) {
  return PRIVATE.some((p) => url.pathname.startsWith(p));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never cache private/transactional routes — always go to network.
  if (isPrivate(url)) return;

  // HTML navigations: network-first, fall back to cache, then offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          putIfCacheable(request, response);
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_URL);
        }),
    );
    return;
  }

  // Same-origin assets: cache-first, but only ever store a good response.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            putIfCacheable(request, response);
            return response;
          }),
      ),
    );
    return;
  }

  // Cross-origin (e.g. Unsplash images): stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          putIfCacheable(request, response);
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
