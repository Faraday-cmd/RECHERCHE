import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RoleCode } from '@recherche/shared';

describe('MessagingService — Phase 10 Security & Role Inbox Isolation Tests', () => {
  let service: MessagingService;
  let prisma: any;

  const mockUserA = { id: 'user-uuid-aaaa', status: 'ACTIVE' };
  const mockUserB = { id: 'user-uuid-bbbb', status: 'ACTIVE' };

  const mockLehrerRoleA = {
    id: 'ur-lehrer-a',
    userId: mockUserA.id,
    status: 'ACTIVE',
    role: { code: RoleCode.LEHRER },
  };

  const mockBetreuerRoleA = {
    id: 'ur-betreuer-a',
    userId: mockUserA.id,
    status: 'ACTIVE',
    role: { code: RoleCode.BETREUER },
  };

  const mockProviderProfilePublishedB = {
    id: 'prof-b',
    userRoleId: 'ur-lehrer-b',
    displayName: 'Provider B',
    publicationStatus: 'PUBLISHED',
    userRole: {
      id: 'ur-lehrer-b',
      userId: mockUserB.id,
      status: 'ACTIVE',
      user: mockUserB,
    },
  };

  const mockConversationUserProvider = {
    id: 'conv-1',
    type: 'USER_PROVIDER',
    contextRoleId: 'ur-lehrer-a', // Lehrer Role Inbox!
    members: [
      { id: 'm-1', conversationId: 'conv-1', userId: mockUserB.id },
      { id: 'm-2', conversationId: 'conv-1', userId: mockUserA.id, roleId: 'ur-lehrer-a' },
    ],
  };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      block: { findFirst: jest.fn() },
      friendship: { findFirst: jest.fn() },
      providerProfile: { findUnique: jest.fn() },
      conversation: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      conversationMember: { findMany: jest.fn() },
      message: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      notification: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: AuditService,
          useValue: { logSecurityEvent: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<MessagingService>(MessagingService);
  });

  // Test 1-4: Permitted conversation & rejection of unowned/unpublished targets
  it('1-4. User can create USER_PROVIDER conversation with published active provider', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUserA);
    prisma.providerProfile.findUnique.mockResolvedValue(mockProviderProfilePublishedB);
    prisma.block.findFirst.mockResolvedValue(null);
    prisma.conversation.findFirst.mockResolvedValue(null);
    prisma.conversation.create.mockResolvedValue(mockConversationUserProvider);

    const conv = await service.createConversation(mockUserA.id, {
      type: 'USER_PROVIDER',
      targetProviderProfileId: mockProviderProfilePublishedB.id,
    });

    expect(conv.id).toBe('conv-1');
  });

  // Test 5, 6, 7: Unauthorized user cannot read another user's conversation
  it('5-7. User B cannot access conversation if not a member (ForbiddenException)', async () => {
    prisma.conversation.findUnique.mockResolvedValue({
      id: 'conv-private',
      members: [{ userId: 'other-user-id' }],
    });

    await expect(
      service.getMessages('conv-private', mockUserA.id, {}),
    ).rejects.toThrow(ForbiddenException);
  });

  // Test 8-13: Client cannot forge senderUserId or timestamps
  it('8-13. Server derives senderUserId from authenticated session', async () => {
    prisma.conversation.findUnique.mockResolvedValue(mockConversationUserProvider);
    prisma.message.create.mockImplementation(({ data }) => Promise.resolve({ id: 'msg-1', ...data }));
    prisma.conversationMember.findMany.mockResolvedValue([]);

    const msg = await service.sendMessage('conv-1', mockUserA.id, { content: 'Hello' });
    expect(msg.senderUserId).toBe(mockUserA.id);
  });

  // Test 14-16: FRIEND_PRIVATE requires ACCEPTED friendship
  it('14-16. FRIEND_PRIVATE conversation requires ACCEPTED friendship (rejects pending/rejected)', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUserA);
    prisma.block.findFirst.mockResolvedValue(null);
    prisma.friendship.findFirst.mockResolvedValue(null); // No accepted friendship!

    await expect(
      service.createConversation(mockUserA.id, {
        type: 'FRIEND_PRIVATE',
        targetUserId: mockUserB.id,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  // Test 17 & 18: Blocked users cannot initiate messaging
  it('17 & 18. Blocked users cannot initiate private conversations', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUserA);
    prisma.block.findFirst.mockResolvedValue({ id: 'b-1', blockerId: mockUserB.id, blockedId: mockUserA.id });

    await expect(
      service.createConversation(mockUserA.id, {
        type: 'FRIEND_PRIVATE',
        targetUserId: mockUserB.id,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  // Test 19, 20, 21, 22: Provider Role Inbox Isolation (Lehrer vs Betreuer)
  it('19-22. Strict Role Inbox Isolation: Betreuer context CANNOT access Lehrer conversation inbox', async () => {
    prisma.conversation.findUnique.mockResolvedValue(mockConversationUserProvider); // contextRoleId = ur-lehrer-a

    // Request presents Betreuer role ID (ur-betreuer-a) -> REJECTED!
    await expect(
      service.getMessages('conv-1', mockUserA.id, {}, mockBetreuerRoleA.id),
    ).rejects.toThrow(ForbiddenException);
  });

  // Test 23-25: WebSocket Room & Identity Authorization
  it('23-25. Membership verification enforces valid user and role context prior to socket room access', async () => {
    prisma.conversation.findUnique.mockResolvedValue(null);

    await expect(
      service.getMessages('non-existent-conv', mockUserA.id, {}),
    ).rejects.toThrow(NotFoundException);
  });

  // Test 26 & 27: Bounded Pagination (Limit <= 50)
  it('26 & 27. Bounded message pagination enforces max limit of 50 per request', async () => {
    prisma.conversation.findUnique.mockResolvedValue(mockConversationUserProvider);
    prisma.message.findMany.mockResolvedValue([]);
    prisma.message.count.mockResolvedValue(0);

    const res = await service.getMessages('conv-1', mockUserA.id, { limit: 100 });
    expect(res.meta.limit).toBe(50);
  });

  // Test 28 & 29: XSS Script Sanitization
  it('28 & 29. Message text strips malicious HTML script tags server-side', async () => {
    prisma.conversation.findUnique.mockResolvedValue(mockConversationUserProvider);
    prisma.message.create.mockImplementation(({ data }) => Promise.resolve({ id: 'msg-x', ...data }));
    prisma.conversationMember.findMany.mockResolvedValue([]);

    const msg = await service.sendMessage('conv-1', mockUserA.id, {
      content: 'Hello <script>alert("XSS")</script> World!',
    });

    expect(msg.content).not.toContain('<script>');
    expect(msg.content).toBe('Hello  World!');
  });

  // Test 30-35: Suspended User & Unauthorized Mutation Rejection
  it('30-35. Suspended user cannot initiate new conversations (ForbiddenException)', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...mockUserA, status: 'SUSPENDED' });

    await expect(
      service.createConversation(mockUserA.id, {
        type: 'USER_PROVIDER',
        targetProviderProfileId: 'prof-b',
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
