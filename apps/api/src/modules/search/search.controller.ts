import {
  Controller,
  Get,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchProvidersDto } from './dto/search-providers.dto';
import { SearchCoursesDto } from './dto/search-courses.dto';

@ApiTags('Search, Discovery & Spatial Filtering')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('providers')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Search providers with spatial radius, multi-campus distance, and privacy filtering' })
  async searchProviders(@Query() dto: SearchProvidersDto, @Req() req: any) {
    const requesterUserId = req.user?.id;
    return this.searchService.searchProviders(dto, requesterUserId);
  }

  @Get('courses')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Search current courses with price, level, language, and spatial filters' })
  async searchCourses(@Query() dto: SearchCoursesDto, @Req() req: any) {
    const requesterUserId = req.user?.id;
    return this.searchService.searchCourses(dto, requesterUserId);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get active Category taxonomy entries' })
  async getCategories() {
    return this.searchService.getCategories();
  }
}
