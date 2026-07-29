const CACHE = 'vibe-v3-perfect';
const SHELL = ['/', '/index.html', '/icon-192.png', '/icon-512.png', '/js/vibe-fixes.js'];
const FIX_TAG = '<script src="/js/vibe-fixes.js?v=3" defer><\/script>';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim()).then(() =>
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((c) => {
          try { c.navigate(c.url); } catch (err) {}
        });
      })
    )
  );
});

function injectFixes(html) {
  if (!html || html.indexOf('vibe-fixes.js') !== -1) return html;
  if (html.indexOf('</head>') !== -1) {
    return html.replace('</head>', FIX_TAG + '\n</head>');
  }
  if (html.indexOf('</body>') !== -1) {
    return html.replace('</body>', FIX_TAG + '\n</body>');
  }
  return html + FIX_TAG;
}

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  const isHTML =
    e.request.mode === 'navigate' ||
    (e.request.headers.get('accept') || '').includes('text/html') ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/index.html';

  if (isHTML) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .then(async (res) => {
          if (!res.ok) {
            const cached = await caches.match(e.request);
            if (cached) {
              const t = await cached.text();
              return new Response(injectFixes(t), {
                status: 200,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
              });
            }
            return res;
          }
          const ct = res.headers.get('content-type') || '';
          if (!ct.includes('text/html') && !ct.includes('text/plain')) return res;
          const text = await res.text();
          const fixed = injectFixes(text);
          const headers = new Headers(res.headers);
          headers.set('Content-Type', 'text/html; charset=utf-8');
          headers.set('Cache-Control', 'no-cache');
          return new Response(fixed, {
            status: res.status,
            statusText: res.statusText,
            headers: headers
          });
        })
        .catch(async () => {
          const cached = await caches.match(e.request);
          if (cached) {
            const t = await cached.text();
            return new Response(injectFixes(t), {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          }
          return caches.match('/index.html');
        })
    );
    return;
  }

  // JS fixes : toujours réseau d'abord, pas de vieux cache
  if (url.pathname.indexOf('vibe-fixes.js') !== -1) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).catch(() => caches.match(e.request))
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
