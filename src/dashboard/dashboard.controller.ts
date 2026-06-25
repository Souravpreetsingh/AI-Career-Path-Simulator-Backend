import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/utils/types';
import { ApiResponse } from '../common/api/api-response';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard analytics stats' })
  async getStats(@CurrentUser() user: JwtPayload) {
    const stats = await this.dashboardService.getStats(user.sub);
    return ApiResponse.success(stats);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent user activity' })
  async getActivity(@CurrentUser() user: JwtPayload) {
    const activity = await this.dashboardService.getActivity(user.sub);
    return ApiResponse.success(activity);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get personalized recommendations' })
  async getRecommendations(@CurrentUser() user: JwtPayload) {
    const recommendations = await this.dashboardService.getRecommendations(user.sub);
    return ApiResponse.success(recommendations);
  }
}
