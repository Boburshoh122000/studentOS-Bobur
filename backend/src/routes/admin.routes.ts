import { Router, Request } from 'express';
import { z } from 'zod';
import multer from 'multer';
import prisma from '../config/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { hashPassword } from '../services/auth.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, R2_BUCKET, R2_PUBLIC_URL } from '../config/r2.js';

const router = Router();

// Helper function to log admin actions
const logAdminAction = async (
  req: AuthenticatedRequest,
  action: string,
  targetType: string,
  targetId: string | null,
  details?: Record<string, any>
) => {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action,
        targetType,
        targetId,
        details: details ? JSON.stringify(details) : null,
        ipAddress: req.ip || req.socket.remoteAddress || null,
        userAgent: req.get('User-Agent') || null,
      },
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

// Validation schemas
const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['STUDENT', 'EMPLOYER', 'EDUCATOR', 'ADMIN']),
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

// Enhanced analytics for charts
router.get('/analytics', async (req: AuthenticatedRequest, res, next) => {
  try {
    // Get daily user signups for the last 7 days
    const userGrowth: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      userGrowth.push({
        date: dayStart.toISOString().split('T')[0],
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayStart.getDay()],
        count,
      });
    }

    // User distribution by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    // Get totals for trend comparison
    const totalApplications = await prisma.jobApplication.count();
    const totalScholarshipSaves = await prisma.savedScholarship.count();
    const totalHabitsLogged = await prisma.habitLog.count();
    const totalCommunityPosts = await prisma.communityPost.count();

    // Get top 5 scholarships (most recently added)
    const recentScholarships = await prisma.scholarship.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        institution: true,
        country: true,
      },
    });

    // Get top 5 jobs (most recently added)
    const recentJobs = await prisma.job.findMany({
      take: 5,
      orderBy: { id: 'desc' },
      select: {
        id: true,
        title: true,
        department: true,
        locationType: true,
      },
    });

    res.json({
      userGrowth,
      usersByRole: usersByRole.map((r) => ({
        role: r.role,
        count: r._count,
      })),
      engagement: {
        applications: totalApplications,
        scholarshipSaves: totalScholarshipSaves,
        habitsLogged: totalHabitsLogged,
        communityPosts: totalCommunityPosts,
      },
      recentScholarships,
      recentJobs,
    });
  } catch (error) {
    next(error);
  }
});

// ─── Demographics: universities ────────────────────────────────────────────
router.get('/demographics/universities', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { role, from, to } = req.query as Record<string, string | undefined>;

    const userWhere: any = {};
    if (role) userWhere.role = role;
    if (from || to) {
      userWhere.createdAt = {};
      if (from) userWhere.createdAt.gte = new Date(from);
      if (to) userWhere.createdAt.lte = new Date(to);
    }

    // Users with a known universityId (linked to University table)
    const byId = await prisma.studentProfile.groupBy({
      by: ['universityId'],
      where: {
        universityId: { not: null },
        user: userWhere,
      },
      _count: true,
    });

    // Resolve university names
    const uniIds = byId.map((r) => r.universityId!);
    const unis = await prisma.university.findMany({
      where: { id: { in: uniIds } },
      select: { id: true, nameUz: true, nameEn: true, region: true },
    });
    const uniMap = new Map(unis.map((u) => [u.id, u]));

    // Users with a plain-text university (no universityId)
    const byText = await prisma.$queryRaw<{ university: string; count: bigint }[]>`
      SELECT sp."university", COUNT(*) AS count
      FROM "StudentProfile" sp
      JOIN "User" u ON u.id = sp."userId"
      WHERE sp."universityId" IS NULL
        AND sp."university" IS NOT NULL
        AND sp."university" != ''
      GROUP BY sp."university"
      ORDER BY count DESC
      LIMIT 30
    `;

    const totalUsers = await prisma.user.count({ where: userWhere });

    const named = byId
      .map((r) => {
        const u = uniMap.get(r.universityId!);
        return {
          universityId: r.universityId,
          name: u?.nameEn || u?.nameUz || 'Unknown',
          nameUz: u?.nameUz,
          region: u?.region,
          count: r._count,
          isVerified: true,
        };
      })
      .sort((a, b) => b.count - a.count);

    const custom = byText.map((r) => ({
      universityId: null,
      name: r.university,
      nameUz: null,
      region: null,
      count: Number(r.count),
      isVerified: false,
    }));

    const all = [...named, ...custom].sort((a, b) => b.count - a.count);
    const totalRepresented = named.length + custom.length;

    res.json({ universities: all, totalRepresented, totalUsers });
  } catch (error) {
    next(error);
  }
});

