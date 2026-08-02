'use client';

import { useEffect } from 'react';
import { ErrorScreen, type ErrorKind } from '@/components/ui/error-screen';

function detectKind(message: string): ErrorKind {
  const lower = message.toLowerCase();
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('load failed') ||
    lower.includes('err_') ||
    lower.includes('offline') ||
    lower.includes('network request failed') ||
    lower.includes('fetch failed')
  ) {
    return 'network';
  }
  if (lower.includes('500') || lower.includes('internal server error')) {
    return 'server';
  }
  return 'generic';
}

export default function ErrorBoundary({
  error,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset?: () => void;
}) {
  useEffect(() => {
    console.error('[ErrorBoundary]', error);
  }, [error]);

  const retry = unstable_retry ?? reset;

  return (
    <ErrorScreen
      kind={detectKind(error?.message || '')}
      onRetry={retry}
    />
  );
}
