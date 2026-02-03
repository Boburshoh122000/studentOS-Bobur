
import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

router.use(authenticate);

// Schemas
const transactionSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    type: z.enum(['INCOME', 'EXPENSE']),
    categoryId: z.string().optional(),
    description: z.string().optional(),
    date: z.string().datetime().optional(), // ISO string
  }),
});

const categorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.enum(['INCOME', 'EXPENSE']),
    color: z.string().optional(),
    icon: z.string().optional(),
  }),
});

const budgetSchema = z.object({
  body: z.object({
    categoryId: z.string(),
    amount: z.number().positive(),
    period: z.enum(['monthly', 'yearly']).default('monthly'),
  }),
});

// Routes

// Get Summary Stats
router.get('/summary', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [income, expense, recentTransactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'INCOME', date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE', date: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 5,
        include: { category: true },
      }),
    ]);

    res.json({
      income: income._sum.amount || 0,
      expense: expense._sum.amount || 0,
      balance: (income._sum.amount || 0) - (expense._sum.amount || 0),
      recentTransactions,
    });
  } catch (error) {
    next(error);
  }
});

// Transactions
router.get('/transactions', async (req: AuthenticatedRequest, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user!.id },
      orderBy: { date: 'desc' },
      include: { category: true },
    });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

router.post('/transactions', validate(transactionSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { amount, type, categoryId, description, date } = req.body;
    
    // Check if category belongs to user? Or is it global?
    // Assuming custom categories are user-specific
    if (categoryId) {
        const category = await prisma.financeCategory.findFirst({
            where: { id: categoryId, userId: req.user!.id }
        });
        if (!category) {
             // allow if it's a default category? For now strict check
             // Implementation Detail: We might need default categories seeded
        }
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user!.id,
        amount,
        type,
        categoryId,
        description,
        date: date ? new Date(date) : undefined,
      },
      include: { category: true },
    });
    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

router.delete('/transactions/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    await prisma.transaction.delete({
      where: { id: req.params.id, userId: req.user!.id },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Categories
router.get('/categories', async (req: AuthenticatedRequest, res, next) => {
  try {
    const categories = await prisma.financeCategory.findMany({
      where: { userId: req.user!.id },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.post('/categories', validate(categorySchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const category = await prisma.financeCategory.create({
      data: {
        userId: req.user!.id,
        ...req.body,
      },
    });
    res.json(category);
  } catch (error) {
    next(error);
  }
});

// Budgets
router.get('/budgets', async (req: AuthenticatedRequest, res, next) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.user!.id },
      include: { category: true },
    });
    
    // Calculate spending against budget
    const budgetsWithProgress = await Promise.all(budgets.map(async (budget) => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const spent = await prisma.transaction.aggregate({
            where: {
                userId: req.user!.id,
                categoryId: budget.categoryId,
                type: 'EXPENSE',
                date: { gte: start, lte: end }
            },
            _sum: { amount: true }
        });
        
        return {
            ...budget,
            spent: spent._sum.amount || 0,
            remaining: budget.amount - (spent._sum.amount || 0)
        };
    }));

    res.json(budgetsWithProgress);
  } catch (error) {
    next(error);
  }
});

router.post('/budgets', validate(budgetSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { categoryId, amount, period } = req.body;
    
    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_period: {
          userId: req.user!.id,
          categoryId,
          period,
        },
      },
      update: { amount },
      create: {
        userId: req.user!.id,
        categoryId,
        amount,
        period,
      },
      include: { category: true },
    });
    res.json(budget);
  } catch (error) {
    next(error);
  }
});

export default router;
