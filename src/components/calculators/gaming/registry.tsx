import React from 'react';
import type { ComponentType } from 'react';

import RobloxEggHatchOddsSimulatorComponent_0 from './roblox-egg-hatch-odds-simulator';
import RobloxPetValueCalculatorComponent_1 from './roblox-pet-value-calculator';
import RobloxTradingProfitAnalyzerComponent_2 from './roblox-trading-profit-analyzer';
import RobloxGamepassRoiCalculatorComponent_3 from './roblox-gamepass-roi-calculator';
import RobloxPetDupeValueCalculatorComponent_4 from './roblox-pet-dupe-value-calculator';
import RobloxLimitedItemResalePredictorComponent_5 from './roblox-limited-item-resale-predictor';
import RobloxInventoryValueEstimatorComponent_6 from './roblox-inventory-value-estimator';
import RobloxTradeTaxCalculatorComponent_7 from './roblox-trade-tax-calculator';
import FortniteDpsCalculatorComponent_8 from './fortnite-dps-calculator';
import FortniteBuildMaterialCostCalculatorComponent_9 from './fortnite-build-material-cost-calculator';
import FortniteStormSurgeTimerComponent_10 from './fortnite-storm-surge-timer';
import FortniteXpPerMatchOptimizerComponent_11 from './fortnite-xp-per-match-optimizer';
import FortniteReloadTimeReducerCalculatorComponent_12 from './fortnite-reload-time-reducer-calculator';
import FortniteLootDropOddsEstimatorComponent_13 from './fortnite-loot-drop-odds-estimator';
import FortniteShieldPotencyCalculatorComponent_14 from './fortnite-shield-potency-calculator';
import FortniteVictoryRoyaleProbabilityEstimatorComponent_15 from './fortnite-victory-royale-probability-estimator';
import MinecraftFarmYieldCalculatorComponent_16 from './minecraft-farm-yield-calculator';
import MinecraftEnchantingOddsPredictorComponent_17 from './minecraft-enchanting-odds-predictor';
import MinecraftVillagerTradeTrackerComponent_18 from './minecraft-villager-trade-tracker';
import MinecraftSmelterFuelEfficiencyComponent_19 from './minecraft-smelter-fuel-efficiency';
import MinecraftMobFarmXpRateCalculatorComponent_20 from './minecraft-mob-farm-xp-rate-calculator';
import MinecraftBeaconRangeOptimizerComponent_21 from './minecraft-beacon-range-optimizer';
import MinecraftRedstoneSignalDelayCalculatorComponent_22 from './minecraft-redstone-signal-delay-calculator';
import MinecraftTreeFarmOutputCalculatorComponent_23 from './minecraft-tree-farm-output-calculator';
import MinecraftNetherPortalLinkageEstimatorComponent_24 from './minecraft-nether-portal-linkage-estimator';

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
