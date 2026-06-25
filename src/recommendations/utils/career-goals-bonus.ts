export const CAREER_GOAL_BONUS: Record<string, number> = {
  'High Salary': 10,
  Startup: 8,
  Research: 7,
  'Government Job': 6,
  'Work-Life Balance': 5,
  Entrepreneurship: 9,
  'Remote Work': 6,
  'Global Impact': 7,
  Innovation: 8,
  Stability: 4,
};

export function getGoalBonus(goal: string): number {
  const normalized = Object.keys(CAREER_GOAL_BONUS).find(
    (key) => key.toLowerCase() === goal.toLowerCase(),
  );
  return normalized ? CAREER_GOAL_BONUS[normalized] : 0;
}

export function calculateGoalBonus(goals: string[]): number {
  return goals.reduce((total, goal) => total + getGoalBonus(goal.trim()), 0);
}
