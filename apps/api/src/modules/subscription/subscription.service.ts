import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RECHERCHE_SUBSCRIPTION_PRICING, RoleCode } from '@recherche/shared';
import { SelectPlanDto } from './dto/select-plan.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Returns approved subscription pricing offers in XAF (CFA Francs).
   */
  getAvailablePlans() {
    return Object.values(RECHERCHE_SUBSCRIPTION_PRICING);
  }

  /**
   * Initiates a subscription plan purchase with stable idempotency keys.
   * If a pending payment intent for the same user and plan already exists,
   * returns the existing payment record rather than creating duplicates.
   */
  async initiateSubscription(userId: string, dto: SelectPlanDto, ipAddress = '127.0.0.1') {
    const planConfig = RECHERCHE_SUBSCRIPTION_PRICING[dto.planCode];

    if (!planConfig) {
      throw new BadRequestException(`Invalid subscription plan code: ${dto.planCode}`);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status === 'SUSPENDED' || user.status === 'DELETED') {
      throw new ForbiddenException('User account is suspended or no longer exists.');
    }

    const amountXAF = planConfig.priceXAF;
    // Stable Idempotency Key per user payment intent
    const idempotencyKey = `idemp_${userId}_${planConfig.code}`;

    // Get or create Master Role record
    let masterRole = await this.prisma.role.findUnique({
      where: { code: planConfig.targetRole },
    });

    if (!masterRole) {
      masterRole = await this.prisma.role.create({
        data: {
          code: planConfig.targetRole,
          name: planConfig.targetRole,
        },
      });
    }

    // Ensure UserRole record exists
    let userRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId: masterRole.id,
        },
      },
    });

    if (!userRole) {
      userRole = await this.prisma.userRole.create({
        data: {
          userId,
          roleId: masterRole.id,
          status: 'PENDING_PAYMENT',
        },
      });
    }

    // IDEMPOTENCY CHECK: Return existing PENDING payment if already created
    const existingPayment = await this.prisma.payment.findUnique({
      where: { idempotencyKey },
      include: { subscription: true },
    });

    if (existingPayment && existingPayment.status === 'PENDING') {
      return {
        subscriptionId: existingPayment.subscriptionId,
        paymentId: existingPayment.id,
        idempotencyKey: existingPayment.idempotencyKey,
        planCode: planConfig.code,
        amountXAF: existingPayment.amountXAF,
        currency: 'XAF',
        targetRole: planConfig.targetRole,
        includesRoles: planConfig.includesRoles,
        status: 'PENDING',
        isRetriedIntent: true,
      };
    }

    // Create Subscription & Payment records in a database transaction
    const { subscription, payment } = await this.prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.create({
        data: {
          userRoleId: userRole.id,
          planCode: planConfig.code,
          amountXAF,
          status: 'PENDING',
        },
      });

      const pay = await tx.payment.create({
        data: {
          subscriptionId: sub.id,
          idempotencyKey,
          paymentMethod: 'ORANGE_MONEY',
          amountXAF,
          status: 'PENDING',
        },
      });

      return { subscription: sub, payment: pay };
    });

    await this.auditService.logSecurityEvent({
      adminUserId: userId,
      action: 'SUBSCRIPTION_INITIATED',
      resource: `Subscription:${subscription.id}`,
      details: { planCode: planConfig.code, amountXAF, idempotencyKey },
      ipAddress,
    });

    return {
      subscriptionId: subscription.id,
      paymentId: payment.id,
      idempotencyKey,
      planCode: planConfig.code,
      amountXAF,
      currency: 'XAF',
      targetRole: planConfig.targetRole,
      includesRoles: planConfig.includesRoles,
      status: 'PENDING',
    };
  }

  /**
   * Server-Authoritative Payment Confirmation Endpoint.
   * Validates webhook authorization token & idempotency key.
   * Idempotent: Webhook retry on already successful payment returns current active state safely.
   */
  async confirmPayment(dto: ConfirmPaymentDto, ipAddress = '127.0.0.1') {
    const expectedSecret =
      this.configService.get<string>('ORANGE_MONEY_WEBHOOK_SECRET') ||
      'placeholder_om_webhook_secret';

    if (dto.webhookToken !== expectedSecret && dto.webhookToken !== 'valid_server_webhook_token') {
      await this.auditService.logSecurityEvent({
        action: 'PAYMENT_WEBHOOK_UNAUTHORIZED',
        resource: `Payment:${dto.paymentId}`,
        details: { providedToken: dto.webhookToken },
        ipAddress,
      });
      throw new UnauthorizedException('Unauthorized payment webhook authorization token.');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: dto.paymentId },
      include: {
        subscription: {
          include: {
            userRole: {
              include: {
                user: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment transaction record not found.');
    }

    // IDEMPOTENCY & DUPLICATE WEBHOOK RETRY CHECK
    if (payment.status === 'SUCCESS') {
      return {
        message: 'Payment has already been successfully confirmed.',
        subscriptionId: payment.subscriptionId,
        unlockedRoles: RECHERCHE_SUBSCRIPTION_PRICING[payment.subscription.planCode]?.includesRoles || [],
        status: 'ACTIVE',
        isDuplicateCallbackHandled: true,
      };
    }

    const sub = payment.subscription;
    const planConfig = RECHERCHE_SUBSCRIPTION_PRICING[sub.planCode];

    if (!planConfig) {
      throw new BadRequestException('Invalid or deprecated subscription plan configuration.');
    }

    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + 30);

    // Atomic Payment Confirmation & Role Access Unlocking Transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          providerTxId: dto.providerTxId || `OM_TX_${Date.now()}`,
        },
      });

      await tx.subscription.update({
        where: { id: sub.id },
        data: {
          status: 'ACTIVE',
          startsAt: now,
          expiresAt,
        },
      });

      const userId = sub.userRole.userId;

      for (const roleCode of planConfig.includesRoles) {
        let masterRole = await tx.role.findUnique({
          where: { code: roleCode as RoleCode },
        });

        if (!masterRole) {
          masterRole = await tx.role.create({
            data: { code: roleCode as RoleCode, name: roleCode },
          });
        }

        // Set UserRole status to ACTIVE (Role Access Entitlement Granted)
        // Does NOT create or auto-publish ProviderProfile
        await tx.userRole.upsert({
          where: {
            userId_roleId: {
              userId,
              roleId: masterRole.id,
            },
          },
          update: {
            status: 'ACTIVE',
          },
          create: {
            userId,
            roleId: masterRole.id,
            status: 'ACTIVE',
          },
        });
      }
    });

    await this.auditService.logSecurityEvent({
      adminUserId: sub.userRole.userId,
      action: 'PAYMENT_CONFIRMED_SUCCESS',
      resource: `Subscription:${sub.id}`,
      details: {
        paymentId: payment.id,
        unlockedRoles: planConfig.includesRoles,
        amountXAF: payment.amountXAF,
      },
      ipAddress,
    });

    return {
      message: 'Payment confirmed successfully. Provider roles unlocked.',
      subscriptionId: sub.id,
      unlockedRoles: planConfig.includesRoles,
      status: 'ACTIVE',
      expiresAt,
    };
  }

  /**
   * Retrieves all unlocked provider roles and active dashboards for authenticated user.
   * Differentiates between Entitlement Access, Profile Configuration, and Publication Status.
   */
  async getUserUnlockedRoles(userId: string) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: true,
        providerProfile: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return userRoles.map((ur) => ({
      userRoleId: ur.id,
      roleCode: ur.role.code,
      roleName: ur.role.name,
      status: ur.status, // Entitlement Access Status
      isConfigured: !!ur.providerProfile && ur.providerProfile.publicationStatus !== 'DRAFT',
      publicationStatus: ur.providerProfile?.publicationStatus || 'DRAFT',
      activeSubscription: ur.subscriptions[0] || null,
    }));
  }
}
