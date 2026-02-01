import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const BabyFeedingAmountCalculatorComponent_0 = dynamic(() => import('./baby-feeding-amount-calculator'));
const ChildcareCostAffordabilityCalculatorComponent_1 = dynamic(() => import('./childcare-cost-affordability-calculator'));
const CollegeSavingsGoalCalculatorComponent_2 = dynamic(() => import('./college-savings-goal-calculator'));
const DueDateCalculatorComponent_3 = dynamic(() => import('./due-date-calculator'));

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
