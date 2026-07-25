'use client';

// Reads the runtime-injected public backend URL. The root layout renders
// `window.__ENV__ = { backendUrl }` from a runtime (non-inlined) env var, so
// the same build works for any deployed instance.
export function browserBackendUrl(): string {
  if (typeof window !== 'undefined') {
    const env = (window as unknown as { __ENV__?: { backendUrl?: string } })
      .__ENV__;
    if (env?.backendUrl) return env.backendUrl;
  }
  // Build-time fallback for the existing Vercel deployment, which only has
  // NEXT_PUBLIC_BACKEND_URL configured. Unset in the Docker build (where
  // window.__ENV__ above always wins), so nothing instance-specific is baked in.
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
}
