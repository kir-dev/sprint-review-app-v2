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

async function proxy(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const target = `${backendUrl()}/${path.join('/')}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);
  for (const header of HOP_BY_HOP_HEADERS) headers.delete(header);
  // Belongs to the inbound request; fetch sets the upstream one.
  headers.delete('host');
  // The body below is streamed chunked, so an inbound length no longer applies.
  headers.delete('content-length');
  // undici rejects this outright (UND_ERR_NOT_SUPPORTED), and a 100-continue
  // negotiation is between the client and this hop anyway -- curl sends it for
  // large bodies, which would otherwise turn every such upload into a 502.
  headers.delete('expect');
  // Ask the backend for an uncompressed body so we can safely re-emit it
  // without a content-encoding/body mismatch (the browser<->frontend hop can
  // still be compressed by the platform).
  headers.delete('accept-encoding');

  // Stream the request body straight through rather than buffering it. Profile
  // pictures are sent as base64 data URLs (~6.7MB after encoding a 5MB file),
  // and buffering those would hold the whole payload in the pod's memory.
  // Since content-length is dropped above, this goes out chunked.
  const body =
    req.method === 'GET' || req.method === 'HEAD' ? null : req.body;

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
    upstream = await fetch(target, init);
  } catch (error) {
    // Backend unreachable / DNS failure / connection refused. Log it: the
    // client only ever sees an opaque 502, so this is the sole record of why.
    console.error(`Proxy to ${target} failed:`, error);
    return new Response(JSON.stringify({ error: 'Bad Gateway' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }

  const responseHeaders = new Headers(upstream.headers);
  for (const header of HOP_BY_HOP_HEADERS) responseHeaders.delete(header);
  // The body is re-emitted as a fresh stream, so the upstream's framing and
  // encoding headers no longer describe what we send.
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');

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
