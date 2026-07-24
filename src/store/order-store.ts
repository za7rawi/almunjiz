'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Order {
  id: string;
  orderNumber: string;
  serviceName: string;
  serviceId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  amount: number;
  tax: number;
  total: number;
  status: string;
  statusAr: string;
  description?: string;
  attachments?: string[];
  paymentMethod?: string;
  invoiceNumber?: string;
  createdAt: string;
  updatedAt?: string;
  timeline: { status: string; label: string; date: string }[];
}

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (id: string, data: Partial<Order>) => void;
  getOrder: (id: string) => Order | undefined;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrder: (id, data) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, ...data } : o,
          ),
        })),
      getOrder: (id) => get().orders.find((o) => o.id === id),
    }),
    {
      name: 'almunjiz-orders',
    },
  ),
)
