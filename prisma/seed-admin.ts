import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { prisma } from '../src/lib/prisma';

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@munjiz.store';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    if (existing.role === 'SUPER_ADMIN' || existing.role === 'ADMIN') {
      console.log(`Admin user already exists: ${adminEmail} (${existing.role})`);
      await prisma.$disconnect();
      return;
    }
    // Generate secure random password for upgrade
    const tempPassword = randomBytes(16).toString('hex');
    const hashed = await bcrypt.hash(tempPassword, 12);
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: 'SUPER_ADMIN', password: hashed },
    });
    console.log(`Updated existing user ${adminEmail} to SUPER_ADMIN`);
    console.log(`TEMPORARY PASSWORD: ${tempPassword}`);
    console.log(`IMPORTANT: Change this password immediately after first login!`);
    await prisma.$disconnect();
    return;
  }

  // Generate secure random password for new admin
  const tempPassword = randomBytes(16).toString('hex');
  const hashed = await bcrypt.hash(tempPassword, 12);
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
  console.log(`TEMPORARY PASSWORD: ${tempPassword}`);
  console.log(`IMPORTANT: Change this password immediately after first login!`);

  await prisma.$disconnect();
}

seedAdmin().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
