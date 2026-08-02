import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: [], error: error instanceof Error ? 'An error occurred' : 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const body = await request.json();

    if (!body.title || !body.titleEn || !body.image) {
      return NextResponse.json(
        { success: false, data: null, error: 'Missing required fields: title, titleEn, image' },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: {
        title: body.title,
        titleEn: body.titleEn,
        subtitle: body.subtitle || null,
        subtitleEn: body.subtitleEn || null,
        image: body.image,
        link: body.link || null,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? 'An error occurred' : 'Failed to create banner' },
      { status: 500 }
    );
  }
}
