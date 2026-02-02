'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'concrete-volume-calculator': lazy(() => import('./concrete-volume-calculator')),
  'cost-estimator-renovation-calculator': lazy(() => import('./cost-estimator-renovation-calculator')),
  'decking-materials-calculator': lazy(() => import('./decking-materials-calculator')),
  'door-cabinet-hardware-calculator': lazy(() => import('./door-cabinet-hardware-calculator')),
  'drywall-plasterboard-calculator': lazy(() => import('./drywall-plasterboard-calculator')),
  'garden-landscape-soil-mulch-calculator': lazy(() => import('./garden-landscape-soil-mulch-calculator')),
  'hvac-sizing-calculator': lazy(() => import('./hvac-sizing-calculator')),
  'insulation-r-value-calculator': lazy(() => import('./insulation-r-value-calculator')),
  'lighting-layout-calculator': lazy(() => import('./lighting-layout-calculator')),
  'paint-coverage-calculator': lazy(() => import('./paint-coverage-calculator')),
  'paint-drying-curing-time-calculator': lazy(() => import('./paint-drying-curing-time-calculator')),
  'roofing-shingle-calculator': lazy(() => import('./roofing-shingle-calculator')),
  'staircase-rise-run-calculator': lazy(() => import('./staircase-rise-run-calculator')),
  'tile-flooring-calculator': lazy(() => import('./tile-flooring-calculator')),
  'wall-framing-lumber-calculator': lazy(() => import('./wall-framing-lumber-calculator')),
  'wallpaper-roll-calculator': lazy(() => import('./wallpaper-roll-calculator')),
  'water-usage-plumbing-flow-calculator': lazy(() => import('./water-usage-plumbing-flow-calculator')),
  'window-glass-curtain-coverage-calculator': lazy(() => import('./window-glass-curtain-coverage-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
