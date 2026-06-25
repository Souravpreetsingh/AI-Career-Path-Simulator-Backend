export interface CareerMatch {
  career: string;
  matchPercentage: number;
  reason: string;
  strengths: string[];
  weaknesses: string[];
  skillGaps: string[];
}

export interface CareerMatchWithDetails extends CareerMatch {
  description?: string;
  averageSalary?: string;
  futureDemand?: string;
  growthRate?: number;
  roadmap?: string[];
  requiredSkills?: string[];
}
