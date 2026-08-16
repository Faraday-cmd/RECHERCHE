import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import { AppModule } from './app.module';

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

export async function createServer(): Promise<express.Express> {
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
}

// Standalone local execution support when not running inside Vercel Lambda
if (!process.env.VERCEL) {
  createServer().then(() => {
    const port = process.env.PORT || 4000;
    server.listen(port, () => {
      console.log(`[RECHERCHE API] Running on port ${port} (Default i18n locale: fr)`);
    });
  });
}

// Vercel Serverless Function Handler
export default async function handler(req: any, res: any) {
  try {
    await createServer();
    server(req, res);
  } catch (err: any) {
    console.error('[FATAL VERCEL SERVERLESS BOOT ERROR]:', err);
    res.status(500).json({
      statusCode: 500,
      error: 'Internal Server Error',
      message: err?.message || 'Serverless function failed to initialize.',
      timestamp: new Date().toISOString(),
    });
  }
}
