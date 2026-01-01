'use client';

import React, { lazy } from 'react';

const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
    'average-percentage-calculator': lazy(() => import('./average-percentage-calculator')),
    'comparative-difference-calculator': lazy(() => import('./comparative-difference-calculator')),
    'compounding-increase-calculator': lazy(() => import('./compounding-increase-calculator')),
    'doubling-time-calculator': lazy(() => import('./doubling-time-calculator')),
    'fraction-to-percent-calculator': lazy(() => import('./fraction-to-percent-calculator')),
    'fuel-cost-calculator': lazy(() => import('./fuel-cost-calculator')),
    'historic-change-calculator': lazy(() => import('./historic-change-calculator')),
    'investment-growth-calculator': lazy(() => import('./investment-growth-calculator')),
    'percent-error-calculator': lazy(() => import('./percent-error-calculator')),
    'percent-to-goal-calculator': lazy(() => import('./percent-to-goal-calculator')),
    'percentage-of-a-percentage-calculator': lazy(() => import('./percentage-of-a-percentage-calculator')),
    'percentage-point-calculator': lazy(() => import('./percentage-point-calculator')),
    'relative-change-calculator': lazy(() => import('./relative-change-calculator')),
    'slope-percentage-calculator': lazy(() => import('./slope-percentage-calculator')),
    'time-percentage-calculator': lazy(() => import('./time-percentage-calculator')),
    'value-percentage-calculator': lazy(() => import('./value-percentage-calculator')),
};

export default function EducationRegistry({ calculatorSlug }: { calculatorSlug: string }) {
    const Component = components[calculatorSlug];

    if (!Component) {
        console.warn(`Calculator not found in education registry: ${calculatorSlug}`);
        return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
    }

    return <Component />;
}
