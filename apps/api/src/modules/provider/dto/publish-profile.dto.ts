import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublishProfileDto {
  @ApiProperty({ example: true, description: 'Set publication status: true = PUBLISHED, false = UNPUBLISHED' })
  @IsBoolean()
  @IsNotEmpty()
  publish!: boolean;
}
