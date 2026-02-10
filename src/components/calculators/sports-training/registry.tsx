'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Static map of calculators to avoid dynamic import context creation
const BattingAverageCalculator = dynamic(() => import('./batting-average-calculator'));
const BowlingAverageCalculator = dynamic(() => import('./bowling-average-calculator'));
const StrikeRateCalculator = dynamic(() => import('./strike-rate-calculator'));
const BowlingEconomyRateCalculator = dynamic(() => import('./bowling-economy-rate-calculator'));
const RequiredRunRateCalculator = dynamic(() => import('./required-run-rate-calculator'));
const TeamRunRateCalculator = dynamic(() => import('./team-run-rate-calculator'));

export const SportsTrainingRegistry: Record<string, React.ComponentType> = {
    'batting-average-calculator': BattingAverageCalculator,
    'bowling-average-calculator': BowlingAverageCalculator,
    'strike-rate-calculator': StrikeRateCalculator,
    'bowling-economy-rate-calculator': BowlingEconomyRateCalculator,
    'required-run-rate-calculator': RequiredRunRateCalculator,
    'team-run-rate-calculator': TeamRunRateCalculator,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
    const Component = SportsTrainingRegistry[calculatorSlug];

    if (!Component) {
        console.warn(`Calculator not found in registry: ${calculatorSlug}`);
        return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
    }

    return <Component />;
}
