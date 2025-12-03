'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { CalculatorLoading } from './calculator-loading';

interface CalculatorWrapperProps {
  categorySlug: string;
  calculatorSlug: string;
}

// Function to dynamically import calculator component
// Using template literals here works in Client Components at runtime
// Next.js will bundle all calculator components together for code splitting
function getCalculatorImport(categorySlug: string, calculatorSlug: string): Promise<{ default: ComponentType }> {
  // Wellness calculators are stored in the health-fitness folder
  // Some wellness calculators have a -wellness-calculator suffix in their filename
  const actualCategory = categorySlug === 'wellness' ? 'health-fitness' : categorySlug;
  
  // For wellness calculators, try the wellness-suffixed version first, then the regular slug
  if (categorySlug === 'wellness') {
    // Pattern: replace -calculator with -wellness-calculator, or append -wellness-calculator
    const wellnessSuffixPath = calculatorSlug.endsWith('-calculator')
      ? calculatorSlug.replace('-calculator', '-wellness-calculator')
      : `${calculatorSlug}-wellness-calculator`;
    
    // Try wellness-suffixed version first, fall back to regular slug
    return import(`@/components/calculators/${actualCategory}/${wellnessSuffixPath}`).catch(() => {
      return import(`@/components/calculators/${actualCategory}/${calculatorSlug}`);
    });
  }
  
  return import(`@/components/calculators/${actualCategory}/${calculatorSlug}`);
}

export function CalculatorWrapper({ categorySlug, calculatorSlug }: CalculatorWrapperProps) {
  // Dynamically import the calculator component on the client side
  const LazyComponent = lazy(() => getCalculatorImport(categorySlug, calculatorSlug));

  return (
    <Suspense fallback={<CalculatorLoading />}>
      <LazyComponent />
    </Suspense>
  );
}

