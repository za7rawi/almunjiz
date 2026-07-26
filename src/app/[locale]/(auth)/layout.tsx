'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/ui/logo';

function FloatingParticle({ delay, size, x, y, color }: { delay: number; size: number; x: number; y: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left: `${x}%`, top: `${y}%`, background: color }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.6, 0.3, 0.6, 0],
        scale: [0, 1, 0.8, 1, 0],
        y: [0, -30, -10, -40, 0],
        x: [0, 10, -5, 15, 0],
      }}
      transition={{ duration: 12 + delay * 2, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function FloatingShape({ delay, size, x, y, rotation }: { delay: number; size: number; x: number; y: number; rotation: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none border border-white/10"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        borderRadius: size > 40 ? '30%' : '50%',
      }}
      initial={{ opacity: 0, rotate: 0 }}
      animate={{
        opacity: [0, 0.15, 0.08, 0.15, 0],
        rotate: [rotation, rotation + 180, rotation + 360],
        y: [0, -20, 10, -15, 0],
      }}
      transition={{ duration: 18 + delay * 3, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const particles = useMemo(() => [
    { delay: 0, size: 6, x: 15, y: 20, color: 'rgba(37, 128, 235, 0.4)' },
    { delay: 1.5, size: 4, x: 80, y: 15, color: 'rgba(20, 184, 166, 0.4)' },
    { delay: 3, size: 8, x: 70, y: 70, color: 'rgba(124, 58, 237, 0.3)' },
    { delay: 0.8, size: 5, x: 25, y: 75, color: 'rgba(37, 128, 235, 0.3)' },
    { delay: 2, size: 7, x: 90, y: 45, color: 'rgba(20, 184, 166, 0.3)' },
    { delay: 4, size: 4, x: 50, y: 10, color: 'rgba(124, 58, 237, 0.4)' },
    { delay: 1, size: 6, x: 10, y: 50, color: 'rgba(37, 128, 235, 0.25)' },
    { delay: 2.5, size: 5, x: 60, y: 85, color: 'rgba(20, 184, 166, 0.25)' },
    { delay: 3.5, size: 3, x: 35, y: 35, color: 'rgba(124, 58, 237, 0.35)' },
    { delay: 0.5, size: 5, x: 45, y: 55, color: 'rgba(37, 128, 235, 0.2)' },
  ], []);

  const shapes = useMemo(() => [
    { delay: 0, size: 80, x: 10, y: 15, rotation: 0 },
    { delay: 2, size: 50, x: 75, y: 60, rotation: 45 },
    { delay: 4, size: 60, x: 85, y: 10, rotation: 90 },
    { delay: 1, size: 40, x: 20, y: 80, rotation: 135 },
  ], []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8"
      style={{
        background: 'linear-gradient(135deg, #0a0e27 0%, #0f172a 20%, #1a1040 40%, #0c1445 60%, #0a1628 80%, #0d1117 100%)',
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(37, 128, 235, 0.15) 0%, transparent 70%)',
            top: '-10%',
            right: '-10%',
          }}
          animate={{
            x: [0, 40, -20, 30, 0],
            y: [0, -30, 20, -10, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, transparent 70%)',
            bottom: '-5%',
            left: '-5%',
          }}
          animate={{
            x: [0, -30, 20, -40, 0],
            y: [0, 20, -30, 10, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
            top: '40%',
            left: '30%',
          }}
          animate={{
            x: [0, 30, -20, 40, 0],
            y: [0, -20, 30, -15, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />

        {particles.map((p, i) => (
          <FloatingParticle key={i} {...p} />
        ))}

        {shapes.map((s, i) => (
          <FloatingShape key={`shape-${i}`} {...s} />
        ))}

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 100, damping: 15 }}
        >
          <Link href="/" className="inline-block group">
            <motion.div
              className="relative inline-block"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Logo size="xl" showText white className="justify-center" />
              <motion.div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#14b8a6] to-transparent"
                initial={{ width: 0 }}
                animate={{ width: '80%' }}
                transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
              />
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-[#2580eb]/30 via-[#14b8a6]/30 to-[#7c3aed]/30 opacity-50 blur-sm" />
              <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-[#2580eb]/20 via-[#14b8a6]/20 to-[#7c3aed]/20" />

              <div className="relative rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/[0.12] shadow-2xl shadow-black/30 p-8 md:p-10">
                {children}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.p
          className="text-center mt-6 text-xs text-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          © {new Date().getFullYear()} المنجز AL-MUNJIZ. جميع الحقوق محفوظة
        </motion.p>
      </div>
    </div>
  );
}
