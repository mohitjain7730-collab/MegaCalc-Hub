'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'age-calculator': lazy(() => import('./age-calculator')),
  'date-difference-calculator': lazy(() => import('./date-difference-calculator')),
  'day-of-the-week-calculator': lazy(() => import('./day-of-the-week-calculator')),
  'working-days-business-days-calculator': lazy(() => import('./working-days-business-days-calculator')),
  'world-time-zone-converter': lazy(() => import('./world-time-zone-converter')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
