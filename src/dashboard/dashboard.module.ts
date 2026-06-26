import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardGateway } from './dashboard.gateway';
import { Assessment, AssessmentSchema } from '../assessments/schemas/assessment.schema';
import { Roadmap, RoadmapSchema } from '../roadmaps/schemas/roadmap.schema';
import { Chat, ChatSchema } from '../chat/schemas/chat.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Assessment.name, schema: AssessmentSchema },
      { name: Roadmap.name, schema: RoadmapSchema },
      { name: Chat.name, schema: ChatSchema },
    ]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardGateway],
})
export class DashboardModule {}
