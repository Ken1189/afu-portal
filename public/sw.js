// AFU Portal Service Worker
// Provides offline caching for farm data, training, and market prices

const CACHE_NAME = 'afu-portal-v1';
const STATIC_CACHE = 'afu-static-v1';
const DATA_CACHE = 'afu-data-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/farm',
  '/dashboard',
  '/manifest.json',
];

// API routes to cache with network-first strategy
const CACHEABLE_API_ROUTES = [
  '/api/market-prices',
  '/api/farm/plots',
  '/api/courses/enrollments',
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DATA_CACHE && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network first for API, cache first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API routes — network first, cache fallback
  if (CACHEABLE_API_ROUTES.some((route) => url.pathname.startsWith(route))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(DATA_CACHE).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets — cache first, network fallback
  if (request.destination === 'document' || request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        });
      })
    );
    return;
  }
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-farm-activities') {
    event.waitUntil(syncFarmActivities());
  }
  if (event.tag === 'sync-payments') {
    event.waitUntil(syncPayments());
  }
});

async function syncFarmActivities() {
  // Retrieve queued activities from IndexedDB and POST them
  // This will be implemented when IndexedDB queue is set up
  console.log('[SW] Syncing farm activities...');
}

async function syncPayments() {
  console.log('[SW] Syncing pending payments...');
}
