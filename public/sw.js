/**
 * Advanced Service Worker with Intelligent Caching Strategies
 * Optimized for Optimum Solutions Group website
 */

const CACHE_VERSION = 'v1.2.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Cache configuration
const CACHE_CONFIG = {
  static: {
    name: STATIC_CACHE,
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    maxEntries: 100,
  },
  dynamic: {
    name: DYNAMIC_CACHE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    maxEntries: 50,
  },
  images: {
    name: IMAGE_CACHE,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 200,
  },
  api: {
    name: API_CACHE,
    maxAge: 60 * 60 * 1000, // 1 hour
    maxEntries: 50,
  },
};

// Assets to precache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Utility functions
const isStaticAsset = (url) => {
  return url.includes('/assets/') || 
         url.includes('/images/') || 
         url.includes('/fonts/') ||
         url.endsWith('.css') ||
         url.endsWith('.js') ||
         url.endsWith('.woff2') ||
         url.endsWith('.woff');
};

const isImage = (url) => {
  return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url);
};

const isApiRequest = (url) => {
  return url.includes('/api/') || url.includes('api.');
};

const shouldCacheRequest = (request) => {
  const url = new URL(request.url);
  if (request.method !== 'GET') return false;
  if (url.pathname.includes('/admin')) return false;
  if (url.search.includes('no-cache')) return false;
  return true;
};

// Caching strategies
const cacheFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Return cached response and update in background
    fetch(request).then(networkResponse => {
      if (networkResponse && networkResponse.status === 200) {
        const responseClone = networkResponse.clone();
        cache.put(request, responseClone);
      }
    }).catch(() => {});
    return cachedResponse;
  }
  
  // No cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (request.destination === 'document') {
      return new Response('Offline', { status: 503 });
    }
    throw error;
  }
};

const networkFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200 && shouldCacheRequest(request)) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    if (request.destination === 'document') {
      return new Response('Offline', { status: 503 });
    }
    throw error;
  }
};

const staleWhileRevalidate = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
};

// Service Worker Event Listeners
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(STATIC_ASSETS);
      await self.skipWaiting();
      console.log('[SW] Service worker installed');
    })()
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(cacheName => {
        return !Object.values(CACHE_CONFIG).some(config => config.name === cacheName);
      });
      
      await Promise.all(oldCaches.map(cacheName => caches.delete(cacheName)));
      await self.clients.claim();
      
      console.log('[SW] Service worker activated');
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (!url.protocol.startsWith('http')) return;
  if (request.headers.get('x-no-sw')) return;
  
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirst(request, CACHE_CONFIG.static.name));
  } else if (isImage(request.url)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_CONFIG.images.name));
  } else if (isApiRequest(request.url)) {
    event.respondWith(networkFirst(request, CACHE_CONFIG.api.name));
  } else {
    event.respondWith(staleWhileRevalidate(request, CACHE_CONFIG.dynamic.name));
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service worker script loaded');
