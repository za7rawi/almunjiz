'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { servicesData, type ServiceData } from '@/lib/services-data';
export type { ServiceData };

interface SiteStats {
  totalOrders: string;
  totalRevenue: string;
  activeCustomers: string;
  newOrders: string;
}

interface SiteSettings {
  siteNameAr: string;
  siteNameEn: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  totalOrdersDisplay: string;
  totalRevenueDisplay: string;
  activeCustomersDisplay: string;
  newOrdersDisplay: string;
  paymentMada: boolean;
  paymentVisa: boolean;
  paymentMastercard: boolean;
  paymentApplePay: boolean;
  paymentBankTransfer: boolean;
  otpProvider: string;
  otpApiKey: string;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  notifySms: boolean;
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
  notifyPush: boolean;
}

interface AdminCMSState {
  services: ServiceData[];
  stats: SiteStats;
  settings: SiteSettings;
  addService: (service: ServiceData) => void;
  updateService: (id: string, updates: Partial<ServiceData>) => void;
  deleteService: (id: string) => void;
  toggleServiceActive: (id: string) => void;
  updateStats: (stats: Partial<SiteStats>) => void;
  updateSettings: (settings: Partial<SiteSettings>) => void;
}

const defaultStats: SiteStats = {
  totalOrders: '1,234',
  totalRevenue: '125,000 ر.س',
  activeCustomers: '856',
  newOrders: '42',
};

const defaultSettings: SiteSettings = {
  siteNameAr: 'المنجز',
  siteNameEn: 'Almunjiz',
  siteDescription: 'منصة الخدمات والحلول المتكاملة',
  logo: '',
  favicon: '',
  whatsapp: '+966500000000',
  phone: '+966112345678',
  email: 'info@almunjiz.com',
  address: 'الرياض، المملكة العربية السعودية',
  workingHours: 'السبت - الخميس: 9 ص - 9 م',
  totalOrdersDisplay: '1,234',
  totalRevenueDisplay: '125,000',
  activeCustomersDisplay: '856',
  newOrdersDisplay: '42',
  paymentMada: true,
  paymentVisa: true,
  paymentMastercard: true,
  paymentApplePay: false,
  paymentBankTransfer: true,
  otpProvider: 'unifonic',
  otpApiKey: '',
  smtpHost: '',
  smtpPort: '587',
  smtpUsername: '',
  smtpPassword: '',
  notifySms: true,
  notifyEmail: true,
  notifyWhatsapp: false,
  notifyPush: true,
};

export const useAdminCMSStore = create<AdminCMSState>()(
  persist(
    (set) => ({
      services: servicesData,
      stats: defaultStats,
      settings: defaultSettings,

      addService: (service) =>
        set((state) => ({
          services: [...state.services, service],
        })),

      updateService: (id, updates) =>
        set((state) => ({
          services: state.services.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      deleteService: (id) =>
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        })),

      toggleServiceActive: (id) =>
        set((state) => ({
          services: state.services.map((s) =>
            s.id === id ? { ...s, isActive: !s.isActive } : s
          ),
        })),

      updateStats: (stats) =>
        set((state) => ({
          stats: { ...state.stats, ...stats },
        })),

      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),
    }),
    {
      name: 'almunjiz-admin-cms',
    }
  )
);
