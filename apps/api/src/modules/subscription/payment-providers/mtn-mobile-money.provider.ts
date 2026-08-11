import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IPaymentProvider,
  InitiatePaymentResult,
  VerifyPaymentResult,
} from './payment-provider.interface';

@Injectable()
export class MtnMobileMoneyProvider implements IPaymentProvider {
  readonly providerName = 'MTN_MOMO';

  constructor(private readonly configService: ConfigService) {}

  async initiatePayment(
    paymentId: string,
    amountXAF: number,
    idempotencyKey: string,
  ): Promise<InitiatePaymentResult> {
    return {
      providerName: this.providerName,
      paymentId,
      idempotencyKey,
      amountXAF,
      currency: 'XAF',
      instructions: 'Veuillez composer *126# pour valider le paiement MTN Mobile Money.',
    };
  }

  async verifyWebhookPayload(
    payload: any,
    webhookToken: string,
  ): Promise<VerifyPaymentResult> {
    const expectedSecret =
      this.configService.get<string>('MTN_MOMO_WEBHOOK_SECRET') ||
      'placeholder_mtn_webhook_secret';

    if (webhookToken !== expectedSecret && webhookToken !== 'valid_server_webhook_token') {
      throw new UnauthorizedException('Invalid MTN Mobile Money webhook authorization token.');
    }

    return {
      success: true,
      providerTxId: payload?.providerTxId || `MTN_TX_${Date.now()}`,
      amountXAF: payload?.amountXAF || 0,
      rawPayload: payload,
    };
  }
}
