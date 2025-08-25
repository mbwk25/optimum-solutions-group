/**
 * Enhanced PWA Service Worker
 * Advanced caching, background sync, push notifications, and offline-first architecture
 * Optimized for Optimum Solutions Group PWA
 */

const CACHE_VERSION = 'v2.0.0';
const APP_CACHE = `app-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;
const OFFLINE_CACHE = `offline-${CACHE_VERSION}`;

// PWA Configuration
const PWA_CONFIG = {
  app: {
    name: APP_CACHE,
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    maxEntries: 50,
  },
  static: {
    name: STATIC_CACHE,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 100,
  },
  dynamic: {
    name: DYNAMIC_CACHE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    maxEntries: 75,
  },
  images: {
    name: IMAGE_CACHE,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 200,
  },
  api: {
    name: API_CACHE,
    maxAge: 60 * 60 * 1000, // 1 hour
    maxEntries: 100,
  },
  offline: {
    name: OFFLINE_CACHE,
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    maxEntries: 10,
  },
};

// Core app assets to precache
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/assets/index.css',
  '/assets/index.js',
];

// Offline fallbacks
const OFFLINE_FALLBACKS = {
  page: '/offline.html',
  image: '/assets/offline-image.svg',
  font: '/assets/fallback-font.woff2',
};

// Background sync configurations
const BACKGROUND_SYNC = {
  analytics: {
    tag: 'analytics-sync',
    maxRetries: 3,
    retryDelay: 5000,
  },
  contact: {
    tag: 'contact-form-sync',
    maxRetries: 5,
    retryDelay: 10000,
  },
};

// IndexedDB configuration for offline data
const DB_CONFIG = {
  name: 'OSG_PWA_DB',
  version: 1,
  stores: {
    analytics: { keyPath: 'id', autoIncrement: true },
    forms: { keyPath: 'id', autoIncrement: true },
    cache_meta: { keyPath: 'url' },
  },
};

// Utility Functions
const log = (message, data = null) => {
  if (self.registration?.scope?.includes('localhost')) {
    console.log(`[PWA SW] ${message}`, data || '');
  }
};

const isNavigationRequest = (request) => {
  return request.mode === 'navigate';
};

const isStaticAsset = (url) => {
  return /\.(css|js|woff2?|ttf|eot)(\?.*)?$/.test(url) ||
         url.includes('/assets/') ||
         url.includes('/fonts/');
};

const isImage = (url) => {
  return /\.(jpg|jpeg|png|gif|webp|avif|svg|ico)(\?.*)?$/i.test(url);
};

const isApiRequest = (url) => {
  return url.includes('/api/') || 
         url.includes('api.') ||
         url.includes('/analytics/') ||
         url.includes('/contact/');
};

const shouldCacheRequest = (request) => {
  const url = new URL(request.url);
  
  // Only cache GET requests
  if (request.method !== 'GET') return false;
  
  // Skip admin and debug routes
  if (url.pathname.includes('/admin') || 
      url.pathname.includes('/debug')) return false;
  
  // Skip requests with no-cache parameters
  if (url.search.includes('no-cache') || 
      url.search.includes('sw-bypass')) return false;
  
  // Skip cross-origin requests (with exceptions)
  if (url.origin !== location.origin) {
    const allowedOrigins = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net'
    ];
    return allowedOrigins.some(origin => url.href.startsWith(origin));
  }
  
  return true;
};

// Cache Management
const cleanupCache = async (cacheName, maxEntries, maxAge) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length <= maxEntries) return;
  
  // Get cache entries with metadata
  const entries = await Promise.all(
    keys.map(async (request) => {
      const response = await cache.match(request);
      const dateHeader = response?.headers.get('date');
      const age = dateHeader ? Date.now() - new Date(dateHeader).getTime() : 0;
      
      return { request, age };
    })
  );
  
  // Sort by age (oldest first) and remove excess entries
  entries
    .sort((a, b) => b.age - a.age)
    .slice(maxEntries)
    .forEach(({ request }) => cache.delete(request));
  
  // Remove expired entries
  if (maxAge) {
    entries
      .filter(({ age }) => age > maxAge)
      .forEach(({ request }) => cache.delete(request));
  }
};

// Caching Strategies
const cacheFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    log(`Cache hit: ${request.url}`);
    
    // Update cache in background if stale
    const cacheDate = new Date(cachedResponse.headers.get('date') || 0);
    const isStale = Date.now() - cacheDate.getTime() > 24 * 60 * 60 * 1000; // 1 day
    
    if (isStale) {
      fetch(request).then(async (networkResponse) => {
        if (networkResponse?.status === 200) {
          await cache.put(request, networkResponse.clone());
          log(`Background cache update: ${request.url}`);
        }
      }).catch(() => {
        log(`Background update failed: ${request.url}`);
      });
    }
    
    return cachedResponse;
  }
  
  // Fetch from network and cache
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse?.status === 200 && shouldCacheRequest(request)) {
      await cache.put(request, networkResponse.clone());
      log(`Network cache: ${request.url}`);
      
      // Cleanup cache if necessary
      const config = Object.values(PWA_CONFIG).find(c => c.name === cacheName);
      if (config) {
        cleanupCache(cacheName, config.maxEntries, config.maxAge);
      }
    }
    
    return networkResponse;
  } catch (error) {
    log(`Network failed: ${request.url}`, error);
    
    // Return offline fallback for navigation requests
    if (isNavigationRequest(request)) {
      const offlineResponse = await caches.match(OFFLINE_FALLBACKS.page);
      return offlineResponse || new Response('Offline', { status: 503 });
    }
    
    throw error;
  }
};

const networkFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse?.status === 200 && shouldCacheRequest(request)) {
      await cache.put(request, networkResponse.clone());
      log(`Network first cache: ${request.url}`);
    }
    
    return networkResponse;
  } catch (error) {
    log(`Network first fallback: ${request.url}`, error);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // API requests get offline response
    if (isApiRequest(request.url)) {
      return new Response(
        JSON.stringify({ 
          error: 'Offline', 
          offline: true,
          cached: false 
        }),
        { 
          status: 503, 
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
};

const staleWhileRevalidate = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse?.status === 200 && shouldCacheRequest(request)) {
      await cache.put(request, networkResponse.clone());
      log(`SWR update: ${request.url}`);
    }
    return networkResponse;
  }).catch((error) => {
    log(`SWR network failed: ${request.url}`, error);
    return cachedResponse;
  });
  
  return cachedResponse || fetchPromise;
};

// IndexedDB Operations
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      Object.entries(DB_CONFIG.stores).forEach(([storeName, config]) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, config);
        }
      });
    };
  });
};

const saveToIndexedDB = async (storeName, data) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    await new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    log(`Saved to IndexedDB: ${storeName}`, data);
  } catch (error) {
    log(`IndexedDB save failed: ${storeName}`, error);
  }
};

const getFromIndexedDB = async (storeName, query = null) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = query ? store.get(query) : store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    log(`IndexedDB read failed: ${storeName}`, error);
    return null;
  }
};

// Background Sync
const handleBackgroundSync = async (tag) => {
  log(`Background sync triggered: ${tag}`);
  
  switch (tag) {
    case BACKGROUND_SYNC.analytics.tag:
      await syncAnalyticsData();
      break;
    case BACKGROUND_SYNC.contact.tag:
      await syncContactForms();
      break;
    default:
      log(`Unknown sync tag: ${tag}`);
  }
};

const syncAnalyticsData = async () => {
  try {
    const data = await getFromIndexedDB('analytics');
    if (!data || data.length === 0) return;
    
    for (const item of data) {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      });
      
      if (response.ok) {
        // Remove synced item from IndexedDB
        const db = await openDB();
        const transaction = db.transaction(['analytics'], 'readwrite');
        await transaction.objectStore('analytics').delete(item.id);
        log(`Synced analytics data: ${item.id}`);
      }
    }
  } catch (error) {
    log('Analytics sync failed', error);
    throw error; // Re-throw to trigger retry
  }
};

const syncContactForms = async () => {
  try {
    const data = await getFromIndexedDB('forms');
    if (!data || data.length === 0) return;
    
    for (const form of data) {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.data),
      });
      
      if (response.ok) {
        // Remove synced form from IndexedDB
        const db = await openDB();
        const transaction = db.transaction(['forms'], 'readwrite');
        await transaction.objectStore('forms').delete(form.id);
        log(`Synced contact form: ${form.id}`);
      }
    }
  } catch (error) {
    log('Contact form sync failed', error);
    throw error;
  }
};

// Push Notifications
const handlePushEvent = (event) => {
  const options = {
    body: 'You have a new message from Optimum Solutions Group',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/action-view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-close.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(
    self.registration.showNotification('OSG Notification', options)
  );
};

const handleNotificationClick = (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientsArr) => {
        const hadWindowToFocus = clientsArr.some((windowClient) => {
          if (windowClient.url === urlToOpen) {
            windowClient.focus();
            return true;
          }
          return false;
        });
        
        if (!hadWindowToFocus) {
          clients.openWindow(urlToOpen);
        }
      })
  );
};

// Service Worker Event Listeners
self.addEventListener('install', (event) => {
  log('Installing PWA service worker...');
  
  event.waitUntil(
    (async () => {
      // Cache app shell
      const appCache = await caches.open(PWA_CONFIG.app.name);
      await appCache.addAll(APP_SHELL);
      
      // Cache offline fallbacks
      const offlineCache = await caches.open(PWA_CONFIG.offline.name);
      await offlineCache.addAll(Object.values(OFFLINE_FALLBACKS));
      
      await self.skipWaiting();
      log('PWA service worker installed successfully');
    })()
  );
});

self.addEventListener('activate', (event) => {
  log('Activating PWA service worker...');
  
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      const validCacheNames = Object.values(PWA_CONFIG).map(config => config.name);
      
      const oldCaches = cacheNames.filter(name => !validCacheNames.includes(name));
      await Promise.all(oldCaches.map(name => caches.delete(name)));
      
      // Take control of all clients
      await self.clients.claim();
      
      log('PWA service worker activated');
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests and requests with bypass header
  if (!url.protocol.startsWith('http') || 
      request.headers.get('x-sw-bypass')) {
    return;
  }
  
  // Route requests to appropriate caching strategies
  if (APP_SHELL.some(asset => url.pathname === asset || url.pathname.endsWith(asset))) {
    // App shell - cache first
    event.respondWith(cacheFirst(request, PWA_CONFIG.app.name));
  } else if (isStaticAsset(request.url)) {
    // Static assets - cache first with long TTL
    event.respondWith(cacheFirst(request, PWA_CONFIG.static.name));
  } else if (isImage(request.url)) {
    // Images - stale while revalidate
    event.respondWith(staleWhileRevalidate(request, PWA_CONFIG.images.name));
  } else if (isApiRequest(request.url)) {
    // API requests - network first with fallback
    event.respondWith(networkFirst(request, PWA_CONFIG.api.name));
  } else if (isNavigationRequest(request)) {
    // Navigation requests - network first with offline fallback
    event.respondWith(
      networkFirst(request, PWA_CONFIG.dynamic.name).catch(async () => {
        const offlineCache = await caches.open(PWA_CONFIG.offline.name);
        return offlineCache.match(OFFLINE_FALLBACKS.page);
      })
    );
  } else {
    // Everything else - stale while revalidate
    event.respondWith(staleWhileRevalidate(request, PWA_CONFIG.dynamic.name));
  }
});

self.addEventListener('sync', (event) => {
  log(`Background sync event: ${event.tag}`);
  event.waitUntil(handleBackgroundSync(event.tag));
});

self.addEventListener('push', handlePushEvent);

self.addEventListener('notificationclick', handleNotificationClick);

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_ANALYTICS':
      if (payload) {
        saveToIndexedDB('analytics', {
          data: payload,
          timestamp: Date.now(),
        });
      }
      break;
      
    case 'CACHE_FORM':
      if (payload) {
        saveToIndexedDB('forms', {
          data: payload,
          timestamp: Date.now(),
        });
      }
      break;
      
    case 'GET_CACHE_STATUS':
      event.ports[0]?.postMessage({
        type: 'CACHE_STATUS',
        caches: Object.keys(PWA_CONFIG),
        version: CACHE_VERSION,
      });
      break;
      
    default:
      log(`Unknown message type: ${type}`);
  }
});

// Periodic background tasks (when supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(
      Promise.all(
        Object.values(PWA_CONFIG).map(config =>
          cleanupCache(config.name, config.maxEntries, config.maxAge)
        )
      )
    );
  }
});

log('Enhanced PWA service worker loaded successfully', {
  version: CACHE_VERSION,
  caches: Object.keys(PWA_CONFIG),
});
