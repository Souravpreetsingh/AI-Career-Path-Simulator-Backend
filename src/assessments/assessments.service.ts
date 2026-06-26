import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assessment, AssessmentDocument } from './schemas/assessment.schema';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import {
  calculateScores,
  calculateMatchPercentages,
  getRecommendedCareer,
} from './utils/scoring';
import { RecommendationsService } from '../recommendations/services/recommendations.service';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectModel(Assessment.name)
    private assessmentModel: Model<AssessmentDocument>,
    private recommendationsService: RecommendationsService,
  ) {}

  async create(userId: string, dto: CreateAssessmentDto) {
    const scores = calculateScores(dto.selectedSkills);
    const matchPercentages = calculateMatchPercentages(scores, dto.interests);
    const recommended = getRecommendedCareer(matchPercentages);

    const assessment = await this.assessmentModel.create({
      userId,
      selectedSkills: dto.selectedSkills,
      interests: dto.interests,
      careerGoals: dto.careerGoals,
      strengths: dto.strengths || [],
      weaknesses: dto.weaknesses || [],
      scores,
      matchPercentages,
      completedAt: new Date(),
    });

    let recommendations: { topMatches: any[]; insights: any[] } | null = null;
    try {
      const recResult = await this.recommendationsService.analyze(userId, {
        selectedSkills: dto.selectedSkills,
        interests: dto.interests,
        careerGoal: dto.careerGoals,
        strengths: dto.strengths,
        weaknesses: dto.weaknesses,
        assessmentId: assessment._id.toString(),
      });
      recommendations = {
        topMatches: recResult.topMatches,
        insights: recResult.insights,
      };
    } catch {
      // Non-blocking: recommendations are a bonus, not a blocker
    }

    return { assessment, recommended, matchPercentages, recommendations };
  }

  async findById(id: string) {
    const assessment = await this.assessmentModel.findById(id).populate('userId', 'fullName email');
    if (!assessment) throw new NotFoundException('Assessment not found');
    return assessment;
  }

  async findResults(userId: string) {
    const assessments = await this.assessmentModel
      .find({ userId })
      .sort({ completedAt: -1 });

    if (!assessments.length) {
      return { assessments: [], latest: null, recommended: null };
    }

    const latest = assessments[0];
    const recommended = getRecommendedCareer(latest.matchPercentages || {});

    return { assessments, latest, recommended };
  }
}
