import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ProviderRoleGuard } from './provider-role.guard';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProviderRoleGuard & Server-Side Authorization Tests', () => {
  let guard: ProviderRoleGuard;
  let prismaService: any;

  const mockUser = {
    id: 'user-uuid-1111',
    email: 'user@example.com',
    status: 'ACTIVE',
  };

  const mockUserRoleOwner = {
    id: 'role-uuid-1',
    userId: 'user-uuid-1111',
    status: 'ACTIVE',
    role: { code: 'LEHRER', name: 'Lehrer' },
    user: { status: 'ACTIVE' },
  };

  const mockUserRoleOtherUser = {
    id: 'role-uuid-2',
    userId: 'user-uuid-9999', // Owned by ANOTHER user
    status: 'ACTIVE',
    role: { code: 'BETREUER', name: 'Betreuer' },
    user: { status: 'ACTIVE' },
  };

  const mockUserRoleSuspended = {
    id: 'role-uuid-3',
    userId: 'user-uuid-1111',
    status: 'SUSPENDED',
    role: { code: 'VISA_COMPANION', name: 'Visa Companion' },
    user: { status: 'ACTIVE' },
  };

  beforeEach(async () => {
    prismaService = {
      userRole: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderRoleGuard,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    guard = module.get<ProviderRoleGuard>(ProviderRoleGuard);
  });

  function createMockContext(user: any, headers: Record<string, string>): ExecutionContext {
    const request = {
      user,
      headers,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  // Test 12 & 13: Unauthenticated Access Rejection
  it('12 & 13. should throw UnauthorizedException if user is not authenticated', async () => {
    const context = createMockContext(null, { 'x-provider-role-id': 'role-uuid-1' });
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  // Test 14: Role Ownership Verification (Access Granted)
  it('14. should grant access when authenticated user owns active provider role', async () => {
    prismaService.userRole.findUnique.mockResolvedValue(mockUserRoleOwner);
    const context = createMockContext(mockUser, { 'x-provider-role-id': 'role-uuid-1' });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  // Test 15: Cross-Role Access Rejection (User DOES NOT own role -> Forbidden 403)
  it('15. should reject cross-role access attempts when role belongs to another user', async () => {
    prismaService.userRole.findUnique.mockResolvedValue(mockUserRoleOtherUser);
    const context = createMockContext(mockUser, { 'x-provider-role-id': 'role-uuid-2' });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  // Test 16: Suspended Role Rejection
  it('16. should reject operations on suspended provider roles', async () => {
    prismaService.userRole.findUnique.mockResolvedValue(mockUserRoleSuspended);
    const context = createMockContext(mockUser, { 'x-provider-role-id': 'role-uuid-3' });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  // Test 17 & 18: Missing Header Context Rejection
  it('17 & 18. should reject requests missing the required x-provider-role-id header', async () => {
    const context = createMockContext(mockUser, {});
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
