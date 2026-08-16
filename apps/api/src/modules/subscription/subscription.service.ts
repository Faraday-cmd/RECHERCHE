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
import { RoleCode } from '@prisma/client';
import { SelectPlanDto } from './dto/select-plan.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { AuditService } from '../audit/audit.service';

export const RECHERCHE_SUBSCRIPTION_PRICING: Record<
  string,
  {
    code: string;
    targetRole: RoleCode;
    name: string;
    priceXAF: number;
    includesRoles: RoleCode[];
    description: string;
  }
> = {
  PLAN_LEHRER_MONTHLY: {
    code: 'PLAN_LEHRER_MONTHLY',
    targetRole: RoleCode.LEHRER,
    name: 'Abonnement Enseignant d\'Allemand',
    priceXAF: 5000,
    includesRoles: [RoleCode.LEHRER],
    description: 'Publication de cours d\'allemand, profil tuteur certifié et messagerie élèves.',
  },
  PLAN_BETREUER_MONTHLY: {
    code: 'PLAN_BETREUER_MONTHLY',
    targetRole: RoleCode.BETREUER,
    name: 'Abonnement Encadreur / Mentor',
    priceXAF: 5000,
    includesRoles: [RoleCode.BETREUER],
    description: 'Accompagnement académique et d\'intégration en Allemagne.',
  },
  PLAN_VISA_MONTHLY: {
    code: 'PLAN_VISA_MONTHLY',
    targetRole: RoleCode.VISA_COMPANION,
    name: 'Abonnement Accompagnateur Visa',
    priceXAF: 7500,
    includesRoles: [RoleCode.VISA_COMPANION],
    description: 'Conseils spécialisés et suivi des procédures consulaires de demande de visa.',
  },
  PLAN_INSTITUT_MONTHLY: {
    code: 'PLAN_INSTITUT_MONTHLY',
    targetRole: RoleCode.DEUTSCH_INSTITUT,
    name: 'Abonnement Institut de Langue',
    priceXAF: 25000,
    includesRoles: [RoleCode.DEUTSCH_INSTITUT, RoleCode.LEHRER],
    description: 'Gestion multi-campus, publication de sessions de cours et mise en avant institutionnelle.',
  },
};

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
    const idempotencyKey = `idemp_${userId}_${planConfig.code}`;

    let masterRole = await this.prisma.role.findUnique({
      where: { code: planConfig.targetRole },
    });

    if (!masterRole) {
      masterRole = await this.prisma.role.create({
        data: {
          code: planConfig.targetRole,
          name: planConfig.name,
        },
      });
    }

    let userRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: masterRole.id,
        },
      },
    });

    if (!userRole) {
      userRole = await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: masterRole.id,
          status: 'DRAFT',
        },
      });
    }

    const existingPayment = await this.prisma.payment.findUnique({
      where: { idempotencyKey },
      include: {
        subscription: true,
      },
    });

    if (existingPayment) {
      return {
        message: 'Pending payment intent retrieved.',
        subscriptionId: existingPayment.subscriptionId,
        paymentId: existingPayment.id,
        idempotencyKey,
        amountXAF: Number(existingPayment.amountXAF),
        status: existingPayment.status,
      };
    }

    const subscription = await this.prisma.subscription.create({
      data: {
        userRoleId: userRole.id,
        planCode: planConfig.code,
        amountXAF,
        status: 'PENDING',
      },
    });

    const payment = await this.prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        idempotencyKey,
        paymentMethod: dto.paymentMethod || 'ORANGE_MONEY',
        amountXAF,
        status: 'PENDING',
      },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: userId,
      action: 'SUBSCRIPTION_INITIATED',
      resource: `Subscription:${subscription.id}`,
      details: { planCode: planConfig.code, amountXAF },
      ipAddress,
    });

    return {
      message: 'Subscription payment intent created.',
      subscriptionId: subscription.id,
      paymentId: payment.id,
      idempotencyKey,
      amountXAF,
      status: payment.status,
    };
  }

  /**
   * Confirms payment for a pending subscription (Simulated / Webhook Callback).
   */
  async confirmPayment(dto: ConfirmPaymentDto, ipAddress = '127.0.0.1') {
    const payment = await this.prisma.payment.findUnique({
      where: {
        idempotencyKey: dto.idempotencyKey,
      },
      include: {
        subscription: {
          include: {
            userRole: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment intent record not found for this idempotency key.');
    }

    if (payment.status === 'SUCCESS') {
      return {
        message: 'Payment already confirmed.',
        subscriptionId: payment.subscriptionId,
        unlockedRoles: [payment.subscription.userRole.roleId],
        status: 'SUCCESS',
        isDuplicateCallbackHandled: true,
      };
    }

    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          providerTxId: dto.providerTxId || `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        },
      });

      const updatedSub = await tx.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: 'ACTIVE',
          startsAt: now,
          expiresAt,
        },
      });

      const updatedUserRole = await tx.userRole.update({
        where: { id: payment.subscription.userRoleId },
        data: {
          status: 'ACTIVE',
        },
      });

      return { updatedPayment, updatedSub, updatedUserRole };
    });

    await this.auditService.logSecurityEvent({
      adminUserId: payment.subscription.userRole.userId,
      action: 'SUBSCRIPTION_ACTIVATED',
      resource: `Subscription:${payment.subscriptionId}`,
      details: {
        amountXAF: Number(payment.amountXAF),
        expiresAt: expiresAt.toISOString(),
      },
      ipAddress,
    });

    return {
      message: 'Payment confirmed and role activated successfully.',
      subscriptionId: result.updatedSub.id,
      status: 'ACTIVE',
      expiresAt,
      unlockedRoles: [result.updatedUserRole.roleId],
    };
  }

  /**
   * Retrieves active unlocked roles for a given user.
   */
  async getUserUnlockedRoles(userId: string) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { role: true },
    });
    return userRoles.map((ur) => ur.role.code);
  }
}
