import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requireEmployer } from '../middleware/role.middleware.js';
import { mediumCache } from '../middleware/cache.middleware.js';
import { sendEmail } from '../services/email.service.js';
import { sanitizeText } from '../utils/sanitize.js';

const router = Router();

// Get all jobs (cached for 5 minutes)
router.get(
  '/',
  optionalAuth,
  mediumCache,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const {
        search,
        locationType,
        jobType,
        minSalary,
        maxSalary,
        department,
        compensationType,
        paidOnly,
        remoteOnly,
        startMonth,
        durationRange,
        hoursPerWeek,
        skills,
        sort = 'newest',
        page = '1',
        limit = '10',
      } = req.query as any;

      const where: any = {
        status: 'ACTIVE',
      };

      // Basic filters
      if (locationType) where.locationType = locationType;
      if (jobType) where.jobType = jobType;
      if (department) where.department = department;
      if (minSalary) where.salaryMin = { gte: parseInt(minSalary) };
      if (maxSalary) where.salaryMax = { lte: parseInt(maxSalary) };

      // Internship-specific filters
      if (compensationType) where.compensationType = compensationType;
      if (paidOnly === 'true') where.compensationType = { in: ['PAID', 'STIPEND'] };
      if (remoteOnly === 'true') where.locationType = 'REMOTE';
      if (hoursPerWeek) where.hoursPerWeek = hoursPerWeek;

      if (startMonth) {
        const year = new Date().getFullYear();
        const monthStart = new Date(year, parseInt(startMonth) - 1, 1);
        const monthEnd = new Date(year, parseInt(startMonth), 0);
        where.startDate = { gte: monthStart, lte: monthEnd };
      }

      if (durationRange) {
        const [minW, maxW] = durationRange.split('-').map(Number);
        where.durationWeeks = { gte: minW * 4, lte: maxW * 4 };
      }

      if (skills) {
        const skillList = skills.split(',').map((s: string) => s.trim());
        where.skills = { hasSome: skillList };
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { skills: { hasSome: [search] } },
        ];
      }

      // Sort options
      let orderBy: any = { postedAt: 'desc' };
      if (sort === 'stipend') orderBy = { salaryMax: 'desc' };
      if (sort === 'deadline') orderBy = { applicationDeadline: 'asc' };

      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          include: {
            employer: {
              select: {
                companyName: true,
                logoUrl: true,
                verificationStatus: true,
              },
            },
            _count: {
              select: { applications: true },
            },
          },
          orderBy,
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
  }
);

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
    let application: any = null;
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
          include: {
            employer: {
              include: { user: { select: { email: true } } },
            },
          },
        },
      },
    });

    // Notify employer via email (fire-and-forget)
    const employerEmail = (application.job as any)?.employer?.user?.email;
    if (employerEmail) {
      const jobTitle = application.job?.title || 'a position';
      const company = application.job?.company || '';
      sendEmail({
        to: employerEmail,
        subject: `New Application: ${jobTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2D4DE0;">New Application Received 📩</h1>
            <p>A candidate has applied for <strong>${jobTitle}</strong>${company ? ` at ${company}` : ''}.</p>
            <a href="${process.env.FRONTEND_URL || 'https://studentos.uz'}/console-employer/applicants" style="display: inline-block; background: #2D4DE0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">View Application</a>
          </div>
        `,
      }).catch((err) => console.error('Failed to send application notification:', err));
    }

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

    const jobBody = req.body;
    const job = await prisma.job.create({
      data: {
        ...jobBody,
        title: sanitizeText(jobBody.title ?? ''),
        description: jobBody.description ? sanitizeText(jobBody.description) : jobBody.description,
        location: jobBody.location ? sanitizeText(jobBody.location) : jobBody.location,
        company: sanitizeText(jobBody.company || employerProfile.companyName),
        employerId: employerProfile.id,
      },
    });
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
});

// Employer: Get own jobs
router.get(
  '/employer/list',
  authenticate,
  requireEmployer,
  async (req: AuthenticatedRequest, res, next) => {
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

      res.json(
        jobs.map((j) => ({
          ...j,
          applicantCount: j._count.applications,
        }))
      );
    } catch (error) {
      next(error);
    }
  }
);

// Employer: Update job
router.patch(
  '/:id',
  authenticate,
  requireEmployer,
  async (req: AuthenticatedRequest, res, next) => {
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

      const updateBody = req.body;
      if (updateBody.title) updateBody.title = sanitizeText(updateBody.title);
      if (updateBody.description) updateBody.description = sanitizeText(updateBody.description);
      if (updateBody.location) updateBody.location = sanitizeText(updateBody.location);
      const job = await prisma.job.update({
        where: { id: req.params.id as string },
        data: updateBody,
      });
      res.json(job);
    } catch (error) {
      next(error);
    }
  }
);

// TEMPORARY: one-time cleanup — remove after use
router.delete('/clear-all-secret', async (req, res, next) => {
  try {
    if (req.headers['x-cleanup-secret'] !== process.env.ADMIN_PASSWORD) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const result = await prisma.job.deleteMany({});
    res.json({ deleted: result.count });
  } catch (error) {
    next(error);
  }
});

// Employer: Delete job
router.delete(
  '/:id',
  authenticate,
  requireEmployer,
  async (req: AuthenticatedRequest, res, next) => {
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
  }
);

// Employer: Update application status
router.patch(
  '/applications/:id/status',
  authenticate,
  requireEmployer,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { status } = req.body;
      const application = await prisma.jobApplication.update({
        where: { id: req.params.id as string },
        data: {
          status,
          ...(status === 'VIEWED' ? { viewedAt: new Date() } : {}),
        },
      });
      res.json(application);
    } catch (error) {
      next(error);
    }
  }
);

// Employer: Rate applicant
router.patch(
  '/applications/:id/rate',
  authenticate,
  requireEmployer,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { rating, notes } = req.body;
      const application = await prisma.jobApplication.update({
        where: { id: req.params.id as string },
        data: {
          ...(rating !== undefined ? { employerRating: rating } : {}),
          ...(notes !== undefined ? { employerNotes: notes } : {}),
        },
      });
      res.json(application);
    } catch (error) {
      next(error);
    }
  }
);

// Employer: Schedule interview
router.patch(
  '/applications/:id/interview',
  authenticate,
  requireEmployer,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { interviewDate } = req.body;
      const application = await prisma.jobApplication.update({
        where: { id: req.params.id as string },
        data: {
          interviewDate: new Date(interviewDate),
          status: 'INTERVIEW',
        },
      });
      res.json(application);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
