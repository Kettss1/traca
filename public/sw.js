// LerTraça Service Worker for PWA offline support
const CACHE_NAME = 'lertraca-v1'
const STATIC_CACHE = 'lertraca-static-v1'
const DYNAMIC_CACHE = 'lertraca-dynamic-v1'

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip API routes and auth-related requests
  if (url.pathname.startsWith('/api/') || url.pathname.includes('auth')) {
    return
  }

  // For navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.ok) {
            const clone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, clone)
            })
          }
          return response
        })
        .catch(() => {
          // Try cache first, then offline page
          return caches.match(request).then((cached) => {
            return cached || caches.match('/offline.html')
          })
        })
    )
    return
  }

  // For static assets (images, fonts, etc.)
  if (
    url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Return cache and update in background
          fetch(request).then((response) => {
            if (response.ok) {
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, response)
              })
            }
          })
          return cached
        }
        // Fetch and cache
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, clone)
            })
          }
          return response
        })
      })
    )
    return
  }

  // Default: network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clone)
          })
        }
        return response
      })
      .catch(() => caches.match(request))
  )
})
