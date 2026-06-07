/* BKS'26 Volunteer Guide — offline service worker.
 * Strategy: precache the app shell, then stale-while-revalidate so the guide
 * loads instantly and works with no signal on-site, while still refreshing
 * in the background whenever the volunteer has a connection.
 * Bump CACHE when the precached file list changes structurally. */
'use strict';

const CACHE = 'bks26-shell-v2';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './og-image.svg',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !isFont) return; // let anything else hit the network normally

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: sameOrigin });
      const network = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);

      // Serve cache immediately when present; otherwise wait for the network.
      // Navigations fall back to the cached shell when offline.
      return cached || (await network) ||
        (req.mode === 'navigate' ? cache.match('./index.html') : Response.error());
    })
  );
});
