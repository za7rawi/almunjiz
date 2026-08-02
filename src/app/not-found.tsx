'use client';

import { ErrorScreen } from '@/components/ui/error-screen';

export default function NotFound() {
  return <ErrorScreen kind="not-found" />;
}
