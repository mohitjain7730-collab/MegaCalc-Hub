'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'age-calculator': lazy(() => import('./age-calculator')),
  'date-difference-calculator': lazy(() => import('./date-difference-calculator')),
  'day-of-the-week-calculator': lazy(() => import('./day-of-the-week-calculator')),
  'working-days-business-days-calculator': lazy(() => import('./working-days-business-days-calculator')),
  'world-time-zone-converter': lazy(() => import('./world-time-zone-converter')),

  // Employment Calculators (categorized under Time & Date)
  'contract-duration-calculator': lazy(() => import('../employment/contract-duration-calculator')),
  'employment-anniversary-calculator': lazy(() => import('../employment/employment-anniversary-calculator')),
  'freelance-billable-hours-calculator': lazy(() => import('../employment/freelance-billable-hours-calculator')),
  'last-working-day-calculator': lazy(() => import('../employment/last-working-day-calculator')),
  'night-shift-duration-calculator': lazy(() => import('../employment/night-shift-duration-calculator')),
  'notice-period-calculator': lazy(() => import('../employment/notice-period-calculator')),
  'probation-period-calculator': lazy(() => import('../employment/probation-period-calculator')),
  'remote-work-time-zone-overlap-calculator': lazy(() => import('../employment/remote-work-time-zone-overlap-calculator')),
  'shift-rotation-calculator': lazy(() => import('../employment/shift-rotation-calculator')),
  'split-shift-hours-calculator': lazy(() => import('../employment/split-shift-hours-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
