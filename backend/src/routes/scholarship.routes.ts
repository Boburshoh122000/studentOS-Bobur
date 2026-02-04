import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { mediumCache } from '../middleware/cache.middleware.js';

const router = Router();

// Query schema
const querySchema = z.object({
  query: z.object({
    country: z.string().optional(),
    studyLevel: z.string().optional(),
    minAmount: z.string().optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

// Get all scholarships (cached for 5 minutes)
router.get('/', optionalAuth, mediumCache, validate(querySchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { country, studyLevel, minAmount, search, page = '1', limit = '10' } = req.query as any;

    const where: any = {
      isActive: true,
    };

    if (country) where.country = country;
    if (studyLevel) where.studyLevel = studyLevel;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { institution: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [scholarships, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        orderBy: { deadline: 'asc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.scholarship.count({ where }),
    ]);

    // Get saved scholarships for authenticated user
    let savedIds: string[] = [];
    if (req.user) {
      const saved = await prisma.savedScholarship.findMany({
        where: { userId: req.user.id },
        select: { scholarshipId: true },
      });
      savedIds = saved.map((s) => s.scholarshipId);
    }

    res.json({
      scholarships: scholarships.map((s) => ({
        ...s,
        isSaved: savedIds.includes(s.id),
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

// Get single scholarship
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: req.params.id as string },
    });

    if (!scholarship) {
      res.status(404).json({ error: 'Scholarship not found' });
      return;
    }

    let isSaved = false;
    if (req.user) {
      const saved = await prisma.savedScholarship.findUnique({
        where: {
          userId_scholarshipId: {
            userId: req.user.id,
            scholarshipId: scholarship.id,
          },
        },
      });
      isSaved = !!saved;
    }

    res.json({ ...scholarship, isSaved });
  } catch (error) {
    next(error);
  }
});

// Save scholarship
router.post('/:id/save', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const saved = await prisma.savedScholarship.create({
      data: {
        userId: req.user!.id,
        scholarshipId: req.params.id as string,
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

// Unsave scholarship
router.delete('/:id/save', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.savedScholarship.delete({
      where: {
        userId_scholarshipId: {
          userId: req.user!.id,
          scholarshipId: req.params.id as string,
        },
      },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get user's saved scholarships
router.get('/saved/list', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const saved = await prisma.savedScholarship.findMany({
      where: { userId: req.user!.id },
      include: { scholarship: true },
      orderBy: { savedAt: 'desc' },
    });
    res.json(saved.map((s) => ({ ...s.scholarship, isSaved: true, savedAt: s.savedAt })));
  } catch (error) {
    next(error);
  }
});

// Admin: Create scholarship
router.post('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const scholarship = await prisma.scholarship.create({
      data: req.body,
    });
    res.status(201).json(scholarship);
  } catch (error) {
    next(error);
  }
});

// Admin: Update scholarship
router.patch('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const scholarship = await prisma.scholarship.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json(scholarship);
  } catch (error) {
    next(error);
  }
});

// Admin: Delete scholarship
router.delete('/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.scholarship.delete({
      where: { id: req.params.id as string },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
