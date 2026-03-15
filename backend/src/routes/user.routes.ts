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
    const now = new Date();
    const toKey = (d: Date) => d.toISOString().split('T')[0];

    // Get profile + user data
    const [profile, userData] = await Promise.all([
      prisma.studentProfile.findUnique({ where: { userId } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { telegramChatId: true, lastLoginAt: true },
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
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
      },
    });

    // Calculate today's habit completions
    const todayLogs = await prisma.habitLog.count({
      where: {
        userId,
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    // ── NEW: ATS scan history ──
    const atsScans = await prisma.atsScan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { score: true, jobRole: true, createdAt: true },
    });
    const atsHistory = [...atsScans].reverse().map((s) => ({
      score: s.score,
      date: s.createdAt.toISOString(),
      jobTitle: s.jobRole ?? undefined,
    }));
    const previousAtsScore = atsScans.length > 1 ? atsScans[1].score : null;
    const lastCvScanDate = atsScans.length > 0 ? atsScans[0].createdAt.toISOString() : null;

    // ── NEW: Upcoming deadlines (saved scholarships with deadline in next 60 days) ──
    const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const savedWithDeadlines = await prisma.savedScholarship.findMany({
      where: {
        userId,
        scholarship: {
          deadline: { gte: now, lte: in60Days },
          isActive: true,
        },
      },
      include: { scholarship: { select: { title: true, deadline: true } } },
      orderBy: { scholarship: { deadline: 'asc' } },
      take: 5,
    });
    const upcomingDeadlines = savedWithDeadlines.map((s) => ({
      id: s.id,
      type: 'scholarship' as const,
      title: s.scholarship.title,
      deadline: s.scholarship.deadline!.toISOString(),
      screen: 'SCHOLARSHIPS',
    }));

    // ── NEW: Activity heatmap (last 28 days) ──
    const heatmapStart = new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000);
    heatmapStart.setHours(0, 0, 0, 0);

    const [atsActivity, habitActivity, appActivity, savedActivity] = await Promise.all([
      prisma.atsScan.findMany({
        where: { userId, createdAt: { gte: heatmapStart } },
        select: { createdAt: true },
      }),
      prisma.habitLog.findMany({
        where: { userId, completedAt: { gte: heatmapStart } },
        select: { completedAt: true },
      }),
      prisma.jobApplication.findMany({
        where: { userId, appliedAt: { gte: heatmapStart } },
        select: { appliedAt: true },
      }),
      prisma.savedScholarship.findMany({
        where: { userId, savedAt: { gte: heatmapStart } },
        select: { savedAt: true },
      }),
    ]);

    const heatmapMap: Record<string, number> = {};
    [
      ...atsActivity.map((x) => x.createdAt),
      ...habitActivity.map((x) => x.completedAt),
      ...appActivity.map((x) => x.appliedAt),
      ...savedActivity.map((x) => x.savedAt),
    ].forEach((d) => {
      const k = toKey(d);
      heatmapMap[k] = (heatmapMap[k] || 0) + 1;
    });
    const activityHeatmap = Array.from({ length: 28 }, (_, i) => {
      const d = new Date(heatmapStart.getTime() + i * 24 * 60 * 60 * 1000);
      const key = toKey(d);
      return { date: key, count: heatmapMap[key] || 0 };
    });

    // ── NEW: Streak days ──
    const allLogs = await prisma.habitLog.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
    });
    const loggedDays = new Set(allLogs.map((l) => toKey(l.completedAt)));
    let streakDays = 0;
    const checkDate = new Date();
    while (loggedDays.has(toKey(checkDate))) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // ── NEW: Learning plans ──
    const learningPlans = await prisma.learningPlan.findMany({
      where: { userId },
      select: { id: true, topic: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
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
        totalHabits: habits.length,
      },
      telegramConnected: !!userData?.telegramChatId,
      // New fields
      atsHistory,
      previousAtsScore,
      lastCvScanDate,
      upcomingDeadlines,
      activityHeatmap,
      streakDays,
      lastLoginAt: userData?.lastLoginAt?.toISOString() ?? null,
      learningPlans: learningPlans.map((p) => ({
        id: p.id,
        name: p.topic,
        lastProgressAt: null,
      })),
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
      // null = bot is not a channel admin (can't verify) → trust the user
      const isMember = await checkChannelMembership(user.telegramChatId, '@creo_life');
      if (isMember === false) {
        return res.status(400).json({
          error: 'Join @creo_life on Telegram first, then click Verify again',
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
