import { Router } from 'express';
import prisma from '../config/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { UNIVERSITIES } from '../data/universities.js';

const router = Router();

/* ─── Public: get all or search universities ─────────────────────────────── */

router.get('/', async (req, res, next) => {
  try {
    const search = (req.query.search as string | undefined)?.trim() ?? '';
    const limit = Math.min(parseInt((req.query.limit as string) || '250', 10), 250);

    const where =
      search.length >= 2
        ? {
            OR: [
              { nameUz: { contains: search, mode: 'insensitive' as const } },
              { nameRu: { contains: search, mode: 'insensitive' as const } },
              { nameEn: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {};

    const universities = await prisma.university.findMany({
      where,
      orderBy: { nameUz: 'asc' },
      take: limit,
      select: { id: true, nameUz: true, nameRu: true, nameEn: true, region: true, type: true },
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
    let updated = 0;

    for (const u of UNIVERSITIES) {
      const exists = await prisma.university.findFirst({
        where: { nameUz: u.nameUz },
      });

      if (exists) {
        // Backfill Russian/English translations if missing
        if (!exists.nameRu || !exists.nameEn) {
          await prisma.university.update({
            where: { id: exists.id },
            data: {
              nameRu: u.nameRu ?? exists.nameRu,
              nameEn: u.nameEn ?? exists.nameEn,
              region: u.region ?? exists.region,
              type: u.type ?? exists.type,
            },
          });
          updated++;
        }
        continue;
      }

      await prisma.university.create({
        data: {
          nameUz: u.nameUz,
          nameRu: u.nameRu ?? null,
          nameEn: u.nameEn ?? null,
          region: u.region ?? null,
          type: u.type ?? null,
        },
      });
      created++;
    }

    const total = await prisma.university.count();
    res.json({ message: 'Sync complete', created, updated, total });
  } catch (error) {
    next(error);
  }
});

export default router;
