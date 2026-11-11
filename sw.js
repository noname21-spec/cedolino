/* Cedolino service worker: offline, aggiornamenti, condivisione di file */
const VERSION = 'cedolino-v8';
const CORE = ['./', './index.html', './styles.css', './engine.js', './app.js', './manifest.webmanifest', './icons/icon.svg?v=2', './icons/icon-192.png?v=2', './icons/icon-512.png?v=2', './icons/maskable-512.png?v=2', './icons/apple-touch-180.png?v=2'];
const CDN = ['https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'];
const LIBS = 'cedolino-libs-v1', SHARE = 'cedolino-share';

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION); await c.addAll(CORE);
    const l = await caches.open(LIBS); await Promise.all(CDN.map((u) => l.match(u).then((hit) => hit || fetch(u, { mode: 'no-cors' }).then((r) => l.put(u, r)).catch(() => {}))));
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keep = [VERSION, LIBS, SHARE];
    await Promise.all((await caches.keys()).filter((k) => !keep.includes(k)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', (e) => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const req = e.request; const url = new URL(req.url);
  // file condivisi da altre app (menu Condividi di Android)
  if (req.method === 'POST' && url.pathname.endsWith('/share-target')) {
    e.respondWith((async () => {
      try {
        const fd = await req.formData(); const files = fd.getAll('file').filter((f) => f && f.size);
        const c = await caches.open(SHARE); for (const k of await c.keys()) await c.delete(k);
        await Promise.all(files.map((f, i) => c.put(`./__condiviso/${i}`, new Response(f, { headers: { 'content-type': f.type || 'application/octet-stream', 'x-nome': encodeURIComponent(f.name || `file-${i}`) } }))));
      } catch (err) {}
      return Response.redirect('./?app=pwa#condiviso', 303);
    })());
    return;
  }
  if (req.method !== 'GET') return;
  const libreria = /cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(url.host);
  if (libreria) {
    // librerie e caratteri: dalla cache se ci sono (non cambiano), poi rete
    e.respondWith(caches.open(LIBS).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  if (url.hostname.endsWith('supabase.co')) return;
  // file dell'app: rete prima (aggiornamenti subito), cache se sei offline
  e.respondWith(fetch(req).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); } return res; })
    .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
