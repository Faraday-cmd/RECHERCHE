import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailWebhookController } from './email-webhook.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [EmailWebhookController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
