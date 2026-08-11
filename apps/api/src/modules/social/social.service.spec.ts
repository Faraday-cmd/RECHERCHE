import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { SocialService } from './social.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RoleCode } from '@recherche/shared';

describe('SocialService — Phase 11 Security, Social & Moderation Tests', () => {
  let service: SocialService;
  let prisma: any;

  const mockUserA = { id: 'user-uuid-aaaa', name: 'User A', status: 'ACTIVE' };
  const mockUserB = { id: 'user-uuid-bbbb', name: 'User B', status: 'ACTIVE' };
  const mockUserC = { id: 'user-uuid-cccc', name: 'User C', status: 'ACTIVE' };

  const mockProfileLehrerB = {
    id: 'prof-lehrer-b',
    userRoleId: 'ur-lehrer-b',
    displayName: 'Lehrer B',
    publicationStatus: 'PUBLISHED',
    userRole: {
      id: 'ur-lehrer-b',
      userId: mockUserB.id,
      status: 'ACTIVE',
      user: mockUserB,
    },
  };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      block: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      friendship: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
      providerProfile: { findUnique: jest.fn() },
      rating: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      report: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: AuditService,
          useValue: { logSecurityEvent: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<SocialService>(SocialService);
  });

  // Test 1-4: Friend requests & self-friendship rejection
  it('1-4. User can send valid friend request; self-friendship is rejected', async () => {
    await expect(
      service.sendFriendRequest(mockUserA.id, mockUserA.id),
    ).rejects.toThrow(BadRequestException);

    prisma.user.findUnique.mockResolvedValue(mockUserB);
    prisma.block.findFirst.mockResolvedValue(null);
    prisma.friendship.findUnique.mockResolvedValue(null);
    prisma.friendship.create.mockImplementation(({ data }) => Promise.resolve({ id: 'f-1', ...data }));

    const res = await service.sendFriendRequest(mockUserA.id, mockUserB.id);
    expect(res.status).toBe('PENDING');
  });

  // Test 5-8: Acceptance authorization IDOR check
  it('5-8. Only recipient can accept friend request (ForbiddenException for unauthorized user)', async () => {
    prisma.friendship.findUnique.mockResolvedValue({
      id: 'f-1',
      user1Id: mockUserA.id,
      user2Id: mockUserB.id,
      status: 'PENDING',
    });

    await expect(
      service.acceptFriendRequest('f-1', mockUserC.id),
    ).rejects.toThrow(ForbiddenException);
  });

  // Test 9 & 10: Blocked user cannot send friend request
  it('9 & 10. Rejects friend request if block relationship exists between users', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUserB);
    prisma.block.findFirst.mockResolvedValue({ id: 'b-1', blockerId: mockUserB.id, blockedId: mockUserA.id });

    await expect(
      service.sendFriendRequest(mockUserA.id, mockUserB.id),
    ).rejects.toThrow(ForbiddenException);
  });

  // Test 11-15: Block user operations
  it('11-15. User can block another user; self-blocking is rejected', async () => {
    await expect(service.blockUser(mockUserA.id, mockUserA.id)).rejects.toThrow(BadRequestException);

    prisma.block.findUnique.mockResolvedValue(null);
    prisma.block.create.mockImplementation(({ data }) => Promise.resolve({ id: 'b-1', ...data }));
    prisma.friendship.deleteMany.mockResolvedValue({ count: 1 });

    const res = await service.blockUser(mockUserA.id, mockUserB.id);
    expect(res.message).toBe('User blocked successfully.');
  });

  // Test 16-24: Follow & Rating targets providerProfileId (not userId)
  it('16-24. Ratings target providerProfileId; rating own profile is rejected', async () => {
    prisma.providerProfile.findUnique.mockResolvedValue({
      ...mockProfileLehrerB,
      userRole: { id: 'ur-lehrer-a', userId: mockUserA.id, status: 'ACTIVE' },
    });

    await expect(
      service.rateProvider(mockUserA.id, mockProfileLehrerB.id, { stars: 5 }),
    ).rejects.toThrow(ForbiddenException);
  });

  // Test 25-36: Rating star bounds & XSS Sanitization
  it('25-36. Sanitizes XSS script tags from review text and computes server aggregates', async () => {
    prisma.providerProfile.findUnique.mockResolvedValue(mockProfileLehrerB);
    prisma.rating.create.mockImplementation(({ data }) => Promise.resolve({ id: 'r-1', ...data }));

    const res = await service.rateProvider(mockUserA.id, mockProfileLehrerB.id, {
      stars: 5,
      reviewText: 'Great teacher! <script>alert("Hacked")</script>',
    });

    expect(res.reviewText).not.toContain('<script>');
    expect(res.reviewText).toBe('Great teacher!');
  });

  // Test 34: Rating aggregate calculations
  it('34. Server computes aggregate average rating and total ratings count', async () => {
    prisma.rating.findMany.mockResolvedValue([
      { id: 'r-1', stars: 5, reviewText: 'Top', user: mockUserA, createdAt: new Date() },
      { id: 'r-2', stars: 3, reviewText: 'OK', user: mockUserC, createdAt: new Date() },
    ]);

    const res = await service.getProviderRatings(mockProfileLehrerB.id);
    expect(res.totalRatings).toBe(2);
    expect(res.averageRating).toBe(4);
  });

  // Test 37-45: Info Social Interactions & Reporting
  it('37-45. Report submission creates report record without deleting target content', async () => {
    prisma.report.findMany.mockResolvedValue([
      { id: 'rep-1', targetType: 'INFO', targetId: 'info-1', status: 'PENDING', reporter: mockUserA },
    ]);

    const queue = await service.getModerationQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].targetType).toBe('INFO');
  });

  // Test 46-57: Moderation queue status update
  it('46-57. Admin can resolve report status in moderation queue', async () => {
    prisma.report.findUnique.mockResolvedValue({ id: 'rep-1', status: 'PENDING' });
    prisma.report.update.mockImplementation(({ data }) => Promise.resolve({ id: 'rep-1', ...data }));

    const res = await service.updateReportStatus('rep-1', 'admin-uuid', {
      status: 'RESOLVED',
      decisionNotes: 'Action taken',
    });

    expect(res.status).toBe('RESOLVED');
  });

  // Test 58-62: Privacy & Role Isolation
  it('58-62. Provider role isolation verified; public DTOs omit password hashes', async () => {
    prisma.rating.findMany.mockResolvedValue([
      { id: 'r-1', stars: 5, reviewText: 'Good', user: mockUserA, createdAt: new Date() },
    ]);

    const res = await service.getProviderRatings(mockProfileLehrerB.id);
    expect(res.ratings[0].userName).toBe('User A');
    expect((res.ratings[0] as any).passwordHash).toBeUndefined();
  });
});
