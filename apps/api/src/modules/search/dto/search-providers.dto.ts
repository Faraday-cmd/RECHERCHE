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
import { RoleCode } from '@recherche/shared';

export class SearchProvidersDto {
  @ApiPropertyOptional({ enum: RoleCode, description: 'Filter by specific provider role' })
  @IsOptional()
  @IsString()
  @IsIn(['LEHRER', 'BETREUER', 'VISA_COMPANION', 'DEUTSCH_INSTITUT'])
  roleCode?: RoleCode;

  @ApiPropertyOptional({ example: 'Deutsch Yaoundé', description: 'Text search query' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ example: 3.8480, description: 'Search target latitude (-90 to 90)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'lat must be a valid number' })
  @Min(-90, { message: 'lat must be >= -90' })
  @Max(90, { message: 'lat must be <= 90' })
  lat?: number;

  @ApiPropertyOptional({ example: 11.5021, description: 'Search target longitude (-180 to 180)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'lng must be a valid number' })
  @Min(-180, { message: 'lng must be >= -180' })
  @Max(180, { message: 'lng must be <= 180' })
  lng?: number;

  @ApiPropertyOptional({ example: 25, description: 'Search radius in kilometers (1 to 500 km)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'radiusKm must be a number' })
  @Min(0.1, { message: 'radiusKm must be > 0' })
  @Max(500, { message: 'radiusKm cannot exceed 500 km' })
  radiusKm?: number;

  @ApiPropertyOptional({ example: 'B2', description: 'Filter by level' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ example: 0, description: 'Min price in XAF' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 100000, description: 'Max price in XAF' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    example: 'recently_published',
    description: 'Sort by: nearest, best_rated, lowest_price, highest_price, recently_published, popularity',
  })
  @IsOptional()
  @IsString()
  @IsIn([
    'nearest',
    'farthest',
    'best_rated',
    'lowest_price',
    'highest_price',
    'recently_published',
    'popularity',
  ])
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
  @Max(50, { message: 'limit cannot exceed 50 per page' })
  limit?: number = 20;
}
