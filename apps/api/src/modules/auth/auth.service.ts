import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordUtil } from '../../common/utils/password.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuditService } from '../audit/audit.service';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  // In-memory / Redis token revocation storage for active refresh tokens
  private revokedTokens = new Set<string>();
  private activeRefreshTokens = new Map<string, { userId: string; family: string }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Registers a new user account with default privacy settings.
   */
  async register(dto: RegisterDto, ipAddress = '127.0.0.1') {
    // 1. Check email uniqueness
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('A user with this email address already exists.');
    }

    // 2. Hash password with Argon2id
    const passwordHash = await PasswordUtil.hashPassword(dto.password);

    // 3. Create User and PrivacySettings in a transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          name: dto.name.trim(),
          sex: dto.sex,
          dob: new Date(dto.dob),
          permanentLocationGeom: dto.permanentLocationGeom,
          bio: dto.bio?.trim(),
          status: 'ACTIVE',
        },
      });

      await tx.userPrivacySettings.create({
        data: {
          userId: newUser.id,
          profileVisibility: 'PUBLIC',
          showExactAddress: false,
          showAge: true,
        },
      });

      return newUser;
    });

    // 4. Generate Auth Tokens
    const tokens = await this.generateTokenPair(user.id, user.email);

    // 5. Security Audit Log
    await this.auditService.logSecurityEvent({
      adminUserId: user.id,
      action: 'USER_REGISTERED',
      resource: `User:${user.id}`,
      details: { email: user.email },
      ipAddress,
    });

    const { passwordHash: _, ...safeUser } = user;
    const calculatedAge = PasswordUtil.calculateAge(user.dob);

    return {
      user: {
        ...safeUser,
        age: calculatedAge,
      },
      ...tokens,
    };
  }

  /**
   * Authenticates user credentials with Argon2id verification.
   */
  async login(dto: LoginDto, ipAddress = '127.0.0.1') {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        privacySettings: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Protection against account enumeration: generic error message
    if (!user) {
      await this.auditService.logSecurityEvent({
        action: 'LOGIN_FAILED_NON_EXISTENT',
        resource: 'Auth',
        details: { email: dto.email },
        ipAddress,
      });
      throw new UnauthorizedException('Invalid email address or password.');
    }

    // Check account status
    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException('Account is suspended. Please contact platform support.');
    }

    // Verify Argon2id password hash
    const isValid = await PasswordUtil.verifyPassword(user.passwordHash, dto.password);

    if (!isValid) {
      await this.auditService.logSecurityEvent({
        adminUserId: user.id,
        action: 'LOGIN_FAILED_WRONG_PASSWORD',
        resource: `User:${user.id}`,
        details: { email: dto.email },
        ipAddress,
      });
      throw new UnauthorizedException('Invalid email address or password.');
    }

    // Generate Token Pair
    const tokens = await this.generateTokenPair(user.id, user.email);

    await this.auditService.logSecurityEvent({
      adminUserId: user.id,
      action: 'USER_LOGIN_SUCCESS',
      resource: `User:${user.id}`,
      details: { email: user.email },
      ipAddress,
    });

    const { passwordHash: _, ...safeUser } = user;
    const calculatedAge = PasswordUtil.calculateAge(user.dob);

    return {
      user: {
        ...safeUser,
        age: calculatedAge,
      },
      ...tokens,
    };
  }

  /**
   * Refresh Token rotation with token reuse / replay detection.
   */
  async refreshToken(refreshTokenStr: string, ipAddress = '127.0.0.1') {
    if (this.revokedTokens.has(refreshTokenStr)) {
      await this.auditService.logSecurityEvent({
        action: 'REFRESH_TOKEN_REUSE_DETECTED',
        resource: 'Auth',
        details: { token: 'REVOKED_TOKEN_PRESENTED' },
        ipAddress,
      });
      throw new UnauthorizedException('Refresh token has been revoked or previously reused.');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshTokenStr, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'super_secret_refresh_dev_key',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const userId = payload.sub;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is no longer active.');
    }

    // Revoke old refresh token (Token Rotation)
    this.revokedTokens.add(refreshTokenStr);
    this.activeRefreshTokens.delete(refreshTokenStr);

    // Issue new pair
    const newTokens = await this.generateTokenPair(user.id, user.email);

    await this.auditService.logSecurityEvent({
      adminUserId: user.id,
      action: 'TOKEN_REFRESH_SUCCESS',
      resource: `User:${user.id}`,
      details: { email: user.email },
      ipAddress,
    });

    return newTokens;
  }

  /**
   * Revokes refresh token and logs user out.
   */
  async logout(userId: string, refreshTokenStr?: string, ipAddress = '127.0.0.1') {
    if (refreshTokenStr) {
      this.revokedTokens.add(refreshTokenStr);
      this.activeRefreshTokens.delete(refreshTokenStr);
    }

    await this.auditService.logSecurityEvent({
      adminUserId: userId,
      action: 'USER_LOGOUT',
      resource: `User:${userId}`,
      details: {},
      ipAddress,
    });

    return { message: 'Successfully logged out and session revoked.' };
  }

  /**
   * Internal token generator.
   */
  private async generateTokenPair(userId: string, email: string): Promise<TokenPair> {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'super_secret_dev_key',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'super_secret_refresh_dev_key',
      expiresIn: '7d',
    });

    const family = `family_${Date.now()}`;
    this.activeRefreshTokens.set(refreshToken, { userId, family });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}
