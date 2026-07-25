import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: [], error: error instanceof Error ? error.message : 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const body = await request.json();

    const requiredFields = ['title', 'titleEn', 'content', 'contentEn'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, data: null, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const news = await prisma.news.create({
      data: {
        title: body.title,
        titleEn: body.titleEn,
        content: body.content,
        contentEn: body.contentEn,
        excerpt: body.excerpt || null,
        excerptEn: body.excerptEn || null,
        image: body.image || null,
        isPublished: body.isPublished ?? false,
        publishedAt: body.isPublished ? (body.publishedAt ? new Date(body.publishedAt) : new Date()) : null,
      },
    });

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to create news' },
      { status: 500 }
    );
  }
}
