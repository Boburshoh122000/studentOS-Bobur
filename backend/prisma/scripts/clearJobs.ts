import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const deleted = await prisma.job.deleteMany({});
  console.log(`Deleted ${deleted.count} jobs`);
}
main().finally(() => prisma.$disconnect());
