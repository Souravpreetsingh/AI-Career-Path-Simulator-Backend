import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-career-path-simulator',
  retryAttempts: parseInt(process.env.MONGODB_RETRY_ATTEMPTS || '5', 10),
  retryDelay: parseInt(process.env.MONGODB_RETRY_DELAY || '3000', 10),
  connectionTimeout: parseInt(process.env.MONGODB_CONNECTION_TIMEOUT || '10000', 10),
}));
