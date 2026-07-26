"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <Logo size="xl" />
        </motion.div>

        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#2580eb]/10 to-[#14b8a6]/10 flex items-center justify-center">
          <span className="text-5xl font-bold gradient-text">404</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          الصفحة غير موجودة
        </h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى عنوان آخر.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button variant="primary" size="lg" iconLeft={<Home size={18} />}>
              العودة للرئيسية
            </Button>
          </Link>
          <Link href="/services">
            <Button variant="secondary" size="lg" iconLeft={<Search size={18} />}>
              تصفح الخدمات
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
