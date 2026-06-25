const MOCK_RESPONSES: Record<string, string> = {
  'how do i become an ai engineer':
    'Learn Python, Data Structures, Machine Learning, Deep Learning and build projects. Start with Python fundamentals, then move to NumPy, Pandas, and Scikit-learn. Study linear algebra and calculus. Build end-to-end ML projects and contribute to open source.',
  'how do i become a data scientist':
    'Master statistics, Python, SQL, and machine learning. Build a portfolio with real-world datasets. Learn data visualization with Matplotlib and Seaborn. Practice on Kaggle competitions and understand the ML lifecycle from data collection to deployment.',
  'how do i become a product manager':
    'Develop strong communication, leadership, and strategic thinking skills. Learn about user research, A/B testing, and agile methodologies. Build domain expertise in your target industry. Create a portfolio of product case studies.',
  'resume review':
    'I can help optimize your resume. Key tips: 1) Quantify achievements with metrics, 2) Tailor keywords to the job description, 3) Use strong action verbs, 4) Keep it to one page for early career, 5) Highlight impact over responsibilities.',
  'interview prep':
    'Prepare by: 1) Researching the company and role deeply, 2) Practicing behavioral questions using the STAR method, 3) Reviewing technical fundamentals, 4) Preparing thoughtful questions to ask, 5) Doing mock interviews with peers.',
  'top skills for 2026':
    'Top skills for 2026: 1) AI/ML expertise, 2) Cloud computing (AWS, Azure, GCP), 3) Data analysis and interpretation, 4) Cybersecurity, 5) Emotional intelligence and leadership, 6) Adaptability and continuous learning.',
};

export function getMockResponse(message: string): string {
  const normalized = message.toLowerCase().trim();

  for (const [keyword, response] of Object.entries(MOCK_RESPONSES)) {
    if (normalized.includes(keyword)) return response;
  }

  const defaultResponses = [
    'That is a great question! Based on current industry trends, I recommend focusing on building a strong foundation in the core skills relevant to your target role. Would you like me to elaborate on any specific area?',
    'Great question! The key to career growth is continuous learning and practical application. I suggest identifying skill gaps, creating a structured learning plan, and working on real-world projects to build your portfolio.',
    'To advance in this area, focus on three pillars: technical proficiency, practical experience, and professional networking. Let me know if you would like specific guidance on any of these.',
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

export const SUGGESTED_PROMPTS = [
  'How do I become an AI Engineer?',
  'Critique my resume for a senior role.',
  'Simulate a product manager interview.',
  'What are the top skills for 2026?',
  'How do I transition from frontend to AI/ML?',
  'What certifications should I pursue?',
];
