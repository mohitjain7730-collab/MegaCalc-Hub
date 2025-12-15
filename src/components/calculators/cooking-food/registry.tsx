'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'brining-solution-calculator': lazy(() => import('./brining-solution-calculator')),
  'cooking-time-adjuster': lazy(() => import('./cooking-time-adjuster')),
  'meat-thawing-time-calculator': lazy(() => import('./meat-thawing-time-calculator')),
  'recipe-ingredient-converter': lazy(() => import('./recipe-ingredient-converter')),
  'recipe-nutrition-calculator': lazy(() => import('./recipe-nutrition-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
