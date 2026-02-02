'use client';

import React, { lazy, useState, useEffect } from 'react';

// Static map of calculators to avoid dynamic import context creation
const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  'crypto-apy-calculator': lazy(() => import('./crypto-apy-calculator')),
  'crypto-mining-profitability-calculator': lazy(() => import('./crypto-mining-profitability-calculator')),
  'crypto-staking-reward-calculator': lazy(() => import('./crypto-staking-reward-calculator')),
  'crypto-tax-liability-calculator': lazy(() => import('./crypto-tax-liability-calculator')),
  'nft-minting-cost-calculator': lazy(() => import('./nft-minting-cost-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
