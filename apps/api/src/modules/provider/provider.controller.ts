import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiParam } from '@nestjs/swagger';
import { ProviderService } from './provider.service';
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto';
import { PublishProfileDto } from './dto/publish-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProviderRoleGuard } from '../../common/guards/provider-role.guard';

@ApiTags('Provider Profiles & Dashboards')
@Controller('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, ProviderRoleGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-provider-role-id',
    description: 'Active provider role context ID',
    required: true,
  })
  @ApiOperation({ summary: "Get profile for active provider role context" })
  async getOwnProfile(@Req() req: any) {
    return this.providerService.getOwnProfile(req.activeUserRole.id, req.user.id);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, ProviderRoleGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-provider-role-id',
    description: 'Active provider role context ID',
    required: true,
  })
  @ApiOperation({ summary: "Create or update profile for active provider role context" })
  async updateOwnProfile(@Req() req: any, @Body() dto: UpdateProviderProfileDto) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.providerService.updateOwnProfile(
      req.activeUserRole.id,
      req.user.id,
      dto,
      ip,
    );
  }

  @Patch('me/publish')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, ProviderRoleGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-provider-role-id',
    description: 'Active provider role context ID',
    required: true,
  })
  @ApiOperation({ summary: "Toggle profile publication status (PUBLISHED vs UNPUBLISHED)" })
  async togglePublication(@Req() req: any, @Body() dto: PublishProfileDto) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.providerService.togglePublication(
      req.activeUserRole.id,
      req.user.id,
      dto.publish,
      ip,
    );
  }

  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard, ProviderRoleGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-provider-role-id',
    description: 'Active provider role context ID',
    required: true,
  })
  @ApiOperation({ summary: "Get minimal dashboard analytics for active provider role" })
  async getDashboardStats(@Req() req: any) {
    return this.providerService.getDashboardStats(req.activeUserRole.id, req.user.id);
  }

  @Get('public/:id')
  @ApiOperation({ summary: 'Get public provider profile if status is PUBLISHED' })
  @ApiParam({ name: 'id', description: 'Provider profile UUID' })
  async getPublicProfile(@Param('id') providerProfileId: string) {
    return this.providerService.getPublicProfile(providerProfileId);
  }
}
