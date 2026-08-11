import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { SelectPlanDto } from './dto/select-plan.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Roles & Subscriptions')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get approved subscription offers in XAF (CFA Francs)' })
  getAvailablePlans() {
    return this.subscriptionService.getAvailablePlans();
  }

  @Post('initiate')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Select plan offer and initiate pending subscription' })
  async initiateSubscription(@Req() req: any, @Body() dto: SelectPlanDto) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.subscriptionService.initiateSubscription(req.user.id, dto, ip);
  }

  @Post('confirm-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Server-authoritative payment confirmation webhook' })
  async confirmPayment(@Req() req: any, @Body() dto: ConfirmPaymentDto) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    return this.subscriptionService.confirmPayment(dto, ip);
  }

  @Get('my-roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get authenticated user's unlocked provider roles and active offers" })
  async getUserUnlockedRoles(@Req() req: any) {
    return this.subscriptionService.getUserUnlockedRoles(req.user.id);
  }
}
