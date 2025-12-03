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
  // Construct the import path dynamically using template literal
  // This works at runtime in Client Components
  return import(`@/components/calculators/${categorySlug}/${calculatorSlug}`);
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

