import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const a = new PrismaPg({connectionString: process.env.DATABASE_URL});
const p = new PrismaClient({adapter: a});

const services = await p.service.findMany({
  select: { id: true, name: true, nameEn: true, slug: true, category: true, icon: true, image: true },
  orderBy: { sortOrder: 'asc' }
});
console.log(JSON.stringify(services, null, 2));
await p.$disconnect();
