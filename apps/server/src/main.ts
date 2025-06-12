// @file: server/src/main.ts
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';
import { json, urlencoded } from 'express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enviroment configuration
  const config: ConfigService = app.get(ConfigService);
  const PORT = config.get<number>('PORT') || 5000;
  const CLIENT_URL = config.get<string>('CLIENT_URL') || 'http://localhost:3000';
  const isProd = config.get<string>('NODE_ENV') === 'production';
  const ttl = config.get<number>('RATE_LIMIT_TTL');
  const limit = config.get<number>('RATE_LIMIT_LIMIT');
  const blockDuration = config.get<number>('RATE_LIMIT_BLOCK_DURATION');
  const headerLimitKb = config.get<number>('PAYLOAD_LIMIT_HEADER_KB') || 8;
  const headerLimitBytes = headerLimitKb * 1024;
  const bodyLimit = config.get<string>('PAYLOAD_LIMIT_BODY') || '64kb';

  Logger.debug(`Throttle enabled with: TTL=${ttl}ms, Limit=${limit}, Block Duration=${blockDuration}ms`, 'Throttle');

  // Prisma Client
  app.enableShutdownHooks();
  app.useGlobalFilters(new PrismaExceptionFilter());

  if (config.get<string>('NODE_ENV') !== 'production') {
    app.use((req, res, next) => {
      let size = 0

      req.on('data', (chunk) => {
        size += chunk.length
      })

      req.on('end', () => {
        if (size > 0) {
          Logger.warn(`Incoming body size: ${size}B`, 'RequestSize')
        }
      })

      next()
    })
  }
  // TODO:
  // 1. Micro and Camera block,
  // 2. add jti to JWT and check if it exists in the database,
  // 3. Hash refresh_token in DB,
  // 4. content-type whitelist
  // 5. Logger for all requests to DB
  app.use((req, res, next) => {
    const totalHeaderSize = Object.entries(req.headers).reduce((acc, [key, val]) => {
      const headerVal = Array.isArray(val) ? val.join(',') : val ?? '';
      return acc + Buffer.byteLength(key + headerVal, 'utf8');
    }, 0);

    if (totalHeaderSize > headerLimitBytes) {
      Logger.warn(`Blocked request: header size = ${totalHeaderSize}B (limit ${headerLimitBytes}B)`, 'HeaderLimit');
      return res.status(431).json({ error: 'Request header too large' }); // 431 = Request Header Fields Too Large
    }

    next();
  });
  Logger.debug(`Header size limit set to ${headerLimitKb}KB (${headerLimitBytes}B)`, 'Payload Header Limit');

  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ limit: bodyLimit, extended: true }));
  Logger.debug(`Request size limit set to ${bodyLimit}`, 'Payload Body Limit');

  app.set('trust proxy', 1);
  Logger.log(`Trust proxy enabled`, 'Security');

  // Middleware
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
    noSniff: true,
    hsts: isProd
      ? {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      }
      : false,
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
  Logger.debug(`System is running in ${isProd ? 'production' : 'development'} mode`, 'System');
}
bootstrap();
//EOF