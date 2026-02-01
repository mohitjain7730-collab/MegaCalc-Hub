import React from 'react';
import type { ComponentType } from 'react';

import CarbonFootprintReductionCalculatorComponent_0 from './carbon-footprint-reduction-calculator';
import RecyclingImpactCalculatorComponent_1 from './recycling-impact-calculator';
import SustainableDietImpactCalculatorComponent_2 from './sustainable-diet-impact-calculator';
import WaterUsageEfficiencyCalculatorComponent_3 from './water-usage-efficiency-calculator';

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'carbon-footprint-reduction-calculator': CarbonFootprintReductionCalculatorComponent_0,
  'recycling-impact-calculator': RecyclingImpactCalculatorComponent_1,
  'sustainable-diet-impact-calculator': SustainableDietImpactCalculatorComponent_2,
  'water-usage-efficiency-calculator': WaterUsageEfficiencyCalculatorComponent_3,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
