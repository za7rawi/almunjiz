'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  AlertTriangle,
  FileQuestion,
  Home,
  LifeBuoy,
  Lock,
  RotateCcw,
  ShieldX,
  WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { useLanguageStore } from '@/store/language-store';
import { cn } from '@/lib/utils';

export type ErrorKind = 'not-found' | 'unauthorized' | 'forbidden' | 'server' | 'network' | 'generic';

interface ErrorScreenProps {
  kind?: ErrorKind;
  code?: string;
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

const kindConfig: Record<
  ErrorKind,
  {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge: string;
    code: string;
    title: [string, string];
    description: [string, string];
    action: 'home' | 'login' | 'services';
  }
> = {
  'not-found': {
    icon: FileQuestion,
    badge: 'from-[#2580eb]/20 to-[#14b8a6]/20 border-[#2580eb]/40',
    code: '404',
    title: ['الصفحة غير موجودة', 'Page Not Found'],
    description: [
      'يبدو أن الرابط الذي وصلت إليه غير متوفر أو تم نقله. يمكنك العودة إلى الرئيسية أو تصفح خدماتنا.',
      'The page you are looking for does not exist or has been moved. You can return home or browse our services.',
    ],
    action: 'services',
  },
  unauthorized: {
    icon: Lock,
    badge: 'from-amber-500/20 to-orange-500/20 border-amber-500/40',
    code: '401',
    title: ['يتطلب تسجيل الدخول', 'Sign in Required'],
    description: [
      'يجب تسجيل الدخول للوصول إلى هذه الصفحة. سجّل دخولك للمتابعة.',
      'You need to be signed in to access this page. Please sign in to continue.',
    ],
    action: 'login',
  },
  forbidden: {
    icon: ShieldX,
    badge: 'from-red-500/20 to-rose-500/20 border-red-500/40',
    code: '403',
    title: ['الوصول مرفوض', 'Access Denied'],
    description: [
      'عذراً، لا تملك صلاحية الوصول إلى هذه الصفحة. إذا كنت تعتقد أن هذا خطأ، تواصل مع فريق الدعم.',
      'You do not have permission to access this page. If you believe this is a mistake, please contact support.',
    ],
    action: 'home',
  },
  server: {
    icon: AlertTriangle,
    badge: 'from-amber-500/20 to-red-500/20 border-amber-500/40',
    code: '500',
    title: ['حدث خطأ غير متوقع', 'Unexpected Error'],
    description: [
      'حدث خطأ ما أثناء معالجة طلبك. حاول مرة أخرى، وإذا استمرت المشكلة تواصل مع فريق الدعم.',
      'Something went wrong while processing your request. Please try again, or contact support if the problem persists.',
    ],
    action: 'home',
  },
  network: {
    icon: WifiOff,
    badge: 'from-slate-500/20 to-[#2580eb]/20 border-slate-400/40',
    code: 'NET',
    title: ['انقطاع الاتصال بالشبكة', 'No Internet Connection'],
    description: [
      'تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت ثم أعد المحاولة.',
      'Unable to reach the server. Please check your internet connection and try again.',
    ],
    action: 'home',
  },
  generic: {
    icon: AlertTriangle,
    badge: 'from-amber-500/20 to-orange-500/20 border-amber-500/40',
    code: '',
    title: ['تعذر إتمام العملية', 'Unable to Complete the Request'],
    description: [
      'يرجى المحاولة مرة أخرى، وإذا استمرت المشكلة يمكنك التواصل مع فريق الدعم.',
      'Please try again. If the problem persists, you can contact our support team.',
    ],
    action: 'home',
  },
};

export function ErrorScreen({ kind = 'generic', code, title, description, onRetry, className }: ErrorScreenProps) {
  const { language } = useLanguageStore();
  const isAr = language === 'ar';
  const config = kindConfig[kind];
  const Icon = config.icon;
  const displayCode = code || config.code;
  const displayTitle = title || (isAr ? config.title[0] : config.title[1]);
  const displayDescription = description || (isAr ? config.description[0] : config.description[1]);

  const primaryHref = config.action === 'login' ? '/login' : config.action === 'services' ? '/services' : '/';

  return (
    <div
      className={cn('relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-10', className)}
      style={{
        background:
          'linear-gradient(135deg, #0a0e27 0%, #0f172a 20%, #1a1040 40%, #0c1445 60%, #0a1628 80%, #0d1117 100%)',
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#2580eb]/10 rounded-full blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#7c3aed]/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-md w-full"
      >
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <Logo size="xl" showText white />
        </motion.div>

        <motion.div
          className={cn(
            'w-24 h-24 mx-auto mb-6 rounded-full border bg-gradient-to-br flex items-center justify-center',
            config.badge,
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
        >
          <Icon size={44} className="text-white/90" />
        </motion.div>

        {displayCode && (
          <motion.span
            className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/70 text-xs font-bold tracking-widest mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            {displayCode}
          </motion.span>
        )}

        <motion.h1
          className="text-3xl font-bold text-white mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {displayTitle}
        </motion.h1>
        <motion.p
          className="text-white/60 mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {displayDescription}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {onRetry ? (
            <Button variant="primary" size="lg" onClick={onRetry} iconLeft={<RotateCcw size={18} />}>
              {isAr ? 'إعادة المحاولة' : 'Try Again'}
            </Button>
          ) : (
            <Link href={primaryHref} tabIndex={-1}>
              <Button
                variant="primary"
                size="lg"
                iconLeft={config.action === 'login' ? <Lock size={18} /> : <Home size={18} />}
              >
                {config.action === 'login'
                  ? isAr
                    ? 'تسجيل الدخول'
                    : 'Sign In'
                  : config.action === 'services'
                    ? isAr
                      ? 'استعراض خدماتنا'
                      : 'Browse Services'
                    : isAr
                      ? 'العودة للرئيسية'
                      : 'Back to Home'}
              </Button>
            </Link>
          )}
          <Link href="/contact" tabIndex={-1}>
            <Button variant="secondary" size="lg" iconLeft={<LifeBuoy size={18} />}>
              {isAr ? 'التواصل مع الدعم' : 'Contact Support'}
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
