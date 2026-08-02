import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const showAll = searchParams.get('all') === 'true';

  if (showAll) {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;
  }

  try {
    const serviceId = searchParams.get('serviceId');

    const where: Record<string, unknown> = {};
    if (!showAll) where.isApproved = true;
    if (serviceId) where.serviceId = serviceId;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: showAll
            ? { id: true, name: true, email: true, avatar: true }
            : { id: true, name: true, avatar: true },
        },
        service: { select: { id: true, name: true, nameEn: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: [], error: error instanceof Error ? 'An error occurred' : 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const body = await request.json();
    const { id, isApproved } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, data: null, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    if (isApproved === undefined) {
      return NextResponse.json(
        { success: false, data: null, error: 'isApproved field is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, error: 'Review not found' },
        { status: 404 }
      );
    }

    const review = await prisma.review.update({
      where: { id },
      data: { isApproved },
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? 'An error occurred' : 'Failed to update review' },
      { status: 500 }
    );
  }
}
