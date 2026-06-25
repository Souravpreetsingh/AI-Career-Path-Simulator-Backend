import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

import databaseConfig from './database.config';
import appConfig from './app.config';

const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  MONGODB_URI: Joi.string().uri().required(),
  MONGODB_RETRY_ATTEMPTS: Joi.number().default(5),
  MONGODB_RETRY_DELAY: Joi.number().default(3000),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRATION: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_EXPIRATION: Joi.string().default('30d'),
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().optional(),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
  BCRYPT_SALT_ROUNDS: Joi.number().default(10),
});

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig, appConfig],
      validationSchema,
      validationOptions: {
        abortEarly: true,
        allowUnknown: true,
      },
    }),
  ],
  exports: [NestConfigModule],
})
export class AppConfigModule {}
