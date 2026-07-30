const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany({ take: 10, orderBy: { createdAt: 'desc' }, select: { id: true, email: true, role: true, name: true, createdAt: true } })
  .then(r => { console.log(JSON.stringify(r, null, 2)); return p.$disconnect(); })
  .catch(e => { console.error('ERR:', e.message); return p.$disconnect(); });