// ─── Demographics: fields of study ─────────────────────────────────────────
router.get('/demographics/fields', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { role, from, to } = req.query as Record<string, string | undefined>;

    const userWhere: any = { role: { in: ['STUDENT', 'EDUCATOR'] } };
    if (role) userWhere.role = role;
    if (from || to) {
      userWhere.createdAt = {};
      if (from) userWhere.createdAt.gte = new Date(from);
      if (to) userWhere.createdAt.lte = new Date(to);
    }

    const byField = await prisma.$queryRaw<{ major: string; count: bigint }[]>`
      SELECT LOWER(TRIM(sp."major")) AS major, COUNT(*) AS count
      FROM "StudentProfile" sp
      JOIN "User" u ON u.id = sp."userId"
      WHERE sp."major" IS NOT NULL
        AND sp."major" != ''
        AND u."role" IN ('STUDENT', 'EDUCATOR')
      GROUP BY LOWER(TRIM(sp."major"))
      ORDER BY count DESC
      LIMIT 30
    `;

    const total = byField.reduce((s, r) => s + Number(r.count), 0);

    const fields = byField.map((r) => ({
      name: r.major.charAt(0).toUpperCase() + r.major.slice(1),
      count: Number(r.count),
      percentage: total > 0 ? Math.round((Number(r.count) / total) * 100) : 0,
    }));

    res.json({ fields, total });
  } catch (error) {
    next(error);
  }
});

// ─── Demographics: summary ──────────────────────────────────────────────────
router.get('/demographics/summary', async (req: AuthenticatedRequest, res, next) => {
  try {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const [totalUsers, totalUniversitiesInDb, newUsersThisMonth] = await Promise.all([
      prisma.user.count(),
      prisma.university.count(),
      prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
    ]);

    // Top university
    const topUniRaw = await prisma.studentProfile.groupBy({
      by: ['universityId'],
      where: { universityId: { not: null } },
      _count: true,
      orderBy: { _count: { universityId: 'desc' } },
      take: 1,
    });

    let topUniversity: { name: string; count: number } | null = null;
    if (topUniRaw[0]) {
      const u = await prisma.university.findUnique({
        where: { id: topUniRaw[0].universityId! },
        select: { nameEn: true, nameUz: true },
      });
      topUniversity = {
        name: u?.nameEn || u?.nameUz || 'Unknown',
        count: topUniRaw[0]._count,
      };
    }

    // Top field
    const topFieldRaw = await prisma.$queryRaw<{ major: string; count: bigint }[]>`
      SELECT LOWER(TRIM(sp."major")) AS major, COUNT(*) AS count
      FROM "StudentProfile" sp
      JOIN "User" u ON u.id = sp."userId"
      WHERE sp."major" IS NOT NULL AND sp."major" != ''
      GROUP BY LOWER(TRIM(sp."major"))
      ORDER BY count DESC
      LIMIT 1
    `;
    const topField = topFieldRaw[0]
      ? {
          name: topFieldRaw[0].major.charAt(0).toUpperCase() + topFieldRaw[0].major.slice(1),
          count: Number(topFieldRaw[0].count),
        }
      : null;

    // Count distinct universities represented (text + id)
    const textCount = await prisma.studentProfile.count({
      where: { universityId: null, university: { not: null } },
    });
    const idCountRaw = await prisma.studentProfile.groupBy({
      by: ['universityId'],
      where: { universityId: { not: null } },
    });
    const totalRepresented = idCountRaw.length + textCount;

    res.json({
      totalUsers,
      totalUniversitiesInDb,
      totalRepresented,
      newUsersThisMonth,
      topUniversity,
      topField,
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

    // Audit log
    await logAdminAction(req, 'CREATE_USER', 'USER', user.id, { email, role });

    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    next(error);
  }
});

// Update user - with self-escalation prevention
router.patch('/users/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { isActive, role } = req.body;
    const targetUserId = req.params.id as string;

    // Prevent admins from modifying their own role or deactivating themselves
    if (targetUserId === req.user!.id) {
      if (role !== undefined) {
        throw new AppError(403, 'You cannot modify your own role');
      }
      if (isActive === false) {
        throw new AppError(403, 'You cannot deactivate your own account');
      }
    }

    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: { isActive, role },
    });

    // Audit log
    await logAdminAction(req, 'UPDATE_USER', 'USER', targetUserId, { isActive, role });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Delete user - prevent self-deletion
router.delete('/users/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const targetUserId = req.params.id as string;

    // Prevent admins from deleting themselves
    if (targetUserId === req.user!.id) {
      throw new AppError(403, 'You cannot delete your own account');
    }

    // Get user info for audit before deletion
    const userToDelete = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { email: true, role: true },
    });

    await prisma.user.delete({ where: { id: targetUserId } });

    // Audit log
    await logAdminAction(req, 'DELETE_USER', 'USER', targetUserId, userToDelete ?? undefined);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Employer management - Stats
