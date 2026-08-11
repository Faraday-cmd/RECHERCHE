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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdatePrivacySettingsDto } from './dto/update-privacy-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('User Profile & Privacy')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get authenticated user's own profile" })
  async getOwnProfile(@Req() req: any) {
    return this.userService.getOwnProfile(req.user.id);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update authenticated user's own profile" })
  async updateOwnProfile(@Req() req: any, @Body() dto: UpdateUserProfileDto) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.userService.updateOwnProfile(req.user.id, dto, ip);
  }

  @Get('profile/:id')
  @ApiOperation({ summary: 'Get user public profile subject to privacy rules' })
  @ApiParam({ name: 'id', description: 'Target user ID' })
  async getPublicProfile(@Param('id') targetUserId: string, @Req() req: any) {
    // Extract optional requester ID from JWT header if provided
    const requesterId = req.user?.id;
    return this.userService.getUserPublicProfile(targetUserId, requesterId);
  }

  @Patch('privacy')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update authenticated user's privacy settings" })
  async updatePrivacySettings(
    @Req() req: any,
    @Body() dto: UpdatePrivacySettingsDto,
  ) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.userService.updatePrivacySettings(req.user.id, dto, ip);
  }
}
