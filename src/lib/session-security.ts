import { prisma } from '@/lib/prisma';

export async function getSessionVersion(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { sessionVersion: true },
  });
  return user?.sessionVersion ?? 0;
}

export async function bumpSessionVersion(userId: string): Promise<number> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
    select: { sessionVersion: true },
  });
  return user.sessionVersion;
}

export async function revokeAllSessions(userId: string): Promise<number> {
  return bumpSessionVersion(userId);
}

export async function isSessionValid(userId: string, tokenVersion: number): Promise<boolean> {
  const currentVersion = await getSessionVersion(userId);
  return currentVersion === tokenVersion;
}
