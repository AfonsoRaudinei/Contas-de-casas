const CACHE_NAME = 'contas-de-casa-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.webmanifest'
];

// Install: cache essential files
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate: remove outdated caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request).then((networkResponse) => {
                if (
                    !networkResponse ||
                    networkResponse.status !== 200 ||
                    networkResponse.type === 'opaque'
                ) {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                    return networkResponse;
                });
            }).catch(() => {
                return caches.match('./index.html');
            });
        })
    );
});
