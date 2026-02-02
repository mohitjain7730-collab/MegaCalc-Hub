'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'fortnite-build-material-cost-calculator': lazy(() => import('./fortnite-build-material-cost-calculator')),
  'fortnite-dps-calculator': lazy(() => import('./fortnite-dps-calculator')),
  'fortnite-loot-drop-odds-estimator': lazy(() => import('./fortnite-loot-drop-odds-estimator')),
  'fortnite-reload-time-reducer-calculator': lazy(() => import('./fortnite-reload-time-reducer-calculator')),
  'fortnite-shield-potency-calculator': lazy(() => import('./fortnite-shield-potency-calculator')),
  'fortnite-storm-surge-timer': lazy(() => import('./fortnite-storm-surge-timer')),
  'fortnite-victory-royale-probability-estimator': lazy(() => import('./fortnite-victory-royale-probability-estimator')),
  'fortnite-xp-per-match-optimizer': lazy(() => import('./fortnite-xp-per-match-optimizer')),
  'minecraft-beacon-range-optimizer': lazy(() => import('./minecraft-beacon-range-optimizer')),
  'minecraft-enchanting-odds-predictor': lazy(() => import('./minecraft-enchanting-odds-predictor')),
  'minecraft-farm-yield-calculator': lazy(() => import('./minecraft-farm-yield-calculator')),
  'minecraft-mob-farm-xp-rate-calculator': lazy(() => import('./minecraft-mob-farm-xp-rate-calculator')),
  'minecraft-nether-portal-linkage-estimator': lazy(() => import('./minecraft-nether-portal-linkage-estimator')),
  'minecraft-redstone-signal-delay-calculator': lazy(() => import('./minecraft-redstone-signal-delay-calculator')),
  'minecraft-smelter-fuel-efficiency': lazy(() => import('./minecraft-smelter-fuel-efficiency')),
  'minecraft-tree-farm-output-calculator': lazy(() => import('./minecraft-tree-farm-output-calculator')),
  'minecraft-villager-trade-tracker': lazy(() => import('./minecraft-villager-trade-tracker')),
  'roblox-adopt-me-neon-pet-value-calculator': lazy(() => import('./roblox-adopt-me-neon-pet-value-calculator')),
  'roblox-adopt-me-mega-neon-value-calculator': lazy(() => import('./roblox-adopt-me-mega-neon-value-calculator')),
  'roblox-egg-hatch-odds-simulator': lazy(() => import('./roblox-egg-hatch-odds-simulator')),
  'roblox-gamepass-roi-calculator': lazy(() => import('./roblox-gamepass-roi-calculator')),
  'roblox-inventory-value-estimator': lazy(() => import('./roblox-inventory-value-estimator')),
  'roblox-limited-item-resale-predictor': lazy(() => import('./roblox-limited-item-resale-predictor')),
  'roblox-pet-dupe-value-calculator': lazy(() => import('./roblox-pet-dupe-value-calculator')),
  'roblox-pet-value-calculator': lazy(() => import('./roblox-pet-value-calculator')),
  'roblox-trade-tax-calculator': lazy(() => import('./roblox-trade-tax-calculator')),
  'roblox-trading-profit-analyzer': lazy(() => import('./roblox-trading-profit-analyzer')),
  'valorant-rank-progression': lazy(() => import('./valorant-rank-progression')),
  'valorant-rr-predictor': lazy(() => import('./valorant-rr-predictor')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
