// 小菜鸟带你飞 - Service Worker
const CACHE_NAME = 'xiaocainiao-v2.1.1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/tutorial.html',
  '/python.html',
  '/scenes.html',
  '/quiz.html',
  '/lab.html',
  '/learning.html',
  '/roadmap.html',
  '/install.html',
  '/about.html',
  '/404.html',
  '/site.css',
  '/site.js',
  '/supabase-config.js',
  '/home.js',
  '/site-lessons.js',
  '/mobile-course.js',
  '/tutorial.js',
  '/tutorial-course.js',
  '/python.js',
  '/quiz.js',
  '/lab.js',
  '/py-worker.js',
  '/learning.js',
  '/assets/supabase.min.js',
  '/manifest.json',
  '/assets/pwa-icon-192.png',
  '/assets/pwa-icon-512.png'
  ,'/assets/course/start-on-phone.webp'
  ,'/assets/course/expense-helper.webp'
  ,'/assets/course/check-ai-result.webp'
  ,'/assets/course/tutorial-mobile-real.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(cacheNames
        .filter(cacheName => cacheName !== CACHE_NAME)
        .map(cacheName => caches.delete(cacheName))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
          return response;
        })
        .catch(async () => (await caches.match(request, { ignoreSearch: true })) || (await caches.match('/404.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(cachedResponse => {
      const networkUpdate = fetch(request).then(response => {
        if (response.ok && response.type === 'basic') {
          caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        }
        return response;
      });
      if (cachedResponse) {
        event.waitUntil(networkUpdate.catch(() => undefined));
        return cachedResponse;
      }
      return networkUpdate;
    })
  );
});
