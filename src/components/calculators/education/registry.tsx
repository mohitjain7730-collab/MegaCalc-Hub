'use client';

import React, { lazy } from 'react';

const components: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
    'average-percentage-calculator': lazy(() => import('./average-percentage-calculator')),
    'comparative-difference-calculator': lazy(() => import('./comparative-difference-calculator')),
    'compounding-increase-calculator': lazy(() => import('./compounding-increase-calculator')),
    'doubling-time-calculator': lazy(() => import('./doubling-time-calculator')),
    'fraction-to-percent-calculator': lazy(() => import('./fraction-to-percent-calculator')),
    'fuel-cost-calculator': lazy(() => import('./fuel-cost-calculator')),
};

export default function EducationRegistry({ calculatorSlug }: { calculatorSlug: string }) {
    const Component = components[calculatorSlug];

    if (!Component) {
        console.warn(`Calculator not found in education registry: ${calculatorSlug}`);
        return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
    }

    return <Component />;
}
