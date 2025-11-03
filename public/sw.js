// Minimal SW to satisfy installability
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    self.clients.claim();
});

// pass-through network (no offline caching yet)
self.addEventListener('fetch', () => { });
