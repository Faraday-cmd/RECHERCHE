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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Social, Ratings & Admin Moderation')
@Controller()
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // ==========================================
  // FRIENDSHIPS
  // ==========================================

  @Post('friends/request/:userId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send friend request to another user' })
  @ApiParam({ name: 'userId', description: 'Target User UUID' })
  async sendFriendRequest(@Req() req: any, @Param('userId') targetUserId: string) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.socialService.sendFriendRequest(req.user.id, targetUserId, ip);
  }

  @Post('friends/accept/:friendshipId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept a pending friend request' })
  @ApiParam({ name: 'friendshipId', description: 'Friendship UUID' })
  async acceptFriendRequest(@Req() req: any, @Param('friendshipId') friendshipId: string) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.socialService.acceptFriendRequest(friendshipId, req.user.id, ip);
  }

  @Post('friends/reject/:friendshipId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a pending friend request' })
  @ApiParam({ name: 'friendshipId', description: 'Friendship UUID' })
  async rejectFriendRequest(@Req() req: any, @Param('friendshipId') friendshipId: string) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.socialService.rejectFriendRequest(friendshipId, req.user.id, ip);
  }

  @Get('friends')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List accepted friends for authenticated user' })
  async getMyFriends(@Req() req: any) {
    return this.socialService.getMyFriends(req.user.id);
  }

  // ==========================================
  // BLOCKS
  // ==========================================

  @Post('blocks/:userId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Block a user' })
  @ApiParam({ name: 'userId', description: 'Target User UUID to block' })
  async blockUser(@Req() req: any, @Param('userId') blockedId: string) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.socialService.blockUser(req.user.id, blockedId, ip);
  }

  @Delete('blocks/:userId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unblock a user' })
  @ApiParam({ name: 'userId', description: 'Target User UUID to unblock' })
  async unblockUser(@Req() req: any, @Param('userId') blockedId: string) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.socialService.unblockUser(req.user.id, blockedId, ip);
  }

  @Get('blocks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List blocked users for authenticated user' })
  async getMyBlockedUsers(@Req() req: any) {
    return this.socialService.getMyBlockedUsers(req.user.id);
  }

  // ==========================================
  // RATINGS & REVIEWS
  // ==========================================

  @Post('ratings/:providerProfileId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rate and review a provider role profile' })
  @ApiParam({ name: 'providerProfileId', description: 'Target Provider Profile UUID' })
  async rateProvider(
    @Req() req: any,
    @Param('providerProfileId') providerProfileId: string,
    @Body() dto: CreateRatingDto,
  ) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.socialService.rateProvider(req.user.id, providerProfileId, dto, ip);
  }

  @Get('ratings/provider/:providerProfileId')
  @ApiOperation({ summary: 'Get provider reviews and server rating aggregate' })
  @ApiParam({ name: 'providerProfileId', description: 'Target Provider Profile UUID' })
  async getProviderRatings(@Param('providerProfileId') providerProfileId: string) {
    return this.socialService.getProviderRatings(providerProfileId);
  }

  // ==========================================
  // ADMIN MODERATION QUEUE
  // ==========================================

  @Get('admin/moderation/reports')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin moderation queue reports' })
  async getModerationQueue() {
    return this.socialService.getModerationQueue();
  }

  @Patch('admin/moderation/reports/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update report status in admin moderation queue' })
  @ApiParam({ name: 'id', description: 'Report UUID' })
  async updateReportStatus(
    @Req() req: any,
    @Param('id') reportId: string,
    @Body() dto: UpdateReportStatusDto,
  ) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.socialService.updateReportStatus(reportId, req.user.id, dto, ip);
  }
}
