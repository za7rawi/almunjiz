import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, amount } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, data: null, error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon) {
      return NextResponse.json({
        success: true,
        data: { valid: false, discount: 0, discountType: null, message: 'كوبون غير صالح' },
      });
    }

    if (!coupon.isActive) {
      return NextResponse.json({
        success: true,
        data: { valid: false, discount: 0, discountType: null, message: 'هذا الكوبون غير نشط' },
      });
    }

    const now = new Date();
    if (now < coupon.startDate) {
      return NextResponse.json({
        success: true,
        data: { valid: false, discount: 0, discountType: null, message: 'هذا الكوبون لم يبدأ بعد' },
      });
    }

    if (now > coupon.endDate) {
      return NextResponse.json({
        success: true,
        data: { valid: false, discount: 0, discountType: null, message: 'انتهت صلاحية هذا الكوبون' },
      });
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({
        success: true,
        data: { valid: false, discount: 0, discountType: null, message: 'تم استخدام هذا الكوبون بالكامل' },
      });
    }

    if (coupon.minAmount !== null && amount !== undefined) {
      const minAmountNum = Number(coupon.minAmount);
      if (Number(amount) < minAmountNum) {
        return NextResponse.json({
          success: true,
          data: { valid: false, discount: 0, discountType: null, message: `الحد الأدنى للمبلغ هو ${minAmountNum} ر.س` },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        discount: Number(coupon.discount),
        discountType: coupon.discountType,
        message: 'كوبون صالح',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: null, error: error instanceof Error ? 'An error occurred' : 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
