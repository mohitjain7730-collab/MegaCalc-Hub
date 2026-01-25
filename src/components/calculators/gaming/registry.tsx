'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'roblox-egg-hatch-odds-simulator': lazy(() => import('./roblox-egg-hatch-odds-simulator')),
  'roblox-pet-value-calculator': lazy(() => import('./roblox-pet-value-calculator')),
  'roblox-trading-profit-analyzer': lazy(() => import('./roblox-trading-profit-analyzer')),
  'roblox-gamepass-roi-calculator': lazy(() => import('./roblox-gamepass-roi-calculator')),
  'roblox-pet-dupe-value-calculator': lazy(() => import('./roblox-pet-dupe-value-calculator')),
  'roblox-limited-item-resale-predictor': lazy(() => import('./roblox-limited-item-resale-predictor')),
  'roblox-inventory-value-estimator': lazy(() => import('./roblox-inventory-value-estimator')),
  'roblox-trade-tax-calculator': lazy(() => import('./roblox-trade-tax-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
