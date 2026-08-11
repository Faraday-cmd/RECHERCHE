import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProfileVisibility } from '@recherche/shared';

export class UpdatePrivacySettingsDto {
  @ApiPropertyOptional({ enum: ProfileVisibility, example: ProfileVisibility.PUBLIC })
  @IsOptional()
  @IsEnum(ProfileVisibility, {
    message: 'profileVisibility must be PUBLIC, FRIENDS_ONLY, or PRIVATE',
  })
  profileVisibility?: ProfileVisibility;

  @ApiPropertyOptional({ example: false, description: 'Whether to display exact address publicly' })
  @IsOptional()
  @IsBoolean()
  showExactAddress?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Whether to display age publicly' })
  @IsOptional()
  @IsBoolean()
  showAge?: boolean;
}
