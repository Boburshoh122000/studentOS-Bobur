import { Router } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { UNIVERSITIES } from '../data/universities.js';

const router = Router();

/* ─── Public: search universities ────────────────────────────────────────── */

router.get('/', async (req, res, next) => {
  try {
    const search = (req.query.search as string | undefined)?.trim() ?? '';
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 50);

    const where =
      search.length >= 2
        ? {
            OR: [
              { nameUz: { contains: search, mode: 'insensitive' as const } },
              { nameEn: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {};

    const universities = await prisma.university.findMany({
      where,
      orderBy: { nameUz: 'asc' },
      take: limit,
      select: { id: true, nameUz: true, nameEn: true, region: true, type: true },
    });

    res.json({ universities });
  } catch (error) {
    next(error);
  }
});

/* ─── Admin: re-sync university list from static data ────────────────────── */

router.post('/sync', authenticate, requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    let created = 0;
    let skipped = 0;

    for (const u of UNIVERSITIES) {
      const exists = await prisma.university.findFirst({
        where: { nameUz: u.nameUz },
      });

      if (exists) {
        skipped++;
        continue;
      }

      await prisma.university.create({
        data: {
          nameUz: u.nameUz,
          nameEn: u.nameEn ?? null,
          region: u.region ?? null,
          type: u.type ?? null,
        },
      });
      created++;
    }

    const total = await prisma.university.count();
    res.json({ message: 'Sync complete', created, skipped, total });
  } catch (error) {
    next(error);
  }
});

export default router;
