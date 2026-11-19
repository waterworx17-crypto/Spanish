/* sw.js - keeps a copy of the app on your phone so it works with no signal.
   When you upload new files, change VERSION so phones fetch the new copy. */
const VERSION = "mijas-spanish-v1";
const FILES = ["./", "index.html", "style.css", "pronounce.js", "phrases.js", "app.js",
  "manifest.json", "apple-touch-icon.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Use the saved copy first; fetch from the internet only if it's not saved.
// Fonts from Google are saved the first time they load.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then((saved) => saved || fetch(event.request).then((response) => {
    const url = event.request.url;
    if (url.includes("fonts.googleapis.com") || url.includes("fonts.gstatic.com")) {
      const copy = response.clone();
      caches.open(VERSION).then((cache) => cache.put(event.request, copy));
    }
    return response;
  })));
});
