import React from 'react';
import type { ComponentType } from 'react';

import AnnealingTemperatureCalculatorComponent_0 from './annealing-temperature-calculator';
import CellDilutionCalculatorComponent_1 from './cell-dilution-calculator';
import CellDoublingTimeCalculatorComponent_2 from './cell-doubling-time-calculator';
import DnaConcentrationCalculatorComponent_3 from './dna-concentration-calculator';
import GenerationTimeCalculatorComponent_4 from './generation-time-calculator';
import LigationCalculatorComponent_5 from './ligation-calculator';
import LogReductionCalculatorComponent_6 from './log-reduction-calculator';
import ProteinConcentrationCalculatorComponent_7 from './protein-concentration-calculator';

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'annealing-temperature-calculator': AnnealingTemperatureCalculatorComponent_0,
  'cell-dilution-calculator': CellDilutionCalculatorComponent_1,
  'cell-doubling-time-calculator': CellDoublingTimeCalculatorComponent_2,
  'dna-concentration-calculator': DnaConcentrationCalculatorComponent_3,
  'generation-time-calculator': GenerationTimeCalculatorComponent_4,
  'ligation-calculator': LigationCalculatorComponent_5,
  'log-reduction-calculator': LogReductionCalculatorComponent_6,
  'protein-concentration-calculator': ProteinConcentrationCalculatorComponent_7,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
