import { IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({ example: 5, description: 'Rating stars from 1 to 5' })
  @IsInt()
  @Min(1, { message: 'stars must be at least 1' })
  @Max(5, { message: 'stars must be at most 5' })
  stars!: number;

  @ApiPropertyOptional({ example: 'Excellente préparation à l\'examen B2 !', description: 'Review text' })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'reviewText must not exceed 1000 characters' })
  reviewText?: string;
}
