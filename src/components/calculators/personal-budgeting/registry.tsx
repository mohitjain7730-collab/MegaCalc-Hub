import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const Calc503020BudgetCalculator = dynamic(() => import('./50-30-20-budget-calculator'));
const DtiRatioCalculatorComponent_1 = dynamic(() => import('./dti-ratio-calculator'));
const EmergencyFundGoalCalculatorComponent_2 = dynamic(() => import('./emergency-fund-goal-calculator'));
const MonthlyBudgetSurplusDeficitCalculatorComponent_3 = dynamic(() => import('./monthly-budget-surplus-deficit-calculator'));
const SavingsRateCalculatorComponent_4 = dynamic(() => import('./savings-rate-calculator'));

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  '50-30-20-budget-calculator': Calc503020BudgetCalculator,
  'dti-ratio-calculator': DtiRatioCalculatorComponent_1,
  'emergency-fund-goal-calculator': EmergencyFundGoalCalculatorComponent_2,
  'monthly-budget-surplus-deficit-calculator': MonthlyBudgetSurplusDeficitCalculatorComponent_3,
  'savings-rate-calculator': SavingsRateCalculatorComponent_4,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
