import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AssessmentsService } from './assessments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/utils/types';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { ApiResponse } from '../common/api/api-response';

@ApiTags('Assessments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assessment')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new career assessment' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAssessmentDto) {
    const result = await this.assessmentsService.create(user.sub, dto);
    return ApiResponse.success(result, 'Assessment completed successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assessment by ID' })
  async findById(@Param('id') id: string) {
    const assessment = await this.assessmentsService.findById(id);
    return ApiResponse.success(assessment);
  }

  @Get('results')
  @ApiOperation({ summary: 'Get all assessment results for current user' })
  async findResults(@CurrentUser() user: JwtPayload) {
    const results = await this.assessmentsService.findResults(user.sub);
    return ApiResponse.success(results);
  }
}
