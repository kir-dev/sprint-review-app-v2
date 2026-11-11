import type { INestApplication } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { readFileSync } from 'fs';
import path from 'path';

interface NextCustomServer {
  prepare(): Promise<void>;
  getRequestHandler(): (req: Request, res: Response) => Promise<void>;
}

type NextFactory = (options: {
  dev: boolean;
  dir: string;
  hostname: string;
  port: number;
  quiet: boolean;
}) => NextCustomServer;

/** Whether a request belongs to the Nest API rather than the Next.js frontend. */
export function isApiPath(pathname: string): boolean {
  return pathname === '/api' || pathname.startsWith('/api/');
}

/**
 * Serves a Next.js standalone build from this process: /api/* stays with Nest,
 * every other path is rendered by Next.js. Mount it before any body parser, so
 * Next.js receives page requests untouched.
 */
export async function mountNextFrontend(
  app: INestApplication,
  frontendDir: string,
  port: number,
): Promise<void> {
  // The standalone output ships no next.config; its serialized form lives in
  // required-server-files.json. Next.js reads it from this variable, exactly
  // as the generated standalone server.js does.
  const serverFiles = JSON.parse(
    readFileSync(
      path.join(frontendDir, '.next', 'required-server-files.json'),
      'utf8',
    ),
  ) as { config: unknown };
  process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(
    serverFiles.config,
  );
  // Server components read the API over loopback (apps/frontend/src/lib/server-api.ts).
  process.env.INTERNAL_API_URL = `http://127.0.0.1:${port}/api`;

  // Resolved at runtime: next is only present in the combined image.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const next = require('next') as NextFactory;
  const nextApp = next({
    dev: false,
    dir: frontendDir,
    hostname: '0.0.0.0',
    port,
    quiet: true,
  });
  await nextApp.prepare();
  const handle = nextApp.getRequestHandler();

  app.use((req: Request, res: Response, nextMiddleware: NextFunction) => {
    if (isApiPath(req.path)) return nextMiddleware();
    handle(req, res).catch(nextMiddleware);
  });
}
