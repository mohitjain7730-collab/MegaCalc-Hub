'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'contract-duration-calculator': lazy(() => import('./contract-duration-calculator')),
  'employment-anniversary-calculator': lazy(() => import('./employment-anniversary-calculator')),
  'freelance-billable-hours-calculator': lazy(() => import('./freelance-billable-hours-calculator')),
  'last-working-day-calculator': lazy(() => import('./last-working-day-calculator')),
  'night-shift-duration-calculator': lazy(() => import('./night-shift-duration-calculator')),
  'notice-period-calculator': lazy(() => import('./notice-period-calculator')),
  'probation-period-calculator': lazy(() => import('./probation-period-calculator')),
  'remote-work-time-zone-overlap-calculator': lazy(() => import('./remote-work-time-zone-overlap-calculator')),
  'shift-rotation-calculator': lazy(() => import('./shift-rotation-calculator')),
  'split-shift-hours-calculator': lazy(() => import('./split-shift-hours-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
