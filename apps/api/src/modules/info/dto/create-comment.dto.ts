import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Très intéressante publication !', description: 'Comment text' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'comment must not exceed 500 characters' })
  comment!: string;
}
