import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const CarbonFootprintReductionCalculatorComponent_0 = dynamic(() => import('./carbon-footprint-reduction-calculator'));
const RecyclingImpactCalculatorComponent_1 = dynamic(() => import('./recycling-impact-calculator'));
const SustainableDietImpactCalculatorComponent_2 = dynamic(() => import('./sustainable-diet-impact-calculator'));
const WaterUsageEfficiencyCalculatorComponent_3 = dynamic(() => import('./water-usage-efficiency-calculator'));

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
