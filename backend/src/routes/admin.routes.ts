import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { hashPassword } from '../services/auth.service.js';

const router = Router();

// Validation schemas
const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['STUDENT', 'EMPLOYER', 'ADMIN']),
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
  }),
});

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// Dashboard stats
router.get('/stats', async (req: AuthenticatedRequest, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalScholarships,
      totalJobs,
      totalApplications,
      recentTransactions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
      prisma.scholarship.count({ where: { isActive: true } }),
      prisma.job.count({ where: { status: 'ACTIVE' } }),
      prisma.jobApplication.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    // User growth over last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = await prisma.user.count({
      where: { createdAt: { gte: weekAgo } },
    });

    res.json({
      totalUsers,
      activeUsers,
      totalScholarships,
      totalJobs,
      totalApplications,
      recentTransactions,
      newUsersThisWeek,
    });
  } catch (error) {
    next(error);
  }
});

// User management
router.get('/users', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { role, search, page = '1', limit = '20' } = req.query as any;

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { studentProfile: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          studentProfile: { select: { fullName: true, avatarUrl: true } },
          employerProfile: { select: { companyName: true, logoUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
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

// Create user with validation
router.post('/users', validate(createUserSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { email, password, role, fullName } = req.body;

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        studentProfile: role === 'STUDENT' ? { create: { fullName } } : undefined,
        employerProfile: role === 'EMPLOYER' ? { create: { companyName: fullName } } : undefined,
      },
    });

    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    next(error);
  }
});

// Update user
router.patch('/users/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { isActive, role } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { isActive, role },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete('/users/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Employer management
router.get('/employers', async (req: AuthenticatedRequest, res, next) => {
  try {
    const employers = await prisma.employerProfile.findMany({
      include: {
        user: { select: { email: true, isActive: true, createdAt: true } },
        _count: { select: { jobs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(employers);
  } catch (error) {
    next(error);
  }
});

// Pricing plans
router.get('/pricing', async (req: AuthenticatedRequest, res, next) => {
  try {
    const plans = await prisma.pricingPlan.findMany({
      include: { _count: { select: { subscriptions: true } } },
      orderBy: { price: 'asc' },
    });
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

router.post('/pricing', async (req: AuthenticatedRequest, res, next) => {
  try {
    const plan = await prisma.pricingPlan.create({ data: req.body });
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
});

router.patch('/pricing/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const plan = await prisma.pricingPlan.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json(plan);
  } catch (error) {
    next(error);
  }
});

router.delete('/pricing/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.pricingPlan.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Contact messages
router.get('/messages', async (req: AuthenticatedRequest, res, next) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

router.patch('/messages/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const message = await prisma.contactMessage.update({
      where: { id: req.params.id as string },
      data: { isRead: true },
    });
    res.json(message);
  } catch (error) {
    next(error);
  }
});

export default router;
