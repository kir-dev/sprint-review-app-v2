import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {(phase: string) => import('next').NextConfig} */
export default function nextConfig(phase) {
  return {
    reactStrictMode: true,
    poweredByHeader: false,
    // Produce a self-contained server build (.next/standalone). In the
    // container the Nest process loads it and serves every non-/api path
    // (see the root Dockerfile and apps/backend/src/frontend).
    output: 'standalone',
    // In this yarn-workspaces monorepo, trace files from the repo root so the
    // standalone bundle picks up hoisted node_modules correctly.
    outputFileTracingRoot: path.join(__dirname, '../../'),
    // NOTE: outputFileTracingExcludes does NOT work here — `next build` runs on
    // Turbopack and that path ignores the option. The standalone tree is
    // pruned in the root Dockerfile's build stage instead.
    // In production Nest serves /api from the same process. In development the
    // API runs as its own server, so `next dev` forwards /api to it and the
    // browser still sees one origin (the session cookie, AuthSCH callback).
    ...(phase === PHASE_DEVELOPMENT_SERVER && {
      async rewrites() {
        const apiOrigin = process.env.DEV_API_ORIGIN || 'http://localhost:3001';
        return [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }];
      },
    }),
    // Empty turbopack config to silence warning
    turbopack: {},
  };
}
