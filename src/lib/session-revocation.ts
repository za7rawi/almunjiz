import { prisma } from '@/lib/prisma';

export async function revokeAllUserSessions(userId: string, reason = 'password_change'): Promise<void> {
  await prisma.sessionRevocation.create({
    data: { userId, reason },
  });
}

export async function isSessionRevoked(userId: string, tokenIat?: number): Promise<boolean> {
  const revocation = await prisma.sessionRevocation.findFirst({
    where: { userId },
    orderBy: { revokedAt: 'desc' },
  });

  if (!revocation) return false;

  if (tokenIat) {
    const tokenDate = new Date(tokenIat * 1000);
    return revocation.revokedAt > tokenDate;
  }

  return true;
}

export async function getUserSessionRevocations(userId: string): Promise<Date[]> {
  const revocations = await prisma.sessionRevocation.findMany({
    where: { userId },
    orderBy: { revokedAt: 'desc' },
    select: { revokedAt: true },
  });
  return revocations.map((r) => r.revokedAt);
}
