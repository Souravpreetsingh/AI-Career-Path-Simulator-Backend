import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Assessment, AssessmentSchema } from '../assessments/schemas/assessment.schema';
import { Roadmap, RoadmapSchema } from '../roadmaps/schemas/roadmap.schema';
import { Chat, ChatSchema } from '../chat/schemas/chat.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Assessment.name, schema: AssessmentSchema },
      { name: Roadmap.name, schema: RoadmapSchema },
      { name: Chat.name, schema: ChatSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
