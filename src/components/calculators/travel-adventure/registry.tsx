'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'distance-between-cities-calculator': lazy(() => import('./distance-between-cities-calculator')),
  'driving-time-with-breaks-calculator': lazy(() => import('./driving-time-with-breaks-calculator')),
  'flight-duration-calculator': lazy(() => import('./flight-duration-calculator')),
  'itinerary-time-planner': lazy(() => import('./itinerary-time-planner')),
  'jet-lag-calculator': lazy(() => import('./jet-lag-calculator')),
  'layover-time-calculator': lazy(() => import('./layover-time-calculator')),
  'time-zone-difference-calculator': lazy(() => import('./time-zone-difference-calculator')),
  'travel-buffer-time-calculator': lazy(() => import('./travel-buffer-time-calculator')),
  'travel-days-calculator': lazy(() => import('./travel-days-calculator')),
  'travel-time-calculator': lazy(() => import('./travel-time-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
