import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportInfoDto {
  @ApiProperty({ example: 'SPAM', description: 'Reason category' })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiProperty({ example: 'Contenu trompeur ou inapproprié', description: 'Report details' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'details must not exceed 1000 characters' })
  details!: string;
}
