import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const AgeCalculatorComponent_0 = dynamic(() => import('./age-calculator'));
const DateDifferenceCalculatorComponent_1 = dynamic(() => import('./date-difference-calculator'));
const DayOfTheWeekCalculatorComponent_2 = dynamic(() => import('./day-of-the-week-calculator'));
const WorkingDaysBusinessDaysCalculatorComponent_3 = dynamic(() => import('./working-days-business-days-calculator'));
const WorldTimeZoneConverterComponent_4 = dynamic(() => import('./world-time-zone-converter'));

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'age-calculator': AgeCalculatorComponent_0,
  'date-difference-calculator': DateDifferenceCalculatorComponent_1,
  'day-of-the-week-calculator': DayOfTheWeekCalculatorComponent_2,
  'working-days-business-days-calculator': WorkingDaysBusinessDaysCalculatorComponent_3,
  'world-time-zone-converter': WorldTimeZoneConverterComponent_4,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
