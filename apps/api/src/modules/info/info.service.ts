import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInfoDto } from './dto/create-info.dto';
import { UpdateInfoDto } from './dto/update-info.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReportInfoDto } from './dto/report-info.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class InfoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Helper verifying that userRoleId belongs to userId and owns a ProviderProfile.
   */
  private async verifyProviderProfileOwnership(userRoleId: string, userId: string) {
    const userRole = await this.prisma.userRole.findUnique({
      where: { id: userRoleId },
      include: {
        providerProfile: true,
        user: true,
      },
    });

    if (!userRole) {
      throw new NotFoundException('Provider role context not found.');
    }

    if (userRole.userId !== userId) {
      throw new ForbiddenException(
        'Access Denied: You do not own this provider role. Cross-role mutation rejected.',
      );
    }

    if (userRole.status !== 'ACTIVE' || userRole.user.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'Access Denied: Active verified subscription required for provider content mutations.',
      );
    }

    if (!userRole.providerProfile) {
      throw new BadRequestException('Provider profile must be configured before creating content.');
    }

    return userRole.providerProfile;
  }

  /**
   * Creates a new Info publication for active provider role context.
   * Enforces 5-day public visibility rule (expiresAt = publishedAt + 5 days).
   */
  async createInfo(
    userRoleId: string,
    userId: string,
    dto: CreateInfoDto,
    ipAddress = '127.0.0.1',
  ) {
    const providerProfile = await this.verifyProviderProfileOwnership(userRoleId, userId);

    // Input Sanitization: Strip malicious script tags
    let sanitizedDesc = dto.description;
    if (sanitizedDesc) {
      sanitizedDesc = sanitizedDesc
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .trim();
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days exact duration

    const info = await this.prisma.info.create({
      data: {
        providerProfileId: providerProfile.id,
        title: dto.title.trim(),
        summary: dto.summary.trim(),
        description: sanitizedDesc,
        infoType: dto.infoType,
        contentLang: dto.contentLang || 'de',
        photosJson: dto.photosJson || null,
        videoUrl: dto.videoUrl || null,
        ctaType: dto.ctaType || 'CONTACT',
        status: 'PUBLISHED',
        publishedAt: now,
        expiresAt,
      },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: userId,
      action: 'INFO_CREATED',
      resource: `Info:${info.id}`,
      details: { title: info.title, expiresAt },
      ipAddress,
    });

    return info;
  }

  /**
   * Updates an existing Info record.
   * Strictly enforces role-level ownership (userRoleId must match owning provider profile).
   */
  async updateInfo(
    infoId: string,
    userRoleId: string,
    userId: string,
    dto: UpdateInfoDto,
    ipAddress = '127.0.0.1',
  ) {
    const providerProfile = await this.verifyProviderProfileOwnership(userRoleId, userId);

    const existingInfo = await this.prisma.info.findUnique({
      where: { id: infoId },
    });

    if (!existingInfo) {
      throw new NotFoundException('Info record not found.');
    }

    // ROLE OWNERSHIP CHECK: Ensure Info belongs to active provider role context
    if (existingInfo.providerProfileId !== providerProfile.id) {
      throw new ForbiddenException(
        'Access Denied: You do not own this Info publication. Cross-role mutation rejected.',
      );
    }

    let sanitizedDesc = dto.description;
    if (sanitizedDesc) {
      sanitizedDesc = sanitizedDesc
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .trim();
    }

    const updatedInfo = await this.prisma.info.update({
      where: { id: infoId },
      data: {
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.summary !== undefined && { summary: dto.summary.trim() }),
        ...(dto.description !== undefined && { description: sanitizedDesc }),
        ...(dto.infoType !== undefined && { infoType: dto.infoType }),
        ...(dto.photosJson !== undefined && { photosJson: dto.photosJson }),
        ...(dto.videoUrl !== undefined && { videoUrl: dto.videoUrl }),
        ...(dto.ctaType !== undefined && { ctaType: dto.ctaType }),
      },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: userId,
      action: 'INFO_UPDATED',
      resource: `Info:${infoId}`,
      details: { updatedFields: Object.keys(dto) },
      ipAddress,
    });

    return updatedInfo;
  }

  /**
   * Republishes an expired Info.
   * Resets publishedAt = now() and expiresAt = now() + 5 days.
   * Does NOT create duplicate database records.
   */
  async republishInfo(
    infoId: string,
    userRoleId: string,
    userId: string,
    ipAddress = '127.0.0.1',
  ) {
    const providerProfile = await this.verifyProviderProfileOwnership(userRoleId, userId);

    const existingInfo = await this.prisma.info.findUnique({
      where: { id: infoId },
    });

    if (!existingInfo) {
      throw new NotFoundException('Info record not found.');
    }

    if (existingInfo.providerProfileId !== providerProfile.id) {
      throw new ForbiddenException(
        'Access Denied: You do not own this Info. Cross-role republishing rejected.',
      );
    }

    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days new countdown

    const republishedInfo = await this.prisma.info.update({
      where: { id: infoId },
      data: {
        status: 'PUBLISHED',
        publishedAt: now,
        expiresAt: newExpiresAt,
      },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: userId,
      action: 'INFO_REPUBLISHED',
      resource: `Info:${infoId}`,
      details: { newExpiresAt },
      ipAddress,
    });

    return {
      message: 'Info republished successfully for a new 5-day period.',
      info: republishedInfo,
    };
  }

  /**
   * Retrieves public Info feed.
   * Filters out EXPIRED items (expiresAt <= now()) and unpublished items.
   */
  async getPublicFeed() {
    const now = new Date();

    const infos = await this.prisma.info.findMany({
      where: {
        status: 'PUBLISHED',
        expiresAt: { gt: now }, // MUST be unexpired
        providerProfile: {
          publicationStatus: 'PUBLISHED',
          userRole: {
            status: 'ACTIVE',
          },
        },
      },
      include: {
        providerProfile: {
          select: {
            id: true,
            displayName: true,
            profilePicUrl: true,
            userRole: {
              select: {
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });

    return infos.map((info) => ({
      id: info.id,
      title: info.title,
      summary: info.summary,
      description: info.description,
      infoType: info.infoType,
      contentLang: info.contentLang,
      photosJson: info.photosJson,
      videoUrl: info.videoUrl,
      ctaType: info.ctaType,
      publishedAt: info.publishedAt,
      expiresAt: info.expiresAt,
      provider: {
        id: info.providerProfile.id,
        displayName: info.providerProfile.displayName,
        profilePicUrl: info.providerProfile.profilePicUrl,
        roleCode: info.providerProfile.userRole.role.code,
      },
      stats: {
        likes: info._count.likes,
        comments: info._count.comments,
        shares: info._count.shares,
      },
    }));
  }

  /**
   * Retrieves provider role dashboard Infos (includes DRAFT, PUBLISHED, and EXPIRED).
   */
  async getMyDashboardInfos(userRoleId: string, userId: string) {
    const providerProfile = await this.verifyProviderProfileOwnership(userRoleId, userId);
    const now = new Date();

    const infos = await this.prisma.info.findMany({
      where: { providerProfileId: providerProfile.id },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return infos.map((info) => {
      const isExpired = info.expiresAt <= now;
      const effectiveStatus = isExpired ? 'EXPIRED' : info.status;

      return {
        id: info.id,
        title: info.title,
        summary: info.summary,
        status: effectiveStatus, // Clearly tags EXPIRED to owner
        isExpired,
        publishedAt: info.publishedAt,
        expiresAt: info.expiresAt,
        stats: {
          likes: info._count.likes,
          comments: info._count.comments,
          shares: info._count.shares,
        },
      };
    });
  }

  /**
   * Likes an Info publication. Prevents duplicates using DB constraint.
   */
  async likeInfo(infoId: string, userId: string) {
    const info = await this.prisma.info.findUnique({
      where: { id: infoId },
    });

    if (!info || info.expiresAt <= new Date() || info.status !== 'PUBLISHED') {
      throw new NotFoundException('Info publication not found or expired.');
    }

    const existing = await this.prisma.infoLike.findUnique({
      where: {
        infoId_userId: { infoId, userId },
      },
    });

    if (existing) {
      return { message: 'Already liked this publication.' };
    }

    await this.prisma.infoLike.create({
      data: { infoId, userId },
    });

    return { message: 'Publication liked successfully.' };
  }

  /**
   * Adds a comment to an Info publication.
   */
  async commentInfo(infoId: string, userId: string, dto: CreateCommentDto) {
    const info = await this.prisma.info.findUnique({
      where: { id: infoId },
    });

    if (!info || info.expiresAt <= new Date() || info.status !== 'PUBLISHED') {
      throw new NotFoundException('Info publication not found or expired.');
    }

    let sanitizedComment = dto.comment
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .trim();

    const comment = await this.prisma.infoComment.create({
      data: {
        infoId,
        userId,
        comment: sanitizedComment,
      },
    });

    return comment;
  }

  /**
   * Reports an Info publication via universal Report architecture.
   */
  async reportInfo(infoId: string, reporterUserId: string, dto: ReportInfoDto) {
    const info = await this.prisma.info.findUnique({
      where: { id: infoId },
    });

    if (!info) {
      throw new NotFoundException('Info publication not found.');
    }

    const report = await this.prisma.report.create({
      data: {
        reporterUserId,
        targetType: 'INFO',
        targetId: infoId,
        reason: dto.reason,
        details: dto.details,
        status: 'PENDING',
      },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: reporterUserId,
      action: 'INFO_REPORTED',
      resource: `Report:${report.id}`,
      details: { targetInfoId: infoId, reason: dto.reason },
    });

    return {
      message: 'Report submitted successfully. Thank you for helping keep the platform safe.',
      reportId: report.id,
    };
  }
}
