'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'carbon-footprint-reduction-calculator': lazy(() => import('./carbon-footprint-reduction-calculator')),
  'recycling-impact-calculator': lazy(() => import('./recycling-impact-calculator')),
  'sustainable-diet-impact-calculator': lazy(() => import('./sustainable-diet-impact-calculator')),
  'water-usage-efficiency-calculator': lazy(() => import('./water-usage-efficiency-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
