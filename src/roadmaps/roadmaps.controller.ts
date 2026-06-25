import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoadmapsService } from './roadmaps.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/utils/types';
import { SaveRoadmapDto } from './dto/save-roadmap.dto';
import { ApiResponse } from '../common/api/api-response';

@ApiTags('Roadmaps')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roadmaps')
export class RoadmapsController {
  constructor(private readonly roadmapsService: RoadmapsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roadmaps for current user' })
  async findAll(@CurrentUser() user: JwtPayload) {
    const roadmaps = await this.roadmapsService.findAll(user.sub);
    return ApiResponse.success(roadmaps);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get roadmap by ID' })
  async findById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const roadmap = await this.roadmapsService.findById(id);
    return ApiResponse.success(roadmap);
  }

  @Post('save')
  @ApiOperation({ summary: 'Create or update a roadmap for a career' })
  async save(@CurrentUser() user: JwtPayload, @Body() dto: SaveRoadmapDto) {
    const roadmap = await this.roadmapsService.save(user.sub, dto);
    return ApiResponse.success(roadmap, 'Roadmap saved successfully');
  }
}
