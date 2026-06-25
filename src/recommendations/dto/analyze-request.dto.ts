import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ArrayMinSize,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzeRequestDto {
  @ApiProperty({
    example: ['Programming', 'Mathematics', 'Problem Solving', 'Python'],
    description: 'List of user skills',
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  selectedSkills: string[];

  @ApiProperty({
    example: 'AI',
    description: 'Primary career interest',
  })
  @IsString()
  @IsNotEmpty()
  interests: string;

  @ApiPropertyOptional({
    example: 'High Salary',
    description: 'Career goal for bonus scoring',
  })
  @IsString()
  @IsOptional()
  careerGoal?: string;

  @ApiPropertyOptional({ example: ['Problem Solving', 'Adaptability'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  strengths?: string[];

  @ApiPropertyOptional({ example: ['Public Speaking', 'Cloud Architecture'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  weaknesses?: string[];

  @ApiPropertyOptional({ description: 'Existing assessment ID to re-analyze' })
  @IsMongoId()
  @IsOptional()
  assessmentId?: string;
}
