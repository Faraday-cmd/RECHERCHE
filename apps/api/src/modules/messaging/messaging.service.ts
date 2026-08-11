import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Creates a new conversation under strict authorization and block rules.
   */
  async createConversation(
    userId: string,
    dto: CreateConversationDto,
    activeUserRoleId?: string,
    ipAddress = '127.0.0.1',
  ) {
    // 1. Verify Sender Account Status
    const senderUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!senderUser || senderUser.status === 'SUSPENDED' || senderUser.status === 'DELETED') {
      throw new ForbiddenException('Your user account is suspended or no longer exists.');
    }

    if (dto.type === 'USER_PROVIDER') {
      if (!dto.targetProviderProfileId) {
        throw new BadRequestException('targetProviderProfileId is required for USER_PROVIDER conversations.');
      }

      const targetProfile = await this.prisma.providerProfile.findUnique({
        where: { id: dto.targetProviderProfileId },
        include: {
          userRole: {
            include: { user: true },
          },
        },
      });

      if (
        !targetProfile ||
        targetProfile.publicationStatus !== 'PUBLISHED' ||
        targetProfile.userRole.status !== 'ACTIVE' ||
        targetProfile.userRole.user.status !== 'ACTIVE'
      ) {
        throw new NotFoundException('Target provider profile is unavailable, unconfigured, or not published.');
      }

      const targetOwnerUserId = targetProfile.userRole.userId;

      // Block Check
      const block = await this.prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: userId, blockedId: targetOwnerUserId },
            { blockerId: targetOwnerUserId, blockedId: userId },
          ],
        },
      });

      if (block) {
        throw new ForbiddenException('Access Denied: Cannot initiate messaging due to blocking settings.');
      }

      // Check if conversation already exists for this user and provider role
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          type: 'USER_PROVIDER',
          contextRoleId: targetProfile.userRoleId,
          members: {
            some: { userId },
          },
        },
        include: { members: true, messages: { take: 1, orderBy: { createdAt: 'desc' } } },
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            type: 'USER_PROVIDER',
            contextRoleId: targetProfile.userRoleId,
            members: {
              create: [
                { userId, roleId: null }, // User member
                { userId: targetOwnerUserId, roleId: targetProfile.userRoleId }, // Provider member
              ],
            },
          },
          include: { members: true, messages: true },
        });

        await this.auditService.logSecurityEvent({
          adminUserId: userId,
          action: 'CONVERSATION_CREATED',
          resource: `Conversation:${conversation.id}`,
          details: { type: 'USER_PROVIDER', targetRoleId: targetProfile.userRoleId },
          ipAddress,
        });
      }

      // Send initial message if provided
      if (dto.initialMessage) {
        await this.sendMessageInternal(conversation.id, userId, activeUserRoleId, dto.initialMessage);
      }

      return conversation;
    }

    if (dto.type === 'FRIEND_PRIVATE') {
      if (!dto.targetUserId) {
        throw new BadRequestException('targetUserId is required for FRIEND_PRIVATE conversations.');
      }

      // Block Check
      const block = await this.prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: userId, blockedId: dto.targetUserId },
            { blockerId: dto.targetUserId, blockedId: userId },
          ],
        },
      });

      if (block) {
        throw new ForbiddenException('Access Denied: Cannot initiate private chat due to blocking settings.');
      }

      // Friendship Check: Must have status ACCEPTED
      const friendship = await this.prisma.friendship.findFirst({
        where: {
          status: 'ACCEPTED',
          OR: [
            { user1Id: userId, user2Id: dto.targetUserId },
            { user1Id: dto.targetUserId, user2Id: userId },
          ],
        },
      });

      if (!friendship) {
        throw new ForbiddenException('Access Denied: Private messaging is restricted to confirmed friends.');
      }

      let conversation = await this.prisma.conversation.findFirst({
        where: {
          type: 'FRIEND_PRIVATE',
          AND: [
            { members: { some: { userId } } },
            { members: { some: { userId: dto.targetUserId } } },
          ],
        },
        include: { members: true, messages: { take: 1, orderBy: { createdAt: 'desc' } } },
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            type: 'FRIEND_PRIVATE',
            members: {
              create: [{ userId }, { userId: dto.targetUserId }],
            },
          },
          include: { members: true, messages: true },
        });
      }

      if (dto.initialMessage) {
        await this.sendMessageInternal(conversation.id, userId, activeUserRoleId, dto.initialMessage);
      }

      return conversation;
    }

    throw new BadRequestException('Unsupported conversation creation request.');
  }

  /**
   * Internal message sending helper.
   */
  private async sendMessageInternal(
    conversationId: string,
    senderUserId: string,
    senderRoleId: string | undefined,
    content: string,
    attachments?: Record<string, any>[],
  ) {
    let sanitizedContent = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .trim();

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderUserId,
        senderRoleId: senderRoleId || null,
        content: sanitizedContent,
        attachments: attachments || null,
      },
    });

    // Create Notification records for other conversation members
    const members = await this.prisma.conversationMember.findMany({
      where: { conversationId, NOT: { userId: senderUserId } },
    });

    for (const member of members) {
      await this.prisma.notification.create({
        data: {
          userId: member.userId,
          eventType: 'NEW_MESSAGE',
          payload: {
            conversationId,
            messageId: message.id,
            senderUserId,
          },
        },
      });
    }

    return message;
  }

  /**
   * Sends a message to an existing conversation.
   * Verifies membership and Provider Role Inbox Isolation.
   */
  async sendMessage(
    conversationId: string,
    userId: string,
    dto: SendMessageDto,
    activeUserRoleId?: string,
  ) {
    await this.verifyConversationMembership(conversationId, userId, activeUserRoleId);
    return this.sendMessageInternal(conversationId, userId, activeUserRoleId, dto.content, dto.attachments);
  }

  /**
   * Retrieves user conversations.
   * Enforces Provider Role Inbox Isolation if activeUserRoleId is supplied.
   */
  async getUserConversations(userId: string, activeUserRoleId?: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        members: {
          some: { userId },
        },
        ...(activeUserRoleId && { contextRoleId: activeUserRoleId }), // Strict Role Inbox Isolation!
      },
      include: {
        members: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations;
  }

  /**
   * Retrieves messages for a conversation with bounded pagination.
   * Verifies membership and Provider Role Inbox Isolation.
   */
  async getMessages(
    conversationId: string,
    userId: string,
    dto: GetMessagesDto,
    activeUserRoleId?: string,
  ) {
    await this.verifyConversationMembership(conversationId, userId, activeUserRoleId);

    const page = dto.page || 1;
    const limit = Math.min(dto.limit || 30, 50);
    const skip = (page - 1) * limit;

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await this.prisma.message.count({
      where: { conversationId },
    });

    return {
      messages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Membership & Provider Role Inbox Isolation Verification Guard Helper.
   */
  private async verifyConversationMembership(
    conversationId: string,
    userId: string,
    activeUserRoleId?: string,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { members: true },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found.');
    }

    const member = conversation.members.find((m) => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('Access Denied: You are not a member of this conversation.');
    }

    // PROVIDER ROLE INBOX ISOLATION CHECK:
    // If conversation targets a specific provider role context, activeUserRoleId MUST match contextRoleId!
    if (conversation.contextRoleId && activeUserRoleId) {
      if (conversation.contextRoleId !== activeUserRoleId) {
        throw new ForbiddenException(
          'Access Denied: Role inbox mismatch. You cannot access this conversation from another provider role context.',
        );
      }
    }
  }
}
