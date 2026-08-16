import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Controller, Get, Post, Module } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

@Controller('api/v1')
export class MinimalHealthController {
  @Get()
  getHealth() {
    return {
      status: 'OK',
      name: 'RECHERCHE V1 Backend API',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('email/webhook')
  getWebhook() {
    return {
      status: 'OK',
      message: 'Resend email webhook endpoint active',
    };
  }
}

@Module({
  controllers: [MinimalHealthController],
})
export class MinimalAppModule {}

const server = express();
let isInitialized = false;

export async function createServer(): Promise<express.Express> {
  if (!isInitialized) {
    const app = await NestFactory.create(MinimalAppModule, new ExpressAdapter(server));
    app.enableCors({ origin: '*' });
    await app.init();
    isInitialized = true;
  }
  return server;
}

export default async function handler(req: any, res: any) {
  try {
    const instance = await createServer();
    instance(req, res);
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
