/**
 * Seed script: populate the universities table.
 *
 * Usage:
 *   cd backend
 *   npx ts-node src/scripts/seed-universities.ts
 *
 * Or from package.json script: npm run seed:universities
 */
import prisma from '../config/database.js';
import { UNIVERSITIES } from '../data/universities.js';

async function main() {
  console.log(`Seeding ${UNIVERSITIES.length} universities…`);

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

  console.log(`Done. Created: ${created}, skipped (already exist): ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
