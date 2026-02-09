const CACHE_NAME = 'sprint-review-app-v2';

self.addEventListener('install', (event) => {
    // Force new service worker to activate immediately
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/',
                '/manifest.webmanifest',
                '/Kir-Dev-Black.png',
                '/Kir-Dev-White.png',
            ]);
        })
    );
});

self.addEventListener('activate', (event) => {
    // Claim clients immediately so the new service worker controls the page
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            // Clear old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // EXCLUDE API and Auth routes from caching completely
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/') || url.pathname.includes('/login')) {
        return;
    }

    // Network First strategy for HTML navigation (ensure fresh pages)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Stale-While-Revalidate for other assets (images, css, js)
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Update cache with new version
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                });
                return networkResponse;
            });

            // Return cached response immediately if available, otherwise wait for network
            return cachedResponse || fetchPromise;
        })
    );
});
