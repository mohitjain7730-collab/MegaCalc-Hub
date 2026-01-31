'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { ComponentType } from 'react';
import { CalculatorLoading } from './calculator-loading';

interface CalculatorWrapperProps {
  categorySlug: string;
  calculatorSlug: string;
}

// Fallback component for missing calculators
function CalculatorNotFound() {
  return (
    <div className="p-8 text-center text-muted-foreground">
      Calculator not found.
    </div>
  );
}

// Dynamic registry loaders with ssr: true so calculator HTML is in initial page source for SEO
// Each registry only loads when its category is accessed
const registryLoaders: Record<string, (slug: string) => ComponentType> = {
  'biology': (slug: string) => dynamic(
    () => import('@/components/calculators/biology/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'business-startup': (slug: string) => dynamic(
    () => import('@/components/calculators/business-startup/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'cognitive-psychology': (slug: string) => dynamic(
    () => import('@/components/calculators/cognitive-psychology/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'conversions': (slug: string) => dynamic(
    () => import('@/components/calculators/conversions/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'cooking-food': (slug: string) => dynamic(
    () => import('@/components/calculators/cooking-food/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'cricket': (slug: string) => dynamic(
    () => import('@/components/calculators/cricket/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'crypto-web3': (slug: string) => dynamic(
    () => import('@/components/calculators/crypto-web3/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'education': (slug: string) => dynamic(
    () => import('@/components/calculators/education/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),

  'employment': (slug: string) => dynamic(
    () => import('@/components/calculators/employment/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'engineering': (slug: string) => dynamic(
    () => import('@/components/calculators/engineering/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'environment': (slug: string) => dynamic(
    () => import('@/components/calculators/environment/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'finance': (slug: string) => dynamic(
    () => import('@/components/calculators/finance/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'fun-games': (slug: string) => dynamic(
    () => import('@/components/calculators/fun-games/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'gaming': (slug: string) => dynamic(
    () => import('@/components/calculators/gaming/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'genetic-ancestry': (slug: string) => dynamic(
    () => import('@/components/calculators/genetic-ancestry/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'health-fitness': (slug: string) => dynamic(
    () => import('@/components/calculators/health-fitness/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'historical-archaeological': (slug: string) => dynamic(
    () => import('@/components/calculators/historical-archaeological/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'home-improvement': (slug: string) => dynamic(
    () => import('@/components/calculators/home-improvement/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'parenting': (slug: string) => dynamic(
    () => import('@/components/calculators/parenting/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'personal-budgeting': (slug: string) => dynamic(
    () => import('@/components/calculators/personal-budgeting/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'technology': (slug: string) => dynamic(
    () => import('@/components/calculators/technology/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'time-date': (slug: string) => dynamic(
    () => import('@/components/calculators/time-date/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  'travel-adventure': (slug: string) => dynamic(
    () => import('@/components/calculators/travel-adventure/registry').then(mod => {
      const Registry = mod.default;
      return () => <Registry calculatorSlug={slug} />;
    }).catch(() => CalculatorNotFound),
    { ssr: true }
  ),
  // Alias wellness to health-fitness
  'wellness': (slug: string) => {
    const adjustedSlug = slug.endsWith('-calculator')
      ? slug.replace('-calculator', '-wellness-calculator')
      : `${slug}-wellness-calculator`;
    return dynamic(
      () => import('@/components/calculators/health-fitness/registry').then(mod => {
        const Registry = mod.default;
        return () => <Registry calculatorSlug={adjustedSlug} />;
      }).catch(() => CalculatorNotFound),
      { ssr: true }
    );
  },
};

export function CalculatorWrapper({ categorySlug, calculatorSlug }: CalculatorWrapperProps) {
  // Get the loader for the category
  const loader = registryLoaders[categorySlug];

  if (!loader) {
    console.warn(`No registry loader found for category: ${categorySlug}`);
    return (
      <div style={{ minHeight: '500px', width: '100%' }}>
        <CalculatorNotFound />
      </div>
    );
  }

  // Get the dynamic component for this specific calculator
  const CalculatorComponent = loader(calculatorSlug);

  return (
    <div className="w-full">
      <Suspense fallback={<CalculatorLoading />}>
        <CalculatorComponent />
      </Suspense>
    </div>
  );
}
