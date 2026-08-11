import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProviderProfileDto {
  @ApiProperty({ example: 'Institut Deutsch Yaoundé', description: 'Provider display name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'displayName must not exceed 100 characters' })
  displayName!: string;

  @ApiProperty({ example: 'Centre de formation agréé en langue allemande', description: 'Short bio/tagline' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250, { message: 'shortBio must not exceed 250 characters' })
  shortBio!: string;

  @ApiProperty({ example: 'Description complète de la structure et des cours...', description: 'Full description' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, { message: 'fullDescription must not exceed 2000 characters' })
  fullDescription!: string;

  @ApiPropertyOptional({ example: 'https://storage.recherche.com/logo.jpg', description: 'Profile picture/logo URL' })
  @IsOptional()
  @IsString()
  profilePicUrl?: string;

  @ApiPropertyOptional({ example: 'https://storage.recherche.com/cover.jpg', description: 'Cover photo URL' })
  @IsOptional()
  @IsString()
  coverPicUrl?: string;

  @ApiPropertyOptional({
    example: [{ label: 'Reception', number: '+237690000000' }],
    description: 'Array of phone contact objects',
  })
  @IsOptional()
  @IsArray()
  phoneNumbers?: Record<string, string>[];

  @ApiPropertyOptional({
    example: { monday: '08:00 - 18:00', tuesday: '08:00 - 18:00' },
    description: 'Weekly opening hours',
  })
  @IsOptional()
  openingHours?: Record<string, string>;

  @ApiPropertyOptional({ example: 2018, description: 'Year founded (for institutions)' })
  @IsOptional()
  @IsNumber()
  yearFounded?: number;

  @ApiPropertyOptional({
    example: 'POINT(11.5021 3.8480)',
    description: 'Provider professional PostGIS WKT Point: POINT(longitude latitude)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^POINT\(\s*[-+]?\d*\.?\d+\s+[-+]?\d*\.?\d+\s*\)$/, {
    message: 'fixedLocationGeom must be a valid PostGIS WKT Point string: POINT(longitude latitude)',
  })
  fixedLocationGeom?: string;
}
