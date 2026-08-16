import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';

// Load pre-compiled AppModule from dist if available (guarantees NestJS decorator metadata in Vercel serverless)
let AppModule: any;
try {
  AppModule = require('../dist/src/app.module').AppModule;
} catch {
  AppModule = require('../src/app.module').AppModule;
}

const server = express();
let isInitialized = false;

// Middleware for rawBody capture (required for Svix webhook signature verification)
server.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

export const createServer = async (): Promise<express.Express> => {
  if (!isInitialized) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      logger: ['error', 'warn', 'log'],
    });

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
    isInitialized = true;
  }
  return server;
};

export default async (req: any, res: any) => {
  try {
    await createServer();
    server(req, res);
  } catch (err: any) {
    console.error('[FATAL VERCEL SERVERLESS BOOT ERROR]:', err);
    res.status(500).json({
      statusCode: 500,
      error: 'Internal Server Error',
      message: err.message || 'Serverless function failed to initialize.',
      timestamp: new Date().toISOString(),
    });
  }
};
