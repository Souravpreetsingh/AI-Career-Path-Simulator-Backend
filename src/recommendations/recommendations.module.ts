import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecommendationsController } from './controllers/recommendations.controller';
import { RecommendationsService } from './services/recommendations.service';
import { ScoringService } from './services/scoring.service';
import { InsightGeneratorService } from './services/insight-generator.service';
import {
  CareerResult,
  CareerResultSchema,
} from './schemas/career-result.schema';
import {
  RecommendationCareer,
  RecommendationCareerSchema,
} from './schemas/recommendation-career.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CareerResult.name, schema: CareerResultSchema },
      { name: RecommendationCareer.name, schema: RecommendationCareerSchema },
    ]),
  ],
  controllers: [RecommendationsController],
  providers: [
    RecommendationsService,
    ScoringService,
    InsightGeneratorService,
  ],
  exports: [RecommendationsService, ScoringService],
})
export class RecommendationsModule {}
