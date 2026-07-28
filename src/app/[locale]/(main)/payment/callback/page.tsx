'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const gatewayId = searchParams.get('gatewayId') || '';
  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  useEffect(() => {
    const params = new URLSearchParams();
    if (orderId) params.set('orderId', orderId);
    if (gatewayId) params.set('gatewayId', gatewayId);

    const qs = params.toString();
    window.location.replace(`/payment/success${qs ? '?' + qs : ''}`);
  }, [orderId, gatewayId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/10">
      <Loader2 className="animate-spin text-[#2580eb] mb-4" size={32} />
      <p className="text-slate-500 dark:text-slate-400 text-sm">{isAr ? 'جارٍ تحميل صفحة الدفع...' : 'Loading payment page...'}</p>
    </div>
  );
}
