import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health & Observability')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API Root Metadata & Liveness' })
  getRoot() {
    return {
      name: 'RECHERCHE V1 Backend API',
      status: 'OK',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

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
