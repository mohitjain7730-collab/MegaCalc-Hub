'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'backpack-weight-calculator': lazy(() => import('./backpack-weight-calculator')),
  'bus-vs-train-cost-calculator': lazy(() => import('./bus-vs-train-cost-calculator')),
  'car-vs-flight-calculator': lazy(() => import('./car-vs-flight-calculator')),
  'cost-per-mile-calculator': lazy(() => import('./cost-per-mile-calculator')),
  'cruise-cost-calculator': lazy(() => import('./cruise-cost-calculator')),
  'distance-between-cities-calculator': lazy(() => import('./distance-between-cities-calculator')),
  'driving-time-with-breaks-calculator': lazy(() => import('./driving-time-with-breaks-calculator')),
  'ev-charging-cost-calculator': lazy(() => import('./ev-charging-cost-calculator')),
  'flight-duration-calculator': lazy(() => import('./flight-duration-calculator')),
  'fuel-cost-calculator': lazy(() => import('./fuel-cost-calculator')),
  'group-expense-splitter': lazy(() => import('./group-expense-splitter')),
  'hiking-calorie-calculator': lazy(() => import('./hiking-calorie-calculator')),
  'hiking-time-calculator': lazy(() => import('./hiking-time-calculator')),
  'hotel-cost-calculator': lazy(() => import('./hotel-cost-calculator')),
  'itinerary-time-planner': lazy(() => import('./itinerary-time-planner')),
  'jet-lag-calculator': lazy(() => import('./jet-lag-calculator')),
  'layover-time-calculator': lazy(() => import('./layover-time-calculator')),
  'multi-stop-route-planner': lazy(() => import('./multi-stop-route-planner')),
  'rental-car-cost-calculator': lazy(() => import('./rental-car-cost-calculator')),
  'time-zone-difference-calculator': lazy(() => import('./time-zone-difference-calculator')),
  'travel-buffer-time-calculator': lazy(() => import('./travel-buffer-time-calculator')),
  'travel-days-calculator': lazy(() => import('./travel-days-calculator')),
  'travel-time-calculator': lazy(() => import('./travel-time-calculator')),
  'trip-budget-calculator': lazy(() => import('./trip-budget-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
