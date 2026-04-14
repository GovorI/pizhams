import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  // Security: CORS configuration (MUST be before Helmet)
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const allowedOrigins = [frontendUrl, 'http://localhost:5173', 'http://localhost:3000'];
  console.log('🔧 FRONTEND_URL:', frontendUrl);
  console.log('🔧 Allowed CORS origins:', allowedOrigins);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        console.log(`✅ CORS allowed for origin: ${origin}`);
        return callback(null, true);
      }
      console.warn(`🚫 CORS blocked for origin: ${origin}`);
      return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Explicit OPTIONS handler to ensure preflight requests are handled before
  // any other middleware (including Helmet) can interfere.
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`📥 ${req.method} ${req.path} — origin: ${req.headers.origin ?? 'none'}`);
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Security: Helmet for security headers.
  // crossOriginResourcePolicy is set to 'cross-origin' so that assets served
  // from this API are not blocked by the browser's CORP check.
  // crossOriginOpenerPolicy is disabled to avoid interfering with CORS flows.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:', '*.r2.cloudflarestorage.com'],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Pizhams API')
    .setDescription('API для магазина пижам')
    .setVersion('1.0')
    .addTag('products', 'Товары')
    .addTag('orders', 'Заказы')
    .addTag('auth', 'Авторизация')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server listening on port ${port}`);
}
bootstrap();
