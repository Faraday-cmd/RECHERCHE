import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchProvidersDto } from './dto/search-providers.dto';
import { SearchCoursesDto } from './dto/search-courses.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper parsing PostGIS Point WKT: POINT(longitude latitude) -> { lng, lat }
   */
  private parseWktPoint(wkt?: string | null): { lng: number; lat: number } | null {
    if (!wkt) return null;
    const match = wkt.match(/^POINT\(\s*([-+]?\d*\.?\d+)\s+([-+]?\d*\.?\d+)\s*\)$/);
    if (!match) return null;
    return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
  }

  /**
   * Haversine Spatial Distance Calculation in Kilometers.
   */
  private calculateHaversineDistanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  /**
   * Provider Search with Spatial Radius, Multi-Campus Distance, Privacy & Block Filtering.
   */
  async searchProviders(dto: SearchProvidersDto, requesterUserId?: string) {
    const page = dto.page || 1;
    const limit = Math.min(dto.limit || 20, 50);
    const skip = (page - 1) * limit;

    // 1. Fetch Blocked User IDs (if requester is logged in)
    let blockedUserIds = new Set<string>();
    if (requesterUserId) {
      const blocks = await this.prisma.block.findMany({
        where: {
          OR: [{ blockerId: requesterUserId }, { blockedId: requesterUserId }],
        },
      });
      blocks.forEach((b) => {
        if (b.blockerId === requesterUserId) blockedUserIds.add(b.blockedId);
        if (b.blockedId === requesterUserId) blockedUserIds.add(b.blockerId);
      });
    }

    // 2. Fetch PUBLISHED profiles owned by ACTIVE userRoles & ACTIVE Users
    const profiles = await this.prisma.providerProfile.findMany({
      where: {
        publicationStatus: 'PUBLISHED',
        userRole: {
          status: 'ACTIVE',
          ...(dto.roleCode && { role: { code: dto.roleCode } }),
          user: {
            status: 'ACTIVE',
          },
        },
      },
      include: {
        userRole: {
          include: {
            role: true,
            user: {
              include: {
                privacySettings: true,
              },
            },
          },
        },
        campuses: true,
        _count: {
          select: {
            follows: true,
            ratings: true,
          },
        },
      },
    });

    // 3. Apply Server-Side Filtering (Text Search, Blocked Users, Spatial Distance, Radius)
    const filteredResults: any[] = [];

    for (const profile of profiles) {
      const ownerUserId = profile.userRole.userId;

      // Filter Blocked Users
      if (blockedUserIds.has(ownerUserId)) continue;

      // Filter Text Search (displayName, shortBio, fullDescription)
      if (dto.query) {
        const q = dto.query.toLowerCase();
        const matchesName = profile.displayName.toLowerCase().includes(q);
        const matchesBio = profile.shortBio.toLowerCase().includes(q);
        const matchesDesc = profile.fullDescription.toLowerCase().includes(q);
        if (!matchesName && !matchesBio && !matchesDesc) continue;
      }

      // Multi-Campus & Spatial Distance Calculation
      let calculatedDistanceKm: number | null = null;
      let nearestCampusName: string | null = null;

      if (dto.lat !== undefined && dto.lng !== undefined) {
        // Collect candidate location points (Fixed Location + All Campus Locations)
        const locationPoints: { lat: number; lng: number; campusName?: string }[] = [];

        const fixedPt = this.parseWktPoint(profile.fixedLocationGeom);
        if (fixedPt) locationPoints.push(fixedPt);

        for (const campus of profile.campuses) {
          const cpt = this.parseWktPoint(campus.locationGeom);
          if (cpt) locationPoints.push({ ...cpt, campusName: campus.name });
        }

        if (locationPoints.length > 0) {
          let minDistance = Infinity;
          for (const pt of locationPoints) {
            const dist = this.calculateHaversineDistanceKm(dto.lat, dto.lng, pt.lat, pt.lng);
            if (dist < minDistance) {
              minDistance = dist;
              if (pt.campusName) nearestCampusName = pt.campusName;
            }
          }
          calculatedDistanceKm = minDistance;
        }

        // Apply Spatial Radius Filter (radiusKm)
        if (dto.radiusKm !== undefined) {
          if (calculatedDistanceKm === null || calculatedDistanceKm > dto.radiusKm) {
            continue; // Exclude results outside radius
          }
        }
      }

      // Data Minimization & Privacy Protection (Mask raw coordinates unless showExactAddress is true)
      const userPrivacy = profile.userRole.user.privacySettings;
      const showExact = userPrivacy?.showExactAddress ?? false;

      filteredResults.push({
        id: profile.id,
        roleCode: profile.userRole.role.code,
        roleName: profile.userRole.role.name,
        displayName: profile.displayName,
        shortBio: profile.shortBio,
        profilePicUrl: profile.profilePicUrl,
        coverPicUrl: profile.coverPicUrl,
        yearFounded: profile.yearFounded,
        fixedLocationGeom: showExact ? profile.fixedLocationGeom : undefined, // Masked!
        distanceKm: calculatedDistanceKm,
        nearestCampusName: nearestCampusName || undefined,
        followerCount: profile._count.follows,
        ratingCount: profile._count.ratings,
        createdAt: profile.createdAt,
      });
    }

    // 4. Server-Side Sorting
    const sortBy = dto.sortBy || 'recently_published';
    filteredResults.sort((a, b) => {
      if (sortBy === 'nearest') {
        return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
      }
      if (sortBy === 'farthest') {
        return (b.distanceKm ?? -Infinity) - (a.distanceKm ?? -Infinity);
      }
      if (sortBy === 'popularity') {
        return b.followerCount - a.followerCount;
      }
      if (sortBy === 'best_rated') {
        return b.ratingCount - a.ratingCount;
      }
      // Default: recently_published
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // 5. Bounded Pagination
    const paginated = filteredResults.slice(skip, skip + limit);

    return {
      results: paginated,
      meta: {
        total: filteredResults.length,
        page,
        limit,
        totalPages: Math.ceil(filteredResults.length / limit),
      },
    };
  }

  /**
   * Current Course Search with Level, Language, Price, and Spatial Radius Filters.
   */
  async searchCourses(dto: SearchCoursesDto, requesterUserId?: string) {
    const page = dto.page || 1;
    const limit = Math.min(dto.limit || 20, 50);
    const skip = (page - 1) * limit;

    let blockedUserIds = new Set<string>();
    if (requesterUserId) {
      const blocks = await this.prisma.block.findMany({
        where: {
          OR: [{ blockerId: requesterUserId }, { blockedId: requesterUserId }],
        },
      });
      blocks.forEach((b) => {
        if (b.blockerId === requesterUserId) blockedUserIds.add(b.blockedId);
        if (b.blockedId === requesterUserId) blockedUserIds.add(b.blockerId);
      });
    }

    const courses = await this.prisma.currentCourse.findMany({
      where: {
        publishToCourses: true,
        ...(dto.level && { level: dto.level }),
        ...(dto.language && { language: dto.language }),
        ...(dto.minPrice !== undefined && { priceXAF: { gte: dto.minPrice } }),
        ...(dto.maxPrice !== undefined && { priceXAF: { lte: dto.maxPrice } }),
        providerProfile: {
          publicationStatus: 'PUBLISHED',
          userRole: {
            status: 'ACTIVE',
            user: { status: 'ACTIVE' },
          },
        },
      },
      include: {
        providerProfile: {
          include: {
            userRole: true,
          },
        },
        campus: true,
      },
    });

    const filtered: any[] = [];

    for (const course of courses) {
      if (blockedUserIds.has(course.providerProfile.userRole.userId)) continue;

      if (dto.query) {
        const q = dto.query.toLowerCase();
        const matchTitle = course.title.toLowerCase().includes(q);
        const matchShort = course.shortDescription.toLowerCase().includes(q);
        const matchFull = course.fullDescription.toLowerCase().includes(q);
        if (!matchTitle && !matchShort && !matchFull) continue;
      }

      let distanceKm: number | null = null;
      if (dto.lat !== undefined && dto.lng !== undefined) {
        const campusPt = this.parseWktPoint(course.campus.locationGeom);
        if (campusPt) {
          distanceKm = this.calculateHaversineDistanceKm(dto.lat, dto.lng, campusPt.lat, campusPt.lng);
        }

        if (dto.radiusKm !== undefined && (distanceKm === null || distanceKm > dto.radiusKm)) {
          continue;
        }
      }

      filtered.push({
        id: course.id,
        title: course.title,
        level: course.level,
        language: course.language,
        shortDescription: course.shortDescription,
        startDate: course.startDate, // Single start date
        durationPeriod: course.durationPeriod,
        priceXAF: course.priceXAF,
        priceNote: course.priceNote,
        distanceKm,
        campusName: course.campus.name,
        providerName: course.providerProfile.displayName,
        providerProfileId: course.providerProfile.id,
      });
    }

    const sortBy = dto.sortBy || 'earliest_start';
    filtered.sort((a, b) => {
      if (sortBy === 'lowest_price') return Number(a.priceXAF) - Number(b.priceXAF);
      if (sortBy === 'highest_price') return Number(b.priceXAF) - Number(a.priceXAF);
      if (sortBy === 'nearest') return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
      if (sortBy === 'latest_start') return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    const paginated = filtered.slice(skip, skip + limit);

    return {
      results: paginated,
      meta: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
    };
  }

  /**
   * Returns active Category taxonomy entries.
   */
  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { code: 'asc' },
    });
  }
}
