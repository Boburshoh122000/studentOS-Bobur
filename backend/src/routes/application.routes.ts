import { Router } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requireEmployer } from '../middleware/role.middleware.js';

const router = Router();

// Get application details (for employer or applicant)
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const application = await prisma.jobApplication.findUnique({
      where: { id: req.params.id as string },
      include: {
        user: {
          include: {
            studentProfile: true,
          },
        },
        job: {
          include: {
            employer: true,
          },
        },
      },
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    // Data isolation check: Only allow access if:
    // 1. User is the applicant themselves
    // 2. User is the employer who owns the job
    // 3. User is an admin
    const isApplicant = application.userId === req.user!.id;
    const isJobOwner = application.job.employer?.userId === req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isApplicant && !isJobOwner && !isAdmin) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
});

// Update application status (employer)
router.patch(
  '/:id/status',
  authenticate,
  requireEmployer,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { status, notes } = req.body;

      // First check if this employer owns the job
      const application = await prisma.jobApplication.findUnique({
        where: { id: req.params.id as string },
        include: {
          job: {
            include: {
              employer: true,
            },
          },
        },
      });

      if (!application) {
        res.status(404).json({ error: 'Application not found' });
        return;
      }

      // Verify ownership
      if (application.job.employer?.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
        res.status(403).json({ error: 'Not authorized to update this application' });
        return;
      }

      const updated = await prisma.jobApplication.update({
        where: { id: req.params.id as string },
        data: {
          status,
          notes,
        },
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

// Get applications for a job (employer)
router.get(
  '/job/:jobId',
  authenticate,
  requireEmployer,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { status, page = '1', limit = '20' } = req.query as any;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 per page

      const where: any = { jobId: req.params.jobId as string };
      if (status) where.status = status;

      const [applications, total] = await Promise.all([
        prisma.jobApplication.findMany({
          where,
          include: {
            user: {
              include: {
                studentProfile: {
                  select: {
                    fullName: true,
                    avatarUrl: true,
                    university: true,
                    major: true,
                    graduationYear: true,
                    skills: true,
                  },
                },
              },
            },
          },
          orderBy: { appliedAt: 'desc' },
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
        }),
        prisma.jobApplication.count({ where }),
      ]);

      res.json({
        applications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Withdraw application (student)
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const application = await prisma.jobApplication.findUnique({
      where: { id: req.params.id as string },
    });

    if (!application || application.userId !== req.user!.id) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    await prisma.jobApplication.update({
      where: { id: req.params.id as string },
      data: { status: 'WITHDRAWN' },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
