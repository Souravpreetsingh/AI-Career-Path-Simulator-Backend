import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCareerDto {
  @ApiProperty({ example: 'AI Engineer' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Designs and builds AI systems...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: '$150k - $220k' })
  @IsString()
  @IsOptional()
  estimatedSalary?: string;

  @ApiPropertyOptional({ example: '+34% over 5 years' })
  @IsString()
  @IsOptional()
  futureDemand?: string;

  @ApiPropertyOptional({ example: ['Python', 'Machine Learning', 'Deep Learning'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredSkills?: string[];

  @ApiPropertyOptional({ example: ['Learn Python', 'Study ML', 'Build projects'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roadmapSteps?: string[];
}
