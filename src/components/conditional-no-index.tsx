'use client';

import { usePathname } from 'next/navigation';

export function ConditionalNoIndex() {
  const pathname = usePathname();
  const isLearningHub = pathname.startsWith('/learning-hub');

  if (isLearningHub) {
    return <meta name="robots" content="noindex, follow" />;
  }

  return null;
}
