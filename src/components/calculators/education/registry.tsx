'use client';

import React, { lazy } from 'react';

const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
    'average-percentage-calculator': lazy(() => import('./maths/average-percentage-calculator')),
    'comparative-difference-calculator': lazy(() => import('./maths/comparative-difference-calculator')),
    'compounding-increase-calculator': lazy(() => import('./maths/compounding-increase-calculator')),
    'doubling-time-calculator': lazy(() => import('./maths/doubling-time-calculator')),
    'fraction-to-percent-calculator': lazy(() => import('./maths/fraction-to-percent-calculator')),
    'fuel-cost-calculator': lazy(() => import('./maths/fuel-cost-calculator')),
    'historic-change-calculator': lazy(() => import('./maths/historic-change-calculator')),
    'investment-growth-calculator': lazy(() => import('./maths/investment-growth-calculator')),
    'percent-error-calculator': lazy(() => import('./maths/percent-error-calculator')),
    'percent-to-goal-calculator': lazy(() => import('./maths/percent-to-goal-calculator')),
    'percentage-of-a-percentage-calculator': lazy(() => import('./maths/percentage-of-a-percentage-calculator')),
    'percentage-point-calculator': lazy(() => import('./maths/percentage-point-calculator')),
    'relative-change-calculator': lazy(() => import('./maths/relative-change-calculator')),
    'slope-percentage-calculator': lazy(() => import('./maths/slope-percentage-calculator')),
    'time-percentage-calculator': lazy(() => import('./maths/time-percentage-calculator')),
    'value-percentage-calculator': lazy(() => import('./maths/value-percentage-calculator')),
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
    const Component = components[calculatorSlug];

    if (!Component) {
        console.warn(`Calculator not found in registry: ${calculatorSlug}`);
        return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
    }

    return <Component />;
}
