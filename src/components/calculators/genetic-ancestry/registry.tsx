import React from 'react';
import type { ComponentType } from 'react';

import AncestryCompositionEstimatorComponent_0 from './ancestry-composition-estimator';
import GenealogyTimelineGeneratorComponent_1 from './genealogy-timeline-generator';
import GeneticTraitProbabilityCalculatorComponent_2 from './genetic-trait-probability-calculator';
import PedigreeAnalysisCalculatorComponent_3 from './pedigree-analysis-calculator';

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'ancestry-composition-estimator': AncestryCompositionEstimatorComponent_0,
  'genealogy-timeline-generator': GenealogyTimelineGeneratorComponent_1,
  'genetic-trait-probability-calculator': GeneticTraitProbabilityCalculatorComponent_2,
  'pedigree-analysis-calculator': PedigreeAnalysisCalculatorComponent_3,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
