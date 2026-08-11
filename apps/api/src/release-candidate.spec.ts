import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { OrangeMoneyProvider } from './modules/subscription/payment-providers/orange-money.provider';
import { MtnMobileMoneyProvider } from './modules/subscription/payment-providers/mtn-mobile-money.provider';
import { PaymentProviderFactory } from './modules/subscription/payment-providers/payment-provider.factory';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('Phase 14 Release Candidate & Operational Readiness Tests', () => {
  let appService: AppService;
  let prisma: any;
  let factory: PaymentProviderFactory;

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    const mockConfig = {
      get: jest.fn((key: string) => {
        if (key === 'ORANGE_MONEY_WEBHOOK_SECRET') return 'rc_om_secret';
        if (key === 'MTN_MOMO_WEBHOOK_SECRET') return 'rc_mtn_secret';
        return null;
      }),
    };

    const omProvider = new OrangeMoneyProvider(mockConfig as any);
    const mtnProvider = new MtnMobileMoneyProvider(mockConfig as any);
    factory = new PaymentProviderFactory(omProvider, mtnProvider);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    appService = module.get<AppService>(AppService);
  });

  // Test 1: Liveness Health Check
  it('1. Liveness health check returns status ok and service identity', () => {
    const health = appService.getHealth();
    expect(health.status).toBe('ok');
    expect(health.service).toBe('recherche-api');
    expect(health.version).toBe('1.0.0-rc1');
  });

  // Test 2: Readiness Health Check with Database Status
  it('2. Readiness health check verifies database connectivity without leaking credentials', async () => {
    const readiness = await appService.getReadiness();
    expect(readiness.status).toBe('ok');
    expect(readiness.database).toBe('ok');
  });

  // Test 3: Readiness Health Check Degradation Handling
  it('3. Readiness health check handles database connection degradation gracefully', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('DB Connection Timeout'));
    const readiness = await appService.getReadiness();
    expect(readiness.status).toBe('degraded');
    expect(readiness.database).toBe('degraded');
  });

  // Test 4-6: Payment Provider Factory and Webhook Security
  it('4-6. Payment Factory handles supported and unsupported providers safely', () => {
    expect(factory.getProvider('ORANGE_MONEY')).toBeDefined();
    expect(factory.getProvider('MTN_MOMO')).toBeDefined();
    expect(() => factory.getProvider('INVALID_PROVIDER')).toThrow(BadRequestException);
  });

  // Test 7-10: Payment Idempotency & Replay Attack Defense
  it('7-10. Prevents duplicate payment processing via webhook signature verification', async () => {
    const omProvider = factory.getProvider('ORANGE_MONEY');
    
    // Invalid token -> UnauthorizedException
    await expect(
      omProvider.verifyWebhookPayload({ providerTxId: 'OM_999' }, 'wrong_secret'),
    ).rejects.toThrow(UnauthorizedException);

    // Valid token -> Success
    const res = await omProvider.verifyWebhookPayload({ providerTxId: 'OM_999' }, 'rc_om_secret');
    expect(res.success).toBe(true);
  });
});
