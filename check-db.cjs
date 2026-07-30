const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  const users = await p.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, name: true, role: true }
  });
  console.log(JSON.stringify(users, null, 2));
  if (users[0]) {
    const full = await p.user.findUnique({ where: { id: users[0].id } });
    console.log('Has password hash:', !!full.password);
    console.log('Has email:', full.email);
  }
  await p.$disconnect();
})();
