import {
  Controller,
  Post,
  Req,
  Headers,
  UnauthorizedException,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Webhook } from 'svix';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ReportTarget, ReportStatus } from '@prisma/client';

export interface InboundAttachmentMetadata {
  filename?: string;
  contentType?: string;
  size?: number;
  attachmentId?: string;
}

@Controller('email')
export class EmailWebhookController {
  private readonly logger = new Logger(EmailWebhookController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Secure Resend Inbound Email Webhook Listener (POST /api/v1/email/webhook)
   * Processes inbound email.received events for user content/profile reports.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleInboundEmailWebhook(
    @Req() req: Request,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    const webhookSecret = this.configService.get<string>('RESEND_WEBHOOK_SECRET');

    // 1. Webhook Signature Verification Guard
    if (!webhookSecret || !webhookSecret.trim()) {
      this.logger.warn(
        'RESEND_WEBHOOK_SECRET is not configured. Webhook signature verification failed.',
      );
      throw new UnauthorizedException('Resend webhook secret not configured on server.');
    }

    if (!svixId || !svixTimestamp || !svixSignature) {
      this.logger.warn('Missing Svix signature headers on inbound email webhook request.');
      throw new UnauthorizedException('Missing required Svix signature headers.');
    }

    // Extract raw payload body for Svix verification
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    let payload: any;
    try {
      const wh = new Webhook(webhookSecret.trim());
      payload = wh.verify(rawBody, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err: any) {
      this.logger.error(`Svix webhook signature verification failed: ${err.message}`);
      throw new UnauthorizedException('Invalid Svix webhook signature.');
    }

    // 2. Filter Event Type (email.received)
    const eventType = payload.type || payload.event;
    if (eventType && eventType !== 'email.received') {
      this.logger.log(`Ignoring unhandled Resend webhook event type: ${eventType}`);
      return { status: 'IGNORED', eventType };
    }

    const emailData = payload.data || payload;
    const emailId = emailData.email_id || emailData.id || svixId;
    const messageId = emailData.message_id || emailData.headers?.['message-id'] || emailId;

    // 3. Idempotency Check (Prevent duplicate report creation on webhook retries)
    const existingAudit = await this.prisma.auditLog.findFirst({
      where: {
        action: 'EMAIL_REPORT_RECEIVED',
        resource: `Email:${emailId}`,
      },
    });

    if (existingAudit) {
      this.logger.log(
        `Idempotent Webhook Guard: Email ID ${emailId} was already processed. Skipping duplicate.`,
      );
      return { status: 'SUCCESS', duplicate: true, emailId };
    }

    // 4. Extract Sender & Preserved Email Audit Data
    const rawSender = emailData.from || 'anonymous@unknown.com';
    const recipientTo = emailData.to || 'reports@recherche.cm';
    const subject = emailData.subject || 'Signalement par E-mail';
    const textBody = emailData.text || emailData.html || '';

    // 5. Safe Attachment Metadata Extraction
    const rawAttachments = emailData.attachments || [];
    const attachmentsMetadata: InboundAttachmentMetadata[] = rawAttachments.map(
      (att: any) => ({
        filename: att.filename || att.name || 'attachment',
        contentType: att.content_type || att.type || 'application/octet-stream',
        size: att.size || att.length || 0,
        attachmentId: att.id || att.attachment_id || undefined,
      }),
    );

    // 6. Find System Fallback Reporter User
    let fallbackUser = await this.prisma.user.findFirst({
      where: { email: 'system-reports@recherche.cm' },
    });

    if (!fallbackUser) {
      // Create system reporter anchor if missing
      fallbackUser = await this.prisma.user.create({
        data: {
          email: 'system-reports@recherche.cm',
          passwordHash: 'SYSTEM_INBOUND_ANCHOR',
          name: 'Système Ingest E-mail',
          sex: 'N/A',
          dob: new Date('2000-01-01'),
          status: 'ACTIVE',
        },
      });
    }

    // 7. Determine Report Target Type & ID
    let targetType: ReportTarget = ReportTarget.PROFILE;
    if (subject.toLowerCase().includes('publication') || subject.toLowerCase().includes('info')) {
      targetType = ReportTarget.INFO;
    } else if (subject.toLowerCase().includes('commentaire')) {
      targetType = ReportTarget.COMMENT;
    } else if (subject.toLowerCase().includes('discussion') || subject.toLowerCase().includes('message')) {
      targetType = ReportTarget.CONVERSATION;
    }

    // 8. Create Database Report Record
    const reportDetails = {
      emailId,
      messageId,
      senderEmail: rawSender,
      senderVerified: false, // EXPLICIT SECURITY REQUIREMENT: Unverified sender flag
      recipients: recipientTo,
      subject,
      textBody,
      attachments: attachmentsMetadata,
      receivedAt: new Date().toISOString(),
      rawPayload: payload,
    };

    const report = await this.prisma.report.create({
      data: {
        reporterUserId: fallbackUser.id,
        targetType,
        targetId: emailId,
        reason: subject,
        details: JSON.stringify(reportDetails),
        status: ReportStatus.PENDING,
      },
    });

    // 9. Audit Log Entry for Idempotency Tracking & Security
    await this.auditService.logSecurityEvent({
      adminUserId: fallbackUser.id,
      action: 'EMAIL_REPORT_RECEIVED',
      resource: `Email:${emailId}`,
      details: {
        reportId: report.id,
        emailId,
        senderEmail: rawSender,
        subject,
        attachmentsCount: attachmentsMetadata.length,
      },
      ipAddress: (req.ip || '127.0.0.1').toString(),
    });

    this.logger.log(
      `Inbound report email processed successfully. Report ID: ${report.id} | Email ID: ${emailId}`,
    );

    return {
      status: 'SUCCESS',
      reportId: report.id,
      emailId,
    };
  }
}
