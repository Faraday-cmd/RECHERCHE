import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProviderRoleGuard } from '../../common/guards/provider-role.guard';

@ApiTags('Authentication & Identity')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register new user account' })
  async register(@Body() dto: RegisterDto, @Req() req: any) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.authService.register(dto, ip);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Authenticate user credentials' })
  async login(@Body() dto: LoginDto, @Req() req: any) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.authService.login(dto, ip);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Rotate refresh token and issue new token pair' })
  async refreshToken(@Body() dto: RefreshTokenDto, @Req() req: any) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.authService.refreshToken(dto.refreshToken, ip);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  async logout(@Req() req: any, @Body() dto?: Partial<RefreshTokenDto>) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.authService.logout(req.user.id, dto?.refreshToken, ip);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async getProfile(@Req() req: any) {
    return {
      user: req.user,
    };
  }

  @Get('test-provider-role-guard')
  @UseGuards(JwtAuthGuard, ProviderRoleGuard)
  @ApiBearerAuth()
  @ApiHeader({
    name: 'x-provider-role-id',
    description: 'Target unlocked provider role ID',
    required: true,
  })
  @ApiOperation({ summary: 'Protected endpoint testing provider role ownership guard' })
  async testProviderRoleGuard(@Req() req: any) {
    return {
      message: 'Access Granted: Verified provider role ownership and subscription status.',
      activeRole: req.activeUserRole,
    };
  }
}
