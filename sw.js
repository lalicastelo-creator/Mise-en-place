// Service worker do Mise en Place: deixa o app instalável e abrindo sem internet.
// Os dados (Supabase) NUNCA passam pelo cache — o app já tem a própria fila offline.
// Ao mudar este arquivo, suba o número da versão pra forçar atualização nos celulares.
const CACHE = 'mep-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('supabase.co')) return; // banco: sempre direto na rede

  // Página: tenta a rede primeiro (pra pegar versão nova), cai pro cache se offline
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return res; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Ícones, fontes, biblioteca do Supabase: usa o cache e atualiza por trás
  e.respondWith(
    caches.match(req).then(cached => {
      const net = fetch(req)
        .then(res => { if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
        .catch(() => cached);
      return cached || net;
    })
  );
});
