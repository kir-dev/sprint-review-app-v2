import { backendUrl } from '@/lib/backend';
import type { NextRequest } from 'next/server';

// Proxies /api/* to the backend, resolving the target at RUNTIME so one image
// can serve multiple instances. This replaces the former next.config
// `rewrites()`, whose destination is serialized into routes-manifest.json at
// build time and therefore cannot be set per-instance.
export const dynamic = 'force-dynamic';

// Connection-specific headers (RFC 9110 s7.6.1). They describe a single hop, so
// a proxy must not pass them on; the outgoing connection gets its own.
const HOP_BY_HOP_HEADERS = [
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
];

const UPSTREAM_TIMEOUT_MS = 30_000;

function sanitizeRequestHeaders(headers: Headers) {
  // Snapshot the keys before deleting. Mutating Headers during its live
  // iteration can otherwise skip the entry following a removed header.
  for (const name of Array.from(headers.keys())) {
    if (
      HOP_BY_HOP_HEADERS.includes(name) ||
      name === 'host' ||
      name === 'content-length' ||
      name === 'expect' ||
      name === 'accept-encoding' ||
      // AuthSCH uses the public backend origin directly and application API
      // authentication uses Bearer tokens. Forwarding frontend-origin cookies
      // would therefore disclose them to the backend without a valid use case.
      name === 'cookie' ||
      name === 'forwarded' ||
      name === 'x-real-ip' ||
      name === 'cf-connecting-ip' ||
      name === 'true-client-ip' ||
      name.startsWith('x-forwarded-') ||
      name.startsWith('x-vercel-')
    ) {
      headers.delete(name);
    }
  }
}

function rewriteInternalLocation(
  responseHeaders: Headers,
  internalBaseUrl: string,
  target: string,
) {
  const location = responseHeaders.get('location');
  if (!location) return;

  try {
    const internalBase = new URL(internalBaseUrl);
    const resolvedLocation = new URL(location, target);
    if (resolvedLocation.origin !== internalBase.origin) return;

    let pathname = resolvedLocation.pathname;
    const basePath = internalBase.pathname.replace(/\/+$/, '');
    if (basePath && pathname === basePath) {
      pathname = '/';
    } else if (basePath && pathname.startsWith(`${basePath}/`)) {
      pathname = pathname.slice(basePath.length);
    }

    // Keep internal redirects on the frontend origin instead of exposing a
    // cluster-local Service hostname to the browser.
    responseHeaders.set(
      'location',
      `/api${pathname}${resolvedLocation.search}${resolvedLocation.hash}`,
    );
  } catch {
    // An invalid upstream Location is safer to discard than reflect verbatim.
    responseHeaders.delete('location');
  }
}

async function proxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const internalBaseUrl = backendUrl();
  const target = `${internalBaseUrl}/${path.join('/')}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);
  sanitizeRequestHeaders(headers);

  // Stream the request body straight through rather than buffering it. Profile
  // pictures are sent as base64 data URLs (~6.7MB after encoding a 5MB file),
  // and buffering those would hold the whole payload in the pod's memory.
  // Since content-length is dropped above, this goes out chunked.
  const body = req.method === 'GET' || req.method === 'HEAD' ? null : req.body;

  const init: RequestInit & { duplex?: 'half' } = {
    method: req.method,
    headers,
    body,
    redirect: 'manual',
    cache: 'no-store',
  };
  // Required by the fetch spec whenever body is a ReadableStream.
  if (body) init.duplex = 'half';

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      ...init,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    // Backend unreachable / DNS failure / connection refused. Log it: the
    // client only ever sees an opaque gateway error, so this is the sole record
    // of why.
    // Do not log the target host, query string or raw error: all three may
    // contain infrastructure details or sensitive request data.
    console.error('Backend proxy request failed', {
      method: req.method,
      path: req.nextUrl.pathname,
      error: error instanceof Error ? error.name : 'UnknownError',
    });
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    return new Response(
      JSON.stringify({ error: timedOut ? 'Gateway Timeout' : 'Bad Gateway' }),
      {
        status: timedOut ? 504 : 502,
        headers: { 'content-type': 'application/json' },
      },
    );
  }

  const responseHeaders = new Headers(upstream.headers);
  for (const header of HOP_BY_HOP_HEADERS) responseHeaders.delete(header);
  // The body is re-emitted as a fresh stream, so the upstream's framing and
  // encoding headers no longer describe what we send.
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');
  // AuthSCH is intentionally handled on the public backend origin. Do not let
  // arbitrary API responses plant backend cookies on the frontend origin.
  responseHeaders.delete('set-cookie');
  responseHeaders.delete('server');
  responseHeaders.delete('x-powered-by');
  rewriteInternalLocation(responseHeaders, internalBaseUrl, target);

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as OPTIONS,
  proxy as HEAD,
};
