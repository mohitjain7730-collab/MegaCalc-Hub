'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { CalculatorLoading } from './calculator-loading';

interface CalculatorWrapperProps {
  componentKey: string;
  calculatorComponents: { [key: string]: ComponentType };
}

export function CalculatorWrapper({ componentKey, calculatorComponents }: CalculatorWrapperProps) {
  const CalculatorComponent = calculatorComponents[componentKey];
  
  if (!CalculatorComponent) {
    return null;
  }

  // Use lazy loading with intersection observer for viewport-based loading
  const LazyComponent = lazy(() => {
    return new Promise<{ default: ComponentType }>((resolve) => {
      // Load immediately but with lower priority
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          resolve({ default: CalculatorComponent });
        }, { timeout: 100 });
      } else {
        setTimeout(() => {
          resolve({ default: CalculatorComponent });
        }, 0);
      }
    });
  });

  return (
    <Suspense fallback={<CalculatorLoading />}>
      <LazyComponent />
    </Suspense>
  );
}

