import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const dbUrl =
      process.env.DATABASE_URL && process.env.DATABASE_URL.trim().startsWith('postgres')
        ? process.env.DATABASE_URL.trim()
        : 'postgresql://postgres:password@localhost:5432/postgres';

    super({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma Client connected to database successfully.');
    } catch (err: any) {
      this.logger.warn(
        `Prisma database connection deferred during serverless init: ${err.message}. Connection will be established on query.`,
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch {}
  }
}
