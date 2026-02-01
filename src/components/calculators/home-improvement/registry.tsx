import React from 'react';
import type { ComponentType } from 'react';

import ConcreteVolumeCalculatorComponent_0 from './concrete-volume-calculator';
import CostEstimatorRenovationCalculatorComponent_1 from './cost-estimator-renovation-calculator';
import DeckingMaterialsCalculatorComponent_2 from './decking-materials-calculator';
import DoorCabinetHardwareCalculatorComponent_3 from './door-cabinet-hardware-calculator';
import DrywallPlasterboardCalculatorComponent_4 from './drywall-plasterboard-calculator';
import GardenLandscapeSoilMulchCalculatorComponent_5 from './garden-landscape-soil-mulch-calculator';
import HvacSizingCalculatorComponent_6 from './hvac-sizing-calculator';
import InsulationRValueCalculatorComponent_7 from './insulation-r-value-calculator';
import LightingLayoutCalculatorComponent_8 from './lighting-layout-calculator';
import PaintCoverageCalculatorComponent_9 from './paint-coverage-calculator';
import PaintDryingCuringTimeCalculatorComponent_10 from './paint-drying-curing-time-calculator';
import RoofingShingleCalculatorComponent_11 from './roofing-shingle-calculator';
import StaircaseRiseRunCalculatorComponent_12 from './staircase-rise-run-calculator';
import TileFlooringCalculatorComponent_13 from './tile-flooring-calculator';
import WallFramingLumberCalculatorComponent_14 from './wall-framing-lumber-calculator';
import WallpaperRollCalculatorComponent_15 from './wallpaper-roll-calculator';
import WaterUsagePlumbingFlowCalculatorComponent_16 from './water-usage-plumbing-flow-calculator';
import WindowGlassCurtainCoverageCalculatorComponent_17 from './window-glass-curtain-coverage-calculator';

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'concrete-volume-calculator': ConcreteVolumeCalculatorComponent_0,
  'cost-estimator-renovation-calculator': CostEstimatorRenovationCalculatorComponent_1,
  'decking-materials-calculator': DeckingMaterialsCalculatorComponent_2,
  'door-cabinet-hardware-calculator': DoorCabinetHardwareCalculatorComponent_3,
  'drywall-plasterboard-calculator': DrywallPlasterboardCalculatorComponent_4,
  'garden-landscape-soil-mulch-calculator': GardenLandscapeSoilMulchCalculatorComponent_5,
  'hvac-sizing-calculator': HvacSizingCalculatorComponent_6,
  'insulation-r-value-calculator': InsulationRValueCalculatorComponent_7,
  'lighting-layout-calculator': LightingLayoutCalculatorComponent_8,
  'paint-coverage-calculator': PaintCoverageCalculatorComponent_9,
  'paint-drying-curing-time-calculator': PaintDryingCuringTimeCalculatorComponent_10,
  'roofing-shingle-calculator': RoofingShingleCalculatorComponent_11,
  'staircase-rise-run-calculator': StaircaseRiseRunCalculatorComponent_12,
  'tile-flooring-calculator': TileFlooringCalculatorComponent_13,
  'wall-framing-lumber-calculator': WallFramingLumberCalculatorComponent_14,
  'wallpaper-roll-calculator': WallpaperRollCalculatorComponent_15,
  'water-usage-plumbing-flow-calculator': WaterUsagePlumbingFlowCalculatorComponent_16,
  'window-glass-curtain-coverage-calculator': WindowGlassCurtainCoverageCalculatorComponent_17,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
