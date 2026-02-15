import { Router } from 'express';
import prisma from '../config/database.js';

const router = Router();

// GET /api/team — Public: list all team members
router.get('/', async (_req, res, next) => {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.json(members);
  } catch (error) {
    next(error);
  }
});

export default router;
