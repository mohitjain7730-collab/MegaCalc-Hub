import React from 'react';
import type { ComponentType } from 'react';

import AncientCivilizationTimelineGeneratorComponent_0 from './ancient-civilization-timeline-generator';
import ArchaeologicalSiteExcavationCalculatorComponent_1 from './archaeological-site-excavation-calculator';
import ArtifactDatingCalculatorComponent_2 from './artifact-dating-calculator';
import HistoricalPopulationDensityCalculatorComponent_3 from './historical-population-density-calculator';

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
