import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface LogSecurityEventParams {
  adminUserId?: string; // Optional user/admin ID
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Logs security-sensitive authentication & authorization events.
   * Passwords, access tokens, refresh tokens, and secrets MUST NEVER be logged.
   */
  async logSecurityEvent(params: LogSecurityEventParams): Promise<void> {
    try {
      // Security Filter: Strip any accidental sensitive payload fields
      const { password, passwordHash, accessToken, refreshToken, token, secret, ...safeDetails } =
        params.details || {};

      if (params.adminUserId) {
        await this.prisma.auditLog.create({
          data: {
            adminUserId: params.adminUserId,
            action: params.action,
            resource: params.resource,
            details: safeDetails,
            ipAddress: params.ipAddress || '127.0.0.1',
          },
        });
      } else {
        // System log message
        console.log(
          `[SECURITY AUDIT LOG] ${params.action} on ${params.resource} from ${params.ipAddress || '127.0.0.1'}`,
        );
      }
    } catch (err) {
      console.error('[AUDIT LOG ERROR] Failed to record security audit log entry:', err);
    }
  }
}
