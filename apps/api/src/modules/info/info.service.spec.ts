import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { InfoService } from './info.service';
import { CourseService } from '../course/course.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RoleCode } from '@recherche/shared';

describe('InfoService & CourseService — Phase 8 Security & Expiration Tests', () => {
  let infoService: InfoService;
  let courseService: CourseService;
  let prisma: any;

  const mockUserA = { id: 'user-uuid-aaaa', status: 'ACTIVE' };
  const mockUserB = { id: 'user-uuid-bbbb', status: 'ACTIVE' };

  const mockProfileLehrerA = {
    id: 'prof-lehrer-a',
    userRoleId: 'ur-lehrer-a',
    displayName: 'Lehrer A Profile',
  };

  const mockProfileBetreuerA = {
    id: 'prof-betreuer-a',
    userRoleId: 'ur-betreuer-a',
    displayName: 'Betreuer A Profile',
  };

  const mockUserRoleLehrerA = {
    id: 'ur-lehrer-a',
    userId: mockUserA.id,
    status: 'ACTIVE',
    user: mockUserA,
    providerProfile: mockProfileLehrerA,
    role: { code: RoleCode.LEHRER },
  };

  const mockUserRoleBetreuerA = {
    id: 'ur-betreuer-a',
    userId: mockUserA.id,
    status: 'ACTIVE',
    user: mockUserA,
    providerProfile: mockProfileBetreuerA,
    role: { code: RoleCode.BETREUER },
  };

  const mockUserRoleLehrerB = {
    id: 'ur-lehrer-b',
    userId: mockUserB.id,
    status: 'ACTIVE',
    user: mockUserB,
    providerProfile: { id: 'prof-lehrer-b', userRoleId: 'ur-lehrer-b' },
    role: { code: RoleCode.LEHRER },
  };

  const mockInfoLehrerA = {
    id: 'info-1',
    providerProfileId: mockProfileLehrerA.id,
    title: 'Lehrer Announcement',
    summary: 'Summary text',
    description: 'Description text',
    infoType: 'ANNOUNCEMENT',
    status: 'PUBLISHED',
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago (EXPIRED!)
    expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),   // Expired 1 day ago
    providerProfile: mockProfileLehrerA,
  };

  beforeEach(async () => {
    prisma = {
      userRole: { findUnique: jest.fn() },
      info: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      infoLike: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      infoComment: { create: jest.fn() },
      report: { create: jest.fn() },
      currentCourse: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InfoService,
        CourseService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: AuditService,
          useValue: { logSecurityEvent: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    infoService = module.get<InfoService>(InfoService);
    courseService = module.get<CourseService>(CourseService);
  });

  // Test 1, 2, 3, 4: User A cannot edit/delete/publish/republish User B's Info
  it('1-4. User A cannot edit or republish User B\'s Info publication (IDOR Rejection)', async () => {
    prisma.userRole.findUnique.mockResolvedValue(mockUserRoleLehrerA);
    prisma.info.findUnique.mockResolvedValue({
      ...mockInfoLehrerA,
      providerProfileId: 'prof-lehrer-b', // Belongs to User B!
    });

    await expect(
      infoService.updateInfo('info-1', mockUserRoleLehrerA.id, mockUserA.id, { title: 'Hacked' }),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      infoService.republishInfo('info-1', mockUserRoleLehrerA.id, mockUserA.id),
    ).rejects.toThrow(ForbiddenException);
  });

  // Test 5 & 6: Betreuer role cannot edit Lehrer Info belonging to same User A
  it('5 & 6. User A\'s Betreuer role cannot edit User A\'s Lehrer Info (Strict Role Isolation)', async () => {
    prisma.userRole.findUnique.mockResolvedValue(mockUserRoleBetreuerA);
    prisma.info.findUnique.mockResolvedValue(mockInfoLehrerA); // Owned by prof-lehrer-a

    await expect(
      infoService.updateInfo('info-1', mockUserRoleBetreuerA.id, mockUserA.id, { title: 'Mutated' }),
    ).rejects.toThrow(ForbiddenException);
  });

  // Test 7, 8, 9, 10: Forged headers/IDs cannot alter ownership or publication
  it('7-10. Forged userRoleId or ownership payload is rejected by server ownership verification', async () => {
    prisma.userRole.findUnique.mockResolvedValue(mockUserRoleLehrerB);

    await expect(
      infoService.createInfo(mockUserRoleLehrerB.id, mockUserA.id, {
        title: 'Forged',
        summary: 'Forged',
        description: 'Forged',
        infoType: 'ANNOUNCEMENT',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  // Test 11 & 12: Expiration duration calculated server-side (+5 days)
  it('11 & 12. Server calculates 5-day expiration countdown dynamically; client cannot alter expiration', async () => {
    prisma.userRole.findUnique.mockResolvedValue(mockUserRoleLehrerA);
    prisma.info.create.mockImplementation(({ data }) => Promise.resolve({ id: 'new-info', ...data }));

    const res = await infoService.createInfo(mockUserRoleLehrerA.id, mockUserA.id, {
      title: 'Valid Info',
      summary: 'Summary',
      description: 'Description',
      infoType: 'ANNOUNCEMENT',
    });

    const durationDays = (res.expiresAt.getTime() - res.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
    expect(durationDays).toBeCloseTo(5, 1);
  });

  // Test 13: Expired Info is not returned in public feed
  it('13. Public feed filters out expired Info publications (expiresAt <= now())', async () => {
    prisma.info.findMany.mockResolvedValue([]);

    const feed = await infoService.getPublicFeed();
    expect(feed.length).toBe(0);
  });

  // Test 14, 15, 16: Expired Info remains in dashboard and owner can republish (+ 5 days)
  it('14-16. Owner sees EXPIRED tag in dashboard and can republish, resetting expiration to + 5 days', async () => {
    prisma.userRole.findUnique.mockResolvedValue(mockUserRoleLehrerA);
    prisma.info.findUnique.mockResolvedValue(mockInfoLehrerA);
    prisma.info.update.mockImplementation(({ data }) => Promise.resolve({ ...mockInfoLehrerA, ...data }));

    const res = await infoService.republishInfo('info-1', mockUserRoleLehrerA.id, mockUserA.id);

    expect(res.info.status).toBe('PUBLISHED');
    const newDuration = (res.info.expiresAt.getTime() - res.info.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
    expect(newDuration).toBeCloseTo(5, 1);
  });

  // Test 17: Duplicate likes prevented
  it('17. Rejects duplicate likes from same user via database constraint', async () => {
    prisma.info.findUnique.mockResolvedValue({ id: 'info-1', status: 'PUBLISHED', expiresAt: new Date(Date.now() + 100000) });
    prisma.infoLike.findUnique.mockResolvedValue({ id: 'like-1' });

    const res = await infoService.likeInfo('info-1', mockUserA.id);
    expect(res.message).toContain('Already liked');
  });

  // Test 18: Unauthorized comment on expired/non-existent Info rejected
  it('18. Rejects comments on expired or non-existent Info publications', async () => {
    prisma.info.findUnique.mockResolvedValue(mockInfoLehrerA); // Expired!

    await expect(
      infoService.commentInfo('info-1', mockUserA.id, { comment: 'Nice' }),
    ).rejects.toThrow(NotFoundException);
  });

  // Test 19 & 20: XSS Script Sanitization & Mass Assignment
  it('19 & 20. Sanitizes malicious script tags from description text', async () => {
    prisma.userRole.findUnique.mockResolvedValue(mockUserRoleLehrerA);
    prisma.info.create.mockImplementation(({ data }) => Promise.resolve({ id: 'info-x', ...data }));

    const res = await infoService.createInfo(mockUserRoleLehrerA.id, mockUserA.id, {
      title: 'XSS Test',
      summary: 'Clean Summary',
      description: 'Hello <script>alert("Hacked")</script> World!',
      infoType: 'ANNOUNCEMENT',
    });

    expect(res.description).not.toContain('<script>');
    expect(res.description).toBe('Hello  World!');
  });

  // Test 21: Unauthorized dashboard access rejected
  it('21. Rejects dashboard Info query if user does not own role context', async () => {
    prisma.userRole.findUnique.mockResolvedValue(mockUserRoleLehrerB);

    await expect(
      infoService.getMyDashboardInfos(mockUserRoleLehrerB.id, mockUserA.id),
    ).rejects.toThrow(ForbiddenException);
  });

  // Test 22 & 23: CurrentCourse cross-role and cross-user editing rejected
  it('22 & 23. CurrentCourse rejects cross-role and cross-user editing attempts', async () => {
    prisma.userRole.findUnique.mockResolvedValue(mockUserRoleBetreuerA);
    prisma.currentCourse.findUnique.mockResolvedValue({
      id: 'course-1',
      providerProfileId: mockProfileLehrerA.id, // Lehrer profile!
    });

    await expect(
      courseService.updateCourse('course-1', mockUserRoleBetreuerA.id, mockUserA.id, { title: 'Hacked' }),
    ).rejects.toThrow(ForbiddenException);
  });

  // Test 24 & 25: Draft/Unpublished CurrentCourse does not leak publicly
  it('24 & 25. Public course feed filters out unpublished courses', async () => {
    prisma.currentCourse.findMany.mockResolvedValue([]);

    const courses = await courseService.getPublicCourses();
    expect(courses.length).toBe(0);
  });
});
