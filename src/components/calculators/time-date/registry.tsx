import React from 'react';
import type { ComponentType } from 'react';

import AgeCalculatorComponent_0 from './age-calculator';
import DateDifferenceCalculatorComponent_1 from './date-difference-calculator';
import DayOfTheWeekCalculatorComponent_2 from './day-of-the-week-calculator';
import WorkingDaysBusinessDaysCalculatorComponent_3 from './working-days-business-days-calculator';
import WorldTimeZoneConverterComponent_4 from './world-time-zone-converter';

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
