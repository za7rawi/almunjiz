'use client';

import { ErrorScreen } from '@/components/ui/error-screen';

export default function Unauthorized() {
  return <ErrorScreen kind="unauthorized" />;
}
