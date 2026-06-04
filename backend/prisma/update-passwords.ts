import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateIfChanged(email: string, rawPassword: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email }, select: { passwordHash: true } });
  if (!user) {
    console.log(`⏭️  ${email} not found, skipping`);
    return;
  }
  const unchanged = user.passwordHash && (await bcrypt.compare(rawPassword, user.passwordHash));
  if (unchanged) {
    console.log(`⏭️  ${email} password unchanged`);
    return;
  }
  const hash = await bcrypt.hash(rawPassword, 12);
  await prisma.user.update({ where: { email }, data: { passwordHash: hash } });
  console.log(`✅ ${email} password updated`);
}

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const employerPassword = process.env.EMPLOYER_PASSWORD;

  if (!adminPassword || !employerPassword) {
    console.error('❌ ADMIN_PASSWORD and EMPLOYER_PASSWORD are required');
    process.exit(1);
  }

  await updateIfChanged('admin@studentos.com', adminPassword);
  await updateIfChanged('hr@techflow.com', employerPassword);
  await updateIfChanged('careers@innovatehub.io', employerPassword);
}

main()
  .catch((e) => {
    console.error('❌ update-passwords error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
