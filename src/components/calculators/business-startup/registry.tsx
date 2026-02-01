import React from 'react';
import type { ComponentType } from 'react';

import BreakEvenPointCalculatorComponent_0 from './break-even-point-calculator';
import BreakEvenSalesDollarCalculatorComponent_1 from './break-even-sales-dollar-calculator';
import ContributionMarginCalculatorComponent_2 from './contribution-margin-calculator';
import CustomerAcquisitionCostCalculatorComponent_3 from './customer-acquisition-cost-calculator';
import DscrCalculatorComponent_4 from './dscr-calculator';
import LifetimeValueCalculatorComponent_5 from './lifetime-value-calculator';
import OperatingLeverageCalculatorComponent_6 from './operating-leverage-calculator';
import RoiCalculatorComponent_7 from './roi-calculator';

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
