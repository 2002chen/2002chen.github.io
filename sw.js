// 小菜鸟带你飞 - Service Worker
const CACHE_NAME = 'xiaocainiao-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/tutorial.html',
  '/quiz.html',
  '/lab.html',
  '/learning.html',
  '/roadmap.html',
  '/404.html',
  '/site.css',
  '/home.js',
  '/tutorial.js',
  '/quiz.js',
  '/lab.js',
  '/learning.js',
  '/supabase.min.js',
  '/manifest.json',
  '/install.html',
  '/v41-course.js',
  '/assets/site-icon.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('缓存中...');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) return response;
      return fetch(event.request).then(function(response) {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        var responseToCache = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    }).catch(function() {
      return caches.match('/404.html');
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) { return name !== CACHE_NAME; })
        .map(function(name) { return caches.delete(name); })
      );
    })
  );
});
