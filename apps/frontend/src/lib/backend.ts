import 'server-only';

// Server-side resolution of backend URLs, read at RUNTIME so a single frontend
// image can serve multiple deployed instances (each Deployment sets its own
// env). Deliberately NOT NEXT_PUBLIC_ variables — those are inlined at build
// time, which would bake one instance's URL into the image.

const FALLBACK = 'http://localhost:3001';

function normalizeBaseUrl(value: string, variableName: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${variableName} must be a valid absolute URL`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${variableName} must use the http or https protocol`);
  }

  // Credentials in a URL are easy to leak through HTML, redirects or logs.
  // Backend credentials belong in dedicated secrets/headers, never in either
  // backend URL environment variable.
  if (url.username || url.password) {
    throw new Error(`${variableName} must not contain credentials`);
  }

  if (url.search || url.hash) {
    throw new Error(`${variableName} must not contain a query or fragment`);
  }

  return url.toString().replace(/\/+$/, '');
}

function configuredUrl(
  candidates: Array<[name: string, value: string | undefined]>,
): string {
  for (const [name, value] of candidates) {
    if (value) return normalizeBaseUrl(value, name);
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('A backend URL must be configured in production');
  }

  return FALLBACK;
}

/**
 * The backend origin used by server-side proxy and SSR requests. Deployments
 * may use an internal service URL to avoid public ingress hairpin traffic.
 */
export function backendUrl(): string {
  return configuredUrl([
    ['BACKEND_INTERNAL_URL', process.env.BACKEND_INTERNAL_URL],
    ['BACKEND_PUBLIC_URL', process.env.BACKEND_PUBLIC_URL],
    // Legacy: the existing Vercel deployment only has this one configured.
    ['NEXT_PUBLIC_BACKEND_URL', process.env.NEXT_PUBLIC_BACKEND_URL],
  ]);
}

/**
 * The browser-reachable backend origin used for the AuthSCH login redirect.
 * It must remain public because the backend starts an express-session there
 * that the AuthSCH callback needs.
 */
export function publicBackendUrl(): string {
  return configuredUrl([
    ['BACKEND_PUBLIC_URL', process.env.BACKEND_PUBLIC_URL],
    // Legacy: the existing Vercel deployment only has this one configured.
    ['NEXT_PUBLIC_BACKEND_URL', process.env.NEXT_PUBLIC_BACKEND_URL],
  ]);
}
