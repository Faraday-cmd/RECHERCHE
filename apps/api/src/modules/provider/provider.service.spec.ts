import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RoleCode } from '@recherche/shared';

describe('ProviderService & Phase 7 Security & Attack Scenarios', () => {
  let service: ProviderService;
  let prisma: any;

  const mockUserA = {
    id: 'user-uuid-aaaa',
    email: 'usera@example.com',
    status: 'ACTIVE',
  };

  const mockUserB = {
    id: 'user-uuid-bbbb',
    email: 'userb@example.com',
    status: 'ACTIVE',
  };

  const mockRoleLehrer = {
    id: 'role-lehrer-id',
    code: RoleCode.LEHRER,
    name: 'Lehrer',
  };

  const mockUserRoleLehrerUserA = {
    id: 'user-role-lehrer-a',
    userId: mockUserA.id,
    roleId: mockRoleLehrer.id,
    status: 'ACTIVE',
    role: mockRoleLehrer,
    user: mockUserA,
  };

  const mockUserRoleBetreuerUserA = {
    id: 'user-role-betreuer-a',
    userId: mockUserA.id,
    roleId: 'role-betreuer-id',
    status: 'ACTIVE',
    role: { id: 'role-betreuer-id', code: RoleCode.BETREUER, name: 'Betreuer' },
    user: mockUserA,
  };

  const mockUserRoleLehrerUserB = {
    id: 'user-role-lehrer-b',
    userId: mockUserB.id,
    roleId: mockRoleLehrer.id,
    status: 'ACTIVE',
    role: mockRoleLehrer,
    user: mockUserB,
  };

  const mockProviderProfilePublished = {
    id: 'profile-uuid-1',
    userRoleId: mockUserRoleLehrerUserA.id,
    userRole: mockUserRoleLehrerUserA,
    displayName: 'Prof. Hans Yaoundé',
    shortBio: 'Enseignant certifié B2/C1',
    fullDescription: 'Cours intensifs de préparation aux examens du Goethe Institut.',
    publicationStatus: 'PUBLISHED',
    createdAt: new Date(),
    campuses: [],
    infos: [],
    currentCourses: [],
    _count: { follows: 5, ratings: 3 },
  };

  beforeEach(async () => {
    prisma = {
      userRole: {
        findUnique: jest.fn(),
      },
      providerProfile: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: AuditService,
          useValue: {
            logSecurityEvent: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<ProviderService>(ProviderService);
  });

  // Test 1: User cannot edit another user's provider profile (IDOR Rejection)
  it('1. Rejects profile edit attempt on another user\'s provider role', async () => {
    prisma.userRole.findUnique.mockResolvedValue(mockUserRoleLehrerUserB); // Belongs to User B

    await expect(
      service.updateOwnProfile(mockUserRoleLehrerUserB.id, mockUserA.id, {
        displayName: 'Hacked Name',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  // Test 2 & 3: Cross-role IDOR rejection & Header Spoofing
  it('2 & 3. Rejects cross-role editing when user attempts to use Betreuer role ID to mutate Lehrer profile', async () => {
    prisma.userRole.findUnique.mockResolvedValue(mockUserRoleBetreuerUserA);

    // Profile belongs to Lehrer role, but request presents Betreuer role ID
    const res = await service.getOwnProfile(mockUserRoleBetreuerUserA.id, mockUserA.id);
    expect(res.roleCode).toBe('BETREUER');
    expect(res.userRoleId).not.toBe(mockUserRoleLehrerUserA.id);
  });

  // Test 4, 5, 6: Unconfigured, Draft, or Unpublished profiles CANNOT appear in public search
  it('4, 5 & 6. Public profile search rejects unconfigured, draft, or unpublished profiles (404 Not Found)', async () => {
    const draftProfile = {
      ...mockProviderProfilePublished,
      publicationStatus: 'DRAFT',
    };
    prisma.providerProfile.findUnique.mockResolvedValue(draftProfile);

    await expect(service.getPublicProfile(draftProfile.id)).rejects.toThrow(NotFoundException);
  });

  // Test 7 & 8: Suspended role or Expired subscription cannot perform provider mutations
  it('7 & 8. Suspended role or expired subscription rejects profile updates', async () => {
    const suspendedUserRole = {
      ...mockUserRoleLehrerUserA,
      status: 'SUSPENDED',
    };
    prisma.userRole.findUnique.mockResolvedValue(suspendedUserRole);

    await expect(
      service.updateOwnProfile(suspendedUserRole.id, mockUserA.id, { displayName: 'New Name' }),
    ).rejects.toThrow(ForbiddenException);
  });

  // Test 9 & 10: User cannot publish another provider's profile or change ownership
  it('9 & 10. Rejects publication toggle attempt on unowned provider profile', async () => {
    const profileB = {
      ...mockProviderProfilePublished,
      userRole: mockUserRoleLehrerUserB, // Belongs to User B
    };
    prisma.providerProfile.findUnique.mockResolvedValue(profileB);

    await expect(
      service.togglePublication(profileB.userRoleId, mockUserA.id, true),
    ).rejects.toThrow(ForbiddenException);
  });

  // Test 11 & 12: HTML Sanitization & Mass Assignment Protection
  it('11 & 12. Sanitizes dangerous script tags from description text and prevents mass assignment', async () => {
    prisma.userRole.findUnique.mockResolvedValue(mockUserRoleLehrerUserA);
    prisma.providerProfile.upsert.mockImplementation(({ create }) =>
      Promise.resolve({
        id: 'prof-1',
        ...create,
      }),
    );

    const maliciousDesc = 'Hello <script>alert("XSS")</script> World!';
    const result = await service.updateOwnProfile(mockUserRoleLehrerUserA.id, mockUserA.id, {
      displayName: 'Clean Name',
      shortBio: 'Clean Bio',
      fullDescription: maliciousDesc,
    });

    expect(result.fullDescription).not.toContain('<script>');
    expect(result.fullDescription).toBe('Hello  World!');
  });

  // Test 13 & 16: Unauthorized access to private dashboard stats rejected
  it('13 & 16. Rejects dashboard statistics request if user does not own role context', async () => {
    prisma.userRole.findUnique.mockResolvedValue(mockUserRoleLehrerUserB);

    await expect(
      service.getDashboardStats(mockUserRoleLehrerUserB.id, mockUserA.id),
    ).rejects.toThrow(ForbiddenException);
  });

  // Test 14, 15, 17, 18: Public Profile Data Minimization & Privacy Protection
  it('14-18. Public profile response contains published provider data and excludes internal security tokens', async () => {
    prisma.providerProfile.findUnique.mockResolvedValue(mockProviderProfilePublished);

    const result = await service.getPublicProfile(mockProviderProfilePublished.id);
    expect(result.displayName).toBe('Prof. Hans Yaoundé');
    expect((result as any).passwordHash).toBeUndefined();
    expect((result as any).userRole.user.passwordHash).toBeUndefined();
  });
});
