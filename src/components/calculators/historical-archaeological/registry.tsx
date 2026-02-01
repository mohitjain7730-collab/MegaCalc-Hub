import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const AncientCivilizationTimelineGeneratorComponent_0 = dynamic(() => import('./ancient-civilization-timeline-generator'));
const ArchaeologicalSiteExcavationCalculatorComponent_1 = dynamic(() => import('./archaeological-site-excavation-calculator'));
const ArtifactDatingCalculatorComponent_2 = dynamic(() => import('./artifact-dating-calculator'));
const HistoricalPopulationDensityCalculatorComponent_3 = dynamic(() => import('./historical-population-density-calculator'));

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'ancient-civilization-timeline-generator': AncientCivilizationTimelineGeneratorComponent_0,
  'archaeological-site-excavation-calculator': ArchaeologicalSiteExcavationCalculatorComponent_1,
  'artifact-dating-calculator': ArtifactDatingCalculatorComponent_2,
  'historical-population-density-calculator': HistoricalPopulationDensityCalculatorComponent_3,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
