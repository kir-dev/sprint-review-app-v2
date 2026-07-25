import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produce a self-contained server build (.next/standalone) for a small
  // production Docker image. See apps/frontend/Dockerfile.
  output: 'standalone',
  // In this yarn-workspaces monorepo, trace files from the repo root so the
  // standalone bundle picks up hoisted node_modules correctly.
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // The /api/* backend proxy lives in app/api/[...path]/route.ts so the target
  // can be resolved at runtime (per-instance) instead of being baked in here.
  // Empty turbopack config to silence warning
  turbopack: {},
};

export default nextConfig;
