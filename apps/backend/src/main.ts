import { config } from 'dotenv';
config();

import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import type { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import { AppModule } from './app.module';
import { SafeExceptionFilter } from './common/filters/safe-exception.filter';
import { validateEnvironment } from './config/environment';
import { mountNextFrontend } from './frontend/next-frontend';
import { appUrl } from './config/app-url';
import {
  configureTrustProxy,
  createSessionOptions,
  rejectCrossOriginWrites,
} from './config/http.config';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const runtimeEnvironment = validateEnvironment(process.env);
  const nodeEnv = runtimeEnvironment.NODE_ENV as string;
  const sessionSecret = runtimeEnvironment.SESSION_SECRET;
  const enableSwagger = runtimeEnvironment.ENABLE_SWAGGER as boolean;
  const port = runtimeEnvironment.PORT as number;
  // Set in the container image: this process then also serves the Next.js
  // frontend, so one container and one origin serve the whole app.
  const frontendDir = process.env.FRONTEND_DIR;

  if (typeof sessionSecret !== 'string' || !sessionSecret.trim()) {
    throw new Error('SESSION_SECRET is required');
  }

  logger.log('Starting application');
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks(['SIGTERM', 'SIGINT']);
  app.setGlobalPrefix('api');

  const expressApp = app.getHttpAdapter().getInstance();
  configureTrustProxy(expressApp);

  if (frontendDir) {
    await mountNextFrontend(app, frontendDir, port);
    logger.log('Serving the Next.js frontend');
  }

  app.use(
    '/api',
    rejectCrossOriginWrites(appUrl(app.get(ConfigService)).origin),
  );
  // API responses are per-user: keep them out of browser and proxy caches.
  app.use(
    '/api',
    (_request: Request, response: Response, next: NextFunction) => {
      response.setHeader('Cache-Control', 'no-store');
      next();
    },
  );

  // Session configuration for Passport (AuthSCH)
  app.use(
    session(
      createSessionOptions({
        nodeEnv,
        sessionSecret: sessionSecret.trim(),
      }),
    ),
  );

  // Increase body size limit for image uploads (10MB)
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );

  if (nodeEnv === 'production') {
    app.useGlobalFilters(new SafeExceptionFilter());
  }

  // Swagger configuration
  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Sprint Review App API')
      .setDescription('API documentation for Sprint Review Application')
      .setVersion('2.0')
      .addTag('users', 'User management endpoints')
      .addTag('projects', 'Project management endpoints')
      .addTag('work-periods', 'Work period management endpoints')
      .addTag('logs', 'Log management endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger documentation enabled');
  }

  await app.listen(port, '0.0.0.0');

  logger.log(`Application listening on port ${port}`);
}

void bootstrap().catch(() => {
  logger.error('Application failed to start');
  process.exitCode = 1;
});
