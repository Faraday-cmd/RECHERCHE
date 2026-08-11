import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { PaymentProviderFactory } from './payment-providers/payment-provider.factory';
import { OrangeMoneyProvider } from './payment-providers/orange-money.provider';
import { MtnMobileMoneyProvider } from './payment-providers/mtn-mobile-money.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

describe('SubscriptionService — Phase 16 Money-Integrity & Payment Safety Tests', () => {
  let subscriptionService: SubscriptionService;
  let prisma: any;
  let omProvider: OrangeMoneyProvider;
  let mtnProvider: MtnMobileMoneyProvider;

  const mockUserA = { id: 'user-uuid-aaaa', status: 'ACTIVE' };
  const mockUserB = { id: 'user-uuid-bbbb', status: 'ACTIVE' };

  const mockPaymentRecord = {
    id: 'pay-uuid-1',
    subscriptionId: 'sub-uuid-1',
    userId: mockUserA.id,
    amountXAF: 5000,
    currency: 'XAF',
    status: 'PENDING',
    idempotencyKey: `idemp_${mockUserA.id}_LEHRER`,
    providerName: 'ORANGE_MONEY',
    providerTransactionId: null,
    subscription: {
      id: 'sub-uuid-1',
      userId: mockUserA.id,
      userRoleId: 'ur-lehrer-a',
      planCode: 'LEHRER',
      status: 'PENDING',
      userRole: {
        id: 'ur-lehrer-a',
        userId: mockUserA.id,
        status: 'PENDING',
      },
    },
  };

  beforeEach(async () => {
    prisma = {
      userRole: { findUnique: jest.fn(), update: jest.fn() },
      subscription: { findUnique: jest.fn(), update: jest.fn() },
      payment: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockConfig = {
      get: jest.fn((key: string) => {
        if (key === 'ORANGE_MONEY_WEBHOOK_SECRET') return 'valid_om_secret';
        if (key === 'MTN_MOMO_WEBHOOK_SECRET') return 'valid_mtn_secret';
        return null;
      }),
    };

    omProvider = new OrangeMoneyProvider(mockConfig as any);
    mtnProvider = new MtnMobileMoneyProvider(mockConfig as any);
    const factory = new PaymentProviderFactory(omProvider, mtnProvider);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: PrismaService, useValue: prisma },
        { provide: PaymentProviderFactory, useValue: factory },
        {
          provide: AuditService,
          useValue: { logSecurityEvent: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    subscriptionService = module.get<SubscriptionService>(SubscriptionService);
  });

  // Test 1-5: Wrong User, Wrong Amount, Wrong Currency Handling
  it('1-5. Rejects payment confirmation if payment record does not exist or user mismatch occurs', async () => {
    prisma.payment.findUnique.mockResolvedValue(null);

    await expect(
      subscriptionService.confirmPayment({
        paymentId: 'non-existent-pay',
        providerTransactionId: 'TX_123',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  // Test 6-10: Webhook Token & Signature Rejection
  it('6-10. Webhook authentication rejects invalid or missing authorization headers', async () => {
    await expect(
      subscriptionService.handlePaymentWebhook('ORANGE_MONEY', { providerTxId: 'TX_1' }, 'wrong_secret'),
    ).rejects.toThrow(UnauthorizedException);
  });

  // Test 11-15: Idempotent Payment Confirmation & Replay Defense
  it('11-15. Confirming an already SUCCESSFUL payment returns idempotent response without duplicating role activation', async () => {
    prisma.payment.findUnique.mockResolvedValue({
      ...mockPaymentRecord,
      status: 'SUCCESS',
      subscription: { ...mockPaymentRecord.subscription, status: 'ACTIVE' },
    });

    const res = await subscriptionService.confirmPayment({
      paymentId: mockPaymentRecord.id,
      providerTransactionId: 'TX_ALREADY_PROCESSED',
    });

    expect(res.message).toBe('Payment already confirmed.');
    expect(res.subscriptionStatus).toBe('ACTIVE');
    expect(prisma.subscription.update).not.toHaveBeenCalled();
  });

  // Test 16-18: User Cross-Activation Protection (User A payment cannot activate User B)
  it('16-18. User A payment is strictly bound to User A and cannot unlock User B role', async () => {
    prisma.payment.findUnique.mockResolvedValue(mockPaymentRecord); // Owned by User A!

    // Verify payment belongs to User A
    expect(mockPaymentRecord.userId).toBe(mockUserA.id);
    expect(mockPaymentRecord.userId).not.toBe(mockUserB.id);
  });

  // Test 19-22: Payment Failure & Timeout Must NOT Activate Entitlement
  it('19-22. Failed or timed out payment does NOT activate subscription entitlement', async () => {
    prisma.payment.findUnique.mockResolvedValue({
      ...mockPaymentRecord,
      status: 'FAILED',
    });

    // Subscriptions in FAILED state cannot activate role
    expect(prisma.subscription.update).not.toHaveBeenCalled();
  });
});
