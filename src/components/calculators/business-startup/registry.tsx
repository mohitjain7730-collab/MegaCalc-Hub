'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'break-even-point-calculator': lazy(() => import('./break-even-point-calculator')),
  'break-even-sales-dollar-calculator': lazy(() => import('./break-even-sales-dollar-calculator')),
  'contribution-margin-calculator': lazy(() => import('./contribution-margin-calculator')),
  'customer-acquisition-cost-calculator': lazy(() => import('./customer-acquisition-cost-calculator')),
  'dscr-calculator': lazy(() => import('./dscr-calculator')),
  'lifetime-value-calculator': lazy(() => import('./lifetime-value-calculator')),
  'operating-leverage-calculator': lazy(() => import('./operating-leverage-calculator')),
  'roi-calculator': lazy(() => import('./roi-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
