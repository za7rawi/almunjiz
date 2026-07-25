import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const coupon = await prisma.coupon.findUnique({ where: { id } });

    if (!coupon) {
      return NextResponse.json(
        { success: false, data: null, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: coupon });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to fetch coupon' },
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

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    if (body.code && body.code !== existing.code) {
      const codeExists = await prisma.coupon.findUnique({ where: { code: body.code } });
      if (codeExists) {
        return NextResponse.json(
          { success: false, data: null, error: 'A coupon with this code already exists' },
          { status: 409 }
        );
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(body.code !== undefined && { code: body.code }),
        ...(body.discount !== undefined && { discount: body.discount }),
        ...(body.discountType !== undefined && { discountType: body.discountType }),
        ...(body.maxUses !== undefined && { maxUses: body.maxUses }),
        ...(body.minAmount !== undefined && { minAmount: body.minAmount }),
        ...(body.startDate !== undefined && { startDate: new Date(body.startDate) }),
        ...(body.endDate !== undefined && { endDate: new Date(body.endDate) }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json({ success: true, data: coupon });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to update coupon' },
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

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, data: null, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true, data: existing });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? error.message : 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
