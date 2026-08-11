import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReportStatusDto {
  @ApiProperty({ example: 'RESOLVED', description: 'Report status: REVIEWED, RESOLVED, DISMISSED' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['REVIEWED', 'RESOLVED', 'DISMISSED'])
  status!: 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

  @ApiPropertyOptional({ example: 'Avertissement envoyé au prestataire.', description: 'Admin decision notes' })
  @IsOptional()
  @IsString()
  decisionNotes?: string;
}
