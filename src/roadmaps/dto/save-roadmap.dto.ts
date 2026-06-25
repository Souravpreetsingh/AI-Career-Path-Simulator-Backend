import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveRoadmapDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  careerId: string;

  @ApiPropertyOptional({ example: ['Phase 1: Learn Python', 'Phase 2: ML Basics'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  phases?: string[];

  @ApiPropertyOptional({ example: 50 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  completedSteps?: string[];
}
