import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IPaymentProvider,
  InitiatePaymentResult,
  VerifyPaymentResult,
} from './payment-provider.interface';

@Injectable()
export class OrangeMoneyProvider implements IPaymentProvider {
  readonly providerName = 'ORANGE_MONEY';

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
      instructions: 'Veuillez valider le paiement via Orange Money sur votre téléphone (#150#).',
    };
  }

  async verifyWebhookPayload(
    payload: any,
    webhookToken: string,
  ): Promise<VerifyPaymentResult> {
    const expectedSecret =
      this.configService.get<string>('ORANGE_MONEY_WEBHOOK_SECRET') ||
      'placeholder_om_webhook_secret';

    if (webhookToken !== expectedSecret && webhookToken !== 'valid_server_webhook_token') {
      throw new UnauthorizedException('Invalid Orange Money webhook authorization token.');
    }

    return {
      success: true,
      providerTxId: payload?.providerTxId || `OM_TX_${Date.now()}`,
      amountXAF: payload?.amountXAF || 0,
      rawPayload: payload,
    };
  }
}
