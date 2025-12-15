'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'beam-bending-calculator': lazy(() => import('./beam-bending-calculator')),
  'cantilever-beam-deflection-calculator': lazy(() => import('./cantilever-beam-deflection-calculator')),
  'compressive-stress-calculator': lazy(() => import('./compressive-stress-calculator')),
  'electrical-power-calculator': lazy(() => import('./electrical-power-calculator')),
  'heat-transfer-calculator': lazy(() => import('./heat-transfer-calculator')),
  'hydraulic-pipe-flow-calculator': lazy(() => import('./hydraulic-pipe-flow-calculator')),
  'natural-frequency-calculator': lazy(() => import('./natural-frequency-calculator')),
  'reynolds-number-calculator': lazy(() => import('./reynolds-number-calculator')),
  'shear-stress-calculator': lazy(() => import('./shear-stress-calculator')),
  'thermal-expansion-calculator': lazy(() => import('./thermal-expansion-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
