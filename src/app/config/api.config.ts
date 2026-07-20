import { environment } from 'src/environments/environment';

/**
 * Resolve API base URL at runtime.
 * On any deployed host (Amplify, custom domain), never call localhost —
 * that causes ERR_CONNECTION_REFUSED in production / PWA caches.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;

    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return 'https://api-production-0b1da.up.railway.app';
    }
  }

  return environment.apiUrl;
}
