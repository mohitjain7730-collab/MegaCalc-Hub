'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'batting-average-calculator': lazy(() => import('./batting-average-calculator')),
  'bowling-average-calculator': lazy(() => import('./bowling-average-calculator')),
  'bowling-economy-rate-calculator': lazy(() => import('./bowling-economy-rate-calculator')),
  'fantasy-points-calculator': lazy(() => import('./fantasy-points-calculator')),
  'net-run-rate-calculator': lazy(() => import('./net-run-rate-calculator')),
  'player-performance-index-calculator': lazy(() => import('./player-performance-index-calculator')),
  'required-run-rate-calculator': lazy(() => import('./required-run-rate-calculator')),
  'strike-rate-calculator': lazy(() => import('./strike-rate-calculator')),
  'team-run-rate-calculator': lazy(() => import('./team-run-rate-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
