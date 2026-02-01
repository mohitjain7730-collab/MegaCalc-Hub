import React from 'react';
import type { ComponentType } from 'react';

import AttentionSpanEstimatorComponent_0 from './attention-span-estimator';
import CognitiveLoadCalculatorComponent_1 from './cognitive-load-calculator';
import EmotionalValenceScoringCalculatorComponent_2 from './emotional-valence-scoring-calculator';
import IqScoreEstimatorComponent_3 from './iq-score-estimator';
import MemorySpanCalculatorComponent_4 from './memory-span-calculator';
import MentalFatigueIndexCalculatorComponent_5 from './mental-fatigue-index-calculator';
import PersonalityTraitCalculatorComponent_6 from './personality-trait-calculator';
import SleepDebtCalculatorComponent_7 from './sleep-debt-calculator';
import StressLevelIndexCalculatorComponent_8 from './stress-level-index-calculator';
import StroopEffectReactionTimeCalculatorComponent_9 from './stroop-effect-reaction-time-calculator';

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'attention-span-estimator': AttentionSpanEstimatorComponent_0,
  'cognitive-load-calculator': CognitiveLoadCalculatorComponent_1,
  'emotional-valence-scoring-calculator': EmotionalValenceScoringCalculatorComponent_2,
  'iq-score-estimator': IqScoreEstimatorComponent_3,
  'memory-span-calculator': MemorySpanCalculatorComponent_4,
  'mental-fatigue-index-calculator': MentalFatigueIndexCalculatorComponent_5,
  'personality-trait-calculator': PersonalityTraitCalculatorComponent_6,
  'sleep-debt-calculator': SleepDebtCalculatorComponent_7,
  'stress-level-index-calculator': StressLevelIndexCalculatorComponent_8,
  'stroop-effect-reaction-time-calculator': StroopEffectReactionTimeCalculatorComponent_9,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
