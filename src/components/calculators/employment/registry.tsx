import React from 'react';
import type { ComponentType } from 'react';

import ContractDurationCalculatorComponent_0 from './contract-duration-calculator';
import EmploymentAnniversaryCalculatorComponent_1 from './employment-anniversary-calculator';
import FreelanceBillableHoursCalculatorComponent_2 from './freelance-billable-hours-calculator';
import LastWorkingDayCalculatorComponent_3 from './last-working-day-calculator';
import NightShiftDurationCalculatorComponent_4 from './night-shift-duration-calculator';
import NoticePeriodCalculatorComponent_5 from './notice-period-calculator';
import ProbationPeriodCalculatorComponent_6 from './probation-period-calculator';
import RemoteWorkTimeZoneOverlapCalculatorComponent_7 from './remote-work-time-zone-overlap-calculator';
import ShiftRotationCalculatorComponent_8 from './shift-rotation-calculator';
import SplitShiftHoursCalculatorComponent_9 from './split-shift-hours-calculator';

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'contract-duration-calculator': ContractDurationCalculatorComponent_0,
  'employment-anniversary-calculator': EmploymentAnniversaryCalculatorComponent_1,
  'freelance-billable-hours-calculator': FreelanceBillableHoursCalculatorComponent_2,
  'last-working-day-calculator': LastWorkingDayCalculatorComponent_3,
  'night-shift-duration-calculator': NightShiftDurationCalculatorComponent_4,
  'notice-period-calculator': NoticePeriodCalculatorComponent_5,
  'probation-period-calculator': ProbationPeriodCalculatorComponent_6,
  'remote-work-time-zone-overlap-calculator': RemoteWorkTimeZoneOverlapCalculatorComponent_7,
  'shift-rotation-calculator': ShiftRotationCalculatorComponent_8,
  'split-shift-hours-calculator': SplitShiftHoursCalculatorComponent_9,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
