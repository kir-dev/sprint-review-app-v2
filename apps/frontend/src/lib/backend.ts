// Server-side resolution of the backend URL, read at RUNTIME so a single
// frontend image can serve multiple deployed instances (each Deployment sets
// its own env). Deliberately NOT a NEXT_PUBLIC_ variable — those are inlined at
// build time, which would bake one instance's URL into the image.
//
// BACKEND_PUBLIC_URL is the name the backend already uses for the same origin
// (see apps/backend/src/auth/authsch.strategy.ts), so this adds no new concept.

const FALLBACK = 'http://localhost:3001';

/**
 * The backend origin. Used server-side by the /api proxy route and SSR fetches,
 * and handed to the browser via window.__ENV__ for the AuthSCH login redirect
 * (which must hit the backend origin directly — it starts an express-session
 * there that the AuthSCH callback needs).
 */
export function backendUrl(): string {
  return (
    process.env.BACKEND_PUBLIC_URL ||
    // Legacy: the existing Vercel deployment only has this one configured.
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    FALLBACK
  );
}
