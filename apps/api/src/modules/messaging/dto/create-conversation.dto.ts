import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    example: 'USER_PROVIDER',
    description: 'Conversation type: USER_PROVIDER, FRIEND_PRIVATE, GROUP',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['USER_PROVIDER', 'FRIEND_PRIVATE', 'GROUP'])
  type!: 'USER_PROVIDER' | 'FRIEND_PRIVATE' | 'GROUP';

  @ApiPropertyOptional({
    example: 'provider-profile-uuid-1',
    description: 'Target Provider Profile UUID (Required for USER_PROVIDER conversations)',
  })
  @IsOptional()
  @IsString()
  targetProviderProfileId?: string;

  @ApiPropertyOptional({
    example: 'target-user-uuid-2',
    description: 'Target User UUID (Required for FRIEND_PRIVATE conversations)',
  })
  @IsOptional()
  @IsString()
  targetUserId?: string;

  @ApiPropertyOptional({ example: 'Initial message to provider...', description: 'Initial message text' })
  @IsOptional()
  @IsString()
  initialMessage?: string;
}
