import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiParam } from '@nestjs/swagger';
import { InfoService } from './info.service';
import { CreateInfoDto } from './dto/create-info.dto';
import { UpdateInfoDto } from './dto/update-info.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReportInfoDto } from './dto/report-info.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProviderRoleGuard } from '../../common/guards/provider-role.guard';

@ApiTags('Content System — Infos & Announcements')
@Controller('info')
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, ProviderRoleGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-provider-role-id',
    description: 'Active provider role context ID',
    required: true,
  })
  @ApiOperation({ summary: 'Create new Info publication with 5-day expiration countdown' })
  async createInfo(@Req() req: any, @Body() dto: CreateInfoDto) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.infoService.createInfo(req.activeUserRole.id, req.user.id, dto, ip);
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
  @ApiOperation({ summary: 'Update existing Info publication (Role ownership enforced)' })
  @ApiParam({ name: 'id', description: 'Info UUID' })
  async updateInfo(
    @Req() req: any,
    @Param('id') infoId: string,
    @Body() dto: UpdateInfoDto,
  ) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.infoService.updateInfo(infoId, req.activeUserRole.id, req.user.id, dto, ip);
  }

  @Post(':id/republish')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, ProviderRoleGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-provider-role-id',
    description: 'Active provider role context ID',
    required: true,
  })
  @ApiOperation({ summary: 'Republish expired Info publication for a new 5-day period' })
  @ApiParam({ name: 'id', description: 'Info UUID' })
  async republishInfo(@Req() req: any, @Param('id') infoId: string) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.infoService.republishInfo(infoId, req.activeUserRole.id, req.user.id, ip);
  }

  @Get('public/feed')
  @ApiOperation({ summary: 'Get public feed of active, non-expired Info publications' })
  async getPublicFeed() {
    return this.infoService.getPublicFeed();
  }

  @Get('dashboard/my-infos')
  @UseGuards(JwtAuthGuard, ProviderRoleGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-provider-role-id',
    description: 'Active provider role context ID',
    required: true,
  })
  @ApiOperation({ summary: "Get provider dashboard Infos (includes DRAFT, PUBLISHED, and EXPIRED)" })
  async getMyDashboardInfos(@Req() req: any) {
    return this.infoService.getMyDashboardInfos(req.activeUserRole.id, req.user.id);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like an Info publication (Prevents duplicate likes)' })
  @ApiParam({ name: 'id', description: 'Info UUID' })
  async likeInfo(@Req() req: any, @Param('id') infoId: string) {
    return this.infoService.likeInfo(infoId, req.user.id);
  }

  @Post(':id/comment')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comment on an Info publication' })
  @ApiParam({ name: 'id', description: 'Info UUID' })
  async commentInfo(
    @Req() req: any,
    @Param('id') infoId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.infoService.commentInfo(infoId, req.user.id, dto);
  }

  @Post(':id/report')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report an Info publication via universal Report workflow' })
  @ApiParam({ name: 'id', description: 'Info UUID' })
  async reportInfo(
    @Req() req: any,
    @Param('id') infoId: string,
    @Body() dto: ReportInfoDto,
  ) {
    return this.infoService.reportInfo(infoId, req.user.id, dto);
  }
}
