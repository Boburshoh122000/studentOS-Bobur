import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { sanitizeText } from '../utils/sanitize.js';

const router = Router();

const habitSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    icon: z.string().optional(),
    color: z.string().optional(),
    frequency: z.enum(['daily', 'weekly']).optional(),
  }),
});

// Get all habits
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.user!.id, isActive: true },
      include: {
        logs: {
          where: {
            completedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          orderBy: { completedAt: 'desc' },
          take: 60, // Max 60 logs (about 2 per day for 30 days)
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 50, // Max 50 habits per user
    });

    res.json(
      habits.map((h) => ({
        ...h,
        completedToday: h.logs.some(
          (l) => new Date(l.completedAt).toDateString() === new Date().toDateString()
        ),
        streak: calculateStreak(h.logs),
      }))
    );
  } catch (error) {
    next(error);
  }
});

// Create habit
router.post(
  '/',
  authenticate,
  validate(habitSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const habit = await prisma.habit.create({
        data: {
          ...req.body,
          title: sanitizeText(req.body.title ?? ''),
          userId: req.user!.id,
        },
      });
      res.status(201).json(habit);
    } catch (error) {
      next(error);
    }
  }
);

// Update habit
router.patch('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const habit = await prisma.habit.update({
      where: { id: req.params.id as string, userId: req.user!.id },
      data: req.body,
    });
    res.json(habit);
  } catch (error) {
    next(error);
  }
});

// Delete habit
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.habit.update({
      where: { id: req.params.id as string, userId: req.user!.id },
      data: { isActive: false },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Log habit completion
router.post('/:id/log', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    // Check if already logged today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId: req.params.id as string,
        userId: req.user!.id,
        completedAt: { gte: today },
      },
    });

    if (existingLog) {
      res.status(409).json({ error: 'Already logged today' });
      return;
    }

    const log = await prisma.habitLog.create({
      data: {
        habitId: req.params.id as string,
        userId: req.user!.id,
        notes: req.body.notes,
      },
    });

    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
});

// Remove today's log
router.delete('/:id/log', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.habitLog.deleteMany({
      where: {
        habitId: req.params.id as string,
        userId: req.user!.id,
        completedAt: { gte: today },
      },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get habit stats
router.get('/stats', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.user!.id, isActive: true },
      include: {
        logs: {
          orderBy: { completedAt: 'desc' },
        },
      },
    });

    const today = new Date().toDateString();
    const completedToday = habits.filter((h) =>
      h.logs.some((l) => new Date(l.completedAt).toDateString() === today)
    ).length;

    const longestStreak = Math.max(...habits.map((h) => calculateStreak(h.logs)), 0);

    res.json({
      totalHabits: habits.length,
      completedToday,
      longestStreak,
      completionRate: habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0,
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to calculate streak
function calculateStreak(logs: { completedAt: Date }[]): number {
  if (logs.length === 0) return 0;

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const log of sortedLogs) {
    const logDate = new Date(log.completedAt);
    logDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0 || diffDays === 1) {
      streak++;
      currentDate = logDate;
    } else {
      break;
    }
  }

  return streak;
}

export default router;
