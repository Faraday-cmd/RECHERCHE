import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsArray,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInfoDto {
  @ApiProperty({ example: 'Nouveaux Cours d\'Allemand B1 à Yaoundé', description: 'Info title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120, { message: 'title must not exceed 120 characters' })
  title!: string;

  @ApiProperty({ example: 'Session d\'octobre ouverte aux inscriptions.', description: 'Info summary' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250, { message: 'summary must not exceed 250 characters' })
  summary!: string;

  @ApiProperty({ example: 'Détails complets de l\'annonce...', description: 'Full Info description' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000, { message: 'description must not exceed 3000 characters' })
  description!: string;

  @ApiProperty({ example: 'ANNOUNCEMENT', description: 'Info category type' })
  @IsString()
  @IsNotEmpty()
  infoType!: string;

  @ApiPropertyOptional({ example: 'de', description: 'Content language (default: de)' })
  @IsOptional()
  @IsString()
  contentLang?: string;

  @ApiPropertyOptional({
    example: ['https://storage.recherche.com/info1.jpg'],
    description: 'Up to 3 photo URLs',
  })
  @IsOptional()
  @IsArray()
  photosJson?: string[];

  @ApiPropertyOptional({ example: 'https://storage.recherche.com/info1.mp4', description: 'Up to 1 video URL' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ example: 'CONTACT', description: 'Call to action type (CONTACT, VIEW_COURSE, VIEW_PROFILE, NONE)' })
  @IsOptional()
  @IsString()
  @IsIn(['CONTACT', 'VIEW_COURSE', 'VIEW_PROFILE', 'NONE'])
  ctaType?: string;
}
