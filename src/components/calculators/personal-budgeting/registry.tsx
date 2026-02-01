import React from 'react';
import type { ComponentType } from 'react';

import Calc503020BudgetCalculator from './50-30-20-budget-calculator';
import DtiRatioCalculatorComponent_1 from './dti-ratio-calculator';
import EmergencyFundGoalCalculatorComponent_2 from './emergency-fund-goal-calculator';
import MonthlyBudgetSurplusDeficitCalculatorComponent_3 from './monthly-budget-surplus-deficit-calculator';
import SavingsRateCalculatorComponent_4 from './savings-rate-calculator';

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
