import { Controller, Post, Get, Body, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/utils/types';
import { ApiResponse } from '../common/api/api-response';
import {
  SignupDto, LoginDto, GoogleLoginDto, ForgotPasswordDto,
  ResetPasswordDto, RefreshTokenDto, ChangePasswordDto,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user with email and password' })
  async signup(@Body() dto: SignupDto) {
    const result = await this.authService.signup(dto);
    return ApiResponse.success(result, 'Account created successfully');
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password, returns tokens' })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return ApiResponse.success(result, 'Login successful');
  }

  @Post('guest')
  @ApiOperation({ summary: 'Create anonymous guest session' })
  async guest() {
    const result = await this.authService.guest();
    return ApiResponse.success(result, 'Guest session created');
  }

  @Post('google')
  @ApiOperation({ summary: 'Login or signup with Google credentials' })
  async googleLogin(@Body() dto: GoogleLoginDto) {
    const result = await this.authService.googleLogin(dto);
    return ApiResponse.success(result, 'Google login successful');
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(dto);
    return ApiResponse.success(result, 'Token refreshed successfully');
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate tokens' })
  async logout(@CurrentUser() user: JwtPayload, @Headers('authorization') authHeader?: string) {
    const accessToken = authHeader?.replace('Bearer ', '');
    await this.authService.logout(user.sub, accessToken);
    return ApiResponse.success(null, 'Logged out successfully');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get currently authenticated user' })
  async getMe(@CurrentUser() user: JwtPayload) {
    const profile = await this.authService.getMe(user.sub);
    return ApiResponse.success(profile);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password (requires current password)' })
  async changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    await this.authService.changePassword(user.sub, dto);
    return ApiResponse.success(null, 'Password changed successfully');
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(dto);
    return ApiResponse.success(null, result.message);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token from email' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return ApiResponse.success(null, 'Password reset successfully');
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authenticated user profile' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    const profile = await this.authService.getProfile(user.sub);
    return ApiResponse.success(profile);
  }
}
