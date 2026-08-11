import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Provider Role Follow System')
@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(':providerProfileId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow a specific provider role profile' })
  @ApiParam({ name: 'providerProfileId', description: 'Target Provider Profile UUID' })
  async followProvider(
    @Req() req: any,
    @Param('providerProfileId') providerProfileId: string,
  ) {
    return this.followService.followProvider(req.user.id, providerProfileId);
  }

  @Delete(':providerProfileId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfollow a specific provider role profile' })
  @ApiParam({ name: 'providerProfileId', description: 'Target Provider Profile UUID' })
  async unfollowProvider(
    @Req() req: any,
    @Param('providerProfileId') providerProfileId: string,
  ) {
    return this.followService.unfollowProvider(req.user.id, providerProfileId);
  }

  @Get('my-follows')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of provider profiles followed by authenticated user' })
  async getMyFollowedProfiles(@Req() req: any) {
    return this.followService.getMyFollowedProfiles(req.user.id);
  }
}
