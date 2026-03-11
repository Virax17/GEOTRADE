/* ================================================================
   GeoTrade Intelligence Platform — Service Worker
   Caches the app shell for fast offline loading.
   Strategy: Cache-First for static assets, Network-First for API.
================================================================ */

const CACHE_NAME = 'geotrade-v1';
const OFFLINE_URL = '/';

// Assets to pre-cache on install (app shell)
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
];

// ── Install: pre-cache the app shell ──────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    // Activate new SW immediately without waiting
    self.skipWaiting();
});

// ── Activate: clean up old caches ─────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    // Take control of all clients immediately
    self.clients.claim();
});

// ── Fetch: serve from cache with network fallback ─────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only intercept same-origin and GET requests
    if (request.method !== 'GET' || url.origin !== location.origin) {
        return;
    }

    // Navigation requests → Network-first, fall back to cached index.html (SPA support)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone and cache the fresh response
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(OFFLINE_URL))
        );
        return;
    }

    // Static assets (JS, CSS, fonts, images) → Cache-first
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;

            return fetch(request).then((response) => {
                // Only cache successful responses for same-origin assets
                if (response.ok && (url.pathname.match(/\.(js|css|woff2?|png|svg|ico)$/))) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            });
        })
    );
});
