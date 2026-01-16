const CACHE_NAME = 'mohallamart-v1';
const RUNTIME_CACHE = 'mohallamart-runtime-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/offline.html',
];

const API_CACHE = 'mohallamart-api-v1';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Failed to cache some assets:', err);
        // Fallback: try to cache offline.html separately
        return cache.add('/offline.html').catch(() => {
          console.warn('[SW] Failed to cache offline.html');
        });
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event with intelligent caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (except for necessary APIs)
  if (url.origin !== self.location.origin && !isAllowedCrossOrigin(url)) {
    return;
  }

  // API requests - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(navigationStrategy(request));
    return;
  }

  // Assets - Cache first
  if (isAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Default - Network first
  event.respondWith(networkFirstStrategy(request));
});

// Network first strategy
async function networkFirstStrategy(request) {
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 8000)
      ),
    ]);
    
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    // If it's an API request, return error response
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({ error: 'Offline - Please check your connection' }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Cache first strategy
async function cacheFirstStrategy(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (error) {
    return new Response('Asset unavailable', { status: 503 });
  }
}

// Navigation strategy with offline page
async function navigationStrategy(request) {
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      ),
    ]);
    
    if (response.ok) {
      return response;
    }
  } catch (error) {
    // Network error or timeout
  }

  // Try to load from cache
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  // Return offline page
  try {
    return await caches.match('/offline.html') || 
           new Response('Offline - Please check your connection', { status: 503 });
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Check if URL is an asset
function isAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|ico)$/i.test(pathname) ||
         /\/(favicon|apple-touch-icon|manifest\.webmanifest|robots\.txt)/.test(pathname);
}

// Check if cross-origin request is allowed
function isAllowedCrossOrigin(url) {
  const allowed = [
    'cdnjs.cloudflare.com',
    'images.unsplash.com',
    'placehold.co',
  ];
  return allowed.some(host => url.hostname.includes(host));
}

// Background sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  } else if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  }
});

async function syncOrders() {
  try {
    const response = await fetch('/api/orders/sync', { method: 'POST' });
    if (response.ok) {
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({ type: 'ORDERS_SYNCED' });
      });
    }
  } catch (error) {
    console.error('[SW] Order sync failed:', error);
    throw error;
  }
}

async function syncCart() {
  try {
    const response = await fetch('/api/cart/sync', { method: 'POST' });
    if (response.ok) {
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({ type: 'CART_SYNCED' });
      });
    }
  } catch (error) {
    console.error('[SW] Cart sync failed:', error);
    throw error;
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    tag: data.tag || 'mohallamart',
    requireInteraction: data.requireInteraction || false,
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'View',
      },
      {
        action: 'close',
        title: 'Dismiss',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'MohallaMart', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if window is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Message handling
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
