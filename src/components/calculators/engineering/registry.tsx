import React from 'react';
import type { ComponentType } from 'react';

import BeamBendingCalculatorComponent_0 from './beam-bending-calculator';
import CantileverBeamDeflectionCalculatorComponent_1 from './cantilever-beam-deflection-calculator';
import CompressiveStressCalculatorComponent_2 from './compressive-stress-calculator';
import ElectricalPowerCalculatorComponent_3 from './electrical-power-calculator';
import HeatTransferCalculatorComponent_4 from './heat-transfer-calculator';
import HydraulicPipeFlowCalculatorComponent_5 from './hydraulic-pipe-flow-calculator';
import NaturalFrequencyCalculatorComponent_6 from './natural-frequency-calculator';
import ReynoldsNumberCalculatorComponent_7 from './reynolds-number-calculator';
import ShearStressCalculatorComponent_8 from './shear-stress-calculator';
import ThermalExpansionCalculatorComponent_9 from './thermal-expansion-calculator';

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
