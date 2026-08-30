'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  serviceId: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  price: number;
  duration?: string;
  durationEn?: string;
  icon?: string;
  image?: string | null;
  categoryAr?: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  open: boolean;
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  removeItem: (serviceId: string) => void;
  setQty: (serviceId: string, qty: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      addItem: (item, qty = 1) => {
        const items = [...get().items];
        const existing = items.find((i) => i.serviceId === item.serviceId);
        if (existing) {
          existing.qty = Math.min(existing.qty + qty, 99);
        } else {
          items.push({ ...item, qty });
        }
        set({ items, open: true });
      },
      removeItem: (serviceId) =>
        set((state) => ({ items: state.items.filter((i) => i.serviceId !== serviceId) })),
      setQty: (serviceId, qty) => {
        if (qty <= 0) {
          set((state) => ({ items: state.items.filter((i) => i.serviceId !== serviceId) }));
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.serviceId === serviceId ? { ...i, qty: Math.min(qty, 99) } : i
          ),
        }));
      },
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: 'almunjiz-cart',
      onRehydrateStorage: () => (state) => {
        if (state) state.open = false;
      },
    }
  )
);

export function useCartCount(): number {
  return useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
}

export function useCartSubtotal(): number {
  return useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.price * i.qty, 0)
  );
}