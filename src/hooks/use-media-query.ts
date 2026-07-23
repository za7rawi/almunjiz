'use client';

import { useSyncExternalStore } from 'react';

function subscribeToMediaQuery(query: string, callback: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getMediaSnapshot(query: string) {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(query).matches;
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => subscribeToMediaQuery(query, callback),
    () => getMediaSnapshot(query),
    () => false,
  );
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
