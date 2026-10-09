// Offline support: the page, code and content are cached after the first visit.
const CACHE = "stemma-61abb00a20"; // deploy.sh stamps a content hash here
const SHELL = ["./", "index.html", "css/stemma.css", "manifest.webmanifest", "icon-192.png",
  "js/app.js", "js/util.js", "js/state.js", "js/store.js", "js/ui.js", "js/latin.js",
  "js/views/home.js", "js/views/lexicon.js", "js/views/grammar.js", "js/views/texts.js",
  "js/views/parallels.js", "js/views/practice.js", "js/views/settings.js",
  "content/lexicon.json", "content/grammar.json", "content/texts.json", "content/parallels.json", "content/meta.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // Always ask the network first, revalidating with the server (cheap 304s when nothing
  // changed), so a new deploy shows up on the next visit; fall back to the cache offline.
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then((r) => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html"))));
});
