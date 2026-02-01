import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const BackpackWeightCalculatorComponent_0 = dynamic(() => import('./backpack-weight-calculator'));
const BusVsTrainCostCalculatorComponent_1 = dynamic(() => import('./bus-vs-train-cost-calculator'));
const CarVsFlightCalculatorComponent_2 = dynamic(() => import('./car-vs-flight-calculator'));
const CostPerMileCalculatorComponent_3 = dynamic(() => import('./cost-per-mile-calculator'));
const CruiseCostCalculatorComponent_4 = dynamic(() => import('./cruise-cost-calculator'));
const DistanceBetweenCitiesCalculatorComponent_5 = dynamic(() => import('./distance-between-cities-calculator'));
const DrivingTimeWithBreaksCalculatorComponent_6 = dynamic(() => import('./driving-time-with-breaks-calculator'));
const EvChargingCostCalculatorComponent_7 = dynamic(() => import('./ev-charging-cost-calculator'));
const FlightDurationCalculatorComponent_8 = dynamic(() => import('./flight-duration-calculator'));
const FuelCostCalculatorComponent_9 = dynamic(() => import('./fuel-cost-calculator'));
const GroupExpenseSplitterComponent_10 = dynamic(() => import('./group-expense-splitter'));
const HikingCalorieCalculatorComponent_11 = dynamic(() => import('./hiking-calorie-calculator'));
const HikingTimeCalculatorComponent_12 = dynamic(() => import('./hiking-time-calculator'));
const HotelCostCalculatorComponent_13 = dynamic(() => import('./hotel-cost-calculator'));
const ItineraryTimePlannerComponent_14 = dynamic(() => import('./itinerary-time-planner'));
const JetLagCalculatorComponent_15 = dynamic(() => import('./jet-lag-calculator'));
const LayoverTimeCalculatorComponent_16 = dynamic(() => import('./layover-time-calculator'));
const MultiStopRoutePlannerComponent_17 = dynamic(() => import('./multi-stop-route-planner'));
const RentalCarCostCalculatorComponent_18 = dynamic(() => import('./rental-car-cost-calculator'));
const TimeZoneDifferenceCalculatorComponent_19 = dynamic(() => import('./time-zone-difference-calculator'));
const TravelBufferTimeCalculatorComponent_20 = dynamic(() => import('./travel-buffer-time-calculator'));
const TravelDaysCalculatorComponent_21 = dynamic(() => import('./travel-days-calculator'));
const TravelTimeCalculatorComponent_22 = dynamic(() => import('./travel-time-calculator'));
const TripBudgetCalculatorComponent_23 = dynamic(() => import('./trip-budget-calculator'));

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
