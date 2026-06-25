import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ScoringService } from './scoring.service';
import { InsightGeneratorService } from './insight-generator.service';
import {
  CareerResult,
  CareerResultDocument,
} from '../schemas/career-result.schema';
import {
  RecommendationCareer,
  RecommendationCareerDocument,
} from '../schemas/recommendation-career.schema';
import { AnalyzeRequestDto } from '../dto/analyze-request.dto';
import { RecommendationsQueryDto } from '../dto/recommendations-query.dto';
import { RecommendationResult } from '../interfaces/recommendation-result.interface';
import { paginate, getPaginationParams } from '../../common/utils/pagination';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectModel(CareerResult.name)
    private careerResultModel: Model<CareerResultDocument>,
    @InjectModel(RecommendationCareer.name)
    private careerModel: Model<RecommendationCareerDocument>,
    private scoringService: ScoringService,
    private insightGenerator: InsightGeneratorService,
  ) {}

  async analyze(
    userId: string,
    dto: AnalyzeRequestDto,
  ): Promise<RecommendationResult> {
    const { allMatches, topMatches } =
      await this.scoringService.calculateMatches(
        dto.selectedSkills,
        dto.interests,
        dto.careerGoal,
        dto.strengths,
        dto.weaknesses,
      );

    const insights = this.insightGenerator.generateInsights(
      topMatches,
      dto.selectedSkills,
      dto.interests,
    );

    const result = new this.careerResultModel({
      userId: new Types.ObjectId(userId),
      assessmentId: dto.assessmentId
        ? new Types.ObjectId(dto.assessmentId)
        : new Types.ObjectId(),
      careerMatches: topMatches.map((m) => ({
        career: m.career,
        matchPercentage: m.matchPercentage,
        reason: m.reason,
        strengths: m.strengths,
        weaknesses: m.weaknesses,
        skillGaps: m.skillGaps,
      })),
      generatedInsights: insights,
      generatedAt: new Date(),
    });
    await result.save();

    return {
      userId,
      topMatches,
      allMatches,
      insights,
      generatedAt: result.generatedAt,
    };
  }

  async getHistory(
    userId: string,
    query: RecommendationsQueryDto,
  ) {
    const filter: any = { userId: new Types.ObjectId(userId) };

    if (query.minMatch !== undefined) {
      filter['careerMatches.matchPercentage'] = { $gte: query.minMatch };
    }

    const { page, limit, skip } = getPaginationParams(query);
    const sortField = query.sort || 'generatedAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.careerResultModel
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.careerResultModel.countDocuments(filter).exec(),
    ]);

    return { items: data, total, page, limit };
  }

  async getById(id: string, userId: string): Promise<CareerResult> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid career result ID');
    }

    const result = await this.careerResultModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!result) {
      throw new NotFoundException('Career result not found');
    }

    return result;
  }

  async getRecommendedCareers(
    search?: string,
  ): Promise<RecommendationCareer[]> {
    const filter: any = {};
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    return this.careerModel.find(filter).sort({ title: 1 }).lean();
  }

  getSuggestedPrompts(): string[] {
    return [
      'What career path should I choose?',
      'How do I become a software developer?',
      'What skills are in demand for AI?',
      'Which tech career has the best growth?',
      'How can I transition into data science?',
    ];
  }
}
