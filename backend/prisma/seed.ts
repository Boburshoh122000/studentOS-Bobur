import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@studentos.com' },
    update: {},
    create: {
      email: 'admin@studentos.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
      studentProfile: {
        create: {
          fullName: 'Admin User',
          profileCompletion: 100,
        },
      },
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create sample employers
  const employerPassword = await bcrypt.hash('employer123', 12);
  
  const employer1 = await prisma.user.upsert({
    where: { email: 'hr@techflow.com' },
    update: {},
    create: {
      email: 'hr@techflow.com',
      passwordHash: employerPassword,
      role: 'EMPLOYER',
      emailVerified: true,
      employerProfile: {
        create: {
          companyName: 'TechFlow Inc.',
          tagline: 'Innovating the future of tech',
          industry: 'Software Development',
          companySize: '11-50 employees',
          description: 'TechFlow is a cutting-edge software company focused on building innovative solutions.',
          website: 'https://techflow.com',
          city: 'San Francisco',
          state: 'CA',
          country: 'United States',
        },
      },
    },
  });
  console.log('✅ Employer 1 created:', employer1.email);

  const employer2 = await prisma.user.upsert({
    where: { email: 'careers@innovatehub.io' },
    update: {},
    create: {
      email: 'careers@innovatehub.io',
      passwordHash: employerPassword,
      role: 'EMPLOYER',
      emailVerified: true,
      employerProfile: {
        create: {
          companyName: 'InnovateHub',
          tagline: 'Where ideas become reality',
          industry: 'Product Development',
          companySize: '51-200 employees',
          description: 'InnovateHub helps startups and enterprises bring their products to market.',
          website: 'https://innovatehub.io',
          city: 'Austin',
          state: 'TX',
          country: 'United States',
        },
      },
    },
  });
  console.log('✅ Employer 2 created:', employer2.email);

  // Get employer profiles for job creation
  const employerProfile1 = await prisma.employerProfile.findUnique({
    where: { userId: employer1.id },
  });
  const employerProfile2 = await prisma.employerProfile.findUnique({
    where: { userId: employer2.id },
  });

  // Create sample jobs
  const jobs = [
    {
      title: 'Junior Frontend Developer',
      company: 'TechFlow Inc.',
      location: 'San Francisco, CA',
      locationType: 'REMOTE' as const,
      salaryMin: 70000,
      salaryMax: 90000,
      department: 'Engineering',
      description: 'We are looking for a passionate Junior Frontend Developer to join our growing team. You will work on building modern web applications using React and TypeScript.',
      requirements: ['React/Vue experience', 'TypeScript knowledge', 'CSS/Tailwind proficiency', 'Git version control'],
      responsibilities: ['Build responsive UIs', 'Collaborate with design team', 'Write clean code', 'Participate in code reviews'],
      benefits: ['Remote work', 'Health insurance', '401k matching', 'Unlimited PTO'],
      employerId: employerProfile1!.id,
    },
    {
      title: 'UX/UI Design Intern',
      company: 'TechFlow Inc.',
      location: 'New York, NY',
      locationType: 'HYBRID' as const,
      salaryMin: 40000,
      salaryMax: 50000,
      department: 'Design',
      description: 'Join our design team and help create beautiful user experiences. Perfect for students looking to gain real-world design experience.',
      requirements: ['Figma proficiency', 'Portfolio required', 'Design fundamentals', 'Strong communication'],
      responsibilities: ['Create wireframes', 'Design prototypes', 'User research', 'Design system maintenance'],
      benefits: ['Mentorship program', 'Flexible hours', 'Learning budget'],
      employerId: employerProfile1!.id,
    },
    {
      title: 'Backend Developer',
      company: 'InnovateHub',
      location: 'Austin, TX',
      locationType: 'ONSITE' as const,
      salaryMin: 85000,
      salaryMax: 110000,
      department: 'Engineering',
      description: 'We are looking for a Backend Developer to build scalable APIs and microservices using Node.js and Python.',
      requirements: ['Node.js/Python experience', 'PostgreSQL/MongoDB', 'REST API design', 'Docker knowledge'],
      responsibilities: ['Design APIs', 'Database optimization', 'Write documentation', 'Mentor junior developers'],
      benefits: ['Competitive salary', 'Stock options', 'Gym membership', 'Catered lunches'],
      employerId: employerProfile2!.id,
    },
    {
      title: 'Data Science Intern',
      company: 'InnovateHub',
      location: 'Remote',
      locationType: 'REMOTE' as const,
      salaryMin: 35000,
      salaryMax: 45000,
      department: 'Data',
      description: 'Work with our data team to analyze large datasets and build machine learning models for product recommendations.',
      requirements: ['Python/R proficiency', 'Statistics knowledge', 'SQL experience', 'Currently enrolled student'],
      responsibilities: ['Data analysis', 'Build ML models', 'Create visualizations', 'Present findings'],
      benefits: ['Remote work', 'Flexible schedule', 'Return offer potential'],
      employerId: employerProfile2!.id,
    },
    {
      title: 'Product Manager Associate',
      company: 'TechFlow Inc.',
      location: 'San Francisco, CA',
      locationType: 'HYBRID' as const,
      salaryMin: 75000,
      salaryMax: 95000,
      department: 'Product',
      description: 'Join our product team to help define and launch new features. Work closely with engineering and design teams.',
      requirements: ['Strong communication', 'Analytical mindset', 'Technical background preferred', 'User-focused thinking'],
      responsibilities: ['Write PRDs', 'User interviews', 'Roadmap planning', 'Stakeholder management'],
      benefits: ['Career growth', 'Health benefits', 'Education stipend'],
      employerId: employerProfile1!.id,
    },
    {
      title: 'Marketing Coordinator',
      company: 'InnovateHub',
      location: 'Austin, TX',
      locationType: 'ONSITE' as const,
      salaryMin: 50000,
      salaryMax: 65000,
      department: 'Marketing',
      description: 'Help us grow our brand and reach new customers through digital marketing campaigns and content creation.',
      requirements: ['Marketing degree or experience', 'Social media savvy', 'Content creation skills', 'Analytics tools'],
      responsibilities: ['Social media management', 'Content calendar', 'Campaign analysis', 'Event coordination'],
      benefits: ['Creative environment', 'Team events', 'Professional development'],
      employerId: employerProfile2!.id,
    },
  ];

  for (const job of jobs) {
    await prisma.job.create({
      data: job,
    });
  }
  console.log('✅ Sample jobs created (6 jobs)');

  // Create sample scholarships
  const scholarships = [
    {
      title: 'Global Excellence Scholarship',
      institution: 'Harvard University',
      country: 'United States',
      studyLevel: 'Undergraduate',
      awardType: 'Full Tuition',
      awardAmount: 'Up to $50,000/year',
      deadline: new Date('2026-03-15'),
      description: 'Merit-based scholarship for outstanding international students demonstrating academic excellence and leadership potential.',
      applicationUrl: 'https://harvard.edu/scholarships',
    },
    {
      title: 'Future Leaders Award',
      institution: 'Oxford University',
      country: 'United Kingdom',
      studyLevel: 'Postgraduate',
      awardType: 'Partial Funding',
      awardAmount: '£15,000',
      deadline: new Date('2026-04-01'),
      description: 'For students demonstrating exceptional leadership potential and commitment to making a positive impact in their communities.',
      applicationUrl: 'https://ox.ac.uk/scholarships',
    },
    {
      title: 'STEM Innovation Grant',
      institution: 'MIT',
      country: 'United States',
      studyLevel: 'Undergraduate',
      awardType: 'Research Grant',
      awardAmount: '$25,000',
      deadline: new Date('2026-02-28'),
      description: 'Supporting innovative research in science and technology. Open to students pursuing STEM degrees.',
      applicationUrl: 'https://mit.edu/grants',
    },
    {
      title: 'Chevening Scholarship',
      institution: 'UK Government',
      country: 'United Kingdom',
      studyLevel: 'Postgraduate',
      awardType: 'Full Funding',
      awardAmount: 'Full tuition + living expenses',
      deadline: new Date('2026-11-01'),
      description: 'The UK governments international scholarship program for future leaders. Covers tuition, travel, and living costs.',
      applicationUrl: 'https://chevening.org/scholarships',
    },
    {
      title: 'Fulbright Program',
      institution: 'U.S. Department of State',
      country: 'United States',
      studyLevel: 'Postgraduate',
      awardType: 'Full Funding',
      awardAmount: 'Full tuition + stipend',
      deadline: new Date('2026-10-15'),
      description: 'Prestigious international exchange program offering grants for graduate study, research, and teaching.',
      applicationUrl: 'https://cies.org/fulbright',
    },
    {
      title: 'DAAD Scholarship',
      institution: 'German Academic Exchange Service',
      country: 'Germany',
      studyLevel: 'Postgraduate',
      awardType: 'Full Funding',
      awardAmount: '€1,200/month + benefits',
      deadline: new Date('2026-09-30'),
      description: 'For international students pursuing masters or PhD degrees at German universities.',
      applicationUrl: 'https://daad.de/en',
    },
    {
      title: 'Australia Awards',
      institution: 'Australian Government',
      country: 'Australia',
      studyLevel: 'Undergraduate',
      awardType: 'Full Funding',
      awardAmount: 'Full tuition + living allowance',
      deadline: new Date('2026-05-15'),
      description: 'Scholarships for students from developing countries to study at Australian universities.',
      applicationUrl: 'https://australiaawards.gov.au',
    },
    {
      title: 'Swiss Government Excellence Scholarship',
      institution: 'Swiss Confederation',
      country: 'Switzerland',
      studyLevel: 'Postgraduate',
      awardType: 'Full Funding',
      awardAmount: 'CHF 1,920/month',
      deadline: new Date('2026-08-01'),
      description: 'For researchers and artists from abroad who wish to pursue doctoral or postdoctoral research in Switzerland.',
      applicationUrl: 'https://sbfi.admin.ch/eskas',
    },
    {
      title: 'Gates Cambridge Scholarship',
      institution: 'University of Cambridge',
      country: 'United Kingdom',
      studyLevel: 'Postgraduate',
      awardType: 'Full Funding',
      awardAmount: 'Full cost of study',
      deadline: new Date('2026-12-01'),
      description: 'For outstanding applicants from outside the UK to pursue a full-time postgraduate degree at Cambridge.',
      applicationUrl: 'https://gatescambridge.org',
    },
    {
      title: 'Japanese Government MEXT Scholarship',
      institution: 'MEXT Japan',
      country: 'Japan',
      studyLevel: 'Undergraduate',
      awardType: 'Full Funding',
      awardAmount: '¥117,000/month + tuition',
      deadline: new Date('2026-04-30'),
      description: 'Comprehensive scholarship covering tuition, airfare, and monthly stipend for study in Japan.',
      applicationUrl: 'https://studyinjapan.go.jp/en',
    },
  ];

  for (const scholarship of scholarships) {
    await prisma.scholarship.create({
      data: scholarship,
    });
  }
  console.log('✅ Sample scholarships created (10 scholarships)');

  // Create sample blog posts (authored by admin)
  const blogPosts = [
    {
      title: 'How to Ace Your Tech Interview',
      slug: 'how-to-ace-your-tech-interview',
      content: `Getting a job in tech can be challenging, but with the right preparation, you can stand out from the crowd.

## 1. Master the Fundamentals
Before anything else, make sure you have a solid understanding of data structures and algorithms. Practice on platforms like LeetCode and HackerRank.

## 2. Build Real Projects
Employers want to see what you can build. Create a portfolio showcasing your best work, including personal projects and contributions to open source.

## 3. Practice Behavioral Questions
Technical skills aren't everything. Be ready to discuss your experiences, challenges you've overcome, and how you work in teams.

## 4. Research the Company
Understand the company's products, culture, and values. This shows genuine interest and helps you ask meaningful questions.

## 5. Follow Up
After the interview, send a thank-you email. It's a small gesture that can make a big difference.`,
      excerpt: 'Learn the essential strategies to prepare for and succeed in your next tech interview.',
      coverImageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800',
      tags: ['career', 'interview', 'tech'],
      status: 'PUBLISHED' as const,
      publishedAt: new Date(),
      authorId: admin.id,
    },
    {
      title: '10 Scholarships Every Student Should Know About',
      slug: '10-scholarships-every-student-should-know',
      content: `Funding your education doesn't have to be a burden. Here are some of the best scholarships available worldwide.

## 1. Fulbright Program
The gold standard for international academic exchange. Fully funded for graduate study abroad.

## 2. Rhodes Scholarship
One of the oldest and most prestigious, covering full tuition at Oxford University.

## 3. Chevening Scholarship
The UK government's flagship program for future leaders from around the world.

## 4. Gates Cambridge Scholarship
Full funding for postgraduate study at the University of Cambridge.

## 5. DAAD Scholarships
Germany's comprehensive funding program for international students.

And many more! Start your applications early and don't be afraid to apply to multiple programs.`,
      excerpt: 'Discover the top scholarships that can help fund your education without breaking the bank.',
      coverImageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
      tags: ['scholarships', 'funding', 'education'],
      status: 'PUBLISHED' as const,
      publishedAt: new Date(),
      authorId: admin.id,
    },
    {
      title: 'Building Habits That Stick: A Students Guide',
      slug: 'building-habits-that-stick',
      content: `Success in academics and life comes down to the small actions you take every day.

## Start Small
Don't try to change everything at once. Pick one habit and focus on making it automatic before adding more.

## Use Habit Stacking
Attach new habits to existing ones. "After I finish my morning coffee, I will study for 30 minutes."

## Track Your Progress
Use a habit tracker to visualize your streak. The longer your streak, the more motivated you'll be to maintain it.

## Embrace Imperfection
Missing one day doesn't mean you've failed. Get back on track the next day.

## Reward Yourself
Celebrate small wins. This positive reinforcement makes habits more likely to stick.`,
      excerpt: 'Learn science-backed strategies to build and maintain productive habits as a student.',
      coverImageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
      tags: ['productivity', 'habits', 'student-life'],
      status: 'PUBLISHED' as const,
      publishedAt: new Date(),
      authorId: admin.id,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.create({
      data: post,
    });
  }
  console.log('✅ Sample blog posts created (3 posts)');

  // Create pricing plans
  const plans = [
    {
      name: 'Free',
      price: 0,
      interval: 'MONTHLY' as const,
      features: ['Basic job search', 'Limited scholarships', '3 CV analyses/month', 'Community access'],
      isActive: true,
    },
    {
      name: 'Pro',
      price: 9.99,
      interval: 'MONTHLY' as const,
      features: ['Unlimited job search', 'All scholarships', 'Unlimited CV analyses', 'AI cover letters', 'Priority support', 'Ad-free experience'],
      isActive: true,
      isPopular: true,
    },
    {
      name: 'Annual Pro',
      price: 79.99,
      interval: 'YEARLY' as const,
      features: ['Everything in Pro', 'Save 33%', 'Early access to new features', 'Exclusive webinars'],
      isActive: true,
    },
    {
      name: 'Enterprise',
      price: 29.99,
      interval: 'MONTHLY' as const,
      features: ['Everything in Pro', 'Team features', 'Custom integrations', 'Dedicated support', 'API access'],
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await prisma.pricingPlan.create({
      data: plan,
    });
  }
  console.log('✅ Pricing plans created (4 plans)');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📋 Test credentials:');
  console.log('   Admin: admin@studentos.com / admin123');
  console.log('   Employer 1: hr@techflow.com / employer123');
  console.log('   Employer 2: careers@innovatehub.io / employer123');
  console.log('\n📊 Data created:');
  console.log('   - 6 Jobs');
  console.log('   - 10 Scholarships');
  console.log('   - 3 Blog Posts');
  console.log('   - 4 Pricing Plans');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
