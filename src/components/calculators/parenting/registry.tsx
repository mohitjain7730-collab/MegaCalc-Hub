import React from 'react';
import type { ComponentType } from 'react';

import BabyFeedingAmountCalculatorComponent_0 from './baby-feeding-amount-calculator';
import ChildcareCostAffordabilityCalculatorComponent_1 from './childcare-cost-affordability-calculator';
import CollegeSavingsGoalCalculatorComponent_2 from './college-savings-goal-calculator';
import DueDateCalculatorComponent_3 from './due-date-calculator';

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'baby-feeding-amount-calculator': BabyFeedingAmountCalculatorComponent_0,
  'childcare-cost-affordability-calculator': ChildcareCostAffordabilityCalculatorComponent_1,
  'college-savings-goal-calculator': CollegeSavingsGoalCalculatorComponent_2,
  'due-date-calculator': DueDateCalculatorComponent_3,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
