'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/sidebar'
import { useAuthStore } from '@/store/auth-store'
import { useIsMobile } from '@/hooks/use-media-query'
import { useDirection } from '@/hooks/use-direction'
import { useIsClient } from '@/hooks/use-is-client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, _hydrated } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { dir } = useDirection()
  const mounted = useIsClient()
  const ready = mounted && _hydrated
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const prevPathnameRef = useRef(pathname)

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      setSidebarOpen(false)
      prevPathnameRef.current = pathname
    }
  }, [pathname])

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [ready, isAuthenticated, router, pathname])

  const prevUserIdRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (mounted && user?.id && prevUserIdRef.current && prevUserIdRef.current !== user.id) {
      window.location.reload()
      return
    }
    prevUserIdRef.current = user?.id
  }, [mounted, user?.id])

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-[#2580eb] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="transition-all duration-300 lg:mr-[260px]">
        <main className="p-4 md:p-6 lg:p-8 min-h-screen">
          {children}
        </main>
      </div>

      {isMobile && !sidebarOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#2580eb] to-[#14b8a6] text-white shadow-lg shadow-[#2580eb]/30 flex items-center justify-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </motion.button>
      )}
    </div>
  )
}
