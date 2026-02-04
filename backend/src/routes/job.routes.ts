import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requireEmployer } from '../middleware/role.middleware.js';
import { mediumCache } from '../middleware/cache.middleware.js';

const router = Router();

// Get all jobs (cached for 5 minutes)
router.get('/', optionalAuth, mediumCache, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      search, 
      locationType, 
      minSalary, 
      maxSalary,
      department,
      page = '1', 
      limit = '10' 
    } = req.query as any;

    const where: any = {
      status: 'ACTIVE',
    };

    if (locationType) where.locationType = locationType;
    if (department) where.department = department;
    if (minSalary) where.salaryMin = { gte: parseInt(minSalary) };
    if (maxSalary) where.salaryMax = { lte: parseInt(maxSalary) };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          employer: {
            select: {
              companyName: true,
              logoUrl: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { postedAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.job.count({ where }),
    ]);

    // Get saved jobs and applications for authenticated user
    let savedIds: string[] = [];
    let appliedIds: string[] = [];
    if (req.user) {
      const [saved, applications] = await Promise.all([
        prisma.savedJob.findMany({
          where: { userId: req.user.id },
          select: { jobId: true },
        }),
        prisma.jobApplication.findMany({
          where: { userId: req.user.id },
          select: { jobId: true, status: true },
        }),
      ]);
      savedIds = saved.map((s) => s.jobId);
      appliedIds = applications.map((a) => a.jobId);
    }

    res.json({
      jobs: jobs.map((j) => ({
        ...j,
        isSaved: savedIds.includes(j.id),
        hasApplied: appliedIds.includes(j.id),
        applicantCount: j._count.applications,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single job
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id as string },
      include: {
        employer: {
          select: {
            companyName: true,
            logoUrl: true,
            description: true,
            website: true,
            industry: true,
            companySize: true,
          },
        },
      },
    });

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    let isSaved = false;
    let application = null;
    if (req.user) {
      const [saved, app] = await Promise.all([
        prisma.savedJob.findUnique({
          where: { userId_jobId: { userId: req.user.id, jobId: job.id } },
        }),
        prisma.jobApplication.findUnique({
          where: { jobId_userId: { jobId: job.id, userId: req.user.id } },
        }),
      ]);
      isSaved = !!saved;
      application = app;
    }

    res.json({ ...job, isSaved, application });
  } catch (error) {
    next(error);
  }
});

// Apply to job
router.post('/:id/apply', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { coverLetter, cvUrl } = req.body;

    const application = await prisma.jobApplication.create({
      data: {
        jobId: req.params.id as string,
        userId: req.user!.id,
        coverLetter,
        cvUrl,
      },
      include: {
        job: {
          select: { title: true, company: true },
        },
      },
    });

    res.status(201).json(application);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Already applied' });
      return;
    }
    next(error);
  }
});

// Save job
router.post('/:id/save', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const saved = await prisma.savedJob.create({
      data: {
        userId: req.user!.id,
        jobId: req.params.id as string,
      },
    });
    res.status(201).json(saved);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Already saved' });
      return;
    }
    next(error);
  }
});

// Unsave job
router.delete('/:id/save', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.savedJob.delete({
      where: { userId_jobId: { userId: req.user!.id, jobId: req.params.id as string } },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get saved jobs
router.get('/saved/list', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const saved = await prisma.savedJob.findMany({
      where: { userId: req.user!.id },
      include: {
        job: {
          include: {
            employer: { select: { companyName: true, logoUrl: true } },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });
    res.json(saved.map((s) => ({ ...s.job, isSaved: true, savedAt: s.savedAt })));
  } catch (error) {
    next(error);
  }
});

// Get user applications
router.get('/applications/list', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const applications = await prisma.jobApplication.findMany({
      where: { userId: req.user!.id },
      include: {
        job: {
          include: {
            employer: { select: { companyName: true, logoUrl: true } },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
    res.json(applications);
  } catch (error) {
    next(error);
  }
});

// Employer: Create job
router.post('/', authenticate, requireEmployer, async (req: AuthenticatedRequest, res, next) => {
  try {
    // Get employer profile
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!employerProfile) {
      res.status(400).json({ error: 'Employer profile required' });
      return;
    }

    const job = await prisma.job.create({
      data: {
        ...req.body,
        employerId: employerProfile.id,
        company: req.body.company || employerProfile.companyName,
      },
    });
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
});

// Employer: Get own jobs
router.get('/employer/list', authenticate, requireEmployer, async (req: AuthenticatedRequest, res, next) => {
  try {
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!employerProfile) {
      res.json([]);
      return;
    }

    const jobs = await prisma.job.findMany({
      where: { employerId: employerProfile.id },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { postedAt: 'desc' },
    });

    res.json(jobs.map((j) => ({
      ...j,
      applicantCount: j._count.applications,
    })));
  } catch (error) {
    next(error);
  }
});

// Employer: Update job
router.patch('/:id', authenticate, requireEmployer, async (req: AuthenticatedRequest, res, next) => {
  try {
    // Verify ownership
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!employerProfile) {
      res.status(400).json({ error: 'Employer profile required' });
      return;
    }

    const existingJob = await prisma.job.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existingJob) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Check ownership (only job owner or admin can update)
    if (existingJob.employerId !== employerProfile.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized to update this job' });
      return;
    }

    const job = await prisma.job.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json(job);
  } catch (error) {
    next(error);
  }
});

// Employer: Delete job
router.delete('/:id', authenticate, requireEmployer, async (req: AuthenticatedRequest, res, next) => {
  try {
    // Verify ownership
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!employerProfile) {
      res.status(400).json({ error: 'Employer profile required' });
      return;
    }

    const existingJob = await prisma.job.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existingJob) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Check ownership (only job owner or admin can delete)
    if (existingJob.employerId !== employerProfile.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized to delete this job' });
      return;
    }

    await prisma.job.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
