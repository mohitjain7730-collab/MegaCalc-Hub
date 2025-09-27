'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { logEvent } from 'firebase/analytics';
import { useFirebase } from '@/firebase';

export function AnalyticsProvider({children}: {children: React.ReactNode}) {
  const { analytics } = useFirebase();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (analytics && typeof window !== 'undefined') {
      const url = pathname + searchParams.toString();
      logEvent(analytics, 'page_view', { page_path: url });
    }
  }, [pathname, searchParams, analytics]);

  return <>{children}</>;
}
