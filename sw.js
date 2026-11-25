const CACHE_NAME = 'yugacut-v1';
const ASSETS = [
  '/yugacut/',
  '/yugacut/index.html',
  '/yugacut/manifest.json',
  '/yugacut/icon-192.png',
  '/yugacut/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request)).catch(() => caches.match('/yugacut/index.html'))
  );
});
