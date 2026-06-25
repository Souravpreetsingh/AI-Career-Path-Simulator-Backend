import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CareersService } from './careers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/utils/roles.enum';
import { CreateCareerDto, UpdateCareerDto } from './dto';
import { ApiResponse } from '../common/api/api-response';

@ApiTags('Careers')
@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all careers (paginated, searchable)' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string) {
    const result = await this.careersService.findAll({ page, limit, search });
    return ApiResponse.paginated(result.items, result.total, result.page, result.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get career by ID' })
  async findById(@Param('id') id: string) {
    const career = await this.careersService.findById(id);
    return ApiResponse.success(career);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new career (Admin only)' })
  async create(@Body() dto: CreateCareerDto) {
    const career = await this.careersService.create(dto);
    return ApiResponse.created(career);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a career (Admin only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateCareerDto) {
    const career = await this.careersService.update(id, dto);
    return ApiResponse.success(career, 'Career updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a career (Admin only)' })
  async delete(@Param('id') id: string) {
    await this.careersService.delete(id);
    return ApiResponse.noContent('Career deleted successfully');
  }
}
