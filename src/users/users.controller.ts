import { Controller, Get, Patch, Delete, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/utils/types';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiResponse } from '../common/api/api-response';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    const profile = await this.usersService.getProfile(user.sub);
    return ApiResponse.success(profile);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    const updated = await this.usersService.updateProfile(user.sub, dto);
    return ApiResponse.success(updated, 'Profile updated successfully');
  }

  @Delete('profile')
  @ApiOperation({ summary: 'Delete current user account' })
  async deleteProfile(@CurrentUser() user: JwtPayload) {
    await this.usersService.deleteProfile(user.sub);
    return ApiResponse.noContent('Account deleted successfully');
  }
}
