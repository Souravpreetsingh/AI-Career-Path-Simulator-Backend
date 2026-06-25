import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RecommendationCareer,
  RecommendationCareerDocument,
} from '../schemas/recommendation-career.schema';
import { calculateSkillScore, getSkillWeight } from '../utils/skill-weights';
import { getCareersForInterest } from '../utils/interest-mapping';
import { getGoalBonus } from '../utils/career-goals-bonus';
import { CareerMatch, CareerMatchWithDetails } from '../interfaces/career-match.interface';

@Injectable()
export class ScoringService {
  constructor(
    @InjectModel(RecommendationCareer.name)
    private careerModel: Model<RecommendationCareerDocument>,
  ) {}

  async calculateMatches(
    selectedSkills: string[],
    interest: string,
    careerGoal?: string,
    strengths?: string[],
    weaknesses?: string[],
  ): Promise<{
    allMatches: CareerMatchWithDetails[];
    topMatches: CareerMatchWithDetails[];
  }> {
    const skillScores = calculateSkillScore(selectedSkills);
    const goalBonus = careerGoal ? getGoalBonus(careerGoal) : 0;
    const candidateTitles = getCareersForInterest(interest);

    const allCareers = await this.careerModel.find().lean();
    const matches: CareerMatchWithDetails[] = [];

    for (const career of allCareers) {
      const shouldBoost = candidateTitles.some(
        (t) => t.toLowerCase() === career.title.toLowerCase(),
      );
      const match = this.scoreCareer(
        career,
        skillScores,
        selectedSkills,
        goalBonus,
        shouldBoost,
        strengths,
        weaknesses,
      );
      if (match.matchPercentage > 0) {
        matches.push(match);
      }
    }

    matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    const topMatches = matches.slice(0, 5);
    return { allMatches: matches, topMatches };
  }

  private scoreCareer(
    career: RecommendationCareer,
    skillScores: Record<string, number>,
    userSkills: string[],
    goalBonus: number,
    shouldBoost: boolean,
    strengths?: string[],
    weaknesses?: string[],
  ): CareerMatchWithDetails {
    const required = career.requiredSkills || [];
    let totalWeight = 0;
    let earnedWeight = 0;
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const skill of required) {
      const weight = getSkillWeight(skill);
      totalWeight += weight;

      const userScore = skillScores[skill] || 0;
      if (userScore > 0) {
        earnedWeight += Math.min(userScore, weight);
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    }

    const interestBoost = shouldBoost ? 8 : 0;
    const basePercentage =
      totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;
    const finalPercentage = Math.min(
      Math.round(basePercentage + goalBonus + interestBoost),
      100,
    );

    const userSkillSet = new Set(userSkills.map((s) => s.trim().toLowerCase()));
    const strengthList =
      strengths?.filter((s) => userSkillSet.has(s.toLowerCase())) || [];
    const weaknessList =
      weaknesses?.filter((w) => userSkillSet.has(w.toLowerCase())) || [];

    const match = this.generateMatchReason(
      career.title,
      matchedSkills,
      missingSkills,
      finalPercentage,
      shouldBoost,
    );

    return {
      career: career.title,
      matchPercentage: finalPercentage,
      reason: match.reason,
      strengths: strengthList,
      weaknesses: weaknessList,
      skillGaps: missingSkills,
      description: career.description,
      averageSalary: career.averageSalary,
      futureDemand: career.futureDemand,
      growthRate: career.growthRate,
      roadmap: career.roadmap,
      requiredSkills: career.requiredSkills,
    };
  }

  private generateMatchReason(
    careerTitle: string,
    matchedSkills: string[],
    missingSkills: string[],
    percentage: number,
    isInterestMatch: boolean,
  ): { reason: string } {
    const parts: string[] = [];

    if (percentage >= 85) {
      parts.push(`Excellent match for ${careerTitle}`);
    } else if (percentage >= 70) {
      parts.push(`Strong potential as a ${careerTitle}`);
    } else if (percentage >= 50) {
      parts.push(`Moderate fit for ${careerTitle}`);
    } else {
      parts.push(`Some alignment with ${careerTitle}`);
    }

    if (matchedSkills.length > 0) {
      parts.push(`Your ${matchedSkills.slice(0, 3).join(', ')} skills are relevant`);
    }

    if (missingSkills.length > 0 && percentage < 80) {
      parts.push(`Consider building ${missingSkills.slice(0, 2).join(', ')}`);
    }

    if (isInterestMatch) {
      parts.push('Matches your stated career interest');
    }

    return { reason: parts.join('. ') };
  }

  analyzeStrengthsAndWeaknesses(
    selectedSkills: string[],
    strengths?: string[],
    weaknesses?: string[],
  ): { identifiedStrengths: string[]; identifiedWeaknesses: string[] } {
    const highWeightSkills = Object.entries(
      calculateSkillScore(selectedSkills),
    )
      .filter(([, score]) => score >= 8)
      .map(([skill]) => skill);

    const lowWeightSkills = Object.entries(
      calculateSkillScore(selectedSkills),
    )
      .filter(([, score]) => score < 6)
      .map(([skill]) => skill);

    return {
      identifiedStrengths: [
        ...new Set([...(strengths || []), ...highWeightSkills]),
      ],
      identifiedWeaknesses: [
        ...new Set([...(weaknesses || []), ...lowWeightSkills]),
      ],
    };
  }
}
