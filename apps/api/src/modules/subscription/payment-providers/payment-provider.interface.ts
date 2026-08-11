export interface InitiatePaymentResult {
  providerName: string;
  paymentId: string;
  idempotencyKey: string;
  amountXAF: number;
  currency: string;
  redirectUrl?: string;
  instructions?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  providerTxId: string;
  amountXAF: number;
  rawPayload?: any;
}

export interface IPaymentProvider {
  readonly providerName: string;

  initiatePayment(
    paymentId: string,
    amountXAF: number,
    idempotencyKey: string,
    metadata?: Record<string, any>,
  ): Promise<InitiatePaymentResult>;

  verifyWebhookPayload(
    payload: any,
    webhookToken: string,
  ): Promise<VerifyPaymentResult>;
}
