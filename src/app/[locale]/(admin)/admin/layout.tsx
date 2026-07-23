"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useAuthStore } from "@/store/auth-store";
import { useIsClient } from "@/hooks/use-is-client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const mounted = useIsClient();

  const isLoginPage = pathname.endsWith("/admin/login") || pathname.endsWith("/admin/login/");

  useEffect(() => {
    if (mounted && !isAuthenticated && !isLoginPage) {
      router.replace("/ar/admin/login");
    }
  }, [mounted, isAuthenticated, isLoginPage, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#2580eb]/30 border-t-[#2580eb] rounded-full animate-spin" />
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar adminName={user?.name || 'مدير'} adminEmail={user?.email || 'admin@almunjiz.com'} />
      <div className="transition-all duration-300 lg:mr-[260px]">
        <DashboardHeader
          userName={user?.name || "المدير"}
          notificationCount={5}
        />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
