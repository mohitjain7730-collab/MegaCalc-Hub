'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'annealing-temperature-calculator': lazy(() => import('./annealing-temperature-calculator')),
  'cell-dilution-calculator': lazy(() => import('./cell-dilution-calculator')),
  'cell-doubling-time-calculator': lazy(() => import('./cell-doubling-time-calculator')),
  'dna-concentration-calculator': lazy(() => import('./dna-concentration-calculator')),
  'generation-time-calculator': lazy(() => import('./generation-time-calculator')),
  'ligation-calculator': lazy(() => import('./ligation-calculator')),
  'log-reduction-calculator': lazy(() => import('./log-reduction-calculator')),
  'protein-concentration-calculator': lazy(() => import('./protein-concentration-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
