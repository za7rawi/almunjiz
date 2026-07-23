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
  provider: 'email' | 'google' | 'apple';
  createdAt: string;
}

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer';
  provider: 'email' | 'google' | 'apple';
  createdAt: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  registeredUsers: RegisteredUser[];
  login: (user: User) => void;
  loginEmail: (email: string, password: string) => { success: boolean; message: string; redirect?: string };
  loginAdmin: (email: string, password: string) => { success: boolean; message: string };
  register: (data: { name: string; email: string; phone: string; password: string }) => { success: boolean; message: string };
  loginWithGoogle: (data: { name: string; email: string; avatar?: string }) => { success: boolean; redirect: string };
  loginWithApple: (data: { name: string; email: string; avatar?: string }) => { success: boolean; redirect: string };
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isAdmin: () => boolean;
  isEmailRegistered: (email: string) => boolean;
}

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      registeredUsers: [],

      login: (user) => set({ user, isAuthenticated: true }),

      loginEmail: (email, password) => {
        const lowerEmail = email.toLowerCase().trim();

        if (lowerEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
          const adminUser: User = {
            id: 'admin-001',
            name: 'مدير النظام',
            email: ADMIN_EMAIL,
            role: 'admin',
            avatar: null,
            provider: 'email',
            createdAt: '2026-01-01T00:00:00Z',
          };
          set({ user: adminUser, isAuthenticated: true });
          return { success: true, message: 'تم تسجيل الدخول بنجاح', redirect: '/admin' };
        }

        const { registeredUsers } = get();
        const found = registeredUsers.find(
          (u) => u.email.toLowerCase() === lowerEmail && u.password === password
        );

        if (!found) {
          return { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
        }

        const user: User = {
          id: found.id,
          name: found.name,
          email: found.email,
          phone: found.phone,
          role: found.role,
          avatar: null,
          provider: found.provider,
          createdAt: found.createdAt,
        };
        set({ user, isAuthenticated: true });
        return { success: true, message: 'تم تسجيل الدخول بنجاح', redirect: '/dashboard' };
      },

      loginAdmin: (email, password) => {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          const adminUser: User = {
            id: 'admin-001',
            name: 'مدير النظام',
            email: ADMIN_EMAIL,
            role: 'admin',
            avatar: null,
            provider: 'email',
            createdAt: '2026-01-01T00:00:00Z',
          };
          set({ user: adminUser, isAuthenticated: true });
          return { success: true, message: 'تم تسجيل الدخول بنجاح' };
        }
        return { success: false, message: 'بيانات الدخول غير صحيحة' };
      },

      register: (data) => {
        const { registeredUsers } = get();
        const lowerEmail = data.email.toLowerCase().trim();

        const exists = registeredUsers.some(
          (u) => u.email.toLowerCase() === lowerEmail
        );
        if (exists) {
          return { success: false, message: 'هذا البريد الإلكتروني مسجل بالفعل. سجّل الدخول بدلاً من ذلك' };
        }

        const phoneExists = registeredUsers.some(
          (u) => u.phone === data.phone
        );
        if (phoneExists) {
          return { success: false, message: 'هذا الرقم مسجل بالفعل بحساب آخر' };
        }

        const newUser: RegisteredUser = {
          id: `user-${Date.now()}`,
          name: data.name.trim(),
          email: lowerEmail,
          phone: data.phone,
          password: data.password,
          role: 'customer',
          provider: 'email',
          createdAt: new Date().toISOString(),
        };

        set({ registeredUsers: [...registeredUsers, newUser] });
        return { success: true, message: 'تم إنشاء الحساب بنجاح' };
      },

      loginWithGoogle: (data) => {
        const { registeredUsers } = get();
        const lowerEmail = data.email.toLowerCase().trim();

        let found = registeredUsers.find(
          (u) => u.email.toLowerCase() === lowerEmail
        );

        if (!found) {
          const newUser: RegisteredUser = {
            id: `guser-${Date.now()}`,
            name: data.name,
            email: lowerEmail,
            phone: '',
            password: '',
            role: 'customer',
            provider: 'google',
            createdAt: new Date().toISOString(),
          };
          set({ registeredUsers: [...registeredUsers, newUser] });
          found = newUser;
        }

        const user: User = {
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.role,
          avatar: data.avatar || null,
          provider: 'google',
          createdAt: found.createdAt,
        };
        set({ user, isAuthenticated: true });
        return { success: true, redirect: '/dashboard' };
      },

      loginWithApple: (data) => {
        const { registeredUsers } = get();
        const lowerEmail = data.email.toLowerCase().trim();

        let found = registeredUsers.find(
          (u) => u.email.toLowerCase() === lowerEmail
        );

        if (!found) {
          const newUser: RegisteredUser = {
            id: `auser-${Date.now()}`,
            name: data.name,
            email: lowerEmail,
            phone: '',
            password: '',
            role: 'customer',
            provider: 'apple',
            createdAt: new Date().toISOString(),
          };
          set({ registeredUsers: [...registeredUsers, newUser] });
          found = newUser;
        }

        const user: User = {
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.role,
          avatar: data.avatar || null,
          provider: 'apple',
          createdAt: found.createdAt,
        };
        set({ user, isAuthenticated: true });
        return { success: true, redirect: '/dashboard' };
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      isEmailRegistered: (email) => {
        const { registeredUsers } = get();
        return registeredUsers.some(
          (u) => u.email.toLowerCase() === email.toLowerCase().trim()
        );
      },
    }),
    {
      name: 'almunjiz-auth',
    },
  ),
)
