import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'campus-uuid-1', description: 'Associated Campus UUID' })
  @IsString()
  @IsNotEmpty()
  campusId!: string;

  @ApiProperty({ example: 'Allemand Intensif Niveau B2', description: 'Course title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120, { message: 'title must not exceed 120 characters' })
  title!: string;

  @ApiProperty({ example: 'B2', description: 'Course level (e.g. A1, A2, B1, B2, C1, C2)' })
  @IsString()
  @IsNotEmpty()
  level!: string;

  @ApiPropertyOptional({ example: 'German', description: 'Language taught (default: German)' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ example: 'Préparation complète au certificat Goethe B2.', description: 'Short description' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250, { message: 'shortDescription must not exceed 250 characters' })
  shortDescription!: string;

  @ApiProperty({ example: 'Programme détaillé du cours...', description: 'Full description' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, { message: 'fullDescription must not exceed 2000 characters' })
  fullDescription!: string;

  @ApiProperty({ example: '2026-10-01T08:00:00.000Z', description: 'V1 Constraint: Exactly ONE start date' })
  @IsDateString({}, { message: 'startDate must be a valid ISO-8601 date string' })
  startDate!: string;

  @ApiProperty({ example: '3 mois (120 heures)', description: 'Duration period' })
  @IsString()
  @IsNotEmpty()
  durationPeriod!: string;

  @ApiProperty({ example: 90000, description: 'Course price in XAF (CFA Francs)' })
  @IsNumber()
  @Min(0, { message: 'priceXAF must be non-negative' })
  priceXAF!: number;

  @ApiPropertyOptional({ example: 'Paiement en 2 tranches accepté', description: 'Price note' })
  @IsOptional()
  @IsString()
  priceNote?: string;

  @ApiPropertyOptional({ example: 25, description: 'Max student capacity' })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiPropertyOptional({ example: true, description: 'Publish to public Info experience' })
  @IsOptional()
  @IsBoolean()
  publishToInfo?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Publish to public Courses experience' })
  @IsOptional()
  @IsBoolean()
  publishToCourses?: boolean;
}
