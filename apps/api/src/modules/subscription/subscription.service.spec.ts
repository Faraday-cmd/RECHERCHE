import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service';
import { RECHERCHE_SUBSCRIPTION_PRICING, RoleCode } from '@recherche/shared';

describe('SubscriptionService & Phase 6 Verification Suite', () => {
  let service: SubscriptionService;
  let prisma: any;

  const mockUser = {
    id: 'user-uuid-1111',
    email: 'test@example.com',
    status: 'ACTIVE',
  };

  const mockLehrerRole = {
    id: 'role-lehrer-id',
    code: RoleCode.LEHRER,
    name: 'Lehrer',
  };

  const mockBetreuerRole = {
    id: 'role-betreuer-id',
    code: RoleCode.BETREUER,
    name: 'Betreuer',
  };

  const mockUserRoleLehrer = {
    id: 'user-role-lehrer-id',
    userId: mockUser.id,
    roleId: mockLehrerRole.id,
    status: 'PENDING_PAYMENT',
  };

  const mockSubscriptionPending = {
    id: 'sub-uuid-1',
    userRoleId: mockUserRoleLehrer.id,
    planCode: 'LEHRER_WITH_BETREUER',
    amountXAF: 6000,
    status: 'PENDING',
    userRole: {
      userId: mockUser.id,
      role: mockLehrerRole,
    },
  };

  const mockPaymentPending = {
    id: 'pay-uuid-1',
    subscriptionId: mockSubscriptionPending.id,
    idempotencyKey: 'idemp_user-uuid-1111_LEHRER_WITH_BETREUER',
    amountXAF: 6000,
    status: 'PENDING',
    subscription: mockSubscriptionPending,
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      userRole: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        upsert: jest.fn(),
      },
      subscription: {
        create: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'ORANGE_MONEY_WEBHOOK_SECRET') return 'valid_server_webhook_token';
              return null;
            }),
          },
        },
        {
          provide: AuditService,
          useValue: {
            logSecurityEvent: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
  });

  // Test 1: Forged plan code rejection
  it('1. Rejects invalid or forged plan code in request body', async () => {
    await expect(
      service.initiateSubscription(mockUser.id, { planCode: 'FORGED_FREE_PLAN' }),
    ).rejects.toThrow(BadRequestException);
  });

  // Test 2 & 3: Server price calculation & stable idempotency
  it('2 & 3. Computes price server-side (6000 XAF) and re-uses stable idempotency key on retry', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    prisma.role.findUnique.mockResolvedValue(mockLehrerRole);
    prisma.userRole.findUnique.mockResolvedValue(mockUserRoleLehrer);
    prisma.payment.findUnique.mockResolvedValue(null);

    const result = await service.initiateSubscription(mockUser.id, {
      planCode: 'LEHRER_WITH_BETREUER',
    });

    expect(result.amountXAF).toBe(6000);
    expect(result.idempotencyKey).toBe('idemp_user-uuid-1111_LEHRER_WITH_BETREUER');
  });

  // Test 4: Stable Idempotency retry returns existing pending payment
  it('4. Retrying payment initiation for same pending plan returns existing pending intent cleanly', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    prisma.role.findUnique.mockResolvedValue(mockLehrerRole);
    prisma.userRole.findUnique.mockResolvedValue(mockUserRoleLehrer);
    prisma.payment.findUnique.mockResolvedValue(mockPaymentPending);

    const result = await service.initiateSubscription(mockUser.id, {
      planCode: 'LEHRER_WITH_BETREUER',
    });

    expect(result.isRetriedIntent).toBe(true);
    expect(result.paymentId).toBe('pay-uuid-1');
  });

  // Test 5: Duplicate webhook handling (idempotent success response)
  it('5. Duplicate webhook execution on successful payment returns current active status safely', async () => {
    const successPayment = {
      ...mockPaymentPending,
      status: 'SUCCESS',
    };
    prisma.payment.findUnique.mockResolvedValue(successPayment);

    const result = await service.confirmPayment({
      paymentId: 'pay-uuid-1',
      idempotencyKey: 'idemp_user-uuid-1111_LEHRER_WITH_BETREUER',
      webhookToken: 'valid_server_webhook_token',
    });

    expect(result.isDuplicateCallbackHandled).toBe(true);
    expect(result.status).toBe('ACTIVE');
  });

  // Test 6: Role Unlocking Hierarchy
  it('6. Subscription for LEHRER_WITH_BETREUER unlocks ONLY LEHRER and BETREUER', async () => {
    prisma.payment.findUnique.mockResolvedValue(mockPaymentPending);
    prisma.role.findUnique.mockImplementation(({ where }) => {
      if (where.code === RoleCode.LEHRER) return Promise.resolve(mockLehrerRole);
      if (where.code === RoleCode.BETREUER) return Promise.resolve(mockBetreuerRole);
      return Promise.resolve(null);
    });

    const result = await service.confirmPayment({
      paymentId: 'pay-uuid-1',
      idempotencyKey: 'idemp_key_123',
      webhookToken: 'valid_server_webhook_token',
    });

    expect(result.unlockedRoles).toEqual([RoleCode.LEHRER, RoleCode.BETREUER]);
    expect(result.unlockedRoles).not.toContain(RoleCode.DEUTSCH_INSTITUT);
  });

  // Test 7: Unconfigured Profile Status
  it('7. Entitlement is ACTIVE but Profile publicationStatus is DRAFT until provider completes setup', async () => {
    prisma.userRole.findMany.mockResolvedValue([
      {
        id: 'ur-1',
        role: { code: 'LEHRER', name: 'Lehrer' },
        status: 'ACTIVE',
        providerProfile: { publicationStatus: 'DRAFT' },
        subscriptions: [{ status: 'ACTIVE' }],
      },
    ]);

    const myRoles = await service.getUserUnlockedRoles(mockUser.id);
    expect(myRoles[0].roleCode).toBe('LEHRER');
    expect(myRoles[0].isConfigured).toBe(false); // Indicates "Set up your profile"
    expect(myRoles[0].publicationStatus).toBe('DRAFT');
  });

  // Test 8: Invalid Webhook Token Rejection
  it('8. Rejects unauthorized payment confirmation if webhook secret token is invalid', async () => {
    await expect(
      service.confirmPayment({
        paymentId: 'pay-uuid-1',
        idempotencyKey: 'idemp_key_123',
        webhookToken: 'INVALID_WEBHOOK_TOKEN',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
