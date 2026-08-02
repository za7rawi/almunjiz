'use client';

import { useEffect } from 'react';
import { ErrorScreen, type ErrorKind } from '@/components/ui/error-screen';
import { useLanguageStore } from '@/store/language-store';

function detectKind(message: string): ErrorKind {
  const lower = message.toLowerCase();
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('load failed') ||
    lower.includes('err_') ||
    lower.includes('offline')
  ) {
    return 'network';
  }
  if (lower.includes('500') || lower.includes('internal server error')) {
    return 'server';
  }
  return 'generic';
}

export default function GlobalError({
  error,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset?: () => void;
}) {
  const { language } = useLanguageStore();
  const isAr = language === 'ar';

  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  const retry = unstable_retry ?? reset;

  return (
    <html lang={isAr ? 'ar' : 'en'} dir={isAr ? 'rtl' : 'ltr'}>
      <body>
        <ErrorScreen kind={detectKind(error?.message || '')} onRetry={retry} />
      </body>
    </html>
  );
}
