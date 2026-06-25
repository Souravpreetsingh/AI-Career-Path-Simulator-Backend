import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { Assessment, AssessmentSchema } from './schemas/assessment.schema';
import { RecommendationsModule } from '../recommendations/recommendations.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Assessment.name, schema: AssessmentSchema },
    ]),
    RecommendationsModule,
  ],
  controllers: [AssessmentsController],
  providers: [AssessmentsService],
  exports: [AssessmentsService],
})
export class AssessmentsModule {}
