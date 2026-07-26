import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const news = await prisma.news.findUnique({ where: { id } });

    if (!news) {
      return NextResponse.json(
        { success: false, data: null, error: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? 'An error occurred' : 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, error: 'News not found' },
        { status: 404 }
      );
    }

    const isPublishedNow = body.isPublished ?? existing.isPublished;

    const news = await prisma.news.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.titleEn !== undefined && { titleEn: body.titleEn }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.contentEn !== undefined && { contentEn: body.contentEn }),
        ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
        ...(body.excerptEn !== undefined && { excerptEn: body.excerptEn }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.isPublished !== undefined && {
          isPublished: body.isPublished,
          publishedAt: body.isPublished && !existing.publishedAt
            ? new Date()
            : existing.publishedAt,
        }),
        ...(body.publishedAt !== undefined && { publishedAt: new Date(body.publishedAt) }),
      },
    });

    return NextResponse.json({ success: true, data: news });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? 'An error occurred' : 'Failed to update news' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const { id } = await params;

    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, error: 'News not found' },
        { status: 404 }
      );
    }

    await prisma.news.delete({ where: { id } });

    return NextResponse.json({ success: true, data: existing });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? 'An error occurred' : 'Failed to delete news' },
      { status: 500 }
    );
  }
}
