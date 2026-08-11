import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordUtil } from '../../common/utils/password.util';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdatePrivacySettingsDto } from './dto/update-privacy-settings.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Retrieves full profile & privacy settings for authenticated user.
   */
  async getOwnProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        privacySettings: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || user.status === 'DELETED') {
      throw new NotFoundException('User profile not found.');
    }

    const { passwordHash: _, ...safeUser } = user;
    const age = PasswordUtil.calculateAge(user.dob);

    return {
      ...safeUser,
      age,
    };
  }

  /**
   * Updates authenticated user's own profile.
   * Server enforces ownership via authenticated userId.
   */
  async updateOwnProfile(userId: string, dto: UpdateUserProfileDto, ipAddress = '127.0.0.1') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status === 'DELETED') {
      throw new NotFoundException('User profile not found.');
    }

    // Input Sanitization: Strip malicious script tags from self bio text
    let sanitizedBio = dto.bio;
    if (sanitizedBio) {
      sanitizedBio = sanitizedBio
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .trim();
    }

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name.trim();
    if (dto.sex !== undefined) updateData.sex = dto.sex;
    if (dto.dob !== undefined) updateData.dob = new Date(dto.dob);
    if (dto.permanentLocationGeom !== undefined)
      updateData.permanentLocationGeom = dto.permanentLocationGeom;
    if (dto.bio !== undefined) updateData.bio = sanitizedBio;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        privacySettings: true,
      },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: userId,
      action: 'USER_PROFILE_UPDATED',
      resource: `User:${userId}`,
      details: { updatedFields: Object.keys(updateData) },
      ipAddress,
    });

    const { passwordHash: _, ...safeUser } = updatedUser;
    const age = PasswordUtil.calculateAge(updatedUser.dob);

    return {
      ...safeUser,
      age,
    };
  }

  /**
   * Retrieves public profile for another user, strictly enforcing privacy rules,
   * friendship status, block state, and coordinate masking.
   */
  async getUserPublicProfile(targetUserId: string, requesterId?: string) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        privacySettings: true,
      },
    });

    if (!targetUser || targetUser.status === 'DELETED') {
      throw new NotFoundException('User profile not found or unavailable.');
    }

    // 1. Check Block State (if requester is logged in)
    if (requesterId && requesterId !== targetUserId) {
      const isBlocked = await this.prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: targetUserId, blockedId: requesterId },
            { blockerId: requesterId, blockedId: targetUserId },
          ],
        },
      });

      if (isBlocked) {
        throw new ForbiddenException('Access Denied: User profile is unavailable.');
      }
    }

    const isSelf = requesterId === targetUserId;
    const settings = targetUser.privacySettings;

    // 2. Evaluate Profile Visibility Rules (PUBLIC, FRIENDS_ONLY, PRIVATE)
    if (!isSelf && settings) {
      if (settings.profileVisibility === 'PRIVATE') {
        throw new ForbiddenException('Access Denied: User profile is private.');
      }

      if (settings.profileVisibility === 'FRIENDS_ONLY') {
        let isFriend = false;
        if (requesterId) {
          const friendship = await this.prisma.friendship.findFirst({
            where: {
              status: 'ACCEPTED',
              OR: [
                { user1Id: requesterId, user2Id: targetUserId },
                { user1Id: targetUserId, user2Id: requesterId },
              ],
            },
          });
          if (friendship) isFriend = true;
        }

        if (!isFriend) {
          throw new ForbiddenException(
            'Access Denied: User profile is restricted to friends only.',
          );
        }
      }
    }

    // 3. Privacy Masking & Data Minimization
    const age = settings?.showAge ? PasswordUtil.calculateAge(targetUser.dob) : undefined;
    const permanentLocation =
      isSelf || settings?.showExactAddress ? targetUser.permanentLocationGeom : undefined;

    return {
      id: targetUser.id,
      name: targetUser.name,
      sex: targetUser.sex,
      bio: targetUser.bio,
      age,
      permanentLocationGeom: permanentLocation, // Masked if showExactAddress is false
      profileVisibility: settings?.profileVisibility || 'PUBLIC',
      createdAt: targetUser.createdAt,
    };
  }

  /**
   * Updates privacy settings for authenticated user.
   */
  async updatePrivacySettings(
    userId: string,
    dto: UpdatePrivacySettingsDto,
    ipAddress = '127.0.0.1',
  ) {
    const updatedSettings = await this.prisma.userPrivacySettings.upsert({
      where: { userId },
      update: {
        ...(dto.profileVisibility !== undefined && { profileVisibility: dto.profileVisibility }),
        ...(dto.showExactAddress !== undefined && { showExactAddress: dto.showExactAddress }),
        ...(dto.showAge !== undefined && { showAge: dto.showAge }),
      },
      create: {
        userId,
        profileVisibility: dto.profileVisibility || 'PUBLIC',
        showExactAddress: dto.showExactAddress ?? false,
        showAge: dto.showAge ?? true,
      },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: userId,
      action: 'USER_PRIVACY_UPDATED',
      resource: `UserPrivacySettings:${userId}`,
      details: dto as Record<string, any>,
      ipAddress,
    });

    return updatedSettings;
  }
}
