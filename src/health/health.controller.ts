import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ApiResponse } from '../common/api/api-response';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get('database')
  @ApiOperation({ summary: 'Check MongoDB connection health' })
  checkDatabase() {
    const state = this.connection.readyState;
    const stateMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    const isHealthy = state === 1;

    if (!isHealthy) {
      this.logger.warn(`Health check failed: MongoDB is ${stateMap[state] || 'unknown'}`);
    }

    return ApiResponse.success(
      { status: isHealthy ? 'healthy' : 'unhealthy', database: stateMap[state] || 'unknown' },
      isHealthy ? 'Database connected' : 'Database connection issue',
    );
  }
}
