import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const BeamBendingCalculatorComponent_0 = dynamic(() => import('./beam-bending-calculator'));
const CantileverBeamDeflectionCalculatorComponent_1 = dynamic(() => import('./cantilever-beam-deflection-calculator'));
const CompressiveStressCalculatorComponent_2 = dynamic(() => import('./compressive-stress-calculator'));
const ElectricalPowerCalculatorComponent_3 = dynamic(() => import('./electrical-power-calculator'));
const HeatTransferCalculatorComponent_4 = dynamic(() => import('./heat-transfer-calculator'));
const HydraulicPipeFlowCalculatorComponent_5 = dynamic(() => import('./hydraulic-pipe-flow-calculator'));
const NaturalFrequencyCalculatorComponent_6 = dynamic(() => import('./natural-frequency-calculator'));
const ReynoldsNumberCalculatorComponent_7 = dynamic(() => import('./reynolds-number-calculator'));
const ShearStressCalculatorComponent_8 = dynamic(() => import('./shear-stress-calculator'));
const ThermalExpansionCalculatorComponent_9 = dynamic(() => import('./thermal-expansion-calculator'));

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'beam-bending-calculator': BeamBendingCalculatorComponent_0,
  'cantilever-beam-deflection-calculator': CantileverBeamDeflectionCalculatorComponent_1,
  'compressive-stress-calculator': CompressiveStressCalculatorComponent_2,
  'electrical-power-calculator': ElectricalPowerCalculatorComponent_3,
  'heat-transfer-calculator': HeatTransferCalculatorComponent_4,
  'hydraulic-pipe-flow-calculator': HydraulicPipeFlowCalculatorComponent_5,
  'natural-frequency-calculator': NaturalFrequencyCalculatorComponent_6,
  'reynolds-number-calculator': ReynoldsNumberCalculatorComponent_7,
  'shear-stress-calculator': ShearStressCalculatorComponent_8,
  'thermal-expansion-calculator': ThermalExpansionCalculatorComponent_9,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
