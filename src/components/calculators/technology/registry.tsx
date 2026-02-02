'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  '3d-print-time-material-calculator': lazy(() => import('./3d-print-time-material-calculator')),
  'api-rate-limit-planner': lazy(() => import('./api-rate-limit-planner')),
  'battery-life-estimator': lazy(() => import('./battery-life-estimator')),
  'cloud-cost-estimator': lazy(() => import('./cloud-cost-estimator')),
  'code-time-complexity-estimator': lazy(() => import('./code-time-complexity-estimator')),
  'disk-raid-capacity-calculator': lazy(() => import('./disk-raid-capacity-calculator')),
  'download-time-calculator': lazy(() => import('./download-time-calculator')),
  'hash-collision-probability-calculator': lazy(() => import('./hash-collision-probability-calculator')),
  'image-compression-size-calculator': lazy(() => import('./image-compression-size-calculator')),
  'internet-data-usage-estimator': lazy(() => import('./internet-data-usage-estimator')),
  'latency-to-throughput-calculator': lazy(() => import('./latency-to-throughput-calculator')),
  'network-bandwidth-calculator': lazy(() => import('./network-bandwidth-calculator')),
  'overclocking-thermal-calculator': lazy(() => import('./overclocking-thermal-calculator')),
  'password-entropy-calculator': lazy(() => import('./password-entropy-calculator')),
  'ping-latency-distance-calculator': lazy(() => import('./ping-latency-distance-calculator')),
  'power-supply-wattage-calculator': lazy(() => import('./power-supply-wattage-calculator')),
  'regex-performance-checker': lazy(() => import('./regex-performance-checker')),
  'solar-panel-output-calculator': lazy(() => import('./solar-panel-output-calculator')),
  'subnet-mask-cidr-calculator': lazy(() => import('./subnet-mask-cidr-calculator')),
  'ups-runtime-calculator': lazy(() => import('./ups-runtime-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
