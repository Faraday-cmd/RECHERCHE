import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth() {
    return {
      status: 'ok',
      service: 'recherche-api',
      version: '1.0.0-rc1',
      defaultLocale: 'fr',
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness() {
    let dbStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = 'degraded';
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      service: 'recherche-api',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
