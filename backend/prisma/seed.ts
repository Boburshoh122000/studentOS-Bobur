import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Use environment variables for passwords (required for security)
  const adminPasswordRaw = process.env.ADMIN_PASSWORD;
  const employerPasswordRaw = process.env.EMPLOYER_PASSWORD;

  if (!adminPasswordRaw || !employerPasswordRaw) {
    console.error('❌ ADMIN_PASSWORD and EMPLOYER_PASSWORD environment variables are required');
    console.error('   Set these in your .env file or Railway environment variables');
    process.exit(1);
  }

  // Create admin user
  const adminPassword = await bcrypt.hash(adminPasswordRaw, 12);
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

  // ==========================================================================
  // RBAC - Seed Permissions and Roles
  // ==========================================================================

  // Define all permissions by category
  const permissionsData = [
    // User Management
    {
      slug: 'users.view',
      name: 'View Users',
      category: 'User Management',
      description: 'View list of all users',
    },
    {
      slug: 'users.create',
      name: 'Create Users',
      category: 'User Management',
      description: 'Create new user accounts',
    },
    {
      slug: 'users.edit',
      name: 'Edit Users',
      category: 'User Management',
      description: 'Edit user details and status',
    },
    {
      slug: 'users.delete',
      name: 'Delete Users',
      category: 'User Management',
      description: 'Delete user accounts',
    },
    // Employer Management
    {
      slug: 'employers.view',
      name: 'View Employers',
      category: 'Employer Management',
      description: 'View employer accounts',
    },
    {
      slug: 'employers.approve',
      name: 'Approve Employers',
      category: 'Employer Management',
      description: 'Approve employer registrations',
    },
    {
      slug: 'employers.reject',
      name: 'Reject Employers',
      category: 'Employer Management',
      description: 'Reject employer registrations',
    },
    // Job Management
    {
      slug: 'jobs.view',
      name: 'View Jobs',
      category: 'Job Management',
      description: 'View all job listings',
    },
    {
      slug: 'jobs.create',
      name: 'Create Jobs',
      category: 'Job Management',
      description: 'Create job listings',
    },
    {
      slug: 'jobs.edit',
      name: 'Edit Jobs',
      category: 'Job Management',
      description: 'Edit job listings',
    },
    {
      slug: 'jobs.delete',
      name: 'Delete Jobs',
      category: 'Job Management',
      description: 'Delete job listings',
    },
    {
      slug: 'jobs.approve',
      name: 'Approve Jobs',
      category: 'Job Management',
      description: 'Approve job submissions',
    },
    // Blog Management
    {
      slug: 'blog.view',
      name: 'View Blog',
      category: 'Blog Management',
      description: 'View all blog posts',
    },
    {
      slug: 'blog.create',
      name: 'Create Blog Posts',
      category: 'Blog Management',
      description: 'Create new blog posts',
    },
    {
      slug: 'blog.edit',
      name: 'Edit Blog Posts',
      category: 'Blog Management',
      description: 'Edit blog posts',
    },
    {
      slug: 'blog.delete',
      name: 'Delete Blog Posts',
      category: 'Blog Management',
      description: 'Delete blog posts',
    },
    {
      slug: 'blog.publish',
      name: 'Publish Blog Posts',
      category: 'Blog Management',
      description: 'Publish/unpublish blog posts',
    },
    // Scholarship Management
    {
      slug: 'scholarships.view',
      name: 'View Scholarships',
      category: 'Scholarship Management',
      description: 'View all scholarships',
    },
    {
      slug: 'scholarships.create',
      name: 'Create Scholarships',
      category: 'Scholarship Management',
      description: 'Create scholarships',
    },
    {
      slug: 'scholarships.edit',
      name: 'Edit Scholarships',
      category: 'Scholarship Management',
      description: 'Edit scholarships',
    },
    {
      slug: 'scholarships.delete',
      name: 'Delete Scholarships',
      category: 'Scholarship Management',
      description: 'Delete scholarships',
    },
    // System
    {
      slug: 'system.settings',
      name: 'System Settings',
      category: 'System',
      description: 'Access system settings',
    },
    {
      slug: 'system.audit-logs',
      name: 'View Audit Logs',
      category: 'System',
      description: 'View admin audit logs',
    },
    {
      slug: 'system.roles',
      name: 'Manage Roles',
      category: 'System',
      description: 'Create and manage admin roles',
    },
  ];

  // Upsert all permissions
  const permissions: Record<string, string> = {};
  for (const perm of permissionsData) {
    const permission = await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: {},
      create: perm,
    });
    permissions[perm.slug] = permission.id;
  }
  console.log('✅ Permissions created (' + permissionsData.length + ' permissions)');

  // Define roles with their permissions
  const rolesData = [
    {
      name: 'Super Admin',
      description: 'Full access to all system features',
      isSystem: true,
      permissionSlugs: Object.keys(permissions), // All permissions
    },
    {
      name: 'Employer Admin',
      description: 'Manage employer accounts and job posts',
      isSystem: true,
      permissionSlugs: [
        'employers.view',
        'employers.approve',
        'employers.reject',
        'jobs.view',
        'jobs.create',
        'jobs.edit',
        'jobs.delete',
        'jobs.approve',
      ],
    },
    {
      name: 'Content Editor',
      description: 'Manage blog and content',
      isSystem: true,
      permissionSlugs: [
        'blog.view',
        'blog.create',
        'blog.edit',
        'blog.delete',
        'blog.publish',
        'scholarships.view',
        'scholarships.create',
        'scholarships.edit',
      ],
    },
    {
      name: 'Support',
      description: 'View-only access for support staff',
      isSystem: true,
      permissionSlugs: [
        'users.view',
        'employers.view',
        'jobs.view',
        'blog.view',
        'scholarships.view',
        'system.audit-logs',
      ],
    },
  ];

  // Upsert roles and their permissions
  for (const roleData of rolesData) {
    const role = await prisma.adminRole.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description },
      create: {
        name: roleData.name,
        description: roleData.description,
        isSystem: roleData.isSystem,
      },
    });

    // Clear existing permissions for this role and add new ones
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    for (const slug of roleData.permissionSlugs) {
      if (permissions[slug]) {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: permissions[slug] },
        });
      }
    }
  }
  console.log('✅ Admin roles created (' + rolesData.length + ' roles)');

  // Assign Super Admin role to the admin user
  const superAdminRole = await prisma.adminRole.findUnique({ where: { name: 'Super Admin' } });
  if (superAdminRole) {
    await prisma.userAdminRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: superAdminRole.id } },
      update: {},
      create: { userId: admin.id, roleId: superAdminRole.id },
    });
    console.log('✅ Super Admin role assigned to admin user');
  }

  // Create sample employers
  const employerPassword = await bcrypt.hash(employerPasswordRaw, 12);

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
          description:
            'TechFlow is a cutting-edge software company focused on building innovative solutions.',
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
      description:
        'We are looking for a passionate Junior Frontend Developer to join our growing team. You will work on building modern web applications using React and TypeScript.',
      requirements: [
        'React/Vue experience',
        'TypeScript knowledge',
        'CSS/Tailwind proficiency',
        'Git version control',
      ],
      responsibilities: [
        'Build responsive UIs',
        'Collaborate with design team',
        'Write clean code',
        'Participate in code reviews',
      ],
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
      description:
        'Join our design team and help create beautiful user experiences. Perfect for students looking to gain real-world design experience.',
      requirements: [
        'Figma proficiency',
        'Portfolio required',
        'Design fundamentals',
        'Strong communication',
      ],
      responsibilities: [
        'Create wireframes',
        'Design prototypes',
        'User research',
        'Design system maintenance',
      ],
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
      description:
        'We are looking for a Backend Developer to build scalable APIs and microservices using Node.js and Python.',
      requirements: [
        'Node.js/Python experience',
        'PostgreSQL/MongoDB',
        'REST API design',
        'Docker knowledge',
      ],
      responsibilities: [
        'Design APIs',
        'Database optimization',
        'Write documentation',
        'Mentor junior developers',
      ],
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
      description:
        'Work with our data team to analyze large datasets and build machine learning models for product recommendations.',
      requirements: [
        'Python/R proficiency',
        'Statistics knowledge',
        'SQL experience',
        'Currently enrolled student',
      ],
      responsibilities: [
        'Data analysis',
        'Build ML models',
        'Create visualizations',
        'Present findings',
      ],
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
      description:
        'Join our product team to help define and launch new features. Work closely with engineering and design teams.',
      requirements: [
        'Strong communication',
        'Analytical mindset',
        'Technical background preferred',
        'User-focused thinking',
      ],
      responsibilities: [
        'Write PRDs',
        'User interviews',
        'Roadmap planning',
        'Stakeholder management',
      ],
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
      description:
        'Help us grow our brand and reach new customers through digital marketing campaigns and content creation.',
      requirements: [
        'Marketing degree or experience',
        'Social media savvy',
        'Content creation skills',
        'Analytics tools',
      ],
      responsibilities: [
        'Social media management',
        'Content calendar',
        'Campaign analysis',
        'Event coordination',
      ],
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
      description:
        'Merit-based scholarship for outstanding international students demonstrating academic excellence and leadership potential.',
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
      description:
        'For students demonstrating exceptional leadership potential and commitment to making a positive impact in their communities.',
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
      description:
        'Supporting innovative research in science and technology. Open to students pursuing STEM degrees.',
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
      description:
        'The UK governments international scholarship program for future leaders. Covers tuition, travel, and living costs.',
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
      description:
        'Prestigious international exchange program offering grants for graduate study, research, and teaching.',
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
      description:
        'For international students pursuing masters or PhD degrees at German universities.',
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
      description:
        'Scholarships for students from developing countries to study at Australian universities.',
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
      description:
        'For researchers and artists from abroad who wish to pursue doctoral or postdoctoral research in Switzerland.',
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
      description:
        'For outstanding applicants from outside the UK to pursue a full-time postgraduate degree at Cambridge.',
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
      description:
        'Comprehensive scholarship covering tuition, airfare, and monthly stipend for study in Japan.',
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
      excerpt:
        'Learn the essential strategies to prepare for and succeed in your next tech interview.',
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
      excerpt:
        'Discover the top scholarships that can help fund your education without breaking the bank.',
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
      excerpt:
        'Learn science-backed strategies to build and maintain productive habits as a student.',
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
      features: [
        'Basic job search',
        'Limited scholarships',
        '3 CV analyses/month',
        'Community access',
      ],
      isActive: true,
    },
    {
      name: 'Pro',
      price: 9.99,
      interval: 'MONTHLY' as const,
      features: [
        'Unlimited job search',
        'All scholarships',
        'Unlimited CV analyses',
        'AI cover letters',
        'Priority support',
        'Ad-free experience',
      ],
      isActive: true,
      isPopular: true,
    },
    {
      name: 'Annual Pro',
      price: 79.99,
      interval: 'YEARLY' as const,
      features: [
        'Everything in Pro',
        'Save 33%',
        'Early access to new features',
        'Exclusive webinars',
      ],
      isActive: true,
    },
    {
      name: 'Enterprise',
      price: 29.99,
      interval: 'MONTHLY' as const,
      features: [
        'Everything in Pro',
        'Team features',
        'Custom integrations',
        'Dedicated support',
        'API access',
      ],
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await prisma.pricingPlan.create({
      data: plan,
    });
  }
  console.log('✅ Pricing plans created (4 plans)');

  // =============================================================================
  // SEED: TOOLS (Credit System)
  // =============================================================================

  const tools = [
    {
      name: 'CV Maker Pro',
      slug: 'cv-maker',
      description: 'AI-Powered Resume Builder',
      category: 'Career Tools',
      icon: 'description',
      creditCost: 50,
      isActive: true,
    },
    {
      name: 'Cover Letter Generator',
      slug: 'cover-letter',
      description: 'Generate professional cover letters with AI',
      category: 'Career Tools',
      icon: 'mail',
      creditCost: 30,
      isActive: true,
    },
    {
      name: 'Job Finder',
      slug: 'job-finder',
      description: 'Standard Job Board Access',
      category: 'Recruitment',
      icon: 'work_outline',
      creditCost: 0, // Free
      isActive: true,
    },
    {
      name: 'Scholarship Finder',
      slug: 'scholarship-finder',
      description: 'Find scholarships matching your profile',
      category: 'Education',
      icon: 'school',
      creditCost: 20,
      isActive: true,
    },
    {
      name: 'Plagiarism Checker',
      slug: 'plagiarism-checker',
      description: 'Check your work for plagiarism',
      category: 'Academic',
      icon: 'fact_check',
      creditCost: 10,
      isActive: true,
    },
    {
      name: 'ATS Checker',
      slug: 'ats-checker',
      description: 'Analyze your CV against job descriptions',
      category: 'Career Tools',
      icon: 'analytics',
      creditCost: 10,
      isActive: true,
    },
    {
      name: 'Learning Plan Generator',
      slug: 'learning-plan',
      description: 'Generate personalized learning plans with AI',
      category: 'Academic',
      icon: 'auto_stories',
      creditCost: 6,
      isActive: true,
    },
    {
      name: 'Presentation Maker',
      slug: 'presentation-maker',
      description: 'Create stunning presentations with AI',
      category: 'Productivity',
      icon: 'slideshow',
      creditCost: 25,
      isActive: true,
    },
    {
      name: 'Essay Writer',
      slug: 'essay-writer',
      description: 'AI-assisted essay writing tool',
      category: 'Academic',
      icon: 'edit_note',
      creditCost: 40,
      isActive: true,
    },
    {
      name: 'Study Planner',
      slug: 'study-planner',
      description: 'Organize your study schedule',
      category: 'Productivity',
      icon: 'calendar_month',
      creditCost: 0, // Free
      isActive: true,
    },
  ];

  for (const tool of tools) {
    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: tool,
      create: tool,
    });
  }
  console.log('✅ Tools created (10 tools)');

  // =============================================================================
  // SEED: APP SETTINGS
  // =============================================================================

  const settings = [
    { key: 'referral_bonus', value: '100' },
    { key: 'early_bird_active', value: 'true' },
    { key: 'default_welcome_credits', value: '10' },
    {
      key: 'plagiarism_pricing_tiers',
      value: JSON.stringify([
        { minWords: 0, maxWords: 1000, credits: 5 },
        { minWords: 1001, maxWords: 3000, credits: 12 },
        { minWords: 3001, maxWords: 6000, credits: 20 },
        { minWords: 6001, maxWords: 10000, credits: 30 },
        { minWords: 10001, maxWords: 15000, credits: 45 },
        { minWords: 15001, maxWords: 20000, credits: 60 },
        { minWords: 20001, maxWords: 30000, credits: 80 },
      ]),
    },
    { key: 'plagiarism_extra_threshold', value: '30000' },
    { key: 'plagiarism_extra_base_credits', value: '80' },
    { key: 'plagiarism_extra_per_10k', value: '25' },
  ];

  for (const setting of settings) {
    await prisma.appSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✅ App settings configured');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📋 Admin/Employer credentials are set via environment variables');
  console.log('   ADMIN_PASSWORD and EMPLOYER_PASSWORD');
  console.log('\n📊 Data created:');
  console.log('   - 6 Jobs');
  console.log('   - 10 Scholarships');
  console.log('   - 3 Blog Posts');
  console.log('   - 4 Pricing Plans');
  console.log('   - 8 Tools (Credit System)');
  console.log('   - 3 App Settings');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
