import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { calculateProfileCompletion } from '../services/auth.service.js';
import { sanitizeText } from '../utils/sanitize.js';
import { checkChannelMembership } from '../services/telegram.service.js';

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
      // Explicitly extract only allowed fields to prevent unknown keys reaching Prisma
      const {
        fullName,
        avatarUrl,
        bio,
        educationLevel,
        university,
        graduationYear,
        major,
        country,
        goals,
        skills,
        headline,
        educationHistory,
        workExperience,
        certificates,
        universityId,
      } = req.body;

      const updateData: Record<string, unknown> = {};
      const raw: Record<string, unknown> = {
        fullName,
        avatarUrl,
        bio,
        educationLevel,
        university,
        graduationYear,
        major,
        country,
        goals,
        skills,
        headline,
        educationHistory,
        workExperience,
        certificates,
        universityId,
      };
      for (const [k, v] of Object.entries(raw)) {
        if (v !== undefined) updateData[k] = v;
      }

      // Sanitize plain-text fields
      if (updateData.fullName) updateData.fullName = sanitizeText(updateData.fullName as string);
      if (updateData.bio) updateData.bio = sanitizeText(updateData.bio as string);
      if (updateData.headline) updateData.headline = sanitizeText(updateData.headline as string);
      if (updateData.major) updateData.major = sanitizeText(updateData.major as string);
      if (updateData.university)
        updateData.university = sanitizeText(updateData.university as string);
      if (updateData.country) updateData.country = sanitizeText(updateData.country as string);
      if (updateData.educationLevel)
        updateData.educationLevel = sanitizeText(
          (updateData.educationLevel as string).toUpperCase()
        );

      // Update student profile
      const profile = await prisma.studentProfile.update({
        where: { userId: req.user!.id },
        data: updateData,
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

// Claim Telegram channel credits (one-time +5, requires Telegram linked + member of @creo_life)
router.post(
  '/claim-telegram-credits',
  authenticate,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { telegramCredited: true, telegramChatId: true },
      });

      if (user?.telegramCredited) {
        return res.status(400).json({ error: 'Telegram channel credits already claimed' });
      }

      // Must have Telegram account linked
      if (!user?.telegramChatId) {
        return res.status(400).json({
          error: 'Connect your Telegram account first, then join the channel and try again',
          needsTelegramLink: true,
        });
      }

      // Verify the user is a member of @creo_life
      const isMember = await checkChannelMembership(user.telegramChatId, '@creo_life');
      if (!isMember) {
        return res.status(400).json({
          error: 'You must join @creo_life on Telegram first, then click Verify',
        });
      }

      // Atomically increment credits and mark as claimed
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          creditBalance: { increment: 5 },
          telegramCredited: true,
        },
        select: { creditBalance: true },
      });

      res.json({ creditBalance: updated.creditBalance, message: '+5 credits added!' });
    } catch (error) {
      next(error);
    }
  }
);

// ─── Telegram Integration ───────────────────────────────────────────────────

// GET /telegram/status — returns connection state + pending code if any
router.get('/telegram/status', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        telegramChatId: true,
        telegramUsername: true,
        telegramLinkCode: true,
        telegramLinkCodeExpiry: true,
      },
    });
    const pendingCode =
      user?.telegramLinkCode &&
      user.telegramLinkCodeExpiry &&
      user.telegramLinkCodeExpiry > new Date()
        ? { code: user.telegramLinkCode, expiresAt: user.telegramLinkCodeExpiry }
        : null;
    res.json({
      connected: !!user?.telegramChatId,
      username: user?.telegramUsername ?? null,
      pendingCode,
    });
  } catch (error) {
    next(error);
  }
});

// POST /telegram/generate-code — create a 6-digit pairing code (10 min TTL)
router.post(
  '/telegram/generate-code',
  authenticate,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const code = Math.floor(100_000 + Math.random() * 900_000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { telegramLinkCode: code, telegramLinkCodeExpiry: expiresAt },
      });
      res.json({ code, expiresAt });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /telegram/disconnect — unlink Telegram account
router.delete(
  '/telegram/disconnect',
  authenticate,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { telegramChatId: null, telegramUsername: null },
      });
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
