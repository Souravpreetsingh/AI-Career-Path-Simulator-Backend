import { CareerMatch, CareerMatchWithDetails } from './career-match.interface';

export interface Insight {
  type: 'strength' | 'weakness' | 'opportunity' | 'suggestion';
  message: string;
  category: string;
}

export interface RecommendationResult {
  userId: string;
  topMatches: CareerMatchWithDetails[];
  allMatches: CareerMatchWithDetails[];
  insights: Insight[];
  generatedAt: Date;
}

export interface CareerAnalysis {
  dominantSkills: string[];
  skillGaps: string[];
  suggestedFocus: string[];
  careerCategory: string;
  experienceLevel: string;
}
