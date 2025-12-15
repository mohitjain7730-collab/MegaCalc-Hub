'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'ancient-civilization-timeline-generator': lazy(() => import('./ancient-civilization-timeline-generator')),
  'archaeological-site-excavation-calculator': lazy(() => import('./archaeological-site-excavation-calculator')),
  'artifact-dating-calculator': lazy(() => import('./artifact-dating-calculator')),
  'historical-population-density-calculator': lazy(() => import('./historical-population-density-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
