import React from 'react';
import type { ComponentType } from 'react';

import BiologyRegistry from '@/components/calculators/biology/registry';
import BusinessStartupRegistry from '@/components/calculators/business-startup/registry';
import CognitivePsychologyRegistry from '@/components/calculators/cognitive-psychology/registry';
import ConversionsRegistry from '@/components/calculators/conversions/registry';
import CookingFoodRegistry from '@/components/calculators/cooking-food/registry';
import CricketRegistry from '@/components/calculators/cricket/registry';
import CryptoWeb3Registry from '@/components/calculators/crypto-web3/registry';
import EducationRegistry from '@/components/calculators/education/registry';
import EmploymentRegistry from '@/components/calculators/employment/registry';
import EngineeringRegistry from '@/components/calculators/engineering/registry';
import EnvironmentRegistry from '@/components/calculators/environment/registry';
import FinanceRegistry from '@/components/calculators/finance/registry';
import FunGamesRegistry from '@/components/calculators/fun-games/registry';
import GamingRegistry from '@/components/calculators/gaming/registry';
import GeneticAncestryRegistry from '@/components/calculators/genetic-ancestry/registry';
import HealthFitnessRegistry from '@/components/calculators/health-fitness/registry';
import HistoricalArchaeologicalRegistry from '@/components/calculators/historical-archaeological/registry';
import HomeImprovementRegistry from '@/components/calculators/home-improvement/registry';
import ParentingRegistry from '@/components/calculators/parenting/registry';
import PersonalBudgetingRegistry from '@/components/calculators/personal-budgeting/registry';
import TechnologyRegistry from '@/components/calculators/technology/registry';
import TimeDateRegistry from '@/components/calculators/time-date/registry';
import TravelAdventureRegistry from '@/components/calculators/travel-adventure/registry';

interface CalculatorWrapperProps {
  categorySlug: string;
  calculatorSlug: string;
}

function CalculatorNotFound() {
  return (
    <div className="p-8 text-center text-muted-foreground">
      Calculator not found.
    </div>
  );
}

// Static registry map - server-rendered for SEO
const registries: Record<string, ComponentType<{ calculatorSlug: string }>> = {
  biology: BiologyRegistry,
  'business-startup': BusinessStartupRegistry,
  'cognitive-psychology': CognitivePsychologyRegistry,
  conversions: ConversionsRegistry,
  'cooking-food': CookingFoodRegistry,
  cricket: CricketRegistry,
  'crypto-web3': CryptoWeb3Registry,
  education: EducationRegistry,
  employment: EmploymentRegistry,
  engineering: EngineeringRegistry,
  environment: EnvironmentRegistry,
  finance: FinanceRegistry,
  'fun-games': FunGamesRegistry,
  gaming: GamingRegistry,
  'genetic-ancestry': GeneticAncestryRegistry,
  'health-fitness': HealthFitnessRegistry,
  'historical-archaeological': HistoricalArchaeologicalRegistry,
  'home-improvement': HomeImprovementRegistry,
  parenting: ParentingRegistry,
  'personal-budgeting': PersonalBudgetingRegistry,
  technology: TechnologyRegistry,
  'time-date': TimeDateRegistry,
  'travel-adventure': TravelAdventureRegistry,
  wellness: HealthFitnessRegistry,
};

export function CalculatorWrapper({ categorySlug, calculatorSlug }: CalculatorWrapperProps) {
  let resolvedSlug = calculatorSlug;
  // Alias wellness to health-fitness with adjusted slug
  if (categorySlug === 'wellness') {
    resolvedSlug = calculatorSlug.endsWith('-calculator')
      ? calculatorSlug.replace('-calculator', '-wellness-calculator')
      : `${calculatorSlug}-wellness-calculator`;
  }

  const Registry = registries[categorySlug === 'wellness' ? 'health-fitness' : categorySlug];

  if (!Registry) {
    return (
      <div style={{ minHeight: '500px', width: '100%' }}>
        <CalculatorNotFound />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Registry calculatorSlug={resolvedSlug} />
    </div>
  );
}
