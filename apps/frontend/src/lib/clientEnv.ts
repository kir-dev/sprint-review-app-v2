'use client';

// Reads the runtime-injected public backend URL. The root layout renders
// `window.__ENV__ = { backendUrl }` from a runtime (non-inlined) env var, so
// the same build works for any deployed instance.
export function browserBackendUrl(): string {
  let value: string | undefined;

  if (typeof window !== 'undefined') {
    const env = (window as unknown as { __ENV__?: { backendUrl?: string } })
      .__ENV__;
    value = env?.backendUrl;
  }

  // Build-time fallback for the existing Vercel deployment, which only has
  // NEXT_PUBLIC_BACKEND_URL configured. It is unset in the Docker build, where
  // window.__ENV__ above always wins, so nothing instance-specific is baked in.
  value ??= process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('The public backend URL is invalid');
  }

  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error('The public backend URL is unsafe');
  }

  return url.toString().replace(/\/+$/, '');
}
