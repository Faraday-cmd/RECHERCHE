import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiParam } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProviderRoleGuard } from '../../common/guards/provider-role.guard';

@ApiTags('Content System — Current Courses')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, ProviderRoleGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-provider-role-id',
    description: 'Active provider role context ID',
    required: true,
  })
  @ApiOperation({ summary: 'Create new CurrentCourse record (Single start date constraint)' })
  async createCourse(@Req() req: any, @Body() dto: CreateCourseDto) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.courseService.createCourse(req.activeUserRole.id, req.user.id, dto, ip);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, ProviderRoleGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-provider-role-id',
    description: 'Active provider role context ID',
    required: true,
  })
  @ApiOperation({ summary: 'Update existing CurrentCourse record (Role ownership enforced)' })
  @ApiParam({ name: 'id', description: 'Course UUID' })
  async updateCourse(
    @Req() req: any,
    @Param('id') courseId: string,
    @Body() dto: UpdateCourseDto,
  ) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.courseService.updateCourse(courseId, req.activeUserRole.id, req.user.id, dto, ip);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, ProviderRoleGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-provider-role-id',
    description: 'Active provider role context ID',
    required: true,
  })
  @ApiOperation({ summary: 'Delete CurrentCourse record (Role ownership enforced)' })
  @ApiParam({ name: 'id', description: 'Course UUID' })
  async deleteCourse(@Req() req: any, @Param('id') courseId: string) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.courseService.deleteCourse(courseId, req.activeUserRole.id, req.user.id, ip);
  }

  @Get('public/feed')
  @ApiOperation({ summary: 'Get public feed of published active Current Courses' })
  async getPublicCourses() {
    return this.courseService.getPublicCourses();
  }

  @Get('dashboard/my-courses')
  @UseGuards(JwtAuthGuard, ProviderRoleGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-provider-role-id',
    description: 'Active provider role context ID',
    required: true,
  })
  @ApiOperation({ summary: 'Get provider dashboard courses for active role context' })
  async getMyDashboardCourses(@Req() req: any) {
    return this.courseService.getMyDashboardCourses(req.activeUserRole.id, req.user.id);
  }
}
