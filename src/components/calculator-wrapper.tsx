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
// Function to dynamically import calculator component
// Using template literals here works in Client Components at runtime
// Next.js will bundle all calculator components together for code splitting
// Added explicit switch map to prevent Webpack from eagerly bundling ALL calculators into one context
function getCalculatorImport(categorySlug: string, calculatorSlug: string): Promise<{ default: ComponentType }> {
  // Validate inputs to prevent undefined variable errors
  if (!categorySlug || !calculatorSlug) {
    return Promise.reject(new Error('Invalid category or calculator slug'));
  }

  // Helper to handle chunk errors gracefully
  const handleImportError = (error: any): Promise<{ default: ComponentType }> => {
    if (isChunkError(error)) {
      // For chunk errors, let the global handler manage reloads
      // Return loading component as fallback
      console.warn('Chunk error in calculator import, using fallback');
      return Promise.resolve({ default: CalculatorLoading });
    }
    // For other errors, log and return loading component
    console.error(`Failed to import calculator: ${categorySlug}/${calculatorSlug}`, error);
    return Promise.resolve({ default: CalculatorLoading });
  };

  // Wellness calculators special handling
  if (categorySlug === 'wellness') {
    // Pattern: replace -calculator with -wellness-calculator, or append -wellness-calculator
    const wellnessSuffixPath = calculatorSlug.endsWith('-calculator')
      ? calculatorSlug.replace('-calculator', '-wellness-calculator')
      : `${calculatorSlug}-wellness-calculator`;

    // Try wellness-suffixed version first, fall back to regular slug
    // Explicitly use 'health-fitness' directory to avoid generic wildcard
    return import(`@/components/calculators/health-fitness/${wellnessSuffixPath}`)
      .catch((error) => {
        if (isChunkError(error)) {
          return handleImportError(error);
        }
        return import(`@/components/calculators/health-fitness/${calculatorSlug}`)
          .catch(handleImportError);
      });
  }

  // For other categories, use explicit switch to segment Webpack contexts
  // This prevents the "over-eager" bundling of thousands of components
  switch (categorySlug) {
    case 'biology': return import(`@/components/calculators/biology/${calculatorSlug}`).catch(handleImportError);
    case 'business-startup': return import(`@/components/calculators/business-startup/${calculatorSlug}`).catch(handleImportError);
    case 'cognitive-psychology': return import(`@/components/calculators/cognitive-psychology/${calculatorSlug}`).catch(handleImportError);
    case 'conversions': return import(`@/components/calculators/conversions/${calculatorSlug}`).catch(handleImportError);
    case 'cooking-food': return import(`@/components/calculators/cooking-food/${calculatorSlug}`).catch(handleImportError);
    case 'cricket': return import(`@/components/calculators/cricket/${calculatorSlug}`).catch(handleImportError);
    case 'crypto-web3': return import(`@/components/calculators/crypto-web3/${calculatorSlug}`).catch(handleImportError);
    case 'engineering': return import(`@/components/calculators/engineering/${calculatorSlug}`).catch(handleImportError);
    case 'environment': return import(`@/components/calculators/environment/${calculatorSlug}`).catch(handleImportError);
    case 'finance': return import(`@/components/calculators/finance/${calculatorSlug}`).catch(handleImportError);
    case 'fun-games': return import(`@/components/calculators/fun-games/${calculatorSlug}`).catch(handleImportError);
    case 'genetic-ancestry': return import(`@/components/calculators/genetic-ancestry/${calculatorSlug}`).catch(handleImportError);
    case 'health-fitness': return import(`@/components/calculators/health-fitness/${calculatorSlug}`).catch(handleImportError);
    case 'historical-archaeological': return import(`@/components/calculators/historical-archaeological/${calculatorSlug}`).catch(handleImportError);
    case 'home-improvement': return import(`@/components/calculators/home-improvement/${calculatorSlug}`).catch(handleImportError);
    case 'parenting': return import(`@/components/calculators/parenting/${calculatorSlug}`).catch(handleImportError);
    case 'personal-budgeting': return import(`@/components/calculators/personal-budgeting/${calculatorSlug}`).catch(handleImportError);
    case 'sports-training': return import(`@/components/calculators/sports-training/${calculatorSlug}`).catch(handleImportError);
    case 'technology': return import(`@/components/calculators/technology/${calculatorSlug}`).catch(handleImportError);
    case 'time-date': return import(`@/components/calculators/time-date/${calculatorSlug}`).catch(handleImportError);
    case 'travel-adventure': return import(`@/components/calculators/travel-adventure/${calculatorSlug}`).catch(handleImportError);

    default:
      console.warn(`Category not handled in explicit import: ${categorySlug}`);
      return Promise.resolve({ default: CalculatorLoading });
  }
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

