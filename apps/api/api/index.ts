import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import express from 'express';

const server = express();

export const createServer = async () => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Enable Graceful Shutdown Hooks
  app.enableShutdownHooks();

  // Set Global API Prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // CORS Configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
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

  await app.init();
  return server;
};

export default async (req: any, res: any) => {
  await createServer();
  server(req, res);
};
