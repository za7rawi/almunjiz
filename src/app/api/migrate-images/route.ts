import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, error: 'Not available in production' }, { status: 403 });
  }

  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  return NextResponse.json({ success: false, error: 'Migration endpoint disabled' }, { status: 410 });
}
