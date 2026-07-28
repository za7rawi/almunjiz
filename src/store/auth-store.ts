'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'employee' | 'support' | 'accountant' | 'customer';
  avatar: string | null;
  provider: 'email' | 'google';
  createdAt: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  _hydrated: boolean;
  login: (user: User) => void;
  loginEmail: (email: string, password: string) => Promise<{ success: boolean; message: string; redirect?: string }>;
  register: (data: { name: string; email: string; password: string }) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (data: { idToken: string; name: string; email: string; avatar?: string }) => Promise<{ success: boolean; message: string; redirect: string; email: string; token: string }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  isAdmin: () => boolean;
}

function mapRole(raw: string): User['role'] {
  const normalized = raw?.toLowerCase?.() ?? '';
  if (normalized === 'admin' || normalized === 'super_admin') return 'admin';
  if (normalized === 'manager') return 'manager';
  if (normalized === 'employee') return 'employee';
  if (normalized === 'support') return 'support';
  if (normalized === 'accountant') return 'accountant';
  return 'customer';
}

function clearUserProgressData(_currentUserId?: string) {
  try {
    localStorage.removeItem('almunjiz-request-progress');
  } catch {}
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      _hydrated: false,

      login: (user) => {
        clearUserProgressData(user.id);
        set({ user, isAuthenticated: true });
      },

      loginEmail: async (email, password) => {
        const lowerEmail = email.toLowerCase().trim();

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: lowerEmail, password }),
          });
          const json = await res.json();

          if (json.success && json.data?.user) {
            const u = json.data.user;
            const user: User = {
              id: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              role: mapRole(u.role),
              avatar: u.avatar ?? null,
              provider: 'email',
              createdAt: u.createdAt ?? new Date().toISOString(),
            };
            clearUserProgressData(user.id);
            set({ user, isAuthenticated: true });
            const isAdmin = user.role === 'admin' || user.role === 'manager';
            return {
              success: true,
              message: json.message || 'تم تسجيل الدخول بنجاح',
              redirect: isAdmin ? '/admin' : '/dashboard',
            };
          }

          return { success: false, message: json.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
        } catch {
          return { success: false, message: 'حدث خطأ أثناء الاتصال بالخادم' };
        }
      },

      register: async (data) => {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: data.name,
              email: data.email.toLowerCase().trim(),
              password: data.password,
            }),
          });
          const json = await res.json();

          if (json.success) {
            return { success: true, message: json.message || 'تم إنشاء الحساب بنجاح' };
          }

          return { success: false, message: json.error || 'حدث خطأ أثناء إنشاء الحساب' };
        } catch {
          return { success: false, message: 'حدث خطأ أثناء الاتصال بالخادم' };
        }
      },

      loginWithGoogle: async (data) => {
        try {
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: data.idToken }),
          });
          const json = await res.json();

          if (json.success && json.user) {
            const u = json.user;
            const user: User = {
              id: u.id,
              name: u.name,
              email: u.email,
              phone: u.phone,
              role: mapRole(u.role),
              avatar: data.avatar || u.avatar || null,
              provider: 'google',
              createdAt: u.createdAt ?? new Date().toISOString(),
            };
            clearUserProgressData(user.id);
            set({ user, isAuthenticated: true });
            const isAdmin = user.role === 'admin' || user.role === 'manager';
            return { success: true, message: json.message || 'تم تسجيل الدخول بنجاح', redirect: isAdmin ? '/admin' : '/dashboard', email: u.email, token: json.token };
          }

          return { success: false, message: json.message || 'فشل تسجيل الدخول بـ Google', redirect: '', email: '', token: '' };
        } catch {
          return { success: false, message: 'حدث خطأ أثناء التواصل مع Google', redirect: '', email: '', token: '' };
        }
      },

      logout: async () => {
        set({ user: null, isAuthenticated: false });
        try { localStorage.removeItem('almunjiz-request-progress'); } catch {}
        document.cookie = 'almunjiz-role=; path=/; max-age=0';
        const { signOut } = await import('next-auth/react');
        await signOut({ redirect: false });
        window.location.href = '/login';
      },

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin' || user?.role === 'manager';
      },
    }),
    {
      name: 'almunjiz-auth',
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as object),
        _hydrated: true,
      }),
    },
  ),
)
