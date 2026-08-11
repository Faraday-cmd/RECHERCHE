import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectPlanDto {
  @ApiProperty({
    example: 'LEHRER_WITH_BETREUER',
    description: 'Target subscription plan code from approved pricing matrix',
  })
  @IsString()
  @IsNotEmpty()
  planCode!: string;
}
