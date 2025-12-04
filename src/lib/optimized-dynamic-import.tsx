import dynamic from 'next/dynamic';
import { CalculatorLoading } from '@/components/calculator-loading';

/**
 * Creates an optimized dynamic import for calculator components
 * - Disables SSR to reduce hydration overhead
 * - Provides loading fallback
 * - Reduces initial bundle size
 */
export function createOptimizedCalculatorImport(importFn: () => Promise<any>) {
  return dynamic(importFn, {
    ssr: false, // Disable SSR to minimize hydration
    loading: () => <CalculatorLoading />,
  });
}

