import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Career } from '../careers/schemas/career.schema';
import { RecommendationCareer } from '../recommendations/schemas/recommendation-career.schema';
import { SEED_CAREERS } from '../recommendations/constants/career-data';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/utils/roles.enum';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const careerModel = app.get<Model<Career>>(getModelToken('Career'));
  const recCareerModel = app.get<Model<RecommendationCareer>>(getModelToken('RecommendationCareer'));
  const userModel = app.get<Model<any>>(getModelToken('User'));
  const assessmentModel = app.get<Model<any>>(getModelToken('Assessment'));
  const roadmapModel = app.get<Model<any>>(getModelToken('Roadmap'));
  const chatModel = app.get<Model<any>>(getModelToken('Chat'));

  await Promise.all([
    careerModel.deleteMany({}),
    recCareerModel.deleteMany({}),
    userModel.deleteMany({}),
    assessmentModel.deleteMany({}),
    roadmapModel.deleteMany({}),
    chatModel.deleteMany({}),
  ]);

  const careers = [
    {
      title: 'AI Engineer',
      description: 'Design and build artificial intelligence systems, including machine learning models, neural networks, and NLP solutions.',
      estimatedSalary: '$150k - $220k',
      futureDemand: '+34% over 5 years',
      requiredSkills: ['Programming', 'Mathematics', 'Problem Solving', 'Machine Learning', 'Deep Learning'],
      roadmapSteps: ['Learn Python and Data Structures', 'Master Linear Algebra and Calculus', 'Study Machine Learning fundamentals', 'Build ML projects', 'Learn Deep Learning frameworks', 'Deploy models to production'],
    },
    {
      title: 'Data Scientist',
      description: 'Analyze large datasets to extract actionable insights using statistical methods, machine learning, and data visualization.',
      estimatedSalary: '$130k - $190k',
      futureDemand: '+28% over 5 years',
      requiredSkills: ['Mathematics', 'Programming', 'Problem Solving', 'Statistics', 'Data Visualization'],
      roadmapSteps: ['Learn Python and SQL', 'Master Statistics and Probability', 'Learn Pandas and NumPy', 'Study Machine Learning', 'Practice on Kaggle datasets', 'Build data pipeline projects'],
    },
    {
      title: 'Full Stack Developer',
      description: 'Build and maintain web applications across frontend and backend using modern frameworks and cloud services.',
      estimatedSalary: '$110k - $170k',
      futureDemand: '+20% over 5 years',
      requiredSkills: ['Programming', 'Design', 'Problem Solving', 'JavaScript', 'Databases'],
      roadmapSteps: ['Learn HTML, CSS, JavaScript', 'Master React or Vue.js', 'Learn Node.js and Express', 'Study databases (SQL + NoSQL)', 'Build full-stack projects', 'Learn cloud deployment'],
    },
    {
      title: 'Cybersecurity Analyst',
      description: 'Protect organizational systems from cyber threats through monitoring, assessments, and incident response.',
      estimatedSalary: '$120k - $180k',
      futureDemand: '+31% over 5 years',
      requiredSkills: ['Programming', 'Problem Solving', 'Communication', 'Network Security', 'Ethical Hacking'],
      roadmapSteps: ['Learn networking fundamentals', 'Study security frameworks', 'Learn Python for security', 'Get CompTIA Security+ certified', 'Practice on CTF platforms', 'Specialize in cloud security'],
    },
    {
      title: 'Product Manager',
      description: 'Define product vision and strategy, working cross-functionally to deliver products that solve user needs.',
      estimatedSalary: '$130k - $200k',
      futureDemand: '+18% over 5 years',
      requiredSkills: ['Leadership', 'Communication', 'Problem Solving', 'Strategic Thinking', 'User Research'],
      roadmapSteps: ['Learn product management fundamentals', 'Master user research techniques', 'Study agile methodologies', 'Build product case studies', 'Learn data-driven decision making', 'Gain domain expertise'],
    },
    {
      title: 'Game Developer',
      description: 'Design and develop video games across platforms using game engines and interactive storytelling.',
      estimatedSalary: '$90k - $150k',
      futureDemand: '+15% over 5 years',
      requiredSkills: ['Programming', 'Creativity', 'Design', 'Game Engines', '3D Graphics'],
      roadmapSteps: ['Learn C++ or C#', 'Study game engines (Unity/Unreal)', 'Learn 3D modeling basics', 'Build small games', 'Study game physics', 'Work on game jams'],
    },
    {
      title: 'Network Engineer',
      description: 'Design, implement, and manage computer networks ensuring reliability, security, and performance.',
      estimatedSalary: '$100k - $160k',
      futureDemand: '+12% over 5 years',
      requiredSkills: ['Programming', 'Problem Solving', 'Communication', 'Network Protocols', 'Cloud Networking'],
      roadmapSteps: ['Learn networking fundamentals (TCP/IP, DNS)', 'Get CCNA certified', 'Learn Python for automation', 'Study cloud networking', 'Practice troubleshooting', 'Learn SDN'],
    },
    {
      title: 'Cloud Engineer',
      description: 'Design and manage cloud infrastructure on AWS, Azure, or GCP for scalable and resilient applications.',
      estimatedSalary: '$140k - $200k',
      futureDemand: '+25% over 5 years',
      requiredSkills: ['Programming', 'Problem Solving', 'Cloud Networking', 'Linux', 'DevOps', 'Databases'],
      roadmapSteps: ['Learn Linux administration', 'Master cloud provider (AWS/Azure/GCP)', 'Learn Infrastructure as Code', 'Study containerization (Docker/K8s)', 'Build CI/CD pipelines', 'Get cloud certifications'],
    },
    {
      title: 'DevOps Engineer',
      description: 'Bridge development and operations by automating infrastructure and streamlining deployment pipelines.',
      estimatedSalary: '$135k - $195k',
      futureDemand: '+22% over 5 years',
      requiredSkills: ['Programming', 'Problem Solving', 'Linux', 'DevOps', 'Cloud Networking', 'Communication'],
      roadmapSteps: ['Learn Linux and scripting', 'Master Git', 'Learn CI/CD tools', 'Study Docker containers', 'Learn Kubernetes', 'Implement monitoring'],
    },
  ];

  await careerModel.insertMany(careers);
  console.log(`Seeded ${careers.length} careers.`);

  await recCareerModel.insertMany(SEED_CAREERS);
  console.log(`Seeded ${SEED_CAREERS.length} recommendation careers.`);

  const salt = await bcrypt.hash('Demo123!', 10);

  const admin = await userModel.create({
    fullName: 'Admin User',
    email: 'admin@careerpath.com',
    password: salt,
    role: UserRole.ADMIN,
    provider: 'email',
    isEmailVerified: true,
  });
  console.log('Admin: admin@careerpath.com / Demo123!');

  const student = await userModel.create({
    fullName: 'Student User',
    email: 'student@careerpath.com',
    password: salt,
    role: UserRole.STUDENT,
    provider: 'email',
    isEmailVerified: true,
    collegeName: 'University of Technology',
    course: 'Computer Science',
    graduationYear: 2025,
  });
  console.log('Student: student@careerpath.com / Demo123!');

  const demo = await userModel.create({
    fullName: 'Demo User',
    email: 'demo@careerpath.com',
    password: salt,
    role: UserRole.STUDENT,
    provider: 'email',
    isEmailVerified: true,
    collegeName: 'Tech Institute',
    course: 'Information Technology',
    graduationYear: 2026,
  });
  console.log('Demo: demo@careerpath.com / Demo123!');

  await app.close();
  console.log('\nSeed complete. Run: npm run start:dev');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
