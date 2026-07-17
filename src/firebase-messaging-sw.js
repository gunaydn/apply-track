// Prefer Angular's ngsw when available (production PWA build).
// In development, ngsw-worker.js is absent and this catch keeps FCM working alone.
try {
  importScripts('./ngsw-worker.js');
} catch (e) {
  console.log('ngsw-worker.js not available, continuing with FCM-only worker.');
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

importScripts(
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js'
);

firebase.initializeApp({
  apiKey: 'AIzaSyBZWCvbuVhhbWp9zKkhGBub68fuBkCs0g4',
  authDomain: 'apply-track-21510.firebaseapp.com',
  projectId: 'apply-track-21510',
  storageBucket: 'apply-track-21510.firebasestorage.app',
  messagingSenderId: '135106228034',
  appId: '1:135106228034:web:c3eefa6b65f5f9345222db',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    payload.notification?.title || 'ApplyTrack Reminder';

  const notificationOptions = {
    body: payload.notification?.body || 'You have a follow-up reminder.',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    data: {
      url: payload.data?.url || '/',
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
