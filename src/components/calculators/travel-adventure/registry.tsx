import React from 'react';
import type { ComponentType } from 'react';

import BackpackWeightCalculatorComponent_0 from './backpack-weight-calculator';
import BusVsTrainCostCalculatorComponent_1 from './bus-vs-train-cost-calculator';
import CarVsFlightCalculatorComponent_2 from './car-vs-flight-calculator';
import CostPerMileCalculatorComponent_3 from './cost-per-mile-calculator';
import CruiseCostCalculatorComponent_4 from './cruise-cost-calculator';
import DistanceBetweenCitiesCalculatorComponent_5 from './distance-between-cities-calculator';
import DrivingTimeWithBreaksCalculatorComponent_6 from './driving-time-with-breaks-calculator';
import EvChargingCostCalculatorComponent_7 from './ev-charging-cost-calculator';
import FlightDurationCalculatorComponent_8 from './flight-duration-calculator';
import FuelCostCalculatorComponent_9 from './fuel-cost-calculator';
import GroupExpenseSplitterComponent_10 from './group-expense-splitter';
import HikingCalorieCalculatorComponent_11 from './hiking-calorie-calculator';
import HikingTimeCalculatorComponent_12 from './hiking-time-calculator';
import HotelCostCalculatorComponent_13 from './hotel-cost-calculator';
import ItineraryTimePlannerComponent_14 from './itinerary-time-planner';
import JetLagCalculatorComponent_15 from './jet-lag-calculator';
import LayoverTimeCalculatorComponent_16 from './layover-time-calculator';
import MultiStopRoutePlannerComponent_17 from './multi-stop-route-planner';
import RentalCarCostCalculatorComponent_18 from './rental-car-cost-calculator';
import TimeZoneDifferenceCalculatorComponent_19 from './time-zone-difference-calculator';
import TravelBufferTimeCalculatorComponent_20 from './travel-buffer-time-calculator';
import TravelDaysCalculatorComponent_21 from './travel-days-calculator';
import TravelTimeCalculatorComponent_22 from './travel-time-calculator';
import TripBudgetCalculatorComponent_23 from './trip-budget-calculator';

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'backpack-weight-calculator': BackpackWeightCalculatorComponent_0,
  'bus-vs-train-cost-calculator': BusVsTrainCostCalculatorComponent_1,
  'car-vs-flight-calculator': CarVsFlightCalculatorComponent_2,
  'cost-per-mile-calculator': CostPerMileCalculatorComponent_3,
  'cruise-cost-calculator': CruiseCostCalculatorComponent_4,
  'distance-between-cities-calculator': DistanceBetweenCitiesCalculatorComponent_5,
  'driving-time-with-breaks-calculator': DrivingTimeWithBreaksCalculatorComponent_6,
  'ev-charging-cost-calculator': EvChargingCostCalculatorComponent_7,
  'flight-duration-calculator': FlightDurationCalculatorComponent_8,
  'fuel-cost-calculator': FuelCostCalculatorComponent_9,
  'group-expense-splitter': GroupExpenseSplitterComponent_10,
  'hiking-calorie-calculator': HikingCalorieCalculatorComponent_11,
  'hiking-time-calculator': HikingTimeCalculatorComponent_12,
  'hotel-cost-calculator': HotelCostCalculatorComponent_13,
  'itinerary-time-planner': ItineraryTimePlannerComponent_14,
  'jet-lag-calculator': JetLagCalculatorComponent_15,
  'layover-time-calculator': LayoverTimeCalculatorComponent_16,
  'multi-stop-route-planner': MultiStopRoutePlannerComponent_17,
  'rental-car-cost-calculator': RentalCarCostCalculatorComponent_18,
  'time-zone-difference-calculator': TimeZoneDifferenceCalculatorComponent_19,
  'travel-buffer-time-calculator': TravelBufferTimeCalculatorComponent_20,
  'travel-days-calculator': TravelDaysCalculatorComponent_21,
  'travel-time-calculator': TravelTimeCalculatorComponent_22,
  'trip-budget-calculator': TripBudgetCalculatorComponent_23,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
