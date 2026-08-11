import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CourseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private async verifyProviderProfileOwnership(userRoleId: string, userId: string) {
    const userRole = await this.prisma.userRole.findUnique({
      where: { id: userRoleId },
      include: {
        providerProfile: true,
        user: true,
      },
    });

    if (!userRole) {
      throw new NotFoundException('Provider role context not found.');
    }

    if (userRole.userId !== userId) {
      throw new ForbiddenException(
        'Access Denied: You do not own this provider role. Cross-role mutation rejected.',
      );
    }

    if (userRole.status !== 'ACTIVE' || userRole.user.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'Access Denied: Active verified subscription required for course publication.',
      );
    }

    if (!userRole.providerProfile) {
      throw new BadRequestException('Provider profile must be configured before creating courses.');
    }

    return userRole.providerProfile;
  }

  /**
   * Creates a new CurrentCourse record. Enforces single start date constraint.
   */
  async createCourse(
    userRoleId: string,
    userId: string,
    dto: CreateCourseDto,
    ipAddress = '127.0.0.1',
  ) {
    const providerProfile = await this.verifyProviderProfileOwnership(userRoleId, userId);

    let sanitizedFullDesc = dto.fullDescription;
    if (sanitizedFullDesc) {
      sanitizedFullDesc = sanitizedFullDesc
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .trim();
    }

    const course = await this.prisma.currentCourse.create({
      data: {
        providerProfileId: providerProfile.id,
        campusId: dto.campusId,
        title: dto.title.trim(),
        level: dto.level.trim(),
        language: dto.language || 'German',
        shortDescription: dto.shortDescription.trim(),
        fullDescription: sanitizedFullDesc,
        startDate: new Date(dto.startDate), // V1 Constraint: Single start date
        durationPeriod: dto.durationPeriod.trim(),
        priceXAF: dto.priceXAF,
        priceNote: dto.priceNote || null,
        capacity: dto.capacity || null,
        publishToInfo: dto.publishToInfo ?? true,
        publishToCourses: dto.publishToCourses ?? true,
      },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: userId,
      action: 'COURSE_CREATED',
      resource: `CurrentCourse:${course.id}`,
      details: { title: course.title, priceXAF: dto.priceXAF, startDate: dto.startDate },
      ipAddress,
    });

    return course;
  }

  /**
   * Updates an existing CurrentCourse record. Enforces role-isolated ownership.
   */
  async updateCourse(
    courseId: string,
    userRoleId: string,
    userId: string,
    dto: UpdateCourseDto,
    ipAddress = '127.0.0.1',
  ) {
    const providerProfile = await this.verifyProviderProfileOwnership(userRoleId, userId);

    const existingCourse = await this.prisma.currentCourse.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      throw new NotFoundException('CurrentCourse record not found.');
    }

    // ROLE OWNERSHIP CHECK: Ensure course belongs to active provider role context
    if (existingCourse.providerProfileId !== providerProfile.id) {
      throw new ForbiddenException(
        'Access Denied: You do not own this course record. Cross-role mutation rejected.',
      );
    }

    let sanitizedFullDesc = dto.fullDescription;
    if (sanitizedFullDesc) {
      sanitizedFullDesc = sanitizedFullDesc
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .trim();
    }

    const updatedCourse = await this.prisma.currentCourse.update({
      where: { id: courseId },
      data: {
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.level !== undefined && { level: dto.level.trim() }),
        ...(dto.language !== undefined && { language: dto.language }),
        ...(dto.shortDescription !== undefined && { shortDescription: dto.shortDescription.trim() }),
        ...(dto.fullDescription !== undefined && { fullDescription: sanitizedFullDesc }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.durationPeriod !== undefined && { durationPeriod: dto.durationPeriod.trim() }),
        ...(dto.priceXAF !== undefined && { priceXAF: dto.priceXAF }),
        ...(dto.priceNote !== undefined && { priceNote: dto.priceNote }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.publishToInfo !== undefined && { publishToInfo: dto.publishToInfo }),
        ...(dto.publishToCourses !== undefined && { publishToCourses: dto.publishToCourses }),
      },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: userId,
      action: 'COURSE_UPDATED',
      resource: `CurrentCourse:${courseId}`,
      details: { updatedFields: Object.keys(dto) },
      ipAddress,
    });

    return updatedCourse;
  }

  /**
   * Deletes a CurrentCourse record. Enforces role ownership.
   */
  async deleteCourse(
    courseId: string,
    userRoleId: string,
    userId: string,
    ipAddress = '127.0.0.1',
  ) {
    const providerProfile = await this.verifyProviderProfileOwnership(userRoleId, userId);

    const existingCourse = await this.prisma.currentCourse.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse || existingCourse.providerProfileId !== providerProfile.id) {
      throw new ForbiddenException('Access Denied: You do not own this course record.');
    }

    await this.prisma.currentCourse.delete({
      where: { id: courseId },
    });

    await this.auditService.logSecurityEvent({
      adminUserId: userId,
      action: 'COURSE_DELETED',
      resource: `CurrentCourse:${courseId}`,
      details: { deletedTitle: existingCourse.title },
      ipAddress,
    });

    return { message: 'Course record deleted successfully.' };
  }

  /**
   * Retrieves public active courses feed.
   */
  async getPublicCourses() {
    const courses = await this.prisma.currentCourse.findMany({
      where: {
        publishToCourses: true,
        providerProfile: {
          publicationStatus: 'PUBLISHED',
          userRole: {
            status: 'ACTIVE',
          },
        },
      },
      include: {
        providerProfile: {
          select: {
            id: true,
            displayName: true,
            profilePicUrl: true,
            userRole: {
              select: {
                role: true,
              },
            },
          },
        },
        campus: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
      take: 30,
    });

    return courses.map((c) => ({
      id: c.id,
      title: c.title,
      level: c.level,
      language: c.language,
      shortDescription: c.shortDescription,
      fullDescription: c.fullDescription,
      startDate: c.startDate,
      durationPeriod: c.durationPeriod,
      priceXAF: c.priceXAF,
      priceNote: c.priceNote,
      capacity: c.capacity,
      enrolledCount: c.enrolledCount,
      provider: {
        id: c.providerProfile.id,
        displayName: c.providerProfile.displayName,
        profilePicUrl: c.providerProfile.profilePicUrl,
        roleCode: c.providerProfile.userRole.role.code,
      },
      campus: c.campus,
    }));
  }

  /**
   * Retrieves dashboard courses for active provider role context.
   */
  async getMyDashboardCourses(userRoleId: string, userId: string) {
    const providerProfile = await this.verifyProviderProfileOwnership(userRoleId, userId);

    return this.prisma.currentCourse.findMany({
      where: { providerProfileId: providerProfile.id },
      include: { campus: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
