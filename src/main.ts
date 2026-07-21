import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

const CACHE_BUST_KEY = 'applytrack_api_cache_bust_v3';

async function clearStaleDeployCachesIfNeeded(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const host = window.location.hostname;
  const isLocal =
    !host || host === 'localhost' || host === '127.0.0.1' || host === '[::1]';

  if (isLocal || localStorage.getItem(CACHE_BUST_KEY)) {
    return;
  }

  localStorage.setItem(CACHE_BUST_KEY, '1');

  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  } catch (error) {
    console.warn('Failed to clear stale caches', error);
  }

  window.location.reload();
}

clearStaleDeployCachesIfNeeded()
  .then(() => platformBrowserDynamic().bootstrapModule(AppModule))
  .catch((err) => console.error(err));
