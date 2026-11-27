// YugaCut Studio service worker v2.3 — offline support
const CACHE = 'yugacut-v2-3-0';
const CORE = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];
const SKIP = /googlesyndication|doubleclick|pagead|google-analytics|googletagmanager|adservice/i;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(CORE.map(u => c.add(u).catch(() => {})));  // a missing file must not break install
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !/^https?:/.test(req.url) || SKIP.test(req.url)) return;
  if (req.mode === 'navigate') {          // page: network first, cached copy when offline
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('index.html', cp)); return r; })
      .catch(async () => (await caches.match('index.html')) || (await caches.match('./')) || Response.error()));
    return;
  }
  // everything else (Tailwind, Font Awesome, Google Fonts, qrcode lib): cache first, refresh in background
  e.respondWith((async () => {
    const hit = await caches.match(req);
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }).catch(() => null);
    return hit || (await net) || Response.error();
  })());
});
