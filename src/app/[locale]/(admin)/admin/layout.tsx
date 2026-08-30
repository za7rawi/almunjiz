"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { GlobalSearchModal } from "@/components/ui/global-search-modal";
import { useAuthStore } from "@/store/auth-store";
import { useIsClient } from "@/hooks/use-is-client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, _hydrated } = useAuthStore();
  const mounted = useIsClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const ready = mounted && _hydrated;

  const isLoginPage = pathname.endsWith("/admin/login") || pathname.endsWith("/admin/login/");
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    if (ready && !isLoginPage && (!isAuthenticated || !isAdmin)) {
      router.replace("/ar/admin/login");
    }
  }, [ready, isAuthenticated, isLoginPage, isAdmin, router]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?isRead=false&limit=1');
      const data = await res.json();
      if (data.meta?.unreadCount !== undefined) {
        setUnreadCount(data.meta.unreadCount);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin && !isLoginPage) {
      const initial = setTimeout(fetchNotifications, 0);
      const interval = setInterval(fetchNotifications, 30000);
      return () => {
        clearTimeout(initial);
        clearInterval(interval);
      };
    }
  }, [isAuthenticated, isAdmin, isLoginPage, fetchNotifications]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2580eb]/20 border-t-[#2580eb] rounded-full animate-spin" />
          <p className="text-xs text-slate-400">AL-MUNJIZ</p>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar
        adminName={user?.name || 'مدير'}
        adminEmail={user?.email || ''}
        adminAvatar={user?.avatar}
        mobileOpen={mobileOpen}
        onMobileToggle={setMobileOpen}
        onSearchOpen={() => setSearchOpen(true)}
      />
      <div className="transition-all duration-300 lg:mr-[260px] rtl:lg:mr-0 rtl:lg:ml-[260px]">
        <DashboardHeader
          userName={user?.name || "المدير"}
          notificationCount={unreadCount}
          onMenuToggle={() => setMobileOpen(true)}
          onSearchOpen={() => setSearchOpen(true)}
        />
        <main className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">{children}</main>
      </div>
      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
