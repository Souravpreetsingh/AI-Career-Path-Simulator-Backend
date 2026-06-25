export const INTEREST_TO_CAREERS: Record<string, string[]> = {
  AI: ['AI Engineer', 'Data Scientist', 'Game Developer'],
  Cybersecurity: ['Cybersecurity Analyst', 'Network Engineer'],
  'Data Science': ['Data Scientist', 'AI Engineer', 'Cloud Engineer'],
  'Web Development': ['Full Stack Developer', 'UI/UX Designer', 'DevOps Engineer'],
  Gaming: ['Game Developer', 'UI/UX Designer'],
  Business: ['Product Manager', 'Data Scientist', 'Full Stack Developer'],
  Networking: ['Network Engineer', 'Cybersecurity Analyst', 'Cloud Engineer'],
  Design: ['UI/UX Designer', 'Full Stack Developer', 'Game Developer'],
  'Cloud Computing': ['Cloud Engineer', 'DevOps Engineer', 'Network Engineer'],
  'Machine Learning': ['AI Engineer', 'Data Scientist', 'Game Developer'],
};

export const CAREER_TO_INTERESTS: Record<string, string[]> = {
  'AI Engineer': ['AI', 'Data Science', 'Machine Learning'],
  'Data Scientist': ['Data Science', 'AI', 'Business'],
  'Cybersecurity Analyst': ['Cybersecurity', 'Networking'],
  'Full Stack Developer': ['Web Development', 'Design', 'Business'],
  'Product Manager': ['Business', 'Web Development', 'Data Science'],
  'Network Engineer': ['Networking', 'Cybersecurity'],
  'Game Developer': ['Gaming', 'Design', 'AI'],
  'Cloud Engineer': ['Cloud Computing', 'Networking', 'Web Development'],
  'DevOps Engineer': ['Web Development', 'Networking', 'Cloud Computing'],
  'UI/UX Designer': ['Design', 'Web Development', 'Gaming'],
};

export function getCareersForInterest(interest: string): string[] {
  const normalized = Object.keys(INTEREST_TO_CAREERS).find(
    (key) => key.toLowerCase() === interest.toLowerCase(),
  );
  return normalized ? INTEREST_TO_CAREERS[normalized] : [];
}

export function getInterestsForCareer(career: string): string[] {
  return CAREER_TO_INTERESTS[career] || [];
}
