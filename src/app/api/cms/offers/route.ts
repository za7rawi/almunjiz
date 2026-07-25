import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: offers });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: [], error: error instanceof Error ? error.message : 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const body = await request.json();

    const requiredFields = ['title', 'titleEn', 'discount', 'discountType', 'startDate', 'endDate'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json(
          { success: false, data: null, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const offer = await prisma.offer.create({
      data: {
        title: body.title,
        titleEn: body.titleEn,
        description: body.description || null,
        descriptionEn: body.descriptionEn || null,
        discount: body.discount,
        discountType: body.discountType,
        code: body.code || null,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        isActive: body.isActive ?? true,
        maxUses: body.maxUses ?? null,
        serviceIds: body.serviceIds || [],
      },
    });

    return NextResponse.json({ success: true, data: offer });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to create offer' },
      { status: 500 }
    );
  }
}
