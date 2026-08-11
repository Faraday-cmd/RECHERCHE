import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'pay-uuid-1234', description: 'Internal payment record UUID' })
  @IsString()
  @IsNotEmpty()
  paymentId!: string;

  @ApiProperty({ example: 'idemp-key-5678', description: 'Unique idempotency key for replay protection' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;

  @ApiPropertyOptional({ example: 'OM_TX_998877', description: 'External provider transaction ID' })
  @IsOptional()
  @IsString()
  providerTxId?: string;

  @ApiProperty({ example: 'secret_webhook_token', description: 'Server webhook authorization token' })
  @IsString()
  @IsNotEmpty()
  webhookToken!: string;
}
