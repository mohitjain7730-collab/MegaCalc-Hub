import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const AttentionSpanEstimatorComponent_0 = dynamic(() => import('./attention-span-estimator'));
const CognitiveLoadCalculatorComponent_1 = dynamic(() => import('./cognitive-load-calculator'));
const EmotionalValenceScoringCalculatorComponent_2 = dynamic(() => import('./emotional-valence-scoring-calculator'));
const IqScoreEstimatorComponent_3 = dynamic(() => import('./iq-score-estimator'));
const MemorySpanCalculatorComponent_4 = dynamic(() => import('./memory-span-calculator'));
const MentalFatigueIndexCalculatorComponent_5 = dynamic(() => import('./mental-fatigue-index-calculator'));
const PersonalityTraitCalculatorComponent_6 = dynamic(() => import('./personality-trait-calculator'));
const SleepDebtCalculatorComponent_7 = dynamic(() => import('./sleep-debt-calculator'));
const StressLevelIndexCalculatorComponent_8 = dynamic(() => import('./stress-level-index-calculator'));
const StroopEffectReactionTimeCalculatorComponent_9 = dynamic(() => import('./stroop-effect-reaction-time-calculator'));

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
