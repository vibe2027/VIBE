const CACHE = 'vibe-v2-fixes';
const SHELL = ['/', '/index.html', '/icon-192.png', '/icon-512.png', '/js/vibe-fixes.js'];
const FIX_SCRIPT = '<script src="/js/vibe-fixes.js" defer><\/script>';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function injectFixes(html) {
  if (!html || html.indexOf('vibe-fixes.js') !== -1) return html;
  if (html.indexOf('</body>') !== -1) {
    return html.replace('</body>', FIX_SCRIPT + '\n</body>');
  }
  return html + FIX_SCRIPT;
}

// Réseau d'abord ; injection des corrections sur les pages HTML.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  const isHTML =
    e.request.mode === 'navigate' ||
    (e.request.headers.get('accept') || '').includes('text/html') ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html');

  if (isHTML && url.origin === self.location.origin) {
    e.respondWith(
      fetch(e.request)
        .then(async (res) => {
          if (!res.ok) return res;
          const ct = res.headers.get('content-type') || '';
          if (!ct.includes('text/html')) return res;
          const text = await res.text();
          const fixed = injectFixes(text);
          return new Response(fixed, {
            status: res.status,
            statusText: res.statusText,
            headers: res.headers
          });
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
