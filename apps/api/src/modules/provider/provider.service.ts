import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ProviderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Retrieves profile for currently active provider role context (x-provider-role-id).
   * Enforces server-side ownership.
   */
  async getOwnProfile(userRoleId: string, userId: string) {
    const userRole = await this.prisma.userRole.findUnique({
      where: { id: userRoleId },
      include: {
        role: true,
        providerProfile: {
          include: {
            campuses: {
              include: {
                coursesAvailable: true,
              },
            },
          },
        },
      },
    });

    if (!userRole) {
      throw new NotFoundException('Provider role context not found.');
    }

    if (userRole.userId !== userId) {
      throw new ForbiddenException(
        'Access Denied: You do not own this provider role. Cross-role access is strictly prohibited.',
      );
    }

    return {
      userRoleId: userRole.id,
      roleCode: userRole.role.code,
      roleName: userRole.role.name,
      status: userRole.status,
      profile: userRole.providerProfile || null,
      isConfigured: !!userRole.providerProfile && userRole.providerProfile.publicationStatus !== 'DRAFT',
      publicationStatus: userRole.providerProfile?.publicationStatus || 'DRAFT',
    };
  }

  /**
   * Creates or updates provider profile for active provider role context.
   * Enforces ownership, active role status, and HTML sanitization.
   */
  async updateOwnProfile(
    userRoleId: string,
    userId: string,
    dto: UpdateProviderProfileDto,
    ipAddress = '127.0.0.1',
  ) {
    const userRole = await this.prisma.userRole.findUnique({
      where: { id: userRoleId },
      include: { user: true, role: true },
    });

    if (!userRole) {
      throw new NotFoundException('Provider role context not found.');
    }

    if (userRole.userId !== userId) {
      throw new ForbiddenException(
        'Access Denied: You do not own this provider role. Cross-role mutation rejected.',
      );
    }

    if (userRole.status !== 'ACTIVE') {
      throw new ForbiddenException(
        `Access Denied: Cannot modify provider profile while role status is ${userRole.status}. Active subscription required.`,
      );
    }

    // Input Sanitization: Strip dangerous HTML/script tags
    let sanitizedShortBio = dto.shortBio;
    if (sanitizedShortBio) {
      sanitizedShortBio = sanitizedShortBio
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .trim();
    }

    let sanitizedFullDesc = dto.fullDescription;
    if (sanitizedFullDesc) {
      sanitizedFullDesc = sanitizedFullDesc
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .trim();
    }

    const profile = await this.prisma.providerProfile.upsert({
      where: { userRoleId },
      update: {
        ...(dto.displayName !== undefined && { displayName: dto.displayName.trim() }),
        ...(dto.shortBio !== undefined && { shortBio: sanitizedShortBio }),
        ...(dto.fullDescription !== undefined && { fullDescription: sanitizedFullDesc }),
        ...(dto.profilePicUrl !== undefined && { profilePicUrl: dto.profilePicUrl }),
        ...(dto.coverPicUrl !== undefined && { coverPicUrl: dto.coverPicUrl }),
        ...(dto.phoneNumbers !== undefined && { phoneNumbers: dto.phoneNumbers }),
        ...(dto.openingHours !== undefined && { openingHours: dto.openingHours }),
        ...(dto.yearFounded !== undefined && { yearFounded: dto.yearFounded }),
        ...(dto.fixedLocationGeom !== undefined && { fixedLocationGeom: dto.fixedLocationGeom }),
        publicationStatus: 'CONFIGURED',
      },
      create: {
        userRoleId,
        displayName: dto.displayName?.trim() || 'Nouveau Prestataire',
        shortBio: sanitizedShortBio || '',
        fullDescription: sanitizedFullDesc || '',
        profilePicUrl: dto.profilePicUrl || null,
        coverPicUrl: dto.coverPicUrl || null,
        phoneNumbers: dto.phoneNumbers || [],
        openingHours: dto.openingHours || null,
        yearFounded: dto.yearFounded || null,
        fixedLocationGeom: dto.fixedLocationGeom || null,
        publicationStatus: 'CONFIGURED',
      },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: userId,
      action: 'PROVIDER_PROFILE_UPDATED',
      resource: `ProviderProfile:${profile.id}`,
      details: { roleCode: userRole.role.code, publicationStatus: profile.publicationStatus },
      ipAddress,
    });

    return profile;
  }

  /**
   * Toggles public publication status (PUBLISHED vs UNPUBLISHED).
   */
  async togglePublication(
    userRoleId: string,
    userId: string,
    publish: boolean,
    ipAddress = '127.0.0.1',
  ) {
    const profile = await this.prisma.providerProfile.findUnique({
      where: { userRoleId },
      include: { userRole: true },
    });

    if (!profile || profile.userRole.userId !== userId) {
      throw new ForbiddenException('Access Denied: You do not own this provider profile.');
    }

    if (profile.userRole.status !== 'ACTIVE') {
      throw new ForbiddenException('Access Denied: Active verified subscription required to publish profile.');
    }

    const newStatus = publish ? 'PUBLISHED' : 'UNPUBLISHED';

    const updatedProfile = await this.prisma.providerProfile.update({
      where: { userRoleId },
      data: { publicationStatus: newStatus },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: userId,
      action: 'PROVIDER_PUBLICATION_TOGGLED',
      resource: `ProviderProfile:${profile.id}`,
      details: { newStatus },
      ipAddress,
    });

    return {
      message: `Profile publication status updated to ${newStatus}.`,
      publicationStatus: updatedProfile.publicationStatus,
    };
  }

  /**
   * Retrieves public provider profile for public display & search.
   * Strictly enforces that provider profile MUST have publicationStatus == 'PUBLISHED'
   * and userRole.status == 'ACTIVE'. Otherwise rejects with HTTP 404.
   */
  async getPublicProfile(providerProfileId: string) {
    const profile = await this.prisma.providerProfile.findUnique({
      where: { id: providerProfileId },
      include: {
        userRole: {
          include: {
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
        campuses: {
          include: {
            coursesAvailable: true,
          },
        },
        infos: {
          where: { status: 'PUBLISHED' },
          take: 10,
        },
        currentCourses: {
          take: 10,
        },
        _count: {
          select: {
            follows: true,
            ratings: true,
          },
        },
      },
    });

    // Enforcement: Only PUBLISHED profiles owned by ACTIVE userRoles can be discovered publicly
    if (
      !profile ||
      profile.publicationStatus !== 'PUBLISHED' ||
      profile.userRole.status !== 'ACTIVE' ||
      profile.userRole.user.status !== 'ACTIVE'
    ) {
      throw new NotFoundException('Provider profile not found, unconfigured, or not currently published.');
    }

    return {
      id: profile.id,
      roleCode: profile.userRole.role.code,
      roleName: profile.userRole.role.name,
      displayName: profile.displayName,
      shortBio: profile.shortBio,
      fullDescription: profile.fullDescription,
      profilePicUrl: profile.profilePicUrl,
      coverPicUrl: profile.coverPicUrl,
      phoneNumbers: profile.phoneNumbers,
      openingHours: profile.openingHours,
      yearFounded: profile.yearFounded,
      fixedLocationGeom: profile.fixedLocationGeom,
      followerCount: profile._count.follows,
      ratingCount: profile._count.ratings,
      campuses: profile.campuses,
      recentInfos: profile.infos,
      currentCourses: profile.currentCourses,
      publishedAt: profile.createdAt,
    };
  }

  /**
   * Retrieves provider dashboard stats for active role context.
   */
  async getDashboardStats(userRoleId: string, userId: string) {
    const userRole = await this.prisma.userRole.findUnique({
      where: { id: userRoleId },
      include: {
        providerProfile: {
          include: {
            _count: {
              select: {
                follows: true,
                infos: true,
                currentCourses: true,
                ratings: true,
              },
            },
          },
        },
      },
    });

    if (!userRole || userRole.userId !== userId) {
      throw new ForbiddenException('Access Denied: You do not own this provider role context.');
    }

    const profile = userRole.providerProfile;

    return {
      userRoleId: userRole.id,
      publicationStatus: profile?.publicationStatus || 'DRAFT',
      stats: {
        followers: profile?._count.follows || 0,
        infosPublished: profile?._count.infos || 0,
        coursesPublished: profile?._count.currentCourses || 0,
        ratingsReceived: profile?._count.ratings || 0,
      },
    };
  }
}
