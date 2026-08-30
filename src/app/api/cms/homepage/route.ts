import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { normalizeHomepageData, readHomepageContent } from '@/lib/homepage-content';

export async function GET() {
  try {
    const data = await readHomepageContent();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? 'An error occurred' : 'Failed to fetch homepage content' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const body = await request.json();

    const content = await prisma.siteContent.upsert({
      where: { section: 'homepage' },
      update: { data: body, updatedAt: new Date() },
      create: { section: 'homepage', data: body, updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: normalizeHomepageData(content.data) });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? 'An error occurred' : 'Failed to update homepage content' },
      { status: 500 }
    );
  }
}