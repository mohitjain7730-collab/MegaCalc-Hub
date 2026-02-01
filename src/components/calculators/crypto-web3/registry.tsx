import React from 'react';
import type { ComponentType } from 'react';

import CryptoApyCalculatorComponent_0 from './crypto-apy-calculator';
import CryptoMiningProfitabilityCalculatorComponent_1 from './crypto-mining-profitability-calculator';
import CryptoStakingRewardCalculatorComponent_2 from './crypto-staking-reward-calculator';
import CryptoTaxLiabilityCalculatorComponent_3 from './crypto-tax-liability-calculator';
import NftMintingCostCalculatorComponent_4 from './nft-minting-cost-calculator';

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
