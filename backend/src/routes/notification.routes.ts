
import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

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
        where: { userId: req.user!.id, isRead: false }
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
            data: { isRead: true }
        });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// Create notification (internal usage or testing)
router.post('/', validate(createNotificationSchema), async (req: AuthenticatedRequest, res, next) => {
    try {
        const { title, message, type, link } = req.body;
        const notification = await prisma.notification.create({
            data: {
                userId: req.user!.id,
                title,
                message,
                type: type || 'INFO',
                link
            }
        });
        res.json(notification);
    } catch (error) {
        next(error);
    }
});

export default router;
