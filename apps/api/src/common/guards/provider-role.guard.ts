import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProviderRoleGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required prior to role verification.');
    }

    const providerRoleId = request.headers['x-provider-role-id'];

    if (!providerRoleId || typeof providerRoleId !== 'string') {
      throw new ForbiddenException(
        'Provider role context header (x-provider-role-id) is required for protected provider operations.',
      );
    }

    // 1. Load UserRole, role ownership, profile publication status, and active subscription server-side
    const userRole = await this.prisma.userRole.findUnique({
      where: { id: providerRoleId },
      include: {
        role: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
        providerProfile: true,
        user: true,
      },
    });

    if (!userRole) {
      throw new ForbiddenException('The specified provider role context does not exist.');
    }

    // 2. SERVER-SIDE OWNERSHIP CHECK: Ensure specified role belongs to authenticated user
    if (userRole.userId !== user.id) {
      throw new ForbiddenException(
        'Access Denied: You do not own this provider role. Cross-role access is strictly prohibited.',
      );
    }

    // 3. SERVER-SIDE ACCOUNT & ROLE SUSPENSION CHECK
    if (userRole.status === 'SUSPENDED' || userRole.user.status === 'SUSPENDED') {
      throw new ForbiddenException(
        'Access Denied: This provider account or role is currently suspended.',
      );
    }

    // 4. ENTITLEMENT ACCESS CHECK: Verify role is active / unlocked by payment
    if (userRole.status !== 'ACTIVE') {
      throw new ForbiddenException(
        `Access Denied: Provider role is not currently active (Status: ${userRole.status}). Verified subscription required.`,
      );
    }

    // Attach verified userRole context to request object
    request.activeUserRole = userRole;

    return true;
  }
}
