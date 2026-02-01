import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const BreakEvenPointCalculatorComponent_0 = dynamic(() => import('./break-even-point-calculator'));
const BreakEvenSalesDollarCalculatorComponent_1 = dynamic(() => import('./break-even-sales-dollar-calculator'));
const ContributionMarginCalculatorComponent_2 = dynamic(() => import('./contribution-margin-calculator'));
const CustomerAcquisitionCostCalculatorComponent_3 = dynamic(() => import('./customer-acquisition-cost-calculator'));
const DscrCalculatorComponent_4 = dynamic(() => import('./dscr-calculator'));
const LifetimeValueCalculatorComponent_5 = dynamic(() => import('./lifetime-value-calculator'));
const OperatingLeverageCalculatorComponent_6 = dynamic(() => import('./operating-leverage-calculator'));
const RoiCalculatorComponent_7 = dynamic(() => import('./roi-calculator'));

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'break-even-point-calculator': BreakEvenPointCalculatorComponent_0,
  'break-even-sales-dollar-calculator': BreakEvenSalesDollarCalculatorComponent_1,
  'contribution-margin-calculator': ContributionMarginCalculatorComponent_2,
  'customer-acquisition-cost-calculator': CustomerAcquisitionCostCalculatorComponent_3,
  'dscr-calculator': DscrCalculatorComponent_4,
  'lifetime-value-calculator': LifetimeValueCalculatorComponent_5,
  'operating-leverage-calculator': OperatingLeverageCalculatorComponent_6,
  'roi-calculator': RoiCalculatorComponent_7,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
