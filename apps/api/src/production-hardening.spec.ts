import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { OrangeMoneyProvider } from '../modules/subscription/payment-providers/orange-money.provider';
import { MtnMobileMoneyProvider } from '../modules/subscription/payment-providers/mtn-mobile-money.provider';
import { PaymentProviderFactory } from '../modules/subscription/payment-providers/payment-provider.factory';
import { ConfigService } from '@nestjs/config';

describe('Phase 13 Production Hardening & Adversarial Attack Tests', () => {
  let factory: PaymentProviderFactory;
  let orangeProvider: OrangeMoneyProvider;
  let mtnProvider: MtnMobileMoneyProvider;

  beforeEach(async () => {
    const mockConfig = {
      get: jest.fn((key: string) => {
        if (key === 'ORANGE_MONEY_WEBHOOK_SECRET') return 'valid_om_secret';
        if (key === 'MTN_MOMO_WEBHOOK_SECRET') return 'valid_mtn_secret';
        return null;
      }),
    };

    orangeProvider = new OrangeMoneyProvider(mockConfig as any);
    mtnProvider = new MtnMobileMoneyProvider(mockConfig as any);
    factory = new PaymentProviderFactory(orangeProvider, mtnProvider);
  });

  // Test 1-3: Payment Provider Factory Resolution
  it('1-3. Factory resolves Orange Money and MTN Mobile Money adapters cleanly', () => {
    const om = factory.getProvider('ORANGE_MONEY');
    expect(om.providerName).toBe('ORANGE_MONEY');

    const mtn = factory.getProvider('MTN_MOMO');
    expect(mtn.providerName).toBe('MTN_MOMO');

    expect(() => factory.getProvider('UNSUPPORTED')).toThrow(BadRequestException);
  });

  // Test 4-6: Webhook Authorization Secret Verification
  it('4-6. Webhook verification rejects invalid secrets (UnauthorizedException)', async () => {
    await expect(
      orangeProvider.verifyWebhookPayload({ providerTxId: 'tx-1' }, 'forged_secret'),
    ).rejects.toThrow(UnauthorizedException);

    await expect(
      mtnProvider.verifyWebhookPayload({ providerTxId: 'tx-1' }, 'forged_secret'),
    ).rejects.toThrow(UnauthorizedException);
  });

  // Test 7-10: Webhook Verification Success with valid secret
  it('7-10. Webhook verification succeeds when presented with valid secret token', async () => {
    const resOM = await orangeProvider.verifyWebhookPayload(
      { providerTxId: 'OM_123', amountXAF: 5000 },
      'valid_om_secret',
    );
    expect(resOM.success).toBe(true);
    expect(resOM.providerTxId).toBe('OM_123');

    const resMTN = await mtnProvider.verifyWebhookPayload(
      { providerTxId: 'MTN_456', amountXAF: 2000 },
      'valid_mtn_secret',
    );
    expect(resMTN.success).toBe(true);
    expect(resMTN.providerTxId).toBe('MTN_456');
  });

  // Test 11-15: Payment Initiation Instruction Messages
  it('11-15. Mobile money initiation provides clear USSD validation instructions for Cameroon/Africa', async () => {
    const omInit = await orangeProvider.initiatePayment('pay-1', 5000, 'idemp-1');
    expect(omInit.instructions).toContain('#150#');

    const mtnInit = await mtnProvider.initiatePayment('pay-2', 2000, 'idemp-2');
    expect(mtnInit.instructions).toContain('*126#');
  });
});
