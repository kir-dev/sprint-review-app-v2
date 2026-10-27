import 'server-only';

/**
 * Base URL for API reads made while rendering on the server. In the container
 * the Nest process serving this app sets INTERNAL_API_URL to its own loopback
 * address; in development the API runs as a separate server.
 */
export function serverApiUrl(): string {
  return (
    process.env.INTERNAL_API_URL ||
    `${process.env.DEV_API_ORIGIN || 'http://localhost:3001'}/api`
  );
}
