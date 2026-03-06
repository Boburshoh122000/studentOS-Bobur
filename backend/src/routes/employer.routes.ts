import { Router } from 'express';
import multer from 'multer';
import prisma from '../config/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requireEmployer } from '../middleware/role.middleware.js';
import { sendTelegramMessage } from '../services/telegram.service.js';
import { getSupabaseAdmin } from '../config/supabase.js';

const router = Router();

// Multer config for logo uploads (memory storage, images only, 2MB)
const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// Middleware: All routes require authentication and EMPLOYER role
router.use(authenticate, requireEmployer);

// Get employer profile
router.get('/me', async (req: AuthenticatedRequest, res, next) => {
  try {
    const profile = await prisma.employerProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        _count: {
          select: { jobs: true },
        },
      },
    });

    if (!profile) {
      // Auto-create if not exists (onboarding flow might have been skipped)
      // Or return 404? Better to return null or strict 404.
      // User model exists, so if they are EMPLOYER, they should have a profile.
      // But let's return null if not found for frontend to handle "Create Profile" UI.
      res.json(null);
      return;
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
});

// Update employer profile
router.patch('/me', async (req: AuthenticatedRequest, res, next) => {
  try {
    const profile = await prisma.employerProfile.upsert({
      where: { userId: req.user!.id },
      update: req.body,
      create: {
        userId: req.user!.id,
        ...req.body,
        companyName: req.body.companyName || 'My Company', // Fallback
      },
    });

    res.json(profile);
  } catch (error) {
    next(error);
  }
});

// Upload company logo
router.post('/logo', logoUpload.single('logo'), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      res.status(503).json({ error: 'Storage service not configured' });
      return;
    }

    const fileExt = req.file.originalname.split('.').pop() || 'png';
    const fileName = `company-logos/${req.user!.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('team-avatars')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Logo upload error:', uploadError);
      res.status(500).json({ error: 'Failed to upload logo' });
      return;
    }

    const { data: urlData } = supabase.storage.from('team-avatars').getPublicUrl(fileName);

    await prisma.employerProfile.update({
      where: { userId: req.user!.id },
      data: { logoUrl: urlData.publicUrl },
    });

    res.json({ logoUrl: urlData.publicUrl });
  } catch (error) {
    next(error);
  }
});

// Delete company logo
router.delete('/logo', async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.employerProfile.update({
      where: { userId: req.user!.id },
      data: { logoUrl: null },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get dashboard stats
router.get('/stats', async (req: AuthenticatedRequest, res, next) => {
  try {
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!employerProfile) {
      res.json({
        activeJobs: 0,
        totalApplicants: 0,
        newApplications: 0,
        shortlisted: 0,
        newThisWeek: 0,
        closedJobs: 0,
        interviewsScheduled: 0,
      });
      return;
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      activeJobs,
      totalApplicants,
      newApplications,
      shortlisted,
      newThisWeek,
      closedJobs,
      interviewsScheduled,
    ] = await Promise.all([
      // Active Jobs
      prisma.job.count({
        where: { employerId: employerProfile.id, status: 'ACTIVE' },
      }),
      // Total Applicants across all my jobs
      prisma.jobApplication.count({
        where: { job: { employerId: employerProfile.id } },
      }),
      // New Applications (e.g. status NEW)
      prisma.jobApplication.count({
        where: { job: { employerId: employerProfile.id }, status: 'NEW' },
      }),
      // Shortlisted (e.g. status SCREENING or INTERVIEW)
      prisma.jobApplication.count({
        where: {
          job: { employerId: employerProfile.id },
          status: { in: ['SCREENING', 'INTERVIEW'] },
        },
      }),
      // New jobs posted this week
      prisma.job.count({
        where: { employerId: employerProfile.id, postedAt: { gte: weekAgo } },
      }),
      // Closed jobs
      prisma.job.count({
        where: { employerId: employerProfile.id, status: 'CLOSED' },
      }),
      // Interviews scheduled
      prisma.jobApplication.count({
        where: { job: { employerId: employerProfile.id }, status: 'INTERVIEW' },
      }),
    ]);

    res.json({
      activeJobs,
      totalApplicants,
      newApplications,
      shortlisted,
      newThisWeek,
      closedJobs,
      interviewsScheduled,
    });
  } catch (error) {
    next(error);
  }
});

// Get all applications for this employer (aggregated)
router.get('/applications', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page = '1', limit = '10', status, search, jobId } = req.query as any;

    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!employerProfile) {
      res.json({ applications: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } });
      return;
    }

    const where: any = {
      job: { employerId: employerProfile.id },
    };

    if (jobId) {
      where.jobId = jobId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { user: { studentProfile: { fullName: { contains: search, mode: 'insensitive' } } } },
        { job: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        include: {
          job: {
            select: { title: true, id: true },
          },
          user: {
            select: {
              email: true,
              studentProfile: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                  university: true,
                  major: true,
                  educationLevel: true,
                  country: true,
                  graduationYear: true,
                  skills: true,
                },
              },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.jobApplication.count({ where }),
    ]);

    res.json({
      applications,
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

// Update application status (shortlist, reject, schedule interview)
router.patch('/applications/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['NEW', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    // Get employer profile
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!employerProfile) {
      res.status(403).json({ error: 'Employer profile not found' });
      return;
    }

    // Verify the application belongs to this employer's job
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }

    if (application.job.employerId !== employerProfile.id) {
      res.status(403).json({ error: 'Not authorized to update this application' });
      return;
    }

    // Update the application
    const updated = await prisma.jobApplication.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        job: { select: { title: true } },
        user: {
          select: {
            email: true,
            studentProfile: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    res.json(updated);

    // ── Telegram notification to student (fire-and-forget) ──
    if (status && updated.userId) {
      const statusMessages: Record<string, string> = {
        SCREENING: '👀 Your application is being reviewed',
        INTERVIEW: '🎉 You have been invited to an interview',
        OFFER: '🏆 Congratulations! You received a job offer',
        REJECTED: '😔 Your application was not selected this time',
      };
      const msg = statusMessages[status];
      if (msg) {
        const jobTitle = updated.job?.title || 'a position';
        sendTelegramMessage(
          updated.userId,
          `${msg} for <b>${jobTitle}</b>!\n\nCheck your StudentOS dashboard for details.`
        ).catch(() => {});
      }
    }
  } catch (error) {
    next(error);
  }
});

// Get candidate portfolio (full student profile for employers)
router.get('/applicants/:userId/portfolio', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { userId } = req.params;

    // Get employer profile
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!employerProfile) {
      res.status(403).json({ error: 'Employer profile not found' });
      return;
    }

    // Verify this candidate has applied to at least one of this employer's jobs
    const applicationExists = await prisma.jobApplication.findFirst({
      where: {
        userId: userId as string,
        job: { employerId: employerProfile.id },
      },
    });

    if (!applicationExists) {
      res.status(403).json({
        error: 'You can only view portfolios of candidates who have applied to your jobs',
      });
      return;
    }

    // Fetch full student profile
    const user = await prisma.user.findUnique({
      where: { id: userId as string },
      select: {
        id: true,
        email: true,
        studentProfile: {
          select: {
            fullName: true,
            avatarUrl: true,
            bio: true,
            headline: true,
            educationLevel: true,
            university: true,
            graduationYear: true,
            major: true,
            country: true,
            skills: true,
            cvUrl: true,
            atsScore: true,
            educationHistory: true,
            workExperience: true,
            certificates: true,
            goals: true,
          },
        },
      },
    });

    if (!user || !user.studentProfile) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }

    res.json({
      ...user.studentProfile,
      email: user.email,
      userId: user.id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
