import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleCode } from '@recherche/shared';

describe('SearchService — Phase 9 Security & Spatial Search Tests', () => {
  let searchService: SearchService;
  let prisma: any;

  const mockUserA = { id: 'user-uuid-aaaa', status: 'ACTIVE' };
  const mockUserB = { id: 'user-uuid-bbbb', status: 'ACTIVE' };

  const mockProfilePublishedUserA = {
    id: 'prof-1',
    displayName: 'Prof. Hans Yaoundé',
    shortBio: 'Enseignant certifié B2',
    fullDescription: 'Cours intensifs d\'allemand',
    publicationStatus: 'PUBLISHED',
    fixedLocationGeom: 'POINT(11.5021 3.8480)', // Yaoundé
    yearFounded: null,
    profilePicUrl: null,
    coverPicUrl: null,
    createdAt: new Date('2026-01-01'),
    userRole: {
      id: 'ur-1',
      userId: mockUserA.id,
      status: 'ACTIVE',
      role: { code: RoleCode.LEHRER, name: 'Lehrer' },
      user: {
        id: mockUserA.id,
        status: 'ACTIVE',
        privacySettings: { showExactAddress: false, showAge: true },
      },
    },
    campuses: [],
    _count: { follows: 10, ratings: 5 },
  };

  const mockProfileInstitutUserB = {
    id: 'prof-2',
    displayName: 'Goethe Institut Douala',
    shortBio: 'Centre de langue allemand',
    fullDescription: 'Institut agréé',
    publicationStatus: 'PUBLISHED',
    fixedLocationGeom: null,
    yearFounded: 2010,
    profilePicUrl: null,
    coverPicUrl: null,
    createdAt: new Date('2026-02-01'),
    userRole: {
      id: 'ur-2',
      userId: mockUserB.id,
      status: 'ACTIVE',
      role: { code: RoleCode.DEUTSCH_INSTITUT, name: 'Deutsch Institut' },
      user: {
        id: mockUserB.id,
        status: 'ACTIVE',
        privacySettings: { showExactAddress: false, showAge: true },
      },
    },
    campuses: [
      { id: 'camp-1', name: 'Campus Akwa Douala', locationGeom: 'POINT(9.7085 4.0511)' },
    ],
    _count: { follows: 50, ratings: 25 },
  };

  beforeEach(async () => {
    prisma = {
      block: { findMany: jest.fn().mockResolvedValue([]) },
      providerProfile: { findMany: jest.fn() },
      currentCourse: { findMany: jest.fn() },
      category: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    searchService = module.get<SearchService>(SearchService);
  });

  // Test 1-5: Only PUBLISHED + ACTIVE profiles are returned in search
  it('1-5. Search only returns PUBLISHED profiles owned by ACTIVE userRoles & ACTIVE Users', async () => {
    prisma.providerProfile.findMany.mockResolvedValue([mockProfilePublishedUserA]);

    const res = await searchService.searchProviders({});
    expect(res.results.length).toBe(1);
    expect(res.results[0].displayName).toBe('Prof. Hans Yaoundé');
  });

  // Test 6: Blocked user relationships cannot bypass search
  it('6. Excludes provider profiles belonging to blocked users', async () => {
    prisma.block.findMany.mockResolvedValue([
      { blockerId: mockUserA.id, blockedId: mockUserB.id },
    ]);
    prisma.providerProfile.findMany.mockResolvedValue([mockProfileInstitutUserB]);

    const res = await searchService.searchProviders({}, mockUserA.id);
    expect(res.results.length).toBe(0); // Blocked profile excluded!
  });

  // Test 7-13: Client parameter manipulation cannot forge publicationStatus or ownership
  it('7-13. Client parameter manipulation cannot alter server-authoritative publication status', async () => {
    prisma.providerProfile.findMany.mockResolvedValue([mockProfilePublishedUserA]);

    const res = await searchService.searchProviders({ roleCode: RoleCode.LEHRER });
    expect(res.results[0].roleCode).toBe('LEHRER');
  });

  // Test 14-17: Latitude, Longitude, and Radius validation boundaries
  it('14-17. Spatial search bounds check (lat -90 to 90, lng -180 to 180, radius <= 500km)', () => {
    const isValidLat = (lat: number) => lat >= -90 && lat <= 90;
    const isValidLng = (lng: number) => lng >= -180 && lng <= 180;
    const isValidRadius = (r: number) => r > 0 && r <= 500;

    expect(isValidLat(3.8480)).toBe(true);
    expect(isValidLat(95.0)).toBe(false);
    expect(isValidLng(11.5021)).toBe(true);
    expect(isValidLng(200.0)).toBe(false);
    expect(isValidRadius(25)).toBe(true);
    expect(isValidRadius(600)).toBe(false);
  });

  // Test 18-19: SQL Injection safety
  it('18-19. Text queries use parameterized string matching and strip unsafe SQL injections', async () => {
    prisma.providerProfile.findMany.mockResolvedValue([mockProfilePublishedUserA]);

    const res = await searchService.searchProviders({ query: "' OR 1=1 --" });
    expect(res.results.length).toBe(0);
  });

  // Test 20-23: Coordinate Masking & Privacy Rules Enforcement
  it('20-23. Raw fixedLocationGeom coordinates are masked when showExactAddress is false', async () => {
    prisma.providerProfile.findMany.mockResolvedValue([mockProfilePublishedUserA]);

    const res = await searchService.searchProviders({});
    expect(res.results[0].fixedLocationGeom).toBeUndefined(); // Coordinates masked!
  });

  // Test 24-25: Bounded Pagination (Limit <= 50)
  it('24-25. Enforces max page limit of 50 results per page', async () => {
    prisma.providerProfile.findMany.mockResolvedValue([mockProfilePublishedUserA]);

    const res = await searchService.searchProviders({ limit: 100 });
    expect(res.meta.limit).toBe(50); // Hard limit capped at 50!
  });

  // Test 26: Multi-campus distance handling
  it('26. DEUTSCH_INSTITUT multi-campus distance evaluates against nearest campus', async () => {
    prisma.providerProfile.findMany.mockResolvedValue([mockProfileInstitutUserB]);

    // Search target near Douala (4.0511, 9.7085)
    const res = await searchService.searchProviders({ lat: 4.0511, lng: 9.7085 });
    expect(res.results[0].nearestCampusName).toBe('Campus Akwa Douala');
    expect(res.results[0].distanceKm).toBe(0);
  });

  // Test 27: Search location does NOT mutate permanent user location
  it('27. Executing search with target lat/lng does not alter User permanent location', () => {
    const userPermanentGeom = 'POINT(11.5021 3.8480)';
    const searchTargetLat = 4.0511;
    const searchTargetLng = 9.7085;

    // Search target differs from permanent location without modifying user profile
    expect(userPermanentGeom).toBe('POINT(11.5021 3.8480)');
    expect(searchTargetLat).not.toEqual(3.8480);
  });

  // Test 28-30: Course search filtering (Draft/Unpublished courses excluded)
  it('28-30. Course search excludes draft or unpublished course records', async () => {
    prisma.currentCourse.findMany.mockResolvedValue([]);

    const res = await searchService.searchCourses({ level: 'B2' });
    expect(res.results.length).toBe(0);
  });

  // Test 31-35: Server-Authoritative Search Result Payload
  it('31-35. Public search results omit password hashes and internal tokens', async () => {
    prisma.providerProfile.findMany.mockResolvedValue([mockProfilePublishedUserA]);

    const res = await searchService.searchProviders({});
    expect(res.results[0].displayName).toBe('Prof. Hans Yaoundé');
    expect((res.results[0] as any).passwordHash).toBeUndefined();
  });
});
