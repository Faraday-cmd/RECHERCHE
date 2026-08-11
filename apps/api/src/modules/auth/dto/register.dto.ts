import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsNotEmpty,
  IsDateString,
  IsIn,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Unique user email address' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Strong password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)',
  })
  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters long' })
  @Matches(
    /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    {
      message:
        'password must contain at least one uppercase letter, one lowercase letter, and one number or special character',
    },
  )
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: 'Jean Dupont', description: 'Full legal user name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'M', description: 'Sex / gender identifier (M, F, Other)' })
  @IsString()
  @IsIn(['M', 'F', 'OTHER'], { message: 'sex must be M, F, or OTHER' })
  @IsNotEmpty()
  sex!: string;

  @ApiProperty({ example: '1998-05-15', description: 'Date of birth (ISO-8601 string YYYY-MM-DD)' })
  @IsDateString({}, { message: 'dob must be a valid ISO-8601 date string' })
  @IsNotEmpty()
  dob!: string;

  @ApiProperty({
    example: 'POINT(11.5021 3.8480)',
    description: 'Permanent location PostGIS WKT Point (Not current GPS)',
  })
  @IsString()
  @IsNotEmpty()
  permanentLocationGeom!: string;

  @ApiPropertyOptional({ example: 'Etudiant en cours de préparation B2', description: 'Short self bio' })
  @IsOptional()
  @IsString()
  bio?: string;
}
