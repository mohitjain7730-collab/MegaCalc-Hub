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
        
        // Defer analytics even more aggressively to reduce TBT
        // Wait for page to be fully interactive
        const logAnalytics = () => {
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
              logEvent(analytics, 'page_view', { page_path: url });
            }, { timeout: 5000 });
          } else {
            setTimeout(() => {
              logEvent(analytics, 'page_view', { page_path: url });
            }, 2000);
          }
        };

        // Wait for page load and then defer
        if (document.readyState === 'complete') {
          logAnalytics();
        } else {
          window.addEventListener('load', logAnalytics, { once: true });
        }
      }
    }
  }, [pathname, searchParams, analytics]);

  return <>{children}</>;
}
