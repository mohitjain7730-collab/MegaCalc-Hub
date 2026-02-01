import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const BirthdayCompatibilityCalculatorComponent_0 = dynamic(() => import('./birthday-compatibility-calculator'));
const CrushCompatibilityCalculatorComponent_1 = dynamic(() => import('./crush-compatibility-calculator'));
const FriendshipCompatibilityCalculatorComponent_2 = dynamic(() => import('./friendship-compatibility-calculator'));
const FuturePartnerNameGeneratorComponent_3 = dynamic(() => import('./future-partner-name-generator'));
const LovePercentageCalculatorComponent_4 = dynamic(() => import('./love-percentage-calculator'));
const MarriageCompatibilityCalculatorComponent_5 = dynamic(() => import('./marriage-compatibility-calculator'));
const NameCompatibilityCalculatorComponent_6 = dynamic(() => import('./name-compatibility-calculator'));
const RelationshipStrengthTestComponent_7 = dynamic(() => import('./relationship-strength-test'));
const RomanticQuizCalculatorComponent_8 = dynamic(() => import('./romantic-quiz-calculator'));
const ZodiacMatchCalculatorComponent_9 = dynamic(() => import('./zodiac-match-calculator'));

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'birthday-compatibility-calculator': BirthdayCompatibilityCalculatorComponent_0,
  'crush-compatibility-calculator': CrushCompatibilityCalculatorComponent_1,
  'friendship-compatibility-calculator': FriendshipCompatibilityCalculatorComponent_2,
  'future-partner-name-generator': FuturePartnerNameGeneratorComponent_3,
  'love-percentage-calculator': LovePercentageCalculatorComponent_4,
  'marriage-compatibility-calculator': MarriageCompatibilityCalculatorComponent_5,
  'name-compatibility-calculator': NameCompatibilityCalculatorComponent_6,
  'relationship-strength-test': RelationshipStrengthTestComponent_7,
  'romantic-quiz-calculator': RomanticQuizCalculatorComponent_8,
  'zodiac-match-calculator': ZodiacMatchCalculatorComponent_9,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
