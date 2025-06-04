// @file: server/src/main.ts
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enviroment configuration
  const config: ConfigService = app.get(ConfigService);
  const PORT = config.get<number>('PORT') || 5000;
  const CLIENT_URL = config.get<string>('CLIENT_URL') || 'http://localhost:3000';

  // Prisma Client
  app.enableShutdownHooks();
  app.useGlobalFilters(new PrismaExceptionFilter());

  app.set('trust proxy', 1);
  Logger.log(`Trust proxy enabled`, 'Security');

  // Middleware
  // app.use(helmet());
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
        "style-src": ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        "font-src": ["'self'", "fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "blob:"],
      },
    },
    referrerPolicy: { policy: 'no-referrer' },
    frameguard: { action: 'deny' },
    xssFilter: true,
    hidePoweredBy: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  }));
  Logger.log(`Middlewares enabled: Helmet`, 'Middleware');

  app.use(cookieParser());
  Logger.log(`Middlewares enabled: Cookie Parser`, 'Middleware');

  app.enableCors({
    origin: CLIENT_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  Logger.log(`Middlewares enabled: CORS: [GET,HEAD,PUT,PATCH,POST,DELETE]`, 'Middleware');
  Logger.debug(`Client is running on ${CLIENT_URL}`, 'Middleware');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  Logger.log('Validation pipe enabled', 'Validation');

  await app.listen(PORT ?? 5000);
  Logger.debug(`Server is running on ${await app.getUrl()}`, 'Bootstrap');
}
bootstrap();
//EOF