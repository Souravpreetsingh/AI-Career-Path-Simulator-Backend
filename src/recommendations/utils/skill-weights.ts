export const SKILL_WEIGHTS: Record<string, number> = {
  Programming: 9,
  Communication: 7,
  Leadership: 8,
  'Problem Solving': 10,
  Design: 6,
  Mathematics: 9,
  Creativity: 7,
  'Machine Learning': 10,
  'Deep Learning': 9,
  Python: 8,
  JavaScript: 7,
  'Data Visualization': 6,
  Statistics: 9,
  SQL: 6,
  'Network Security': 8,
  'Ethical Hacking': 8,
  Linux: 6,
  'Cloud Networking': 8,
  DevOps: 7,
  'Strategic Thinking': 8,
  'User Research': 7,
  'Game Engines': 8,
  '3D Graphics': 7,
  'C++': 8,
  Databases: 6,
  'UI/UX': 7,
  'Data Analysis': 8,
};

export function getSkillWeight(skill: string): number {
  return SKILL_WEIGHTS[skill] || 5;
}

export function calculateSkillScore(skills: string[]): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const skill of skills) {
    const normalized = skill.trim();
    scores[normalized] = getSkillWeight(normalized);
  }
  return scores;
}
