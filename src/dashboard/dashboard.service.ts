import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Assessment, AssessmentDocument } from '../assessments/schemas/assessment.schema';
import { Roadmap, RoadmapDocument } from '../roadmaps/schemas/roadmap.schema';
import { Chat, ChatDocument } from '../chat/schemas/chat.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Assessment.name)
    private assessmentModel: Model<AssessmentDocument>,
    @InjectModel(Roadmap.name)
    private roadmapModel: Model<RoadmapDocument>,
    @InjectModel(Chat.name)
    private chatModel: Model<ChatDocument>,
  ) {}

  async getStats(userId: string) {
    const [assessments, roadmaps, chats] = await Promise.all([
      this.assessmentModel.countDocuments({ userId }),
      this.roadmapModel.countDocuments({ userId }),
      this.chatModel.countDocuments({ userId }),
    ]);

    const latestAssessment = await this.assessmentModel
      .findOne({ userId })
      .sort({ completedAt: -1 });

    return {
      totalAssessments: assessments,
      totalRoadmaps: roadmaps,
      totalChats: chats,
      topMatch: latestAssessment?.matchPercentages || {},
      recommendedCareer: this.getTopCareer(latestAssessment),
    };
  }

  async getActivity(userId: string) {
    const recentAssessments = await this.assessmentModel
      .find({ userId })
      .select('interests completedAt matchPercentages')
      .sort({ completedAt: -1 })
      .limit(5);

    const recentRoadmaps = await this.roadmapModel
      .find({ userId })
      .populate('careerId', 'title')
      .sort({ updatedAt: -1 })
      .limit(5);

    const recentChats = await this.chatModel
      .find({ userId })
      .select('title createdAt')
      .sort({ updatedAt: -1 })
      .limit(5);

    return {
      recentAssessments,
      recentRoadmaps,
      recentChats,
    };
  }

  async getRecommendations(userId: string) {
    const latestAssessment = await this.assessmentModel
      .findOne({ userId })
      .sort({ completedAt: -1 });

    const skillGaps = latestAssessment?.weaknesses || [];
    const interests = latestAssessment?.interests || '';

    const defaultRecommendations = [
      {
        title: 'Complete a Career Assessment',
        description: 'Start your journey by analyzing your skills and interests.',
        priority: 'high',
      },
      {
        title: 'Explore AI Engineering Path',
        description: 'One of the highest growth fields with excellent compensation.',
        priority: 'medium',
      },
    ];

    if (!latestAssessment) return defaultRecommendations;

    const recommendations = [
      {
        title: `Focus on ${interests} Skills`,
        description: `Based on your interest in ${interests}, we recommend targeted skill development.`,
        priority: 'high',
      },
      ...skillGaps.slice(0, 3).map((gap) => ({
        title: `Improve ${gap}`,
        description: `Addressing this weakness could unlock new career opportunities.`,
        priority: 'medium' as const,
      })),
      {
        title: 'Review Your Career Matches',
        description: 'Your assessment results show promising career paths to explore.',
        priority: 'high',
      },
    ];

    return recommendations;
  }

  private getTopCareer(assessment: AssessmentDocument | null) {
    if (!assessment?.matchPercentages) return null;
    let best = '';
    let bestPct = 0;
    for (const [career, pct] of Object.entries(assessment.matchPercentages)) {
      if (pct > bestPct) {
        best = career;
        bestPct = pct;
      }
    }
    return best ? { title: best, percentage: bestPct } : null;
  }
}
