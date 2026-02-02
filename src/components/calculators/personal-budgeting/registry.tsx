'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  '50-30-20-budget-calculator': lazy(() => import('./50-30-20-budget-calculator')),
  'dti-ratio-calculator': lazy(() => import('./dti-ratio-calculator')),
  'emergency-fund-goal-calculator': lazy(() => import('./emergency-fund-goal-calculator')),
  'monthly-budget-surplus-deficit-calculator': lazy(() => import('./monthly-budget-surplus-deficit-calculator')),
  'savings-rate-calculator': lazy(() => import('./savings-rate-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
