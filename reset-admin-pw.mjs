import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const DATABASE_URL = 'postgresql://neondb_owner:npg_0vEkqy9AGPsg@ep-frosty-violet-aug2spd0-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=verify-full';
const NEW_ADMIN_PASSWORD = 'AdminTest@2026!';

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// We need bcrypt to hash the password
async function main() {
  // Check current admin
  const admin = await prisma.user.findFirst({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
  });
  
  if (!admin) {
    console.log('No admin found in database');
    await prisma.$disconnect();
    return;
  }
  
  console.log('Current admin:', admin.email, admin.name, admin.role);
  console.log('Has password:', !!admin.password);
  
  // Hash the new password using Node.js crypto (or we can install bcryptjs)
  // Actually let's just use the built-in crypto
  const bcryptjs = await import('bcryptjs');
  const hashedPassword = await bcryptjs.hash(NEW_ADMIN_PASSWORD, 12);
  
  // Update password
  await prisma.user.update({
    where: { id: admin.id },
    data: { password: hashedPassword }
  });
  
  console.log(`\nPassword updated to: ${NEW_ADMIN_PASSWORD}`);
  console.log('Please use this to log in');
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
