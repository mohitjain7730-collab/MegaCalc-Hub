import React from 'react';
import type { ComponentType } from 'react';

import BattingAverageCalculatorComponent_0 from './batting-average-calculator';
import BowlingAverageCalculatorComponent_1 from './bowling-average-calculator';
import BowlingEconomyRateCalculatorComponent_2 from './bowling-economy-rate-calculator';
import FantasyPointsCalculatorComponent_3 from './fantasy-points-calculator';
import NetRunRateCalculatorComponent_4 from './net-run-rate-calculator';
import PlayerPerformanceIndexCalculatorComponent_5 from './player-performance-index-calculator';
import RequiredRunRateCalculatorComponent_6 from './required-run-rate-calculator';
import StrikeRateCalculatorComponent_7 from './strike-rate-calculator';
import TeamRunRateCalculatorComponent_8 from './team-run-rate-calculator';

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
