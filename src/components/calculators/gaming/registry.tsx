import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const RobloxEggHatchOddsSimulatorComponent_0 = dynamic(() => import('./roblox-egg-hatch-odds-simulator'));
const RobloxPetValueCalculatorComponent_1 = dynamic(() => import('./roblox-pet-value-calculator'));
const RobloxTradingProfitAnalyzerComponent_2 = dynamic(() => import('./roblox-trading-profit-analyzer'));
const RobloxGamepassRoiCalculatorComponent_3 = dynamic(() => import('./roblox-gamepass-roi-calculator'));
const RobloxPetDupeValueCalculatorComponent_4 = dynamic(() => import('./roblox-pet-dupe-value-calculator'));
const RobloxLimitedItemResalePredictorComponent_5 = dynamic(() => import('./roblox-limited-item-resale-predictor'));
const RobloxInventoryValueEstimatorComponent_6 = dynamic(() => import('./roblox-inventory-value-estimator'));
const RobloxTradeTaxCalculatorComponent_7 = dynamic(() => import('./roblox-trade-tax-calculator'));
const FortniteDpsCalculatorComponent_8 = dynamic(() => import('./fortnite-dps-calculator'));
const FortniteBuildMaterialCostCalculatorComponent_9 = dynamic(() => import('./fortnite-build-material-cost-calculator'));
const FortniteStormSurgeTimerComponent_10 = dynamic(() => import('./fortnite-storm-surge-timer'));
const FortniteXpPerMatchOptimizerComponent_11 = dynamic(() => import('./fortnite-xp-per-match-optimizer'));
const FortniteReloadTimeReducerCalculatorComponent_12 = dynamic(() => import('./fortnite-reload-time-reducer-calculator'));
const FortniteLootDropOddsEstimatorComponent_13 = dynamic(() => import('./fortnite-loot-drop-odds-estimator'));
const FortniteShieldPotencyCalculatorComponent_14 = dynamic(() => import('./fortnite-shield-potency-calculator'));
const FortniteVictoryRoyaleProbabilityEstimatorComponent_15 = dynamic(() => import('./fortnite-victory-royale-probability-estimator'));
const MinecraftFarmYieldCalculatorComponent_16 = dynamic(() => import('./minecraft-farm-yield-calculator'));
const MinecraftEnchantingOddsPredictorComponent_17 = dynamic(() => import('./minecraft-enchanting-odds-predictor'));
const MinecraftVillagerTradeTrackerComponent_18 = dynamic(() => import('./minecraft-villager-trade-tracker'));
const MinecraftSmelterFuelEfficiencyComponent_19 = dynamic(() => import('./minecraft-smelter-fuel-efficiency'));
const MinecraftMobFarmXpRateCalculatorComponent_20 = dynamic(() => import('./minecraft-mob-farm-xp-rate-calculator'));
const MinecraftBeaconRangeOptimizerComponent_21 = dynamic(() => import('./minecraft-beacon-range-optimizer'));
const MinecraftRedstoneSignalDelayCalculatorComponent_22 = dynamic(() => import('./minecraft-redstone-signal-delay-calculator'));
const MinecraftTreeFarmOutputCalculatorComponent_23 = dynamic(() => import('./minecraft-tree-farm-output-calculator'));
const MinecraftNetherPortalLinkageEstimatorComponent_24 = dynamic(() => import('./minecraft-nether-portal-linkage-estimator'));

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'roblox-egg-hatch-odds-simulator': RobloxEggHatchOddsSimulatorComponent_0,
  'roblox-pet-value-calculator': RobloxPetValueCalculatorComponent_1,
  'roblox-trading-profit-analyzer': RobloxTradingProfitAnalyzerComponent_2,
  'roblox-gamepass-roi-calculator': RobloxGamepassRoiCalculatorComponent_3,
  'roblox-pet-dupe-value-calculator': RobloxPetDupeValueCalculatorComponent_4,
  'roblox-limited-item-resale-predictor': RobloxLimitedItemResalePredictorComponent_5,
  'roblox-inventory-value-estimator': RobloxInventoryValueEstimatorComponent_6,
  'roblox-trade-tax-calculator': RobloxTradeTaxCalculatorComponent_7,
  'fortnite-dps-calculator': FortniteDpsCalculatorComponent_8,
  'fortnite-build-material-cost-calculator': FortniteBuildMaterialCostCalculatorComponent_9,
  'fortnite-storm-surge-timer': FortniteStormSurgeTimerComponent_10,
  'fortnite-xp-per-match-optimizer': FortniteXpPerMatchOptimizerComponent_11,
  'fortnite-reload-time-reducer-calculator': FortniteReloadTimeReducerCalculatorComponent_12,
  'fortnite-loot-drop-odds-estimator': FortniteLootDropOddsEstimatorComponent_13,
  'fortnite-shield-potency-calculator': FortniteShieldPotencyCalculatorComponent_14,
  'fortnite-victory-royale-probability-estimator': FortniteVictoryRoyaleProbabilityEstimatorComponent_15,
  'minecraft-farm-yield-calculator': MinecraftFarmYieldCalculatorComponent_16,
  'minecraft-enchanting-odds-predictor': MinecraftEnchantingOddsPredictorComponent_17,
  'minecraft-villager-trade-tracker': MinecraftVillagerTradeTrackerComponent_18,
  'minecraft-smelter-fuel-efficiency': MinecraftSmelterFuelEfficiencyComponent_19,
  'minecraft-mob-farm-xp-rate-calculator': MinecraftMobFarmXpRateCalculatorComponent_20,
  'minecraft-beacon-range-optimizer': MinecraftBeaconRangeOptimizerComponent_21,
  'minecraft-redstone-signal-delay-calculator': MinecraftRedstoneSignalDelayCalculatorComponent_22,
  'minecraft-tree-farm-output-calculator': MinecraftTreeFarmOutputCalculatorComponent_23,
  'minecraft-nether-portal-linkage-estimator': MinecraftNetherPortalLinkageEstimatorComponent_24,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
