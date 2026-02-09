
import React from 'react';
import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';

const BiologyRegistry = dynamic(() => import('@/components/calculators/biology/registry'));
const BusinessStartupRegistry = dynamic(() => import('@/components/calculators/business-startup/registry'));
const CognitivePsychologyRegistry = dynamic(() => import('@/components/calculators/cognitive-psychology/registry'));
const ConversionsRegistry = dynamic(() => import('@/components/calculators/conversions/registry'));
const CookingFoodRegistry = dynamic(() => import('@/components/calculators/cooking-food/registry'));
const SportsTrainingRegistry = dynamic(() => import('@/components/calculators/sports-training/registry'));
const CryptoWeb3Registry = dynamic(() => import('@/components/calculators/crypto-web3/registry'));
const EducationRegistry = dynamic(() => import('@/components/calculators/education/registry'));
const EmploymentRegistry = dynamic(() => import('@/components/calculators/employment/registry'));
const EngineeringRegistry = dynamic(() => import('@/components/calculators/engineering/registry'));
const EnvironmentRegistry = dynamic(() => import('@/components/calculators/environment/registry'));
const FinanceRegistry = dynamic(() => import('@/components/calculators/finance/registry'));
const FunGamesRegistry = dynamic(() => import('@/components/calculators/fun-games/registry'));
const GamingRegistry = dynamic(() => import('@/components/calculators/gaming/registry'));
const GeneticAncestryRegistry = dynamic(() => import('@/components/calculators/genetic-ancestry/registry'));
const HealthFitnessRegistry = dynamic(() => import('@/components/calculators/health-fitness/registry'));
const HistoricalArchaeologicalRegistry = dynamic(() => import('@/components/calculators/historical-archaeological/registry'));
const HomeImprovementRegistry = dynamic(() => import('@/components/calculators/home-improvement/registry'));
const ParentingRegistry = dynamic(() => import('@/components/calculators/parenting/registry'));
const PersonalBudgetingRegistry = dynamic(() => import('@/components/calculators/personal-budgeting/registry'));
const TechnologyRegistry = dynamic(() => import('@/components/calculators/technology/registry'));
const TimeDateRegistry = dynamic(() => import('@/components/calculators/time-date/registry'));
const TravelAdventureRegistry = dynamic(() => import('@/components/calculators/travel-adventure/registry'));

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

// Static registry map - server-rendered for SEO using dynamic imports to split chunks
const registries: Record<string, ComponentType<{ calculatorSlug: string }>> = {
  biology: BiologyRegistry,
  'business-startup': BusinessStartupRegistry,
  'cognitive-psychology': CognitivePsychologyRegistry,
  conversions: ConversionsRegistry,
  'cooking-food': CookingFoodRegistry,
  'sports-training': SportsTrainingRegistry,
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
