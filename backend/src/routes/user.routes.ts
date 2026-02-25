import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { calculateProfileCompletion } from '../services/auth.service.js';

const router = Router();

// Update profile
const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().optional(),
    avatarUrl: z.string().url().optional().nullable(),
    bio: z.string().max(500).optional(),
    educationLevel: z.string().optional(),
    university: z.string().optional(),
    graduationYear: z.number().optional(),
    major: z.string().optional(),
    country: z.string().optional(),
    goals: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    headline: z.string().max(200).optional(),
    educationHistory: z.any().optional(),
    workExperience: z.any().optional(),
    certificates: z.any().optional(),
  }),
});

// Get profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        studentProfile: true,
        employerProfile: true,
      },
    });

    res.json(user?.studentProfile || user?.employerProfile);
  } catch (error) {
    next(error);
  }
});

// Update profile
router.patch(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const data = req.body;

      // Update student profile
      const profile = await prisma.studentProfile.update({
        where: { userId: req.user!.id },
        data: {
          ...data,
          educationLevel: data.educationLevel?.toUpperCase(),
        },
      });

      // Calculate and update profile completion
      const completion = calculateProfileCompletion(profile);
      await prisma.studentProfile.update({
        where: { userId: req.user!.id },
        data: { profileCompletion: completion },
      });

      res.json({
        ...profile,
        profileCompletion: completion,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get dashboard data
router.get('/dashboard', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Get profile
    const [profile, userData] = await Promise.all([
      prisma.studentProfile.findUnique({ where: { userId } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { telegramChatId: true },
      }),
    ]);

    // Get recent applications
    const applications = await prisma.jobApplication.findMany({
      where: { userId },
      include: {
        job: {
          select: {
            title: true,
            company: true,
            location: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
      take: 5,
    });

    // Get habit stats
    const habits = await prisma.habit.findMany({
      where: { userId, isActive: true },
      include: {
        logs: {
          where: {
            completedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        },
      },
    });

    // Calculate streak
    const todayLogs = await prisma.habitLog.count({
      where: {
        userId,
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    res.json({
      userId,
      profile,
      recentApplications: applications,
      habits: habits.map((h) => ({
        id: h.id,
        title: h.title,
        icon: h.icon,
        color: h.color,
        completedToday: h.logs.some(
          (l) => new Date(l.completedAt).toDateString() === new Date().toDateString()
        ),
        weeklyCount: h.logs.length,
      })),
      stats: {
        activeApplications: applications.filter(
          (a) => a.status !== 'REJECTED' && a.status !== 'WITHDRAWN'
        ).length,
        atsScore: profile?.atsScore || 0,
        habitsCompletedToday: todayLogs,
        profileCompletion: profile?.profileCompletion || 0,
      },
      telegramConnected: !!userData?.telegramChatId,
    });
  } catch (error) {
    next(error);
  }
});

// Claim Telegram credits (one-time +50)
router.post(
  '/claim-telegram-credits',
  authenticate,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.user!.id;

      // Check if already claimed
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { telegramCredited: true },
      });

      if (user?.telegramCredited) {
        return res.status(400).json({ error: 'Telegram credits already claimed' });
      }

      // Atomically increment credits and mark as claimed
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          creditBalance: { increment: 50 },
          telegramCredited: true,
        },
        select: { creditBalance: true },
      });

      res.json({ creditBalance: updated.creditBalance, message: '+50 credits added!' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
