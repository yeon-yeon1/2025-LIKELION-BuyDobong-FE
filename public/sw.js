// 캐싱할 파일들 (필요시 수정 가능)
const CACHE_NAME = 'buydobong-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicons/Logo-192.png',
  '/favicons/Logo-512.png',
];

// 설치 이벤트: 캐시 저장
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// 활성화 이벤트: 오래된 캐시 제거
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// fetch 이벤트: 캐시 우선 전략
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// push 이벤트: 알림 표시
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received:', event);
  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: '푸시 알림', body: event.data.text() };
  }

  const options = {
    body: data.body || '새 알림이 도착했습니다.',
    icon: data.icon || '/favicons/Logo-192.png',
    badge: data.badge || '/favicons/Logo-192.png',
    data: { url: data.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(data.title || '알림', options));
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