router.get('/employers/stats', async (req: AuthenticatedRequest, res, next) => {
  try {
    const [totalEmployers, pendingApprovals, activeVacancies, featuredPartners] = await Promise.all(
      [
        prisma.employerProfile.count(),
        prisma.employerProfile.count({ where: { verificationStatus: 'pending' } }),
        prisma.job.count({ where: { status: 'ACTIVE' } }),
        prisma.employerProfile.count({ where: { isFeatured: true } }),
      ]
    );

    res.json({ totalEmployers, pendingApprovals, activeVacancies, featuredPartners });
  } catch (error) {
    next(error);
  }
});

// Employer management - List with search and filters
router.get('/employers', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { search, status, industry, page = '1', limit = '20' } = req.query as any;

    const where: any = {};
    if (status) where.verificationStatus = status;
    if (industry) where.industry = industry;
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [employers, total] = await Promise.all([
      prisma.employerProfile.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              isActive: true,
              createdAt: true,
              studentProfile: { select: { fullName: true } },
            },
          },
          _count: { select: { jobs: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.employerProfile.count({ where }),
    ]);

    // Get unique industries for filter dropdown
    const industries = await prisma.employerProfile.findMany({
      where: { industry: { not: null } },
      select: { industry: true },
      distinct: ['industry'],
    });

    res.json({
      employers,
      industries: industries.map((i) => i.industry).filter(Boolean),
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

// Employer management - Create
router.post('/employers', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { email, companyName, industry, website, repName } = req.body;

    // Create user with EMPLOYER role
    const passwordHash = await hashPassword('TempPass123!');
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'EMPLOYER',
        employerProfile: {
          create: {
            companyName,
            industry: industry || null,
            website: website || null,
            verificationStatus: 'pending',
          },
        },
        studentProfile: {
          create: {
            fullName: repName || null,
          },
        },
      },
      include: {
        employerProfile: true,
      },
    });

    await logAdminAction(req, 'CREATE_EMPLOYER', 'EMPLOYER', user.employerProfile!.id, {
      email,
      companyName,
    });

    res.status(201).json(user.employerProfile);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }
    next(error);
  }
});

// Employer management - Update
router.patch('/employers/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { companyName, industry, website, verificationStatus, isFeatured } = req.body;

    const employer = await prisma.employerProfile.update({
      where: { id: req.params.id as string },
      data: {
        ...(companyName !== undefined && { companyName }),
        ...(industry !== undefined && { industry }),
        ...(website !== undefined && { website }),
        ...(verificationStatus !== undefined && { verificationStatus }),
        ...(isFeatured !== undefined && { isFeatured }),
      },
      include: {
        user: { select: { email: true, isActive: true, createdAt: true } },
        _count: { select: { jobs: true } },
      },
    });

    await logAdminAction(req, 'UPDATE_EMPLOYER', 'EMPLOYER', employer.id, req.body);

    res.json(employer);
  } catch (error) {
    next(error);
  }
});

// Employer management - Delete
router.delete('/employers/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const employer = await prisma.employerProfile.findUnique({
      where: { id: req.params.id as string },
      select: { userId: true },
    });

    if (!employer) {
      res.status(404).json({ error: 'Employer not found' });
      return;
    }

    // Delete the user (cascades to employer profile)
    await prisma.user.delete({ where: { id: employer.userId } });

    await logAdminAction(req, 'DELETE_EMPLOYER', 'EMPLOYER', req.params.id as string);

    res.status(204).send();
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

