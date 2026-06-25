import { IsOptional, IsString, IsNumber, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  collegeName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  course?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  graduationYear?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  avatar?: string;
}
