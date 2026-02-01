import React from 'react';
import type { ComponentType } from 'react';

import BirthdayCompatibilityCalculatorComponent_0 from './birthday-compatibility-calculator';
import CrushCompatibilityCalculatorComponent_1 from './crush-compatibility-calculator';
import FriendshipCompatibilityCalculatorComponent_2 from './friendship-compatibility-calculator';
import FuturePartnerNameGeneratorComponent_3 from './future-partner-name-generator';
import LovePercentageCalculatorComponent_4 from './love-percentage-calculator';
import MarriageCompatibilityCalculatorComponent_5 from './marriage-compatibility-calculator';
import NameCompatibilityCalculatorComponent_6 from './name-compatibility-calculator';
import RelationshipStrengthTestComponent_7 from './relationship-strength-test';
import RomanticQuizCalculatorComponent_8 from './romantic-quiz-calculator';
import ZodiacMatchCalculatorComponent_9 from './zodiac-match-calculator';

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
