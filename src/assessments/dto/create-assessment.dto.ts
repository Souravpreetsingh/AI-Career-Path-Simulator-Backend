import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssessmentDto {
  @ApiProperty({ example: ['Python', 'JavaScript', 'Data Analysis'] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  selectedSkills: string[];

  @ApiProperty({ example: 'AI' })
  @IsString()
  @IsNotEmpty()
  interests: string;

  @ApiProperty({ example: 'Become a Senior AI Architect' })
  @IsString()
  @IsOptional()
  careerGoals?: string;

  @ApiProperty({ example: ['Problem Solving', 'Adaptability'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  strengths?: string[];

  @ApiProperty({ example: ['Public Speaking', 'Cloud Architecture'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  weaknesses?: string[];
}
