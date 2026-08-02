'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, type User } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { toast } from '@/components/ui/toast';

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
  const router = useRouter();
  const pathname = usePathname();
  const prevStatus = useRef<string | null>(null);
  const { language } = useLanguageStore();
  const isAr = language === 'ar';

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

    if (prevStatus.current === 'authenticated' && status === 'unauthenticated') {
      const wasLoggedIn = useAuthStore.getState().isAuthenticated;
      const path = pathname ?? '';
      const isAuthPage = path.includes('/login') || path.includes('/register') || path.includes('/otp');
      if (wasLoggedIn && !isAuthPage) {
        useAuthStore.setState({ user: null, isAuthenticated: false });
        toast.warning({
          title: isAr ? 'انتهت جلستك' : 'Your session has expired',
          description: isAr
            ? 'يرجى تسجيل الدخول مرة أخرى للمتابعة بأمان'
            : 'Please sign in again to continue securely',
        });
        const target = window.location.pathname + window.location.search;
        const safeRedirect = target.startsWith('/') ? target : '/dashboard';
        router.replace(`/login?expired=1&redirect=${encodeURIComponent(safeRedirect)}`);
      }
    }

    prevStatus.current = status;
  }, [status, session, router, pathname, isAr]);

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
