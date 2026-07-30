import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const DATABASE_URL = 'postgresql://neondb_owner:npg_0vEkqy9AGPsg@ep-frosty-violet-aug2spd0-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=verify-full';

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing all orders, customers, and related data...\n');

  // 1. Delete in order to respect foreign keys
  console.log('1. Deleting file_attachments...');
  const deletedFiles = await prisma.fileAttachment.deleteMany({});
  console.log(`   Deleted ${deletedFiles.count} file attachments`);

  console.log('2. Deleting payments...');
  const deletedPayments = await prisma.payment.deleteMany({});
  console.log(`   Deleted ${deletedPayments.count} payments`);

  console.log('3. Deleting invoices...');
  const deletedInvoices = await prisma.invoice.deleteMany({});
  console.log(`   Deleted ${deletedInvoices.count} invoices`);

  console.log('4. Deleting order timelines...');
  const deletedTimelines = await prisma.orderTimeline.deleteMany({});
  console.log(`   Deleted ${deletedTimelines.count} timelines`);

  console.log('5. Deleting orders...');
  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`   Deleted ${deletedOrders.count} orders`);

  console.log('6. Deleting customer users...');
  const deletedUsers = await prisma.user.deleteMany({
    where: { role: 'CUSTOMER' }
  });
  console.log(`   Deleted ${deletedUsers.count} customer users`);

  // 7. Verify remaining data
  const remainingUsers = await prisma.user.count({ where: { role: { not: 'CUSTOMER' } } });
  const remainingOrders = await prisma.order.count();
  console.log(`\nRemaining non-customer users (admins, etc): ${remainingUsers}`);
  console.log(`Remaining orders: ${remainingOrders}`);

  console.log('\n✅ Database cleared successfully!');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
