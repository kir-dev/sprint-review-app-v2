import { config } from 'dotenv';
config();

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import session from 'express-session';
import { AppModule } from './app.module';
import { SafeExceptionFilter } from './common/filters/safe-exception.filter';
import { validateEnvironment } from './config/environment';
import {
  configureTrustProxy,
  createCorsOrigins,
  createSessionOptions,
} from './config/http.config';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const runtimeEnvironment = validateEnvironment(process.env);
  const nodeEnv = runtimeEnvironment.NODE_ENV as string;
  const frontendUrl = runtimeEnvironment.FRONTEND_URL as string | undefined;
  const sessionSecret = runtimeEnvironment.SESSION_SECRET;
  const enableSwagger = runtimeEnvironment.ENABLE_SWAGGER as boolean;
  const port = runtimeEnvironment.PORT as number;

  if (typeof sessionSecret !== 'string' || !sessionSecret.trim()) {
    throw new Error('SESSION_SECRET is required');
  }

  logger.log('Starting application');
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks(['SIGTERM', 'SIGINT']);

  const expressApp = app.getHttpAdapter().getInstance();
  configureTrustProxy(expressApp);

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

  // Enable CORS
  app.enableCors({
    origin: createCorsOrigins({
      nodeEnv,
      frontendUrl,
    }),
    credentials: true,
  });

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
    SwaggerModule.setup('api', app, document);
    logger.log('Swagger documentation enabled');
  }

  await app.listen(port, '0.0.0.0');

  logger.log(`Application listening on port ${port}`);
}

void bootstrap().catch(() => {
  logger.error('Application failed to start');
  process.exitCode = 1;
});
