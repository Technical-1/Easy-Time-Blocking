const CACHE_NAME = 'time-blocking-v7';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './icon.svg',
  './manifest.json',
  './modules/index.js',
  './modules/storage.js',
  './modules/utils.js',
  './modules/theme.js',
  './modules/notifications.js',
  './modules/time.js',
  './modules/search.js',
  './modules/statistics.js',
  './modules/data.js',
  './modules/archive.js',
  './modules/print.js'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache:', error);
      })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - stale-while-revalidate strategy
// Serves from cache immediately, but fetches update in background
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Start network request in parallel
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // If we got a valid response, update the cache
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            // Clone the response before caching
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((error) => {
          console.log('Network fetch failed:', error);
          return null;
        });

        // Return cached response immediately if available, otherwise wait for network
        if (cachedResponse) {
          // Return cached version immediately
          // The fetchPromise will update the cache in the background
          return cachedResponse;
        }

        // No cache available, wait for network
        return fetchPromise.then((networkResponse) => {
          if (networkResponse) {
            return networkResponse;
          }
          // If navigation request and both cache and network fail, try index.html
          if (event.request.mode === 'navigate') {
            return cache.match('./index.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      });
    })
  );
});

// Listen for skip waiting message to force update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
