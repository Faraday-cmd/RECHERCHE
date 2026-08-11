import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SocialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ==========================================
  // 1. FRIENDSHIPS
  // ==========================================

  /**
   * Sends a friend request with canonical ordering and block checks.
   */
  async sendFriendRequest(senderUserId: string, targetUserId: string, ipAddress = '127.0.0.1') {
    if (senderUserId === targetUserId) {
      throw new BadRequestException('You cannot send a friend request to yourself.');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser || targetUser.status === 'SUSPENDED' || targetUser.status === 'DELETED') {
      throw new NotFoundException('Target user not found or account is suspended.');
    }

    // Block Check: Neither direction allowed
    const block = await this.prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: senderUserId, blockedId: targetUserId },
          { blockerId: targetUserId, blockedId: senderUserId },
        ],
      },
    });

    if (block) {
      throw new ForbiddenException('Access Denied: Cannot send friend request due to blocking settings.');
    }

    // Canonical Ordering
    const [user1Id, user2Id] =
      senderUserId < targetUserId ? [senderUserId, targetUserId] : [targetUserId, senderUserId];

    const existing = await this.prisma.friendship.findUnique({
      where: { user1Id_user2Id: { user1Id, user2Id } },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        return { message: 'You are already friends with this user.', friendship: existing };
      }
      throw new ConflictException('A friendship request already exists between these users.');
    }

    const friendship = await this.prisma.friendship.create({
      data: {
        user1Id,
        user2Id,
        status: 'PENDING',
      },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: senderUserId,
      action: 'FRIEND_REQUEST_CREATED',
      resource: `Friendship:${friendship.id}`,
      details: { targetUserId },
      ipAddress,
    });

    return friendship;
  }

  /**
   * Accepts a pending friend request.
   */
  async acceptFriendRequest(friendshipId: string, recipientUserId: string, ipAddress = '127.0.0.1') {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship request record not found.');
    }

    // Ownership Check: Ensure accepting user is part of the request
    if (friendship.user1Id !== recipientUserId && friendship.user2Id !== recipientUserId) {
      throw new ForbiddenException('Access Denied: You are not authorized to accept this request.');
    }

    const updated = await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: recipientUserId,
      action: 'FRIEND_REQUEST_ACCEPTED',
      resource: `Friendship:${friendshipId}`,
      ipAddress,
    });

    return updated;
  }

  /**
   * Rejects a pending friend request.
   */
  async rejectFriendRequest(friendshipId: string, recipientUserId: string, ipAddress = '127.0.0.1') {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship request record not found.');
    }

    if (friendship.user1Id !== recipientUserId && friendship.user2Id !== recipientUserId) {
      throw new ForbiddenException('Access Denied: You are not authorized to reject this request.');
    }

    const updated = await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'REJECTED' },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: recipientUserId,
      action: 'FRIEND_REQUEST_REJECTED',
      resource: `Friendship:${friendshipId}`,
      ipAddress,
    });

    return updated;
  }

  /**
   * Lists accepted friends for authenticated user.
   */
  async getMyFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: { id: true, name: true, sex: true } },
        user2: { select: { id: true, name: true, sex: true } },
      },
    });

    return friendships.map((f) => {
      const friend = f.user1Id === userId ? f.user2 : f.user1;
      return {
        friendshipId: f.id,
        friendId: friend.id,
        name: friend.name,
        sex: friend.sex,
        acceptedAt: f.updatedAt,
      };
    });
  }

  // ==========================================
  // 2. BLOCK SYSTEM
  // ==========================================

  /**
   * Blocks a user and removes any existing friendship.
   */
  async blockUser(blockerId: string, blockedId: string, ipAddress = '127.0.0.1') {
    if (blockerId === blockedId) {
      throw new BadRequestException('You cannot block yourself.');
    }

    const existing = await this.prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId, blockedId } },
    });

    if (existing) {
      return { message: 'User is already blocked.', block: existing };
    }

    const block = await this.prisma.block.create({
      data: { blockerId, blockedId },
    });

    // Remove existing friendship if present
    const [u1, u2] = blockerId < blockedId ? [blockerId, blockedId] : [blockedId, blockerId];
    await this.prisma.friendship.deleteMany({
      where: { user1Id: u1, user2Id: u2 },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: blockerId,
      action: 'USER_BLOCKED',
      resource: `User:${blockedId}`,
      ipAddress,
    });

    return { message: 'User blocked successfully.', block };
  }

  /**
   * Unblocks a user.
   */
  async unblockUser(blockerId: string, blockedId: string, ipAddress = '127.0.0.1') {
    const existing = await this.prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId, blockedId } },
    });

    if (!existing) {
      throw new NotFoundException('Block record not found.');
    }

    await this.prisma.block.delete({
      where: { blockerId_blockedId: { blockerId, blockedId } },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: blockerId,
      action: 'USER_UNBLOCKED',
      resource: `User:${blockedId}`,
      ipAddress,
    });

    return { message: 'User unblocked successfully.' };
  }

  /**
   * Lists blocked users for authenticated user.
   */
  async getMyBlockedUsers(blockerId: string) {
    return this.prisma.block.findMany({
      where: { blockerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================
  // 3. RATINGS & REVIEWS
  // ==========================================

  /**
   * Rates & reviews a provider role profile.
   * Ratings target providerProfileId (not userId).
   */
  async rateProvider(
    userId: string,
    providerProfileId: string,
    dto: CreateRatingDto,
    ipAddress = '127.0.0.1',
  ) {
    const profile = await this.prisma.providerProfile.findUnique({
      where: { id: providerProfileId },
      include: { userRole: true },
    });

    if (!profile || profile.publicationStatus !== 'PUBLISHED' || profile.userRole.status !== 'ACTIVE') {
      throw new NotFoundException('Provider profile not found or unavailable for rating.');
    }

    if (profile.userRole.userId === userId) {
      throw new ForbiddenException('You cannot rate your own provider profile.');
    }

    let sanitizedReview = dto.reviewText;
    if (sanitizedReview) {
      sanitizedReview = sanitizedReview
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .trim();
    }

    const rating = await this.prisma.rating.create({
      data: {
        userId,
        providerProfileId,
        stars: dto.stars,
        reviewText: sanitizedReview || null,
      },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: userId,
      action: 'RATING_CREATED',
      resource: `Rating:${rating.id}`,
      details: { providerProfileId, stars: dto.stars },
      ipAddress,
    });

    return rating;
  }

  /**
   * Computes authoritative server-side rating aggregates (average & total count).
   */
  async getProviderRatings(providerProfileId: string) {
    const ratings = await this.prisma.rating.findMany({
      where: { providerProfileId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = ratings.length;
    const sum = ratings.reduce((acc, r) => acc + r.stars, 0);
    const averageRating = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

    return {
      providerProfileId,
      averageRating,
      totalRatings: total,
      ratings: ratings.map((r) => ({
        id: r.id,
        userName: r.user.name,
        stars: r.stars,
        reviewText: r.reviewText,
        createdAt: r.createdAt,
      })),
    };
  }

  // ==========================================
  // 4. ADMIN MODERATION QUEUE
  // ==========================================

  /**
   * Retrieves pending/reviewed moderation reports.
   */
  async getModerationQueue() {
    return this.prisma.report.findMany({
      include: {
        reporter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Updates report status in admin moderation workflow.
   */
  async updateReportStatus(
    reportId: string,
    adminUserId: string,
    dto: UpdateReportStatusDto,
    ipAddress = '127.0.0.1',
  ) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report record not found.');
    }

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: dto.status,
        reviewerId: adminUserId,
        decisionNotes: dto.decisionNotes || null,
      },
    });

    await this.auditService.logSecurityEvent({
      adminUserId,
      action: 'REPORT_RESOLVED',
      resource: `Report:${reportId}`,
      details: { newStatus: dto.status, decisionNotes: dto.decisionNotes },
      ipAddress,
    });

    return updated;
  }
}
