export const SKILL_WEIGHTS: Record<string, number> = {
  Programming: 9,
  Communication: 7,
  Leadership: 8,
  'Problem Solving': 10,
  Design: 6,
  Mathematics: 9,
  Creativity: 7,
};

interface CareerProfile {
  requiredSkills: string[];
  skillWeights: Record<string, number>;
}

const CAREER_PROFILES: Record<string, CareerProfile> = {
  'AI Engineer': {
    requiredSkills: ['Programming', 'Mathematics', 'Problem Solving'],
    skillWeights: { Programming: 9, Mathematics: 9, 'Problem Solving': 10 },
  },
  'Cybersecurity Analyst': {
    requiredSkills: ['Programming', 'Problem Solving', 'Communication'],
    skillWeights: { Programming: 8, 'Problem Solving': 9, Communication: 6 },
  },
  'Data Scientist': {
    requiredSkills: ['Mathematics', 'Programming', 'Problem Solving'],
    skillWeights: { Mathematics: 10, Programming: 8, 'Problem Solving': 9 },
  },
  'Full Stack Developer': {
    requiredSkills: ['Programming', 'Design', 'Problem Solving'],
    skillWeights: { Programming: 10, Design: 7, 'Problem Solving': 8 },
  },
  'Game Developer': {
    requiredSkills: ['Programming', 'Creativity', 'Design'],
    skillWeights: { Programming: 9, Creativity: 9, Design: 8 },
  },
  'Product Manager': {
    requiredSkills: ['Leadership', 'Communication', 'Problem Solving'],
    skillWeights: { Leadership: 9, Communication: 9, 'Problem Solving': 8 },
  },
  'Network Engineer': {
    requiredSkills: ['Programming', 'Problem Solving', 'Communication'],
    skillWeights: { Programming: 8, 'Problem Solving': 8, Communication: 6 },
  },
};

export const INTEREST_TO_CAREER: Record<string, string[]> = {
  AI: ['AI Engineer', 'Data Scientist'],
  Cybersecurity: ['Cybersecurity Analyst'],
  'Data Science': ['Data Scientist', 'AI Engineer'],
  'Web Development': ['Full Stack Developer'],
  Gaming: ['Game Developer'],
  Business: ['Product Manager'],
  Networking: ['Network Engineer'],
};

export function calculateScores(selectedSkills: string[]): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const skill of selectedSkills) {
    const normalized = skill.trim();
    const weight = SKILL_WEIGHTS[normalized];
    if (weight) {
      scores[normalized] = weight;
    } else {
      scores[normalized] = 5;
    }
  }
  return scores;
}

export function calculateMatchPercentages(
  scores: Record<string, number>,
  interest: string,
): Record<string, number> {
  const matches: Record<string, number> = {};
  const candidateCareers = INTEREST_TO_CAREER[interest] || Object.keys(CAREER_PROFILES);

  for (const career of candidateCareers) {
    const profile = CAREER_PROFILES[career];
    if (!profile) continue;

    let totalWeight = 0;
    let earnedWeight = 0;

    for (const skill of profile.requiredSkills) {
      const weight = profile.skillWeights[skill] || 5;
      totalWeight += weight;
      const userScore = scores[skill] || 0;
      const maxPossible = weight;
      earnedWeight += Math.min(userScore, maxPossible);
    }

    const percentage = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
    matches[career] = Math.min(percentage, 100);
  }

  return matches;
}

export function getRecommendedCareer(
  matchPercentages: Record<string, number>,
): { title: string; percentage: number } | null {
  let best: { title: string; percentage: number } | null = null;
  for (const [career, pct] of Object.entries(matchPercentages)) {
    if (!best || pct > best.percentage) {
      best = { title: career, percentage: pct };
    }
  }
  return best;
}