// Contact messages - with pagination
router.get('/messages', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page = '1', limit = '50' } = req.query as any;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 per page

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.contactMessage.count(),
    ]);

    res.json({
      messages,
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

// Audit logs - view admin actions for accountability
router.get('/audit-logs', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { page = '1', limit = '50', action, adminId } = req.query as any;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const where: any = {};
    if (action) where.action = action;
    if (adminId) where.adminId = adminId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      logs,
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
});

// ── Manual Credit Granting ──
router.post('/grant-credits', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { email, amount, reason } = req.body;

    if (!email || !amount) {
      return res.status(400).json({ error: 'Email and amount are required' });
    }

    const credits = parseInt(amount);
    if (isNaN(credits) || credits <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive integer' });
    }

    // Find user by email
    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
      return res.status(404).json({ error: `User with email "${email}" not found` });
    }

    // Atomically increment credits
    const updated = await prisma.user.update({
      where: { id: targetUser.id },
      data: { creditBalance: { increment: credits } },
      select: { creditBalance: true, email: true },
    });

    // Log the action
    await logAdminAction(req, 'GRANT_CREDITS', 'User', targetUser.id, {
      email,
      amount: credits,
      reason: reason || 'Manual credit grant',
      newBalance: updated.creditBalance,
    });

    res.json({
      success: true,
      email: updated.email,
      creditsGranted: credits,
      newBalance: updated.creditBalance,
      message: `Granted ${credits} credits to ${email}`,
    });
  } catch (error) {
    next(error);
  }
});

// =============================================================================
// TEAM MEMBERS
// =============================================================================

// Configure multer for avatar uploads (memory storage, images only, 5MB limit)
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// POST /api/admin/team/upload-avatar — Upload avatar image to Cloudflare R2
router.post(
  '/team/upload-avatar',
  avatarUpload.single('avatar'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const r2 = getR2Client();
      if (!r2) {
        return res.status(503).json({
          error:
            'Storage service not configured. Check R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY.',
        });
      }

      const fileExt = req.file.originalname.split('.').pop() || 'jpg';
      const fileName = `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      await r2.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: fileName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );

      res.json({ url: `${R2_PUBLIC_URL}/${fileName}` });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/admin/team — List all team members
router.get('/team', async (req: AuthenticatedRequest, res, next) => {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.json(members);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/team — Create a team member
router.post('/team', async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      fullName,
      role,
      avatarUrl,
      socialLinkedin,
      socialTwitter,
      socialWebsite,
      socialInstagram,
      socialTelegram,
      socialGithub,
      displayOrder,
    } = req.body;

    if (!fullName || !role) {
      return res.status(400).json({ error: 'fullName and role are required' });
    }

    const member = await prisma.teamMember.create({
      data: {
        fullName,
        role,
        avatarUrl: avatarUrl || null,
        socialLinkedin: socialLinkedin || null,
        socialTwitter: socialTwitter || null,
        socialWebsite: socialWebsite || null,
        socialInstagram: socialInstagram || null,
        socialTelegram: socialTelegram || null,
        socialGithub: socialGithub || null,
        displayOrder: displayOrder ?? 0,
      },
    });

    await logAdminAction(req, 'CREATE_TEAM_MEMBER', 'TeamMember', member.id, { fullName, role });

    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/team/:id — Update a team member
router.patch('/team/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      role,
      avatarUrl,
      socialLinkedin,
      socialTwitter,
      socialWebsite,
      socialInstagram,
      socialTelegram,
      socialGithub,
      displayOrder,
    } = req.body;

    const member = await prisma.teamMember.update({
      where: { id: id as string },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(role !== undefined && { role }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl || null }),
        ...(socialLinkedin !== undefined && { socialLinkedin: socialLinkedin || null }),
        ...(socialTwitter !== undefined && { socialTwitter: socialTwitter || null }),
        ...(socialWebsite !== undefined && { socialWebsite: socialWebsite || null }),
        ...(socialInstagram !== undefined && { socialInstagram: socialInstagram || null }),
        ...(socialTelegram !== undefined && { socialTelegram: socialTelegram || null }),
        ...(socialGithub !== undefined && { socialGithub: socialGithub || null }),
        ...(displayOrder !== undefined && { displayOrder }),
      },
    });

    await logAdminAction(req, 'UPDATE_TEAM_MEMBER', 'TeamMember', member.id, { fullName, role });

    res.json(member);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/team/:id — Delete a team member
router.delete('/team/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    await prisma.teamMember.delete({ where: { id: id as string } });

    await logAdminAction(req, 'DELETE_TEAM_MEMBER', 'TeamMember', id as string);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
