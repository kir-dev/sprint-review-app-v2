const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

/** Returns whether a URL hostname is an explicit local loopback host. */
export function isLoopbackHostname(hostname: string): boolean {
  return LOOPBACK_HOSTNAMES.has(hostname);
}

/** Parses a credential-free browser origin and permits HTTP only for local development. */
export function parseBrowserOrigin(value: string, name: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }

  const isHttps = url.protocol === 'https:';
  const isLoopbackHttp =
    url.protocol === 'http:' && isLoopbackHostname(url.hostname);
  const isOriginOnly =
    url.pathname === '/' && !url.search && !url.hash && !url.username && !url.password;

  if ((!isHttps && !isLoopbackHttp) || !isOriginOnly) {
    throw new Error(
      `${name} must be a credential-free HTTPS origin or an explicit HTTP loopback origin`,
    );
  }

  return url;
}

/** Parses the AuthSCH provider base URL before OAuth credentials can be transmitted. */
export function parseHttpsProvider(value: string, name: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid HTTPS URL`);
  }

  if (
    url.protocol !== 'https:' ||
    url.pathname !== '/' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(`${name} must be a credential-free HTTPS URL`);
  }

  return url;
}
