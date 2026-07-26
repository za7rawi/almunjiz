import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: coupons });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: [], error: error instanceof Error ? 'An error occurred' : 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  try {
    const body = await request.json();

    const requiredFields = ['code', 'discount', 'discountType', 'startDate', 'endDate'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json(
          { success: false, data: null, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const existing = await prisma.coupon.findUnique({ where: { code: body.code } });
    if (existing) {
      return NextResponse.json(
        { success: false, data: null, error: 'A coupon with this code already exists' },
        { status: 409 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: body.code,
        discount: body.discount,
        discountType: body.discountType,
        maxUses: body.maxUses ?? null,
        minAmount: body.minAmount ?? null,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, data: coupon });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? 'An error occurred' : 'Failed to create coupon' },
      { status: 500 }
    );
  }
}
