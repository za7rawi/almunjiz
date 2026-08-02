import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const pages = await prisma.page.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: [], error: error instanceof Error ? 'An error occurred' : 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const body = await request.json();

    const requiredFields = ['slug', 'title', 'titleEn', 'content', 'contentEn'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, data: null, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const existing = await prisma.page.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return NextResponse.json(
        { success: false, data: null, error: 'A page with this slug already exists' },
        { status: 409 }
      );
    }

    const page = await prisma.page.create({
      data: {
        slug: body.slug,
        title: body.title,
        titleEn: body.titleEn,
        content: body.content,
        contentEn: body.contentEn,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? 'An error occurred' : 'Failed to create page' },
      { status: 500 }
    );
  }
}
