import React from 'react';
import type { ComponentType } from 'react';

import AveragePercentageCalculatorComponent_0 from './average-percentage-calculator';
import ComparativeDifferenceCalculatorComponent_1 from './comparative-difference-calculator';
import CompoundingIncreaseCalculatorComponent_2 from './compounding-increase-calculator';
import DoublingTimeCalculatorComponent_3 from './doubling-time-calculator';
import FractionToPercentCalculatorComponent_4 from './fraction-to-percent-calculator';
import FuelCostCalculatorComponent_5 from './fuel-cost-calculator';
import HistoricChangeCalculatorComponent_6 from './historic-change-calculator';
import InvestmentGrowthCalculatorComponent_7 from './investment-growth-calculator';
import PercentErrorCalculatorComponent_8 from './percent-error-calculator';
import PercentToGoalCalculatorComponent_9 from './percent-to-goal-calculator';
import PercentageOfAPercentageCalculatorComponent_10 from './percentage-of-a-percentage-calculator';
import PercentagePointCalculatorComponent_11 from './percentage-point-calculator';
import RelativeChangeCalculatorComponent_12 from './relative-change-calculator';
import SlopePercentageCalculatorComponent_13 from './slope-percentage-calculator';
import TimePercentageCalculatorComponent_14 from './time-percentage-calculator';
import ValuePercentageCalculatorComponent_15 from './value-percentage-calculator';

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'average-percentage-calculator': AveragePercentageCalculatorComponent_0,
  'comparative-difference-calculator': ComparativeDifferenceCalculatorComponent_1,
  'compounding-increase-calculator': CompoundingIncreaseCalculatorComponent_2,
  'doubling-time-calculator': DoublingTimeCalculatorComponent_3,
  'fraction-to-percent-calculator': FractionToPercentCalculatorComponent_4,
  'fuel-cost-calculator': FuelCostCalculatorComponent_5,
  'historic-change-calculator': HistoricChangeCalculatorComponent_6,
  'investment-growth-calculator': InvestmentGrowthCalculatorComponent_7,
  'percent-error-calculator': PercentErrorCalculatorComponent_8,
  'percent-to-goal-calculator': PercentToGoalCalculatorComponent_9,
  'percentage-of-a-percentage-calculator': PercentageOfAPercentageCalculatorComponent_10,
  'percentage-point-calculator': PercentagePointCalculatorComponent_11,
  'relative-change-calculator': RelativeChangeCalculatorComponent_12,
  'slope-percentage-calculator': SlopePercentageCalculatorComponent_13,
  'time-percentage-calculator': TimePercentageCalculatorComponent_14,
  'value-percentage-calculator': ValuePercentageCalculatorComponent_15,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
