'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Coupon {
  id: string
  code: string
  discount: number
  discountType: 'percentage' | 'fixed'
  maxUses?: number
  usedCount: number
  minAmount?: number
  isActive: boolean
  expiresAt?: string
  serviceIds?: string[]
  createdAt: string
  updatedAt: string
}

interface CouponState {
  coupons: Coupon[]
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>) => void
  updateCoupon: (id: string, updates: Partial<Coupon>) => void
  deleteCoupon: (id: string) => void
  toggleCoupon: (id: string) => void
  validateCoupon: (
    code: string,
    amount: number,
    serviceId?: string,
  ) => { valid: boolean; discount: number; discountType: 'percentage' | 'fixed'; message: string }
  applyCoupon: (code: string) => void
  getActiveCoupons: () => Coupon[]
}

const now = () => new Date().toISOString()

const defaultCoupons: Coupon[] = [
  {
    id: 'cp_default_almunjiz10',
    code: 'ALMUNJIZ10',
    discount: 10,
    discountType: 'percentage',
    usedCount: 0,
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'cp_default_welcome20',
    code: 'WELCOME20',
    discount: 20,
    discountType: 'percentage',
    usedCount: 0,
    minAmount: 200,
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'cp_default_fixed50',
    code: 'FIXED50',
    discount: 50,
    discountType: 'fixed',
    usedCount: 0,
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  },
]

export const useCouponStore = create<CouponState>()(
  persist(
    (set, get) => ({
      coupons: defaultCoupons,

      addCoupon: (coupon) =>
        set((state) => ({
          coupons: [
            ...state.coupons,
            {
              ...coupon,
              id: `cp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              usedCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateCoupon: (id, updates) =>
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c,
          ),
        })),

      deleteCoupon: (id) =>
        set((state) => ({
          coupons: state.coupons.filter((c) => c.id !== id),
        })),

      toggleCoupon: (id) =>
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.id === id ? { ...c, isActive: !c.isActive, updatedAt: new Date().toISOString() } : c,
          ),
        })),

      validateCoupon: (code, amount, serviceId) => {
        const coupon = get().coupons.find(
          (c) => c.code.toUpperCase() === code.toUpperCase(),
        )
        if (!coupon) {
          return { valid: false, discount: 0, discountType: 'percentage', message: 'الكوبون غير صالح' }
        }
        if (!coupon.isActive) {
          return { valid: false, discount: 0, discountType: coupon.discountType, message: 'الكوبون غير نشط' }
        }
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
          return { valid: false, discount: 0, discountType: coupon.discountType, message: 'الكوبون منتهي الصلاحية' }
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          return { valid: false, discount: 0, discountType: coupon.discountType, message: 'تم استنفاذ استخدامات الكوبون' }
        }
        if (coupon.minAmount && amount < coupon.minAmount) {
          return {
            valid: false,
            discount: 0,
            discountType: coupon.discountType,
            message: `الحد الأدنى للطلب ${coupon.minAmount} ريال`,
          }
        }
        if (coupon.serviceIds && coupon.serviceIds.length > 0 && serviceId && !coupon.serviceIds.includes(serviceId)) {
          return { valid: false, discount: 0, discountType: coupon.discountType, message: 'الكوبون غير صالح لهذا الخدمة' }
        }
        const discount = coupon.discountType === 'fixed' ? coupon.discount : Math.round((amount * coupon.discount) / 100)
        return { valid: true, discount, discountType: coupon.discountType, message: 'تم تطبيق الكوبون بنجاح' }
      },

      applyCoupon: (code) =>
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.code.toUpperCase() === code.toUpperCase()
              ? { ...c, usedCount: c.usedCount + 1, updatedAt: new Date().toISOString() }
              : c,
          ),
        })),

      getActiveCoupons: () => get().coupons.filter((c) => c.isActive),
    }),
    {
      name: 'almunjiz-coupons',
    },
  ),
)
