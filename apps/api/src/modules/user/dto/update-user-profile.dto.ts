import {
  IsString,
  IsOptional,
  IsIn,
  IsDateString,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ example: 'Jean Dupont', description: 'User full name' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'name must not exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({ example: 'M', description: 'Sex / gender (M, F, OTHER)' })
  @IsOptional()
  @IsString()
  @IsIn(['M', 'F', 'OTHER'], { message: 'sex must be M, F, or OTHER' })
  sex?: string;

  @ApiPropertyOptional({ example: '1998-05-15', description: 'Date of birth (ISO-8601 YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'dob must be a valid ISO-8601 date string' })
  dob?: string;

  @ApiPropertyOptional({
    example: 'POINT(11.5021 3.8480)',
    description: 'Permanent location PostGIS WKT Point (POINT(longitude latitude))',
  })
  @IsOptional()
  @IsString()
  @Matches(/^POINT\(\s*[-+]?\d*\.?\d+\s+[-+]?\d*\.?\d+\s*\)$/, {
    message: 'permanentLocationGeom must be a valid PostGIS WKT Point string: POINT(longitude latitude)',
  })
  permanentLocationGeom?: string;

  @ApiPropertyOptional({
    example: 'Etudiant en préparation B2 à Yaoundé',
    description: 'Short self-description (max 500 characters)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'bio must not exceed 500 characters' })
  bio?: string;
}
