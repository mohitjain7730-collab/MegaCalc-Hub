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
const CricketPlayerPerformanceIndexCalculator = dynamic(() => import('./cricket-player-performance-index-calculator'));
const CricketFantasyPointsCalculator = dynamic(() => import('./cricket-fantasy-points-calculator'));
const CricketWinProbabilityCalculator = dynamic(() => import('./cricket-win-probability-calculator'));
const CricketPartnershipRunRateCalculator = dynamic(() => import('./cricket-partnership-run-rate-calculator'));
const PowerplayRunRateCalculator = dynamic(() => import('./powerplay-run-rate-calculator'));
const RunContributionPercentageCalculator = dynamic(() => import('./run-contribution-percentage-calculator'));
const TeamBattingAverageCalculator = dynamic(() => import('./team-batting-average-calculator'));
const MatchImpactScoreCalculator = dynamic(() => import('./match-impact-score-calculator'));
const FootballGoalConversionRateCalculator = dynamic(() => import('./football-goal-conversion-rate-calculator'));
const FootballPassAccuracyCalculator = dynamic(() => import('./football-pass-accuracy-calculator'));

export const SportsTrainingRegistry: Record<string, React.ComponentType> = {
    'batting-average-calculator': BattingAverageCalculator,
    'bowling-average-calculator': BowlingAverageCalculator,
    'strike-rate-calculator': StrikeRateCalculator,
    'bowling-economy-rate-calculator': BowlingEconomyRateCalculator,
    'required-run-rate-calculator': RequiredRunRateCalculator,
    'team-run-rate-calculator': TeamRunRateCalculator,
    'cricket-player-performance-index-calculator': CricketPlayerPerformanceIndexCalculator,
    'cricket-fantasy-points-calculator': CricketFantasyPointsCalculator,
    'cricket-win-probability-calculator': CricketWinProbabilityCalculator,
    'cricket-partnership-run-rate-calculator': CricketPartnershipRunRateCalculator,
    'boundary-percentage-calculator': dynamic(() => import('./boundary-percentage-calculator')),
    'over-economy-tracker': dynamic(() => import('./over-economy-tracker')),
    'dot-ball-percentage-calculator': dynamic(() => import('./dot-ball-percentage-calculator')),
    'bowling-strike-rate-calculator': dynamic(() => import('./bowling-strike-rate-calculator')),
    'powerplay-run-rate-calculator': PowerplayRunRateCalculator,
    'run-contribution-percentage-calculator': RunContributionPercentageCalculator,
    'team-batting-average-calculator': TeamBattingAverageCalculator,
    'match-impact-score-calculator': MatchImpactScoreCalculator,
    'football-goal-conversion-rate-calculator': FootballGoalConversionRateCalculator,
    'football-pass-accuracy-calculator': FootballPassAccuracyCalculator,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
    const Component = SportsTrainingRegistry[calculatorSlug];

    if (!Component) {
        console.warn(`Calculator not found in registry: ${calculatorSlug}`);
        return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
    }

    return <Component />;
}
