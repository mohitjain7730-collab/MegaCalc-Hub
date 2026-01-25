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
  'fortnite-dps-calculator': lazy(() => import('./fortnite-dps-calculator')),
  'fortnite-build-material-cost-calculator': lazy(() => import('./fortnite-build-material-cost-calculator')),
  'fortnite-storm-surge-timer': lazy(() => import('./fortnite-storm-surge-timer')),
  'fortnite-xp-per-match-optimizer': lazy(() => import('./fortnite-xp-per-match-optimizer')),
  'fortnite-reload-time-reducer-calculator': lazy(() => import('./fortnite-reload-time-reducer-calculator')),
  'fortnite-loot-drop-odds-estimator': lazy(() => import('./fortnite-loot-drop-odds-estimator')),
  'fortnite-shield-potency-calculator': lazy(() => import('./fortnite-shield-potency-calculator')),
  'fortnite-victory-royale-probability-estimator': lazy(() => import('./fortnite-victory-royale-probability-estimator')),
  'minecraft-farm-yield-calculator': lazy(() => import('./minecraft-farm-yield-calculator')),
  'minecraft-enchanting-odds-predictor': lazy(() => import('./minecraft-enchanting-odds-predictor')),
  'minecraft-villager-trade-tracker': lazy(() => import('./minecraft-villager-trade-tracker')),
  'minecraft-smelter-fuel-efficiency': lazy(() => import('./minecraft-smelter-fuel-efficiency')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
