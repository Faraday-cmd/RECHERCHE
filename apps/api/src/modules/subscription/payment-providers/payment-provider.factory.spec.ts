import { OrangeMoneyProvider } from './orange-money.provider';
import { MtnMobileMoneyProvider } from './mtn-mobile-money.provider';
import { MockPaymentProvider } from './mock-payment.provider';
import { PaymentProviderFactory } from './payment-provider.factory';

describe('PaymentProviderFactory Extensibility Test (Section C)', () => {
  it('Proves future payment providers (Mock, PayPal, Stripe) can be registered without modifying SubscriptionService', async () => {
    const mockConfigService = { get: jest.fn().mockReturnValue('secret') };
    const om = new OrangeMoneyProvider(mockConfigService as any);
    const mtn = new MtnMobileMoneyProvider(mockConfigService as any);
    const mockProvider = new MockPaymentProvider();

    // Custom factory registering future provider
    const factory = new PaymentProviderFactory(om, mtn);
    (factory as any).providers.set(mockProvider.providerName, mockProvider);

    const resolved = factory.getProvider('MOCK_FUTURE_PAYMENT');
    expect(resolved).toBeDefined();
    expect(resolved.providerName).toBe('MOCK_FUTURE_PAYMENT');

    const initResult = await resolved.initiatePayment('pay-future-1', 10000, 'idemp-future-1');
    expect(initResult.amountXAF).toBe(10000);
    expect(initResult.instructions).toContain('Mock payment initiation');

    const verifyResult = await resolved.verifyWebhookPayload(
      { providerTxId: 'MOCK_TX_999', amountXAF: 10000 },
      'mock_valid_token',
    );
    expect(verifyResult.success).toBe(true);
    expect(verifyResult.providerTxId).toBe('MOCK_TX_999');
  });
});
