const CACHE_NAME = 'tcc-pwa-cache-v1';
const ASSETS = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/logo.svg',
  '/logotipo.svg',
  // Adicione outros assets essenciais
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Para assets estáticos
  if (request.method === 'GET' && ASSETS.some((asset) => request.url.includes(asset))) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  // Para requests de API de inventário
  if (request.url.includes('/api/inventory')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Se sucesso, retorna e salva uma cópia no cache
          const resClone = response.clone();
          resClone.json().then((data) => {
            // Salva no IndexedDB (via postMessage para o client)
            self.clients.matchAll().then((clients) => {
              clients.forEach((client) => {
                client.postMessage({ type: 'CACHE_INVENTORY', data });
              });
            });
          });
          return response;
        })
        .catch(async () => {
          // Se offline, tenta buscar do IndexedDB
          return new Response(JSON.stringify(await getInventoryFromIDB()), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          });
        })
    );
    return;
  }

  // Fallback para qualquer outra request GET: cache first, network fallback
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).catch(() => new Response('', { status: 503 }))
      )
    );
  }
});

// Listener para receber mensagens do service worker no client
// O client deve implementar algo como:
// navigator.serviceWorker.addEventListener('message', (event) => { ... })
// para atualizar o IndexedDB local com os dados recebidos
// Veja exemplo abaixo para o client:
//
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.addEventListener('message', (event) => {
//     if (event.data?.type === 'CACHE_INVENTORY') {
//       // Salve event.data.data no IndexedDB local
//     }
//   });
// }
// Função para buscar dados do IndexedDB
async function getInventoryFromIDB() {
  return new Promise((resolve) => {
    const open = indexedDB.open('tcc-inventory', 1);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction('inventory', 'readonly');
      const store = tx.objectStore('inventory');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve([]);
    };
    open.onerror = () => resolve([]);
  });
}
