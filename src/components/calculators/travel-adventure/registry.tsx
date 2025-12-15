'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'adventure-activity-risk-calculator': lazy(() => import('./adventure-activity-risk-calculator')),
  'backpacking-load-weight-calculator': lazy(() => import('./backpacking-load-weight-calculator')),
  'hiking-elevation-gain-calculator': lazy(() => import('./hiking-elevation-gain-calculator')),
  'travel-budget-estimator': lazy(() => import('./travel-budget-estimator')),
  'travel-carbon-footprint-calculator': lazy(() => import('./travel-carbon-footprint-calculator')),
  'travel-time-zone-jet-lag-planner': lazy(() => import('./travel-time-zone-jet-lag-planner')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
