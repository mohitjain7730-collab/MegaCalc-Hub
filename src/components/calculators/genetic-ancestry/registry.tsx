'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'ancestry-composition-estimator': lazy(() => import('./ancestry-composition-estimator')),
  'genealogy-timeline-generator': lazy(() => import('./genealogy-timeline-generator')),
  'genetic-trait-probability-calculator': lazy(() => import('./genetic-trait-probability-calculator')),
  'pedigree-analysis-calculator': lazy(() => import('./pedigree-analysis-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
