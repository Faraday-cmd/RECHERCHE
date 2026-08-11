import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  IPaymentProvider,
  InitiatePaymentResult,
  VerifyPaymentResult,
} from './payment-provider.interface';

@Injectable()
export class MockPaymentProvider implements IPaymentProvider {
  readonly providerName = 'MOCK_FUTURE_PAYMENT';

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
      instructions: 'Mock payment initiation for future provider extensibility validation.',
    };
  }

  async verifyWebhookPayload(
    payload: any,
    webhookToken: string,
  ): Promise<VerifyPaymentResult> {
    if (webhookToken !== 'mock_valid_token') {
      throw new UnauthorizedException('Invalid mock payment provider token.');
    }

    return {
      success: true,
      providerTxId: payload?.providerTxId || `MOCK_TX_${Date.now()}`,
      amountXAF: payload?.amountXAF || 0,
      rawPayload: payload,
    };
  }
}
