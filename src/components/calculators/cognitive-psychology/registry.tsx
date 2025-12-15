'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'attention-span-estimator': lazy(() => import('./attention-span-estimator')),
  'cognitive-load-calculator': lazy(() => import('./cognitive-load-calculator')),
  'emotional-valence-scoring-calculator': lazy(() => import('./emotional-valence-scoring-calculator')),
  'iq-score-estimator': lazy(() => import('./iq-score-estimator')),
  'memory-span-calculator': lazy(() => import('./memory-span-calculator')),
  'mental-fatigue-index-calculator': lazy(() => import('./mental-fatigue-index-calculator')),
  'personality-trait-calculator': lazy(() => import('./personality-trait-calculator')),
  'sleep-debt-calculator': lazy(() => import('./sleep-debt-calculator')),
  'stress-level-index-calculator': lazy(() => import('./stress-level-index-calculator')),
  'stroop-effect-reaction-time-calculator': lazy(() => import('./stroop-effect-reaction-time-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
