'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  nameEn: string;
  provider: GatewayProvider;
  publicKey: string;
  secretKey: string;
  merchantId?: string;
  webhookSecret?: string;
  environment: 'sandbox' | 'production';
  callbackUrl?: string;
  webhookUrl?: string;
  currency: string;
  supportedCountries: string[];
  isActive: boolean;
  isDefault: boolean;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export type GatewayProvider =
  | 'tap'
  | 'moyasar'
  | 'hyperpay'
  | 'paytabs'
  | 'myfatoorah'
  | 'stripe'
  | 'custom';

export interface PaymentGatewayState {
  gateways: PaymentGatewayConfig[];
  addGateway: (gateway: Omit<PaymentGatewayConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGateway: (id: string, updates: Partial<PaymentGatewayConfig>) => void;
  deleteGateway: (id: string) => void;
  toggleGateway: (id: string) => void;
  setDefault: (id: string) => void;
  testConnection: (id: string) => Promise<{ success: boolean; message: string }>;
  getActiveGateways: () => PaymentGatewayConfig[];
  getGatewayById: (id: string) => PaymentGatewayConfig | undefined;
}

const defaultGateways: PaymentGatewayConfig[] = [
  {
    id: 'gw_default_tap',
    name: 'Tap Payments',
    nameEn: 'Tap Payments',
    provider: 'tap',
    publicKey: 'pk_test_xxxxxxxxxxxx',
    secretKey: 'sk_test_xxxxxxxxxxxx',
    environment: 'sandbox',
    currency: 'SAR',
    supportedCountries: ['SA', 'AE', 'KW'],
    isActive: true,
    isDefault: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'gw_default_stripe',
    name: 'Stripe',
    nameEn: 'Stripe',
    provider: 'stripe',
    publicKey: 'pk_test_xxxxxxxxxxxx',
    secretKey: '',
    environment: 'sandbox',
    currency: 'USD',
    supportedCountries: ['US', 'GB', 'SA'],
    isActive: false,
    isDefault: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

export const usePaymentGatewayStore = create<PaymentGatewayState>()(
  persist(
    (set, get) => ({
      gateways: defaultGateways,

      addGateway: (gateway) => {
        const now = new Date().toISOString();
        const newGateway: PaymentGatewayConfig = {
          ...gateway,
          id: `gw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ gateways: [...state.gateways, newGateway] }));
      },

      updateGateway: (id, updates) => {
        set((state) => ({
          gateways: state.gateways.map((gw) =>
            gw.id === id
              ? { ...gw, ...updates, updatedAt: new Date().toISOString() }
              : gw
          ),
        }));
      },

      deleteGateway: (id) => {
        set((state) => ({
          gateways: state.gateways.filter((gw) => gw.id !== id),
        }));
      },

      toggleGateway: (id) => {
        set((state) => ({
          gateways: state.gateways.map((gw) =>
            gw.id === id ? { ...gw, isActive: !gw.isActive, updatedAt: new Date().toISOString() } : gw
          ),
        }));
      },

      setDefault: (id) => {
        set((state) => ({
          gateways: state.gateways.map((gw) =>
            gw.id === id
              ? { ...gw, isDefault: true, updatedAt: new Date().toISOString() }
              : { ...gw, isDefault: false, updatedAt: new Date().toISOString() }
          ),
        }));
      },

      testConnection: async (id) => {
        const gateway = get().gateways.find((gw) => gw.id === id);
        if (!gateway) {
          return { success: false, message: 'Gateway not found' };
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (gateway.secretKey && gateway.secretKey.trim() !== '') {
          return { success: true, message: `Connection to ${gateway.name} established successfully` };
        }

        return { success: false, message: `Connection to ${gateway.name} failed: Secret key is missing` };
      },

      getActiveGateways: () => {
        return get().gateways.filter((gw) => gw.isActive);
      },

      getGatewayById: (id) => {
        return get().gateways.find((gw) => gw.id === id);
      },
    }),
    {
      name: 'almunjiz-payment-gateways',
    }
  )
);
