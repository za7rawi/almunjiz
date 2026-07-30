'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAuthStore, type User } from '@/store/auth-store';

function mapRole(raw: string): User['role'] {
  const normalized = raw?.toLowerCase?.() ?? '';
  if (normalized === 'admin' || normalized === 'super_admin') return 'admin';
  if (normalized === 'manager') return 'manager';
  if (normalized === 'employee') return 'employee';
  if (normalized === 'support') return 'support';
  if (normalized === 'accountant') return 'accountant';
  return 'customer';
}

function AuthSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const storeUser = useAuthStore.getState().user;
      if (storeUser) return;

      const u = session.user as Record<string, unknown>;
      useAuthStore.setState({
        user: {
          id: u.id as string,
          name: u.name as string,
          email: u.email as string,
          role: mapRole(u.role as string),
          avatar: (u.image as string) || (u.avatar as string) || null,
          provider: (u.provider as 'email' | 'google') || 'google',
          createdAt: (u.createdAt as string) || new Date().toISOString(),
        },
        isAuthenticated: true,
      });
    }
  }, [status, session]);

  return null;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <AuthSync />
      {children}
    </NextAuthSessionProvider>
  );
}
