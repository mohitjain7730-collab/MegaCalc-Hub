import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const AnnealingTemperatureCalculatorComponent_0 = dynamic(() => import('./annealing-temperature-calculator'));
const CellDilutionCalculatorComponent_1 = dynamic(() => import('./cell-dilution-calculator'));
const CellDoublingTimeCalculatorComponent_2 = dynamic(() => import('./cell-doubling-time-calculator'));
const DnaConcentrationCalculatorComponent_3 = dynamic(() => import('./dna-concentration-calculator'));
const GenerationTimeCalculatorComponent_4 = dynamic(() => import('./generation-time-calculator'));
const LigationCalculatorComponent_5 = dynamic(() => import('./ligation-calculator'));
const LogReductionCalculatorComponent_6 = dynamic(() => import('./log-reduction-calculator'));
const ProteinConcentrationCalculatorComponent_7 = dynamic(() => import('./protein-concentration-calculator'));

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
