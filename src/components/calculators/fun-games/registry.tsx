'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'birthday-compatibility-calculator': lazy(() => import('./birthday-compatibility-calculator')),
  'crush-compatibility-calculator': lazy(() => import('./crush-compatibility-calculator')),
  'friendship-compatibility-calculator': lazy(() => import('./friendship-compatibility-calculator')),
  'future-partner-name-generator': lazy(() => import('./future-partner-name-generator')),
  'love-percentage-calculator': lazy(() => import('./love-percentage-calculator')),
  'marriage-compatibility-calculator': lazy(() => import('./marriage-compatibility-calculator')),
  'name-compatibility-calculator': lazy(() => import('./name-compatibility-calculator')),
  'relationship-strength-test': lazy(() => import('./relationship-strength-test')),
  'romantic-quiz-calculator': lazy(() => import('./romantic-quiz-calculator')),
  'zodiac-match-calculator': lazy(() => import('./zodiac-match-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
