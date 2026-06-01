import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // required for webhook signatures later
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Parse cookies
  app.use(cookieParser());

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unregistered properties
      forbidNonWhitelisted: true, // reject unrecognized inputs
      transform: true, // auto convert types (string -> number, etc.)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Interceptors
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  // Swagger Documentation (Development Only)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Express Cafe F&B SaaS API')
      .setDescription('Production-ready F&B SaaS & Franchise Management API Specs')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .addTag('Auth')
      .addTag('Users')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  // Graceful Shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`\n🚀 Express Cafe API running on: http://localhost:${port}/api/v1`);
  console.log(`📄 Swagger documentation available at: http://localhost:${port}/docs\n`);
}

bootstrap();
