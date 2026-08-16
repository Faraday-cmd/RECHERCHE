import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SelectPlanDto {
  @ApiProperty({
    example: 'PLAN_LEHRER_MONTHLY',
    description: 'Target subscription plan code from approved pricing matrix',
  })
  @IsString()
  @IsNotEmpty()
  planCode!: string;

  @ApiPropertyOptional({
    example: 'ORANGE_MONEY',
    description: 'Preferred payment method (ORANGE_MONEY, MTN_MOMO, BANK_TRANSFER)',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
