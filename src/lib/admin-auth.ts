import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'];
const CMS_ROLES = [...ADMIN_ROLES, 'EMPLOYEE'];

export interface AdminSession {
  userId: string;
  role: string;
  name: string;
  email: string;
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

  const role = (session.user as Record<string, unknown>).role as string;
  if (!ADMIN_ROLES.includes(role)) {
    return {
      error: NextResponse.json(
        { success: false, error: 'غير مصرح - صلاحيات الإدارة مطلوبة' },
        { status: 403 }
      ),
    };
  }

  return {
    session: {
      userId: (session.user as Record<string, unknown>).id as string,
      role,
      name: session.user.name || '',
      email: session.user.email || '',
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

  const role = (session.user as Record<string, unknown>).role as string;
  if (!CMS_ROLES.includes(role)) {
    return {
      error: NextResponse.json(
        { success: false, error: 'غير مصرح - صلاحيات التحرير مطلوبة' },
        { status: 403 }
      ),
    };
  }

  return {
    session: {
      userId: (session.user as Record<string, unknown>).id as string,
      role,
      name: session.user.name || '',
      email: session.user.email || '',
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

  return {
    session: {
      userId: (session.user as Record<string, unknown>).id as string,
      role: (session.user as Record<string, unknown>).role as string,
      name: session.user.name || '',
      email: session.user.email || '',
    },
  };
}
