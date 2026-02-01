import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const Calc3dPrintTimeMaterialCalculator = dynamic(() => import('./3d-print-time-material-calculator'));
const ApiRateLimitPlannerComponent_1 = dynamic(() => import('./api-rate-limit-planner'));
const BatteryLifeEstimatorComponent_2 = dynamic(() => import('./battery-life-estimator'));
const CloudCostEstimatorComponent_3 = dynamic(() => import('./cloud-cost-estimator'));
const CodeTimeComplexityEstimatorComponent_4 = dynamic(() => import('./code-time-complexity-estimator'));
const DiskRaidCapacityCalculatorComponent_5 = dynamic(() => import('./disk-raid-capacity-calculator'));
const DownloadTimeCalculatorComponent_6 = dynamic(() => import('./download-time-calculator'));
const HashCollisionProbabilityCalculatorComponent_7 = dynamic(() => import('./hash-collision-probability-calculator'));
const ImageCompressionSizeCalculatorComponent_8 = dynamic(() => import('./image-compression-size-calculator'));
const InternetDataUsageEstimatorComponent_9 = dynamic(() => import('./internet-data-usage-estimator'));
const LatencyToThroughputCalculatorComponent_10 = dynamic(() => import('./latency-to-throughput-calculator'));
const NetworkBandwidthCalculatorComponent_11 = dynamic(() => import('./network-bandwidth-calculator'));
const OverclockingThermalCalculatorComponent_12 = dynamic(() => import('./overclocking-thermal-calculator'));
const PasswordEntropyCalculatorComponent_13 = dynamic(() => import('./password-entropy-calculator'));
const PingLatencyDistanceCalculatorComponent_14 = dynamic(() => import('./ping-latency-distance-calculator'));
const PowerSupplyWattageCalculatorComponent_15 = dynamic(() => import('./power-supply-wattage-calculator'));
const RegexPerformanceCheckerComponent_16 = dynamic(() => import('./regex-performance-checker'));
const SolarPanelOutputCalculatorComponent_17 = dynamic(() => import('./solar-panel-output-calculator'));
const SubnetMaskCidrCalculatorComponent_18 = dynamic(() => import('./subnet-mask-cidr-calculator'));
const UpsRuntimeCalculatorComponent_19 = dynamic(() => import('./ups-runtime-calculator'));

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
