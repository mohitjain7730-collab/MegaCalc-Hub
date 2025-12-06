'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { CalculatorLoading } from './calculator-loading';

interface CalculatorWrapperProps {
  categorySlug: string;
  calculatorSlug: string;
}

// Function to check if an error is a chunk load error
function isChunkError(error: any): boolean {
  if (!error) return false;
  const msg = error?.message || '';
  const name = error?.name || '';
  return msg.includes('Loading chunk') ||
         msg.includes('ChunkLoadError') ||
         msg.includes('Failed to fetch dynamically imported module') ||
         msg.includes('timeout') ||
         name === 'ChunkLoadError' ||
         /chunk.*failed/i.test(msg) ||
         /loading.*chunk/i.test(msg);
}

// Function to dynamically import calculator component
// Using template literals here works in Client Components at runtime
// Next.js will bundle all calculator components together for code splitting
// Added error handling to prevent chunk load errors for missing calculators
function getCalculatorImport(categorySlug: string, calculatorSlug: string): Promise<{ default: ComponentType }> {
  // Validate inputs to prevent undefined variable errors
  if (!categorySlug || !calculatorSlug) {
    return Promise.reject(new Error('Invalid category or calculator slug'));
  }

  // Wellness calculators are stored in the health-fitness folder
  // Some wellness calculators have a -wellness-calculator suffix in their filename
  const actualCategory = categorySlug === 'wellness' ? 'health-fitness' : categorySlug;
  
  // Helper to handle chunk errors gracefully
  const handleImportError = (error: any): Promise<{ default: ComponentType }> => {
    if (isChunkError(error)) {
      // For chunk errors, let the global handler manage reloads
      // Return loading component as fallback
      console.warn('Chunk error in calculator import, using fallback');
      return Promise.resolve({ default: CalculatorLoading });
    }
    // For other errors, return loading component
    return Promise.resolve({ default: CalculatorLoading });
  };
  
  // For wellness calculators, try the wellness-suffixed version first, then the regular slug
  if (categorySlug === 'wellness') {
    // Pattern: replace -calculator with -wellness-calculator, or append -wellness-calculator
    const wellnessSuffixPath = calculatorSlug.endsWith('-calculator')
      ? calculatorSlug.replace('-calculator', '-wellness-calculator')
      : `${calculatorSlug}-wellness-calculator`;
    
    // Try wellness-suffixed version first, fall back to regular slug
    return import(`@/components/calculators/${actualCategory}/${wellnessSuffixPath}`)
      .catch((error) => {
        if (isChunkError(error)) {
          return handleImportError(error);
        }
        return import(`@/components/calculators/${actualCategory}/${calculatorSlug}`)
          .catch((error2) => {
            if (isChunkError(error2)) {
              return handleImportError(error2);
            }
            // Final fallback: return a loading component if calculator doesn't exist
            return Promise.resolve({ default: CalculatorLoading });
          });
      });
  }
  
  // For non-wellness calculators, try import with error handling
  return import(`@/components/calculators/${actualCategory}/${calculatorSlug}`)
    .catch((error) => {
      console.error(`Failed to import calculator: ${actualCategory}/${calculatorSlug}`, error);
      if (isChunkError(error)) {
        return handleImportError(error);
      }
      // Fallback to loading component if calculator doesn't exist
      return Promise.resolve({ default: CalculatorLoading });
    });
}

export function CalculatorWrapper({ categorySlug, calculatorSlug }: CalculatorWrapperProps) {
  // Dynamically import the calculator component on the client side
  // Using React.lazy for code splitting - Next.js will automatically optimize chunk loading
  const LazyComponent = lazy(() => getCalculatorImport(categorySlug, calculatorSlug));

  // The loading skeleton is rendered immediately in the HTML (SSR)
  // This ensures the LCP element (calculator container) has content immediately
  return (
    <div style={{ minHeight: '500px', width: '100%' }}>
      <Suspense fallback={<CalculatorLoading />}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}

