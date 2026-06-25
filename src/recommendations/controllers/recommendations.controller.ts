import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationsService } from '../services/recommendations.service';
import { AnalyzeRequestDto } from '../dto/analyze-request.dto';
import { RecommendationsQueryDto } from '../dto/recommendations-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/utils/types';
import { ApiResponse } from '../../common/api/api-response';

@ApiTags('Recommendations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze skills and get career recommendations' })
  async analyze(@CurrentUser() user: JwtPayload, @Body() dto: AnalyzeRequestDto) {
    const result = await this.recommendationsService.analyze(user.sub, dto);
    return ApiResponse.success(result, 'Analysis complete');
  }

  @Get('history')
  @ApiOperation({ summary: 'Get paginated recommendation history' })
  async getHistory(@CurrentUser() user: JwtPayload, @Query() query: RecommendationsQueryDto) {
    const result = await this.recommendationsService.getHistory(user.sub, query);
    return ApiResponse.paginated(result.items, result.total, result.page, result.limit);
  }

  @Get('history/:id')
  @ApiOperation({ summary: 'Get recommendation result by ID' })
  async getById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const result = await this.recommendationsService.getById(id, user.sub);
    return ApiResponse.success(result);
  }

  @Get('careers')
  @ApiOperation({ summary: 'List all recommended careers' })
  async getCareers(@CurrentUser() user: JwtPayload, @Query('search') search?: string) {
    const careers = await this.recommendationsService.getRecommendedCareers(search);
    return ApiResponse.success(careers);
  }

  @Get('prompts')
  @ApiOperation({ summary: 'Get suggested chat prompts based on recommendations' })
  async getPrompts() {
    const prompts = this.recommendationsService.getSuggestedPrompts();
    return ApiResponse.success(prompts);
  }
}
