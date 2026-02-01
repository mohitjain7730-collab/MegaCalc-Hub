import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const ContractDurationCalculatorComponent_0 = dynamic(() => import('./contract-duration-calculator'));
const EmploymentAnniversaryCalculatorComponent_1 = dynamic(() => import('./employment-anniversary-calculator'));
const FreelanceBillableHoursCalculatorComponent_2 = dynamic(() => import('./freelance-billable-hours-calculator'));
const LastWorkingDayCalculatorComponent_3 = dynamic(() => import('./last-working-day-calculator'));
const NightShiftDurationCalculatorComponent_4 = dynamic(() => import('./night-shift-duration-calculator'));
const NoticePeriodCalculatorComponent_5 = dynamic(() => import('./notice-period-calculator'));
const ProbationPeriodCalculatorComponent_6 = dynamic(() => import('./probation-period-calculator'));
const RemoteWorkTimeZoneOverlapCalculatorComponent_7 = dynamic(() => import('./remote-work-time-zone-overlap-calculator'));
const ShiftRotationCalculatorComponent_8 = dynamic(() => import('./shift-rotation-calculator'));
const SplitShiftHoursCalculatorComponent_9 = dynamic(() => import('./split-shift-hours-calculator'));

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
