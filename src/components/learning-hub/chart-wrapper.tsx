'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

// Map chartComponent strings to actual React components
const chartComponents = {
  CompoundInterestChart: dynamic(
    () =>
      import('@/components/learning-hub/charts/compound-interest-chart').then(
        (m) => m.CompoundInterestChart,
      ),
    { ssr: false },
  ),
  AprVsApyChart: dynamic(
    () =>
      import('@/components/learning-hub/charts/apr-vs-apy-chart').then(
        (m) => m.AprVsApyChart,
      ),
    { ssr: false },
  ),
  BmiChart: dynamic(
    () =>
      import('@/components/learning-hub/charts/bmi-chart').then(
        (m) => m.BmiChart,
      ),
    { ssr: false },
  ),
  NewtonsSecondLawChart: dynamic(
    () =>
      import(
        '@/components/learning-hub/charts/newtons-second-law-chart'
      ).then((m) => m.NewtonsSecondLawChart),
    { ssr: false },
  ),
  PressureUnitsChart: dynamic(
    () =>
      import('@/components/learning-hub/charts/pressure-units-chart').then(
        (m) => m.PressureUnitsChart,
      ),
    { ssr: false },
  ),
  BfpChart: dynamic(
    () =>
      import('@/components/learning-hub/charts/bfp-chart').then(
        (m) => m.BfpChart,
      ),
    { ssr: false },
  ),
  BmrTdeeChart: dynamic(
    () =>
      import('@/components/learning-hub/charts/bmr-tdee-chart').then(
        (m) => m.BmrTdeeChart,
      ),
    { ssr: false },
  ),
} as const;

type ChartKey = keyof typeof chartComponents;

interface ChartWrapperProps {
  chartComponent?: string;
}

export function ChartWrapper({ chartComponent }: ChartWrapperProps) {
  if (!chartComponent) {
    return null;
  }

  const ChartComponent = chartComponents[chartComponent as ChartKey] as
    | ComponentType
    | undefined;

  if (!ChartComponent) {
    return null;
  }

  return (
    <div className="mb-10">
      <ChartComponent />
    </div>
  );
}

