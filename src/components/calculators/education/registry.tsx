import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const AveragePercentageCalculatorComponent_0 = dynamic(() => import('./average-percentage-calculator'));
const ComparativeDifferenceCalculatorComponent_1 = dynamic(() => import('./comparative-difference-calculator'));
const CompoundingIncreaseCalculatorComponent_2 = dynamic(() => import('./compounding-increase-calculator'));
const DoublingTimeCalculatorComponent_3 = dynamic(() => import('./doubling-time-calculator'));
const FractionToPercentCalculatorComponent_4 = dynamic(() => import('./fraction-to-percent-calculator'));
const FuelCostCalculatorComponent_5 = dynamic(() => import('./fuel-cost-calculator'));
const HistoricChangeCalculatorComponent_6 = dynamic(() => import('./historic-change-calculator'));
const InvestmentGrowthCalculatorComponent_7 = dynamic(() => import('./investment-growth-calculator'));
const PercentErrorCalculatorComponent_8 = dynamic(() => import('./percent-error-calculator'));
const PercentToGoalCalculatorComponent_9 = dynamic(() => import('./percent-to-goal-calculator'));
const PercentageOfAPercentageCalculatorComponent_10 = dynamic(() => import('./percentage-of-a-percentage-calculator'));
const PercentagePointCalculatorComponent_11 = dynamic(() => import('./percentage-point-calculator'));
const RelativeChangeCalculatorComponent_12 = dynamic(() => import('./relative-change-calculator'));
const SlopePercentageCalculatorComponent_13 = dynamic(() => import('./slope-percentage-calculator'));
const TimePercentageCalculatorComponent_14 = dynamic(() => import('./time-percentage-calculator'));
const ValuePercentageCalculatorComponent_15 = dynamic(() => import('./value-percentage-calculator'));

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
