import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Graceful Shutdown Hooks
  app.enableShutdownHooks();

  // Set Global Prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // CORS Configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Global DTO Input Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // OpenAPI / Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('RECHERCHE V1 Backend API')
    .setDescription('Authoritative REST API documentation for Recherche contextual discovery platform.')
    .setVersion('1.0.0-rc1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`[RECHERCHE API] Running on port ${port} (Default i18n locale: fr)`);
}

bootstrap();
