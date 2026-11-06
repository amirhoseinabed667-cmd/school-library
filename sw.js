/* Service Worker — کتابخانه مدرسه PWA v1.4.0 */
const CACHE = 'school-lib-v22';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './splash.jpg',
  './js/database.js',
  './js/auth.js'
];

const CDN = [
  'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js',
  'https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(ASSETS).then(() =>
        Promise.allSettled(CDN.map((url) => cache.add(url).catch(() => null)))
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200 && (req.url.startsWith(self.location.origin) || req.url.includes('cdn.jsdelivr.net'))) {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => cached);

      return cached || network;
    })
  );
});
