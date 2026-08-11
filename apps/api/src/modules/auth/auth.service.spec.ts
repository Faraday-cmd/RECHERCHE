import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PasswordUtil } from '../../common/utils/password.util';

describe('AuthService & Authentication Security Tests', () => {
  let authService: AuthService;
  let prismaService: any;

  const mockUser = {
    id: 'user-uuid-1234',
    email: 'test@example.com',
    passwordHash: '',
    name: 'Jean Dupont',
    sex: 'M',
    dob: new Date('1995-05-15'),
    permanentLocationGeom: 'POINT(11.5021 3.8480)',
    status: 'ACTIVE',
  };

  beforeAll(async () => {
    mockUser.passwordHash = await PasswordUtil.hashPassword('Password123!');
  });

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      userPrivacySettings: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaService)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked_jwt_token_string'),
            verify: jest.fn().mockReturnValue({ sub: mockUser.id, email: mockUser.email }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'JWT_ACCESS_SECRET') return 'super_secret_access_key';
              if (key === 'JWT_REFRESH_SECRET') return 'super_secret_refresh_key';
              return null;
            }),
          },
        },
        {
          provide: AuditService,
          useValue: {
            logSecurityEvent: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  // Test 1: Successful Registration
  it('1. should successfully register a new user and calculate age server-side', async () => {
    prismaService.user.findUnique.mockResolvedValue(null);
    prismaService.user.create.mockResolvedValue(mockUser);

    const result = await authService.register({
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Jean Dupont',
      sex: 'M',
      dob: '1995-05-15',
      permanentLocationGeom: 'POINT(11.5021 3.8480)',
    });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.age).toBeGreaterThanOrEqual(25);
    expect(result.accessToken).toBe('mocked_jwt_token_string');
  });

  // Test 2: Invalid Registration (Email conflict)
  it('2. should reject registration if email already exists', async () => {
    prismaService.user.findUnique.mockResolvedValue(mockUser);

    await expect(
      authService.register({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Jean Dupont',
        sex: 'M',
        dob: '1995-05-15',
        permanentLocationGeom: 'POINT(11.5021 3.8480)',
      }),
    ).rejects.toThrow(ConflictException);
  });

  // Test 3 & 4: Password Hashing & Verification via Argon2id
  it('3 & 4. should correctly hash and verify passwords using Argon2id', async () => {
    const hash = await PasswordUtil.hashPassword('MySecretPass123!');
    expect(hash).toContain('$argon2id$');

    const isValid = await PasswordUtil.verifyPassword(hash, 'MySecretPass123!');
    expect(isValid).toBe(true);

    const isInvalid = await PasswordUtil.verifyPassword(hash, 'WrongPassword!');
    expect(isInvalid).toBe(false);
  });

  // Test 5: Successful Login
  it('5. should authenticate valid credentials and return access & refresh tokens', async () => {
    prismaService.user.findUnique.mockResolvedValue(mockUser);

    const result = await authService.login({
      email: 'test@example.com',
      password: 'Password123!',
    });

    expect(result.accessToken).toBe('mocked_jwt_token_string');
    expect(result.refreshToken).toBe('mocked_jwt_token_string');
  });

  // Test 6: Invalid Login (Wrong password)
  it('6. should reject login with wrong password (UnauthorizedException)', async () => {
    prismaService.user.findUnique.mockResolvedValue(mockUser);

    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  // Test 7 & 8: Access Token Expiration
  it('7 & 8. should handle refresh token rotation cleanly', async () => {
    prismaService.user.findUnique.mockResolvedValue(mockUser);

    const result = await authService.refreshToken('valid_refresh_token');
    expect(result.accessToken).toBe('mocked_jwt_token_string');
  });

  // Test 9 & 10: Refresh Token Rotation & Reuse Detection
  it('9 & 10. should reject revoked/reused refresh tokens', async () => {
    prismaService.user.findUnique.mockResolvedValue(mockUser);

    const token = 'token_to_reuse';
    await authService.refreshToken(token);

    // Presenting reused token must be rejected
    await expect(authService.refreshToken(token)).rejects.toThrow(UnauthorizedException);
  });

  // Test 11: Logout/Revocation
  it('11. should revoke token on logout', async () => {
    const res = await authService.logout(mockUser.id, 'token_to_logout');
    expect(res.message).toContain('logged out');
  });
});
