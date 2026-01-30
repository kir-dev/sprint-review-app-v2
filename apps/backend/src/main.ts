import { config } from 'dotenv';
config();

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  logger.log('Starting application...');
  logger.log('Starting application...');
  logger.log(`DEBUG: FRONTEND_URL=${process.env.FRONTEND_URL}`);
  logger.log(`DEBUG: BACKEND_PUBLIC_URL=${process.env.BACKEND_PUBLIC_URL}`);
  logger.log(`DEBUG: BACKEND_PUBLIC_URL=${process.env.BACKEND_PUBLIC_URL}`);
  const app = await NestFactory.create(AppModule);

  // Raw request logger
  app.use((req, res, next) => {
    logger.log(`📥 INCOMING REQUEST: ${req.method} ${req.url}`);
    next();
  });

  // Increase body size limit for image uploads (10MB)
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Session configuration for Passport (AuthSCH)
  const session = require('express-session');
  app.use(
    session({
      secret: process.env.JWT_SECRET || 'secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );

  // Enable Trust Proxy for Nginx/K8s Ingress
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://sprint-review.kir-dev.hu',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Sprint Review App API')
    .setDescription('API documentation for Sprint Review Application')
    .setVersion('2.0')
    .addTag('users', 'User management endpoints')
    .addTag('projects', 'Project management endpoints')
    .addTag('work-periods', 'Work period management endpoints')
    .addTag('logs', 'Log management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(
    `Swagger documentation available at: http://localhost:${port}/api`,
  );
}
void bootstrap();
