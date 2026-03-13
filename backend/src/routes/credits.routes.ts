import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// =============================================================================
// GET /credits/balance - Get current user's credit balance
// =============================================================================
router.get('/balance', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true, referralCode: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Lazy-generate referral code if missing
    if (!user.referralCode) {
      let code: string | null = null;
      for (let i = 0; i < 5 && !code; i++) {
        const candidate = Math.random().toString(36).substring(2, 10).toUpperCase();
        const exists = await prisma.user.findUnique({ where: { referralCode: candidate } });
        if (!exists) code = candidate;
      }
      if (code) {
        user = await prisma.user.update({
          where: { id: userId },
          data: { referralCode: code },
          select: { creditBalance: true, referralCode: true },
        });
      }
    }

    res.json({
      success: true,
      data: {
        balance: user.creditBalance,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch balance' });
  }
});

// =============================================================================
// POST /credits/use - Deduct credits for tool usage (atomic transaction)
// =============================================================================
router.post('/use', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { toolSlug } = req.body;
    if (!toolSlug) {
      return res.status(400).json({ success: false, error: 'toolSlug is required' });
    }

    // Fetch the tool
    const tool = await prisma.tool.findUnique({
      where: { slug: toolSlug },
    });

    if (!tool) {
      return res.status(404).json({ success: false, error: 'Tool not found' });
    }

    if (!tool.isActive) {
      return res.status(400).json({ success: false, error: 'Tool is currently disabled' });
    }

    // Free tools - no credit deduction needed
    if (tool.creditCost === 0) {
      return res.json({
        success: true,
        data: {
          toolName: tool.name,
          creditCost: 0,
          remainingBalance: null, // No balance check for free tools
          message: 'Free tool - no credits required',
        },
      });
    }

    // Fetch user's current balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if user has enough credits
    if (user.creditBalance < tool.creditCost) {
      return res.status(402).json({
        success: false,
        error: 'INSUFFICIENT_CREDITS',
        data: {
          required: tool.creditCost,
          available: user.creditBalance,
          shortfall: tool.creditCost - user.creditBalance,
          toolName: tool.name,
        },
      });
    }

    // Atomic transaction: deduct balance + create usage record
    const [updatedUser, usageRecord] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { creditBalance: { decrement: tool.creditCost } },
        select: { creditBalance: true },
      }),
      prisma.toolUsage.create({
        data: {
          userId,
          toolId: tool.id,
          credits: tool.creditCost,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        toolName: tool.name,
        creditCost: tool.creditCost,
        remainingBalance: updatedUser.creditBalance,
        usageId: usageRecord.id,
        message: `Successfully used ${tool.creditCost} credits for ${tool.name}`,
      },
    });
  } catch (error) {
    console.error('Error using credits:', error);
    res.status(500).json({ success: false, error: 'Failed to process credit transaction' });
  }
});

// =============================================================================
// GET /credits/history - Get user's credit usage history
// =============================================================================
router.get('/history', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      prisma.toolUsage.findMany({
        where: { userId },
        include: {
          tool: {
            select: { name: true, slug: true, icon: true, category: true },
          },
        },
        orderBy: { usedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.toolUsage.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: {
        history: history.map((h) => ({
          id: h.id,
          tool: h.tool,
          credits: h.credits,
          usedAt: h.usedAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching credit history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
});

// =============================================================================
// GET /credits/tool/:slug - Get tool credit cost (for preview)
// =============================================================================
router.get('/tool/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;

    const tool = await prisma.tool.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        creditCost: true,
        isActive: true,
        icon: true,
        category: true,
      },
    });

    if (!tool) {
      return res.status(404).json({ success: false, error: 'Tool not found' });
    }

    res.json({ success: true, data: tool });
  } catch (error) {
    console.error('Error fetching tool:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tool' });
  }
});

export default router;
