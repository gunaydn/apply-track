import { environment } from 'src/environments/environment';

export const PRODUCTION_API_URL =
  'https://api-production-0b1da.up.railway.app';

function isBrowserLocalHost(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  const host = window.location.hostname;

  return (
    !host ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '[::1]'
  );
}

/**
 * Resolve API base URL at runtime.
 * On Amplify / any deployed host, always use Railway — never localhost.
 */
export function getApiBaseUrl(): string {
  if (!isBrowserLocalHost()) {
    return PRODUCTION_API_URL;
  }

  if (environment.production) {
    return PRODUCTION_API_URL;
  }

  return environment.apiUrl || PRODUCTION_API_URL;
}

/** Rewrite accidental localhost API calls when the app is served from a real host. */
export function rewriteLocalhostApiUrl(url: string): string {
  if (isBrowserLocalHost()) {
    return url;
  }

  return url.replace(/http:\/\/localhost:3000/gi, PRODUCTION_API_URL);
}
