// Service Worker
const CACHE_NAME = 'propark-v1';

// Install event
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match('/index.html'))
  );
});