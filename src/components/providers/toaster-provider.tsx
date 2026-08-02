'use client';

import { Toaster } from 'sonner';

export function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      dir="rtl"
      gap={10}
      offset={16}
      toastOptions={{
        duration: 4500,
      }}
      style={{ zIndex: 9999 }}
      containerAriaLabel="الإشعارات"
    />
  );
}
