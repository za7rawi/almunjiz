import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const orphanedFiles = await prisma.fileAttachment.count({ where: { orderId: null } });
  const linkedFiles = await prisma.fileAttachment.count({ where: { orderId: { not: null } } });
  const totalOrders = await prisma.order.count();
  const ordersWithAttachments = await prisma.order.count({ where: { attachments: { isEmpty: false } } });
  const ordersWithFileAttachments = await prisma.order.count({ where: { fileAttachments: { some: {} } } });
  const ordersWithBoth = await prisma.order.count({ where: { AND: [{ attachments: { isEmpty: false } }, { fileAttachments: { some: {} } }] } });
  const ordersWithOnlyAttachments = await prisma.order.count({ where: { AND: [{ attachments: { isEmpty: false } }, { fileAttachments: { none: {} } }] } });
  
  console.log('=== Database File Stats ===');
  console.log('Orphaned FileAttachment (orderId=null):', orphanedFiles);
  console.log('Linked FileAttachment (orderId set):', linkedFiles);
  console.log('Total orders:', totalOrders);
  console.log('Orders with attachments[] (old):', ordersWithAttachments);
  console.log('Orders with fileAttachments (new):', ordersWithFileAttachments);
  console.log('Orders with BOTH:', ordersWithBoth);
  console.log('Orders with ONLY old attachments (needs migration):', ordersWithOnlyAttachments);
  
  if (orphanedFiles > 0) {
    const samples = await prisma.fileAttachment.findMany({ where: { orderId: null }, take: 5, select: { id: true, fileName: true, userId: true } });
    console.log('Sample orphaned files:', JSON.stringify(samples, null, 2));
  }
  
  if (ordersWithOnlyAttachments > 0) {
    const sampleOrders = await prisma.order.findMany({ where: { AND: [{ attachments: { isEmpty: false } }, { fileAttachments: { none: {} } }] }, take: 3, select: { id: true, orderNumber: true, userId: true, attachments: true } });
    console.log('Sample orders needing migration:', JSON.stringify(sampleOrders, null, 2));
  }
  
  const lastOrders = await prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, orderNumber: true, attachments: true, userId: true, _count: { select: { fileAttachments: true } } } });
  console.log('Last 5 orders:', JSON.stringify(lastOrders, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
