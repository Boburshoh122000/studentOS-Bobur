/**
 * Seed script: populate the universities table with trilingual data.
 *
 * Usage:
 *   cd backend
 *   npm run seed:universities
 */
import prisma from '../config/database.js';
import { UNIVERSITIES } from '../data/universities.js';

async function main() {
  console.log(`Seeding ${UNIVERSITIES.length} universities…`);

  let created = 0;
  let updated = 0;

  for (const u of UNIVERSITIES) {
    const exists = await prisma.university.findFirst({
      where: { nameUz: u.nameUz },
    });

    if (exists) {
      // Backfill nameRu if missing
      if (!exists.nameRu) {
        await prisma.university.update({
          where: { id: exists.id },
          data: {
            nameRu: u.nameRu ?? null,
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

  console.log(`Done. Created: ${created}, updated (backfilled): ${updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
