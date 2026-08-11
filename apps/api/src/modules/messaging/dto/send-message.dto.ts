import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'Bonjour, j\'aimerais m\'inscrire au cours B2.', description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, { message: 'content must not exceed 2000 characters' })
  content!: string;

  @ApiPropertyOptional({
    example: [{ name: 'document.pdf', url: 'https://storage.recherche.com/doc.pdf', mimeType: 'application/pdf' }],
    description: 'Array of attachment metadata objects',
  })
  @IsOptional()
  @IsArray()
  attachments?: Record<string, any>[];
}
