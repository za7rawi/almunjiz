'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export function RootSplash() {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'gone'>('visible');

  useEffect(() => {
    const timer = setTimeout(() => setPhase('fading'), 250);
    const cleanup = setTimeout(() => setPhase('gone'), 850);
    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
    };
  }, []);

  return (
    <AnimatePresence>
      {phase !== 'gone' && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0a0e27 0%, #0f172a 20%, #1a1040 40%, #0c1445 60%, #0a1628 80%, #0d1117 100%)',
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'fading' ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
              backgroundSize: '36px 36px',
            }}
          />
          <div className="absolute w-[420px] h-[420px] rounded-full bg-[#2580eb]/20 blur-[120px] animate-pulse-glow-premium" />
          <div className="absolute w-[300px] h-[300px] rounded-full bg-[#14b8a6]/15 blur-[100px] animate-orb-1" />

          <motion.div
            className="relative flex flex-col items-center gap-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-[#2580eb]/30 to-[#14b8a6]/30 blur-2xl" />
              <Image
                src="/logo.jpg"
                alt=""
                width={96}
                height={96}
                className="relative w-24 h-24 object-contain rounded-2xl drop-shadow-2xl"
              />
            </div>

            <div className="text-center">
              <p className="text-xl font-extrabold text-white tracking-tight">المنجز</p>
              <p className="text-[11px] text-white/50 tracking-widest uppercase mt-1">AL-MUNJIZ</p>
            </div>

            <div className="w-44 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #2580eb, #14b8a6)' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
