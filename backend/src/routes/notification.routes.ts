import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { sendTelegramMessage, sendTelegramMessageDirect } from '../services/telegram.service.js';
import { sanitizeText } from '../utils/sanitize.js';

const router = Router();

// Validation schema
const createNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    message: z.string().optional(),
    type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']).default('INFO'),
    link: z.string().url().optional().nullable(),
  }),
});

router.use(authenticate);

// Get my notifications
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50
    });

    // Count unread
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user!.id, isRead: false },
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
});

// Mark as read
router.patch('/:id/read', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id: String(id), userId: req.user!.id },
      data: { isRead: true },
    });
    res.json(notification);
  } catch (error) {
    next(error);
  }
});

// Mark ALL as read
router.patch('/read-all', async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Create notification (internal usage or testing)
router.post(
  '/',
  validate(createNotificationSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { title, message, type, link } = req.body;
      const notification = await prisma.notification.create({
        data: {
          userId: req.user!.id,
          title: sanitizeText(title ?? ''),
          message: message ? sanitizeText(message) : message,
          type: type || 'INFO',
          link,
        },
      });
      res.json(notification);
    } catch (error) {
      next(error);
    }
  }
);

// ── ADMIN: Send notification to specific user or broadcast ──
router.post('/admin/send', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    // Only admins can send
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { email, broadcast, type } = req.body;
    const title = sanitizeText(req.body.title ?? '');
    const message = req.body.message ? sanitizeText(req.body.message) : req.body.message;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const notificationType = type || 'INFO';

    if (broadcast) {
      // Send to ALL users
      const users = await prisma.user.findMany({ select: { id: true } });
      const data = users.map((u) => ({
        userId: u.id,
        title,
        message: message || null,
        type: notificationType,
      }));
      const result = await prisma.notification.createMany({ data });

      // Forward to Telegram (fire-and-forget)
      const telegramUsers = await prisma.user.findMany({
        where: { telegramChatId: { not: null } },
        select: { telegramChatId: true },
      });
      for (const u of telegramUsers) {
        if (u.telegramChatId) {
          sendTelegramMessageDirect(
            u.telegramChatId,
            `📢 <b>${title}</b>\n\n${message || ''}`
          ).catch(() => {});
        }
      }

      return res.json({
        success: true,
        count: result.count,
        message: `Sent to ${result.count} users`,
      });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required for targeted notification' });
    }

    // Find user by email
    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
      return res.status(404).json({ error: `User with email "${email}" not found` });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: targetUser.id,
        title,
        message: message || null,
        type: notificationType,
      },
    });

    // Forward to Telegram (fire-and-forget)
    sendTelegramMessage(targetUser.id, `📢 <b>${title}</b>\n\n${message || ''}`).catch(() => {});

    res.json({ success: true, notification, message: `Notification sent to ${email}` });
  } catch (error) {
    next(error);
  }
});

// ── ADMIN: Notification history ──
router.get('/admin/history', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 30;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        include: {
          user: { select: { email: true, studentProfile: { select: { fullName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count(),
    ]);

    res.json({
      notifications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
