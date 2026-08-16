import 'reflect-metadata';
import express from 'express';

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
    // Dynamic requires inside try/catch boundary for Vercel Serverless Function resilience
    const { NestFactory } = require('@nestjs/core');
    const { ValidationPipe } = require('@nestjs/common');
    const { ExpressAdapter } = require('@nestjs/platform-express');
    const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');
    const { AppModule } = require('../src/app.module');

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
  if (req.url === '/ping' || req.url === '/api/ping') {
    return res.status(200).json({
      status: 'PONG',
      serverless: true,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    await createServer();
    server(req, res);
  } catch (err: any) {
    console.error('[FATAL VERCEL SERVERLESS BOOT ERROR]:', err);
    res.status(500).json({
      statusCode: 500,
      error: 'Internal Server Error',
      message: err?.message || 'Serverless function failed to initialize.',
      stack: err?.stack || undefined,
      timestamp: new Date().toISOString(),
    });
  }
};
