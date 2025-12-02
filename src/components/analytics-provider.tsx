'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { logEvent } from 'firebase/analytics';
import { useFirebase } from '@/firebase';

export function AnalyticsProvider({children}: {children: React.ReactNode}) {
  const { analytics } = useFirebase();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    // Only log if pathname actually changed and analytics is available
    if (analytics && typeof window !== 'undefined') {
      const url = pathname + (searchParams?.toString() || '');
      
      // Debounce: only log if pathname changed
      if (url !== lastPathRef.current) {
        lastPathRef.current = url;
        
        // Use requestIdleCallback for non-critical analytics
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            logEvent(analytics, 'page_view', { page_path: url });
          }, { timeout: 2000 });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => {
            logEvent(analytics, 'page_view', { page_path: url });
          }, 100);
        }
      }
    }
  }, [pathname, searchParams, analytics]);

  return <>{children}</>;
}
