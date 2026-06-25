import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';

const logger = new Logger('DatabaseModule');

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): MongooseModuleFactoryOptions => {
        const uri = configService.get<string>('database.uri') || configService.get<string>('MONGODB_URI');
        const retryAttempts = configService.get<number>('database.retryAttempts') || 5;
        const retryDelay = configService.get<number>('database.retryDelay') || 3000;
        const connectionTimeout = configService.get<number>('database.connectionTimeout') || 10000;

        logger.log(`Connecting to MongoDB at ${uri?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
        logger.log(`Retry attempts: ${retryAttempts}, delay: ${retryDelay}ms`);

        return {
          uri,
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              logger.log('MongoDB connection established successfully');
            });
            connection.on('error', (err) => {
              logger.error(`MongoDB connection error: ${err.message}`);
            });
            connection.on('disconnected', () => {
              logger.warn('MongoDB disconnected');
            });
            connection.on('reconnected', () => {
              logger.log('MongoDB reconnected');
            });
            return connection;
          },
          serverSelectionTimeoutMS: connectionTimeout,
          heartbeatFrequencyMS: 10000,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
