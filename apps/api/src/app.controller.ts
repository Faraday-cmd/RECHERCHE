import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health & Observability')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Liveness Health Check' })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('health/readiness')
  @ApiOperation({ summary: 'Readiness Health Check (Database status)' })
  async getReadiness() {
    return this.appService.getReadiness();
  }
}
