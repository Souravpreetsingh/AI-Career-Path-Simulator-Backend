import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { GoogleController } from './google.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from './schemas/user.schema';
import { JwtStrategy, GoogleStrategy, JwtRefreshStrategy } from './strategies';
import { TokenBlacklistService } from './utils/token-blacklist';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '7d',
        },
      }),
    }),
  ],
  controllers: [AuthController, GoogleController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    JwtRefreshStrategy,
    TokenBlacklistService,
  ],
  exports: [AuthService, JwtModule, MongooseModule, TokenBlacklistService],
})
export class AuthModule {}
