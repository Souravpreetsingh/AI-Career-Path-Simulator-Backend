import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User, UserDocument } from './schemas/user.schema';
import {
  SignupDto,
  LoginDto,
  GoogleLoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
  ChangePasswordDto,
} from './dto';
import { UserRole } from '../common/utils/roles.enum';
import { JwtPayload } from '../common/utils/types';
import { TokenBlacklistService } from './utils/token-blacklist';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  private generateAccessToken(user: UserDocument): string {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(user: UserDocument): string {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET');
    const refreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '30d';
    return this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiration,
    });
  }

  private async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    if (refreshToken) {
      const hashed = await bcrypt.hash(refreshToken, 5);
      await this.userModel.findByIdAndUpdate(userId, { refreshToken: hashed });
    } else {
      await this.userModel.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
    }
  }

  async signup(dto: SignupDto) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) throw new ConflictException('Email already registered');

    const saltRounds = this.configService.get<number>('bcrypt.saltRounds') || this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.userModel.create({
      fullName: dto.fullName,
      email: dto.email,
      collegeName: dto.collegeName,
      course: dto.course,
      graduationYear: dto.graduationYear,
      password: hashedPassword,
      role: UserRole.STUDENT,
      provider: 'email',
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    await this.updateRefreshToken(user._id.toString(), refreshToken);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel
      .findOne({ email: dto.email, provider: 'email' })
      .select('+password');
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password || '');
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    await this.updateRefreshToken(user._id.toString(), refreshToken);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async googleLogin(dto: GoogleLoginDto) {
    let user = await this.userModel.findOne({
      $or: [{ email: dto.email }, { googleId: dto.googleId }],
    });

    if (!user) {
      user = await this.userModel.create({
        fullName: dto.fullName,
        email: dto.email,
        googleId: dto.googleId,
        avatar: dto.avatar,
        isEmailVerified: true,
        role: UserRole.STUDENT,
        provider: 'google',
      });
    } else {
      if (!user.googleId) {
        user.googleId = dto.googleId;
      }
      if (!user.avatar && dto.avatar) {
        user.avatar = dto.avatar;
      }
      if (user.provider !== 'google') {
        user.provider = 'google';
      }
      await user.save();
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    await this.updateRefreshToken(user._id.toString(), refreshToken);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    if (this.tokenBlacklistService.isBlacklisted(dto.refreshToken)) {
      throw new UnauthorizedException('Token has been revoked');
    }

    try {
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET');
      const payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, { secret: refreshSecret });

      const user = await this.userModel.findById(payload.sub).select('+refreshToken');
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isMatch = await bcrypt.compare(dto.refreshToken, user.refreshToken);
      if (!isMatch) {
        throw new UnauthorizedException('Refresh token mismatch');
      }

      const accessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);
      await this.updateRefreshToken(user._id.toString(), newRefreshToken);

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string, accessToken?: string): Promise<{ message: string }> {
    if (accessToken) {
      this.tokenBlacklistService.add(accessToken);
    }
    await this.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId).select('+password');
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password || '');
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    const saltRounds = this.configService.get<number>('bcrypt.saltRounds') || this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;
    user.password = await bcrypt.hash(dto.newPassword, saltRounds);
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email, provider: 'email' });
    if (!user) return { message: 'If the email exists, a reset link has been sent' };

    const token = uuidv4();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    this.logger.log(`Password reset token for ${dto.email}: ${token}`);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userModel.findOne({
      resetPasswordToken: dto.token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) throw new BadRequestException('Invalid or expired reset token');

    const saltRounds = this.configService.get<number>('bcrypt.saltRounds') || this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;
    user.password = await bcrypt.hash(dto.newPassword, saltRounds);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return this.sanitizeUser(user);
  }

  sanitizeUser(user: UserDocument) {
    const obj = user.toObject();
    delete obj.password;
    delete obj.refreshToken;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    return obj;
  }
}
