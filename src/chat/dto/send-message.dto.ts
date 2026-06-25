import { IsNotEmpty, IsOptional, IsString, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'How do I become an AI Engineer?' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ description: 'Chat ID for continuing a conversation' })
  @IsMongoId()
  @IsOptional()
  chatId?: string;
}
