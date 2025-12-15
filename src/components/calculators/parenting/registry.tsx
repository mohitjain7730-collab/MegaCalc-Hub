'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'baby-feeding-amount-calculator': lazy(() => import('./baby-feeding-amount-calculator')),
  'childcare-cost-affordability-calculator': lazy(() => import('./childcare-cost-affordability-calculator')),
  'college-savings-goal-calculator': lazy(() => import('./college-savings-goal-calculator')),
  'due-date-calculator': lazy(() => import('./due-date-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
