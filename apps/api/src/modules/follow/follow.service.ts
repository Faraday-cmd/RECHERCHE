import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FollowService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Follows a specific provider role profile.
   * Following is role-isolated (targets providerProfileId).
   */
  async followProvider(followerUserId: string, providerProfileId: string) {
    const providerProfile = await this.prisma.providerProfile.findUnique({
      where: { id: providerProfileId },
      include: { userRole: true },
    });

    if (!providerProfile || providerProfile.publicationStatus !== 'PUBLISHED') {
      throw new NotFoundException('Provider profile not found or unavailable for follow.');
    }

    // Check if user is attempting to follow their own provider profile
    if (providerProfile.userRole.userId === followerUserId) {
      throw new ConflictException('You cannot follow your own provider profile.');
    }

    // Check if already following
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerUserId_providerProfileId: {
          followerUserId,
          providerProfileId,
        },
      },
    });

    if (existingFollow) {
      return { message: 'Already following this provider profile.', follow: existingFollow };
    }

    const follow = await this.prisma.follow.create({
      data: {
        followerUserId,
        providerProfileId,
      },
    });

    return {
      message: 'Successfully followed provider profile.',
      follow,
    };
  }

  /**
   * Unfollows a provider role profile.
   */
  async unfollowProvider(followerUserId: string, providerProfileId: string) {
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerUserId_providerProfileId: {
          followerUserId,
          providerProfileId,
        },
      },
    });

    if (!existingFollow) {
      throw new NotFoundException('You are not currently following this provider profile.');
    }

    await this.prisma.follow.delete({
      where: {
        followerUserId_providerProfileId: {
          followerUserId,
          providerProfileId,
        },
      },
    });

    return { message: 'Successfully unfollowed provider profile.' };
  }

  /**
   * Returns list of provider profiles followed by authenticated user.
   */
  async getMyFollowedProfiles(followerUserId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { followerUserId },
      include: {
        providerProfile: {
          include: {
            userRole: {
              include: {
                role: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return follows.map((f) => ({
      followId: f.id,
      followedAt: f.createdAt,
      providerProfile: {
        id: f.providerProfile.id,
        roleCode: f.providerProfile.userRole.role.code,
        displayName: f.providerProfile.displayName,
        shortBio: f.providerProfile.shortBio,
        profilePicUrl: f.providerProfile.profilePicUrl,
      },
    }));
  }
}
