import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  const adminEmail = 'admin@gmail.com';
  const adminPassword = 'admin123';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    if (existing.role === 'SUPER_ADMIN' || existing.role === 'ADMIN') {
      console.log(`Admin user already exists: ${adminEmail} (${existing.role})`);
      await prisma.$disconnect();
      return;
    }
    const hashed = await bcrypt.hash(adminPassword, 12);
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: 'SUPER_ADMIN', password: hashed },
    });
    console.log(`Updated existing user ${adminEmail} to SUPER_ADMIN`);
    await prisma.$disconnect();
    return;
  }

  const hashed = await bcrypt.hash(adminPassword, 12);
  await prisma.user.create({
    data: {
      name: 'مدير النظام',
      email: adminEmail,
      password: hashed,
      role: 'SUPER_ADMIN',
      emailVerified: true,
    },
  });
  console.log(`Created admin user: ${adminEmail}`);

  await prisma.$disconnect();
}

seedAdmin().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
