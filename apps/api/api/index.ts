import { Webhook } from 'svix';
import { PrismaClient, ReportTarget } from '@prisma/client';

let prisma: PrismaClient;
try {
  const dbUrl =
    process.env.DATABASE_URL && process.env.DATABASE_URL.trim().startsWith('postgres')
      ? process.env.DATABASE_URL.trim()
      : 'postgresql://postgres:password@localhost:5432/postgres';
  prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } },
  });
} catch {
  prisma = new PrismaClient();
}

export default async function handler(req: any, res: any) {
  const url = req.url || '';

  // Resend Inbound Email Webhook Route (/api/v1/email/webhook)
  if (url.includes('/email/webhook')) {
    if (req.method !== 'POST' && req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (req.method === 'GET') {
      return res.status(200).json({
        status: 'OK',
        message: 'Resend email received webhook endpoint active.',
        resendWebhookSecretConfigured: !!process.env.RESEND_WEBHOOK_SECRET,
        timestamp: new Date().toISOString(),
      });
    }

    try {
      const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

      // Extract Svix verification headers
      const svixId = (req.headers['svix-id'] as string) || '';
      const svixTimestamp = (req.headers['svix-timestamp'] as string) || '';
      const svixSignature = (req.headers['svix-signature'] as string) || '';

      let payload: any = req.body;

      // If webhook secret & svix headers are present, verify signature with Svix
      if (webhookSecret && svixId && svixTimestamp && svixSignature) {
        try {
          const wh = new Webhook(webhookSecret);
          const rawBody = req.rawBody
            ? req.rawBody.toString('utf8')
            : typeof req.body === 'string'
            ? req.body
            : JSON.stringify(req.body);

          payload = wh.verify(rawBody, {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature,
          });
        } catch (verifyErr: any) {
          console.warn('[SVIX VERIFICATION ERROR]:', verifyErr?.message);
          return res.status(401).json({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Invalid Svix webhook signature.',
          });
        }
      }

      const eventType = payload?.type || payload?.event;
      const data = payload?.data || {};
      const emailId = data.email_id || data.id || svixId || `evt_${Date.now()}`;

      // Idempotency check via AuditLog
      try {
        const existingAudit = await prisma.auditLog.findFirst({
          where: {
            action: 'RESEND_INBOUND_EMAIL_WEBHOOK',
            resource: `ResendEmail:${emailId}`,
          },
        });

        if (existingAudit) {
          return res.status(200).json({
            status: 'OK',
            message: 'Duplicate Resend webhook event received and safely ignored.',
            emailId,
            isDuplicate: true,
          });
        }

        // Find or create system fallback reporter user
        let fallbackUser = await prisma.user.findFirst({
          where: { email: 'system-reports@recherche.cm' },
        });

        if (!fallbackUser) {
          fallbackUser = await prisma.user.create({
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

        const fromSender = data.from || 'unknown@sender.com';
        const subject = data.subject || 'Inbound Report via Email';
        const textBody = data.text || data.html || '';

        const reportDetailsObj = {
          inboundEmailId: emailId,
          sender: fromSender,
          senderVerified: false,
          subject,
          body: textBody,
          attachments: (data.attachments || []).map((att: any) => ({
            filename: att.filename,
            contentType: att.content_type,
            size: att.size,
            attachmentId: att.id,
          })),
        };

        // Ingest report record with PENDING status
        const report = await prisma.report.create({
          data: {
            reporterUserId: fallbackUser.id,
            targetType: ReportTarget.PROFILE,
            targetId: emailId,
            reason: 'INBOUND_EMAIL_REPORT',
            details: JSON.stringify(reportDetailsObj),
            status: 'PENDING',
          },
        });

        // Log Security Audit Event
        await prisma.auditLog.create({
          data: {
            adminUserId: fallbackUser.id,
            action: 'RESEND_INBOUND_EMAIL_WEBHOOK',
            resource: `ResendEmail:${emailId}`,
            details: { reportId: report.id, fromSender, subject },
            ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1',
          },
        });

        return res.status(200).json({
          status: 'OK',
          message: 'Inbound email report successfully received and ingested.',
          reportId: report.id,
          emailId,
          timestamp: new Date().toISOString(),
        });
      } catch (dbErr: any) {
        console.warn('[WEBHOOK DB DEFERRED NOTE]:', dbErr?.message);
        return res.status(200).json({
          status: 'OK',
          message: 'Webhook payload received successfully.',
          emailId,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error('[RESEND WEBHOOK ERROR]:', err?.message);
      return res.status(200).json({
        status: 'OK',
        message: 'Webhook payload received.',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Root Backend Health Metadata Route (/api/v1)
  return res.status(200).json({
    status: 'OK',
    name: 'RECHERCHE V1 Backend API',
    version: '1.0.0-rc1',
    endpoint: url,
    resendWebhookSecretConfigured: !!process.env.RESEND_WEBHOOK_SECRET,
    timestamp: new Date().toISOString(),
  });
}
