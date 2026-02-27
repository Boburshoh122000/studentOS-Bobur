import prisma from '../config/database.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { Response, NextFunction } from 'express';

/**
 * Middleware factory: checks the user's credit balance for the given tool slug,
 * deducts credits atomically, and records usage. Returns 402 if insufficient.
 *
 * Usage:
 *   router.post('/analyze-cv', requireCredits('ats-checker'), handler);
 */
export function requireCredits(toolSlug: string) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.id;

            // Look up tool by slug
            const tool = await prisma.tool.findUnique({ where: { slug: toolSlug } });

            if (!tool) {
                // Tool not yet registered in DB — let the request through (free)
                return next();
            }

            if (!tool.isActive) {
                res.status(400).json({ error: 'This tool is currently disabled.' });
                return;
            }

            // Free tools — no deduction needed
            if (tool.creditCost === 0) {
                return next();
            }

            // Fetch user's current balance
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { creditBalance: true },
            });

            if (!user) {
                res.status(401).json({ error: 'User not found' });
                return;
            }

            // Insufficient credits → 402
            if (user.creditBalance < tool.creditCost) {
                res.status(402).json({
                    error: 'Insufficient credits to perform this action.',
                    code: 'INSUFFICIENT_CREDITS',
                    data: {
                        required: tool.creditCost,
                        available: user.creditBalance,
                        shortfall: tool.creditCost - user.creditBalance,
                        toolName: tool.name,
                    },
                });
                return;
            }

            // Atomic deduction + usage record
            const [updatedUser] = await prisma.$transaction([
                prisma.user.update({
                    where: { id: userId },
                    data: { creditBalance: { decrement: tool.creditCost } },
                    select: { creditBalance: true },
                }),
                prisma.toolUsage.create({
                    data: { userId, toolId: tool.id, credits: tool.creditCost },
                }),
            ]);

            // Attach deducted info to request for downstream use
            (req as any).creditDeducted = tool.creditCost;
            (req as any).remainingBalance = updatedUser.creditBalance;

            next();
        } catch (error) {
            next(error);
        }
    };
}
