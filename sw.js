// sw.js — eenvoudige, robuuste service worker voor je PWA
// - Cachet de shell (HTML/manifest/icons) zodat de app meteen start
// - Afbeeldingen: cache-first (sneller bij terugkijken), met netwerkfallback
// - Andere requests: stale-while-revalidate

const CACHE_NAME = 'teun-photos-v1';
const SHELL = [
  './',                // werkt binnen GitHub Pages subpath
  './index.html',
  './landscape.html',
  './portret.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install: cache de shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

// Activate: opruimen oude caches als de naam wijzigt
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Fetch: strategie per type
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Alleen same-origin cachen (GitHub Pages domein van jouw site)
  const isSameOrigin = url.origin === self.location.origin;

  // 1) Navigations (HTML): network-first (valt terug op cache als offline)
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req));
    return;
  }

  // 2) Afbeeldingen: cache-first (supersmooth bij terugkijken)
  if (isSameOrigin && req.destination === 'image') {
    event.respondWith(cacheFirst(req));
    return;
  }

  // 3) Overig (manifest, icons, script): stale-while-revalidate
  if (isSameOrigin) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Extern: gewoon doorlaten
  // (geen respondWith → normale fetch)
});

async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, fresh.clone());
  return fresh;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await caches.match(request);
  const fetchPromise = fetch(request).then((fresh) => {
    cache.put(request, fresh.clone());
    return fresh;
  }).catch(() => null);
  return cached || fetchPromise || fetch(request);
}
