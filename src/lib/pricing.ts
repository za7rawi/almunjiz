import { prisma } from '@/lib/prisma';

export interface ServerCoupon {
  id: string;
  code: string;
  discount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  minAmount: number | null;
}

export interface ServerPricing {
  amount: number;
  discount: number;
  tax: number;
  total: number;
  couponCode: string | null;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function resolveCoupon(code: string | undefined | null, baseAmount: number): Promise<ServerCoupon | null> {
  if (!code) return null;
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });
  if (!coupon) return null;
  const now = new Date();
  if (!coupon.isActive) return null;
  if (now < coupon.startDate || now > coupon.endDate) return null;
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return null;
  if (coupon.minAmount !== null && baseAmount < Number(coupon.minAmount)) return null;
  return {
    id: coupon.id,
    code: coupon.code,
    discount: Number(coupon.discount),
    discountType: coupon.discountType,
    minAmount: coupon.minAmount !== null ? Number(coupon.minAmount) : null,
  };
}

export function computeDiscount(baseAmount: number, coupon: ServerCoupon | null): number {
  if (!coupon) return 0;
  if (coupon.discountType === 'FIXED') {
    return round2(Math.min(coupon.discount, baseAmount));
  }
  return round2((baseAmount * coupon.discount) / 100);
}

export async function computeOrderPricing(servicePrice: number, coupon: ServerCoupon | null): Promise<ServerPricing> {
  const amount = round2(Number(servicePrice));
  const discount = computeDiscount(amount, coupon);

  const setting = await prisma.settings.findUnique({ where: { key: 'taxRate' } });
  const taxRate = setting ? Number((setting.value as Record<string, unknown>)?.rate ?? 0) : 0;
  const taxable = Math.max(0, amount - discount);
  const tax = taxRate > 0 ? round2((taxable * taxRate) / 100) : 0;
  const total = round2(Math.max(0, taxable + tax));

  return {
    amount,
    discount,
    tax,
    total,
    couponCode: coupon?.code ?? null,
  };
}

export function amountsMatch(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.005;
}
