import { Controller, Get, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class GoogleController {
  private readonly logger = new Logger(GoogleController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Redirect to Google OAuth login page' })
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiExcludeEndpoint()
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const googleUser = req.user as any;
      const result = await this.authService.googleLogin({
        googleId: googleUser.googleId,
        email: googleUser.email,
        fullName: googleUser.fullName,
        avatar: googleUser.avatar,
      });

      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

      const redirectUrl = new URL('/auth/callback', frontendUrl);
      redirectUrl.searchParams.set('accessToken', result.accessToken);
      redirectUrl.searchParams.set('refreshToken', result.refreshToken);

      res.redirect(redirectUrl.toString());
    } catch (error: any) {
      this.logger.error(`Google OAuth callback error: ${error.message}`);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
  }
}
