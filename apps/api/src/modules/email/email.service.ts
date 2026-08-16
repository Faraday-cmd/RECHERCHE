import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resendClient: Resend | null = null;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') ||
      'RECHERCHE <notifications@recherche.cm>';

    if (apiKey && apiKey.trim()) {
      this.resendClient = new Resend(apiKey.trim());
      this.logger.log('Resend Email Client initialized successfully.');
    } else {
      this.logger.warn(
        'RESEND_API_KEY environment variable is empty. Email sending will operate in mock/log mode.',
      );
    }
  }

  /**
   * Sends a transactional email using Resend SDK.
   */
  async sendTransactionalEmail(options: SendEmailOptions) {
    const { to, subject, html, text, replyTo } = options;

    if (!this.resendClient) {
      this.logger.log(
        `[MOCK EMAIL SENT] To: ${Array.isArray(to) ? to.join(', ') : to} | Subject: "${subject}"`,
      );
      return { id: `mock-${Date.now()}`, mock: true };
    }

    try {
      const response = await this.resendClient.emails.send({
        from: this.fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || `<p>${text}</p>`,
        text,
        replyTo,
      });

      this.logger.log(`Email delivered via Resend. ID: ${response.data?.id}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to send email via Resend: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Sends a password reset email to a user.
   */
  async sendPasswordResetEmail(toEmail: string, resetUrl: string, userName?: string) {
    const nameStr = userName ? `Bonjour ${userName},` : 'Bonjour,';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 16px;">
        <h2 style="color: #5B21B6; font-size: 22px; margin-bottom: 16px;">Réinitialisation de votre mot de passe</h2>
        <p style="font-size: 15px; color: #334155; line-height: 1.5;">${nameStr}</p>
        <p style="font-size: 14.5px; color: #475569; line-height: 1.5;">
          Vous avez demandé la réinitialisation de votre mot de passe pour votre compte RECHERCHE.
          Cliquer sur le bouton ci-dessous pour définir votre nouveau mot de passe :
        </p>
        <div style="margin: 28px 0; text-align: center;">
          <a href="${resetUrl}" target="_blank" style="background-color: #5B21B6; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; display: inline-block;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="font-size: 13px; color: #64748B;">
          Ce lien de réinitialisation est à usage unique et expire dans 30 minutes. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.
        </p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94A3B8; text-align: center;">
          © RECHERCHE Cameroon — Plateforme de mobilité et d'orientation académique
        </p>
      </div>
    `;

    return this.sendTransactionalEmail({
      to: toEmail,
      subject: 'Réinitialisation de votre mot de passe RECHERCHE 🔐',
      html,
      text: `${nameStr}\n\nUtilisez ce lien pour réinitialiser votre mot de passe : ${resetUrl}`,
    });
  }
}
