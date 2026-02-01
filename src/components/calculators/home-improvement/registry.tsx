import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const ConcreteVolumeCalculatorComponent_0 = dynamic(() => import('./concrete-volume-calculator'));
const CostEstimatorRenovationCalculatorComponent_1 = dynamic(() => import('./cost-estimator-renovation-calculator'));
const DeckingMaterialsCalculatorComponent_2 = dynamic(() => import('./decking-materials-calculator'));
const DoorCabinetHardwareCalculatorComponent_3 = dynamic(() => import('./door-cabinet-hardware-calculator'));
const DrywallPlasterboardCalculatorComponent_4 = dynamic(() => import('./drywall-plasterboard-calculator'));
const GardenLandscapeSoilMulchCalculatorComponent_5 = dynamic(() => import('./garden-landscape-soil-mulch-calculator'));
const HvacSizingCalculatorComponent_6 = dynamic(() => import('./hvac-sizing-calculator'));
const InsulationRValueCalculatorComponent_7 = dynamic(() => import('./insulation-r-value-calculator'));
const LightingLayoutCalculatorComponent_8 = dynamic(() => import('./lighting-layout-calculator'));
const PaintCoverageCalculatorComponent_9 = dynamic(() => import('./paint-coverage-calculator'));
const PaintDryingCuringTimeCalculatorComponent_10 = dynamic(() => import('./paint-drying-curing-time-calculator'));
const RoofingShingleCalculatorComponent_11 = dynamic(() => import('./roofing-shingle-calculator'));
const StaircaseRiseRunCalculatorComponent_12 = dynamic(() => import('./staircase-rise-run-calculator'));
const TileFlooringCalculatorComponent_13 = dynamic(() => import('./tile-flooring-calculator'));
const WallFramingLumberCalculatorComponent_14 = dynamic(() => import('./wall-framing-lumber-calculator'));
const WallpaperRollCalculatorComponent_15 = dynamic(() => import('./wallpaper-roll-calculator'));
const WaterUsagePlumbingFlowCalculatorComponent_16 = dynamic(() => import('./water-usage-plumbing-flow-calculator'));
const WindowGlassCurtainCoverageCalculatorComponent_17 = dynamic(() => import('./window-glass-curtain-coverage-calculator'));

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
