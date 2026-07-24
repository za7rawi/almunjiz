'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RequestProgress {
  serviceId: string;
  step: number;
  formData: {
    name: string;
    email: string;
    phone: string;
    phoneCode: string;
    country: string;
    idNumber: string;
    residenceNumber: string;
    passportNumber: string;
    companyName: string;
    profession: string;
    workerCount: string;
    notes: string;
  };
  promoCode: string;
  selectedGatewayId: string;
  uploadedFileNames: string[];
  lastSaved: number;
}

interface RequestProgressState {
  progress: Record<string, RequestProgress>;
  saveProgress: (serviceId: string, data: Omit<RequestProgress, 'lastSaved'>) => void;
  getProgress: (serviceId: string) => RequestProgress | undefined;
  clearProgress: (serviceId: string) => void;
  clearAllProgress: () => void;
}

export const useRequestProgressStore = create<RequestProgressState>()(
  persist(
    (set, get) => ({
      progress: {},

      saveProgress: (serviceId, data) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [serviceId]: { ...data, lastSaved: Date.now() },
          },
        })),

      getProgress: (serviceId) => get().progress[serviceId],

      clearProgress: (serviceId) =>
        set((state) => {
          const newProgress = { ...state.progress };
          delete newProgress[serviceId];
          return { progress: newProgress };
        }),

      clearAllProgress: () => set({ progress: {} }),
    }),
    {
      name: 'almunjiz-request-progress',
    }
  )
);
