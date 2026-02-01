import React from 'react';
import type { ComponentType } from 'react';

import Calc3dPrintTimeMaterialCalculator from './3d-print-time-material-calculator';
import ApiRateLimitPlannerComponent_1 from './api-rate-limit-planner';
import BatteryLifeEstimatorComponent_2 from './battery-life-estimator';
import CloudCostEstimatorComponent_3 from './cloud-cost-estimator';
import CodeTimeComplexityEstimatorComponent_4 from './code-time-complexity-estimator';
import DiskRaidCapacityCalculatorComponent_5 from './disk-raid-capacity-calculator';
import DownloadTimeCalculatorComponent_6 from './download-time-calculator';
import HashCollisionProbabilityCalculatorComponent_7 from './hash-collision-probability-calculator';
import ImageCompressionSizeCalculatorComponent_8 from './image-compression-size-calculator';
import InternetDataUsageEstimatorComponent_9 from './internet-data-usage-estimator';
import LatencyToThroughputCalculatorComponent_10 from './latency-to-throughput-calculator';
import NetworkBandwidthCalculatorComponent_11 from './network-bandwidth-calculator';
import OverclockingThermalCalculatorComponent_12 from './overclocking-thermal-calculator';
import PasswordEntropyCalculatorComponent_13 from './password-entropy-calculator';
import PingLatencyDistanceCalculatorComponent_14 from './ping-latency-distance-calculator';
import PowerSupplyWattageCalculatorComponent_15 from './power-supply-wattage-calculator';
import RegexPerformanceCheckerComponent_16 from './regex-performance-checker';
import SolarPanelOutputCalculatorComponent_17 from './solar-panel-output-calculator';
import SubnetMaskCidrCalculatorComponent_18 from './subnet-mask-cidr-calculator';
import UpsRuntimeCalculatorComponent_19 from './ups-runtime-calculator';

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  '3d-print-time-material-calculator': Calc3dPrintTimeMaterialCalculator,
  'api-rate-limit-planner': ApiRateLimitPlannerComponent_1,
  'battery-life-estimator': BatteryLifeEstimatorComponent_2,
  'cloud-cost-estimator': CloudCostEstimatorComponent_3,
  'code-time-complexity-estimator': CodeTimeComplexityEstimatorComponent_4,
  'disk-raid-capacity-calculator': DiskRaidCapacityCalculatorComponent_5,
  'download-time-calculator': DownloadTimeCalculatorComponent_6,
  'hash-collision-probability-calculator': HashCollisionProbabilityCalculatorComponent_7,
  'image-compression-size-calculator': ImageCompressionSizeCalculatorComponent_8,
  'internet-data-usage-estimator': InternetDataUsageEstimatorComponent_9,
  'latency-to-throughput-calculator': LatencyToThroughputCalculatorComponent_10,
  'network-bandwidth-calculator': NetworkBandwidthCalculatorComponent_11,
  'overclocking-thermal-calculator': OverclockingThermalCalculatorComponent_12,
  'password-entropy-calculator': PasswordEntropyCalculatorComponent_13,
  'ping-latency-distance-calculator': PingLatencyDistanceCalculatorComponent_14,
  'power-supply-wattage-calculator': PowerSupplyWattageCalculatorComponent_15,
  'regex-performance-checker': RegexPerformanceCheckerComponent_16,
  'solar-panel-output-calculator': SolarPanelOutputCalculatorComponent_17,
  'subnet-mask-cidr-calculator': SubnetMaskCidrCalculatorComponent_18,
  'ups-runtime-calculator': UpsRuntimeCalculatorComponent_19,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
