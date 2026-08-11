import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsIn,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchCoursesDto {
  @ApiPropertyOptional({ example: 'Allemand B2', description: 'Course title/text search query' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ example: 'B2', description: 'Filter by level (e.g. A1, A2, B1, B2)' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ example: 'German', description: 'Filter by language taught' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: 3.8480, description: 'Search target latitude (-90 to 90)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @ApiPropertyOptional({ example: 11.5021, description: 'Search target longitude (-180 to 180)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @ApiPropertyOptional({ example: 25, description: 'Search radius in km (1 to 500)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(500)
  radiusKm?: number;

  @ApiPropertyOptional({ example: 0, description: 'Min price in XAF' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 150000, description: 'Max price in XAF' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    example: 'earliest_start',
    description: 'Sort by: earliest_start, latest_start, lowest_price, highest_price, nearest',
  })
  @IsOptional()
  @IsString()
  @IsIn(['earliest_start', 'latest_start', 'lowest_price', 'highest_price', 'nearest'])
  sortBy?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number (default: 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Results limit per page (max 50)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
