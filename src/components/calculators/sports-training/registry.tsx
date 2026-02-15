'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'batting-average-calculator-interactive': lazy(() => import('./batting-average-calculator-interactive')),
  'batting-average-calculator': lazy(() => import('./batting-average-calculator')),
  'boundary-percentage-calculator-interactive': lazy(() => import('./boundary-percentage-calculator-interactive')),
  'boundary-percentage-calculator': lazy(() => import('./boundary-percentage-calculator')),
  'bowling-average-calculator-interactive': lazy(() => import('./bowling-average-calculator-interactive')),
  'bowling-average-calculator': lazy(() => import('./bowling-average-calculator')),
  'bowling-economy-rate-calculator-interactive': lazy(() => import('./bowling-economy-rate-calculator-interactive')),
  'bowling-economy-rate-calculator': lazy(() => import('./bowling-economy-rate-calculator')),
  'bowling-strike-rate-calculator-interactive': lazy(() => import('./bowling-strike-rate-calculator-interactive')),
  'bowling-strike-rate-calculator': lazy(() => import('./bowling-strike-rate-calculator')),
  'cricket-fantasy-points-calculator-interactive': lazy(() => import('./cricket-fantasy-points-calculator-interactive')),
  'cricket-fantasy-points-calculator': lazy(() => import('./cricket-fantasy-points-calculator')),
  'cricket-partnership-run-rate-calculator-interactive': lazy(() => import('./cricket-partnership-run-rate-calculator-interactive')),
  'cricket-partnership-run-rate-calculator': lazy(() => import('./cricket-partnership-run-rate-calculator')),
  'cricket-player-performance-index-calculator-interactive': lazy(() => import('./cricket-player-performance-index-calculator-interactive')),
  'cricket-player-performance-index-calculator': lazy(() => import('./cricket-player-performance-index-calculator')),
  'cricket-win-probability-calculator-interactive': lazy(() => import('./cricket-win-probability-calculator-interactive')),
  'cricket-win-probability-calculator': lazy(() => import('./cricket-win-probability-calculator')),
  'dot-ball-percentage-calculator-interactive': lazy(() => import('./dot-ball-percentage-calculator-interactive')),
  'dot-ball-percentage-calculator': lazy(() => import('./dot-ball-percentage-calculator')),
  'football-goal-conversion-rate-calculator-interactive': lazy(() => import('./football-goal-conversion-rate-calculator-interactive')),
  'football-goal-conversion-rate-calculator': lazy(() => import('./football-goal-conversion-rate-calculator')),
  'football-pass-accuracy-calculator-interactive': lazy(() => import('./football-pass-accuracy-calculator-interactive')),
  'football-pass-accuracy-calculator': lazy(() => import('./football-pass-accuracy-calculator')),
  'football-possession-percentage-calculator-interactive': lazy(() => import('./football-possession-percentage-calculator-interactive')),
  'football-possession-percentage-calculator': lazy(() => import('./football-possession-percentage-calculator')),
  'football-expected-goals-calculator-interactive': lazy(() => import('./football-expected-goals-calculator-interactive')),
  'football-expected-goals-calculator': lazy(() => import('./football-expected-goals-calculator')),
  'football-expected-assists-calculator-interactive': lazy(() => import('./football-expected-assists-calculator-interactive')),
  'football-expected-assists-calculator': lazy(() => import('./football-expected-assists-calculator')),
  'football-shot-accuracy-calculator-interactive': lazy(() => import('./football-shot-accuracy-calculator-interactive')),
  'football-shot-accuracy-calculator': lazy(() => import('./football-shot-accuracy-calculator')),
  'match-impact-score-calculator-interactive': lazy(() => import('./match-impact-score-calculator-interactive')),
  'match-impact-score-calculator': lazy(() => import('./match-impact-score-calculator')),
  'over-economy-tracker-interactive': lazy(() => import('./over-economy-tracker-interactive')),
  'over-economy-tracker': lazy(() => import('./over-economy-tracker')),
  'powerplay-run-rate-calculator-interactive': lazy(() => import('./powerplay-run-rate-calculator-interactive')),
  'powerplay-run-rate-calculator': lazy(() => import('./powerplay-run-rate-calculator')),
  'required-run-rate-calculator-interactive': lazy(() => import('./required-run-rate-calculator-interactive')),
  'required-run-rate-calculator': lazy(() => import('./required-run-rate-calculator')),
  'run-contribution-percentage-calculator-interactive': lazy(() => import('./run-contribution-percentage-calculator-interactive')),
  'run-contribution-percentage-calculator': lazy(() => import('./run-contribution-percentage-calculator')),
  'strike-rate-calculator-interactive': lazy(() => import('./strike-rate-calculator-interactive')),
  'strike-rate-calculator': lazy(() => import('./strike-rate-calculator')),
  'team-batting-average-calculator-interactive': lazy(() => import('./team-batting-average-calculator-interactive')),
  'team-batting-average-calculator': lazy(() => import('./team-batting-average-calculator')),
  'team-run-rate-calculator-interactive': lazy(() => import('./team-run-rate-calculator-interactive')),
  'team-run-rate-calculator': lazy(() => import('./team-run-rate-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
