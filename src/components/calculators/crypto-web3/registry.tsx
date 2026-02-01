import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const CryptoApyCalculatorComponent_0 = dynamic(() => import('./crypto-apy-calculator'));
const CryptoMiningProfitabilityCalculatorComponent_1 = dynamic(() => import('./crypto-mining-profitability-calculator'));
const CryptoStakingRewardCalculatorComponent_2 = dynamic(() => import('./crypto-staking-reward-calculator'));
const CryptoTaxLiabilityCalculatorComponent_3 = dynamic(() => import('./crypto-tax-liability-calculator'));
const NftMintingCostCalculatorComponent_4 = dynamic(() => import('./nft-minting-cost-calculator'));

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'crypto-apy-calculator': CryptoApyCalculatorComponent_0,
  'crypto-mining-profitability-calculator': CryptoMiningProfitabilityCalculatorComponent_1,
  'crypto-staking-reward-calculator': CryptoStakingRewardCalculatorComponent_2,
  'crypto-tax-liability-calculator': CryptoTaxLiabilityCalculatorComponent_3,
  'nft-minting-cost-calculator': NftMintingCostCalculatorComponent_4,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
