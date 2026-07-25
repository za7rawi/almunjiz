import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

const SEO_KEY = 'seo';
const DEFAULT_SEO = {
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  ogImage: '',
  twitterHandle: '',
};

export async function GET() {
  try {
    const setting = await prisma.settings.findUnique({ where: { key: SEO_KEY } });

    return NextResponse.json({
      success: true,
      data: setting?.value ?? DEFAULT_SEO,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: DEFAULT_SEO, error: error instanceof Error ? error.message : 'Failed to fetch SEO settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const body = await request.json();

    const value = {
      metaTitle: body.metaTitle ?? '',
      metaDescription: body.metaDescription ?? '',
      keywords: body.keywords ?? '',
      ogImage: body.ogImage ?? '',
      twitterHandle: body.twitterHandle ?? '',
    };

    const setting = await prisma.settings.upsert({
      where: { key: SEO_KEY },
      update: { value },
      create: { key: SEO_KEY, value },
    });

    return NextResponse.json({ success: true, data: setting.value });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to update SEO settings' },
      { status: 500 }
    );
  }
}
