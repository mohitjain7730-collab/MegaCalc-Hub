import dynamic from 'next/dynamic';
import { CalculatorLoading } from '@/components/calculator-loading';

/**
 * Creates a safe dynamic import wrapper that handles chunk load errors gracefully
 * Falls back to a loading component if the chunk fails to load
 */
export function createSafeDynamicImport<T = any>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  options?: {
    loading?: () => React.ReactElement | null;
    ssr?: boolean;
  }
) {
  return dynamic(
    () =>
      importFn().catch((error) => {
        // Log the error for debugging
        console.warn('Dynamic import failed, using fallback:', error);
        
        // Return a fallback component that shows loading state
        // This prevents chunk load errors from breaking the page
        return {
          default: () => options?.loading?.() || <CalculatorLoading />,
        };
      }),
    {
      loading: options?.loading || (() => <CalculatorLoading />),
      ssr: options?.ssr ?? false,
    }
  );
}

/**
 * Safe dynamic import for calculator components
 * Wraps the import in error handling to prevent chunk load failures
 */
export function safeImportCalculator(path: string) {
  return createSafeDynamicImport(
    () => import(path),
    {
      loading: () => <CalculatorLoading />,
      ssr: false,
    }
  );
}

