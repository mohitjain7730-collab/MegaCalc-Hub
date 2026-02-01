import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const BattingAverageCalculatorComponent_0 = dynamic(() => import('./batting-average-calculator'));
const BowlingAverageCalculatorComponent_1 = dynamic(() => import('./bowling-average-calculator'));
const BowlingEconomyRateCalculatorComponent_2 = dynamic(() => import('./bowling-economy-rate-calculator'));
const FantasyPointsCalculatorComponent_3 = dynamic(() => import('./fantasy-points-calculator'));
const NetRunRateCalculatorComponent_4 = dynamic(() => import('./net-run-rate-calculator'));
const PlayerPerformanceIndexCalculatorComponent_5 = dynamic(() => import('./player-performance-index-calculator'));
const RequiredRunRateCalculatorComponent_6 = dynamic(() => import('./required-run-rate-calculator'));
const StrikeRateCalculatorComponent_7 = dynamic(() => import('./strike-rate-calculator'));
const TeamRunRateCalculatorComponent_8 = dynamic(() => import('./team-run-rate-calculator'));

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'batting-average-calculator': BattingAverageCalculatorComponent_0,
  'bowling-average-calculator': BowlingAverageCalculatorComponent_1,
  'bowling-economy-rate-calculator': BowlingEconomyRateCalculatorComponent_2,
  'fantasy-points-calculator': FantasyPointsCalculatorComponent_3,
  'net-run-rate-calculator': NetRunRateCalculatorComponent_4,
  'player-performance-index-calculator': PlayerPerformanceIndexCalculatorComponent_5,
  'required-run-rate-calculator': RequiredRunRateCalculatorComponent_6,
  'strike-rate-calculator': StrikeRateCalculatorComponent_7,
  'team-run-rate-calculator': TeamRunRateCalculatorComponent_8,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
