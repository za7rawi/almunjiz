import { NextResponse } from 'next/server';
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { isSessionValid } from '@/lib/session-security';
import { prisma } from '@/lib/prisma';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'];
const CMS_ROLES = [...ADMIN_ROLES, 'EMPLOYEE'];

export interface AdminSession {
  userId: string;
  role: string;
  name: string;
  email: string;
}

async function validateSession(session: Session | null): Promise<{ valid: boolean; dbUser?: { id: string; role: string; name: string; email: string } }> {
  if (!session?.user) return { valid: false };
  const userId = (session.user as Record<string, unknown>).id as string;

  // SECURITY: Verify user still exists in DB and get current role
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, name: true, email: true },
  });
  if (!dbUser) return { valid: false };

  // Check session version (revocation)
  const tokenVersion = (session.user as Record<string, unknown>).sessionVersion as number | undefined;
  if (tokenVersion !== undefined) {
    const valid = await isSessionValid(userId, tokenVersion);
    if (!valid) return { valid: false };
  }

  return { valid: true, dbUser };
}

export async function requireAdmin(): Promise<
  { session: AdminSession } | { error: NextResponse }
> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { success: false, error: 'غير مصرح - يرجى تسجيل الدخول' },
        { status: 401 }
      ),
    };
  }

  const validation = await validateSession(session);
  if (!validation.valid || !validation.dbUser) {
    return {
      error: NextResponse.json(
        { success: false, error: 'الجلسة غير صالحة - يرجى تسجيل الدخول مرة أخرى' },
        { status: 401 }
      ),
    };
  }

  if (!ADMIN_ROLES.includes(validation.dbUser.role)) {
    return {
      error: NextResponse.json(
        { success: false, error: 'غير مصرح - صلاحيات الإدارة مطلوبة' },
        { status: 403 }
      ),
    };
  }

  return {
    session: {
      userId: validation.dbUser.id,
      role: validation.dbUser.role,
      name: validation.dbUser.name || '',
      email: validation.dbUser.email || '',
    },
  };
}

export async function requireCmsEditor(): Promise<
  { session: AdminSession } | { error: NextResponse }
> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { success: false, error: 'غير مصرح - يرجى تسجيل الدخول' },
        { status: 401 }
      ),
    };
  }

  const validation = await validateSession(session);
  if (!validation.valid || !validation.dbUser) {
    return {
      error: NextResponse.json(
        { success: false, error: 'الجلسة غير صالحة - يرجى تسجيل الدخول مرة أخرى' },
        { status: 401 }
      ),
    };
  }

  if (!CMS_ROLES.includes(validation.dbUser.role)) {
    return {
      error: NextResponse.json(
        { success: false, error: 'غير مصرح - صلاحيات التحرير مطلوبة' },
        { status: 403 }
      ),
    };
  }

  return {
    session: {
      userId: validation.dbUser.id,
      role: validation.dbUser.role,
      name: validation.dbUser.name || '',
      email: validation.dbUser.email || '',
    },
  };
}

export async function requireAuth(): Promise<
  { session: AdminSession } | { error: NextResponse }
> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      ),
    };
  }

  const validation = await validateSession(session);
  if (!validation.valid || !validation.dbUser) {
    return {
      error: NextResponse.json(
        { success: false, error: 'الجلسة غير صالحة - يرجى تسجيل الدخول مرة أخرى' },
        { status: 401 }
      ),
    };
  }

  return {
    session: {
      userId: validation.dbUser.id,
      role: validation.dbUser.role,
      name: validation.dbUser.name || '',
      email: validation.dbUser.email || '',
    },
  };
}
