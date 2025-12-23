
import { Calculator } from '@/types';

export const travel_adventure_calculators: Calculator[] = [
    {
        id: 8001,
        name: 'Travel Time Calculator',
        description: 'Estimate the time it will take to travel a certain distance at a constant speed.',
        slug: 'travel-time-calculator',
        category: 'travel-adventure',
        metaTitle: 'Travel Time Calculator - Estimate Driving or Flying Time',
        metaDescription: 'Calculate travel time based on distance and average speed. Supports miles, kilometers, mph, and km/h inputs.'
    },
    {
        id: 8002,
        name: 'Distance Between Cities Calculator',
        description: 'Calculate the great-circle distance between two points on Earth using their latitude and longitude.',
        slug: 'distance-between-cities-calculator',
        category: 'travel-adventure',
        metaTitle: 'Distance Between Cities Calculator - Great Circle Distance',
        metaDescription: 'Find the straight-line distance between two cities or coordinates using the Haversine formula.'
    },
    {
        id: 8003,
        name: 'Time Zone Difference Calculator',
        description: 'Calculate the current time difference between any two time zones in the world.',
        slug: 'time-zone-difference-calculator',
        category: 'travel-adventure',
        metaTitle: 'Time Zone Difference Calculator - Compare World Times',
        metaDescription: 'Instantly calculate the time difference between two time zones and view live clocks for both locations.'
    },
    {
        id: 8004,
        name: 'Driving Time with Breaks Calculator',
        description: 'Estimate total driving trip time including planned rest stops and breaks.',
        slug: 'driving-time-with-breaks-calculator',
        category: 'travel-adventure',
        metaTitle: 'Driving Time with Breaks Calculator - Road Trip Planner',
        metaDescription: 'Calculate total road trip time by adding driving duration and planned breaks for food, fuel, and rest.'
    },
    {
        id: 8005,
        name: 'Flight Duration Calculator',
        description: 'Calculate the total duration of a flight by providing departure and arrival times and their respective time zones.',
        slug: 'flight-duration-calculator',
        category: 'travel-adventure',
        metaTitle: 'Flight Duration Calculator - Calculate Air Travel Time',
        metaDescription: 'Compute the exact duration of a flight using departure and arrival times and time zones.'
    },
    {
        id: 8006,
        name: 'Itinerary Time Planner',
        description: 'Plan your day by adding activities and durations to see if they fit within your schedule.',
        slug: 'itinerary-time-planner',
        category: 'travel-adventure',
        metaTitle: 'Itinerary Time Planner - Trip Activity Scheduler',
        metaDescription: 'Organize your travel itinerary by calculating total activity time and remaining free time in your schedule.'
    },
    {
        id: 8007,
        name: 'Jet Lag Calculator',
        description: 'Estimate the severity of jet lag and get recovery advice based on your flight details.',
        slug: 'jet-lag-calculator',
        category: 'travel-adventure',
        metaTitle: 'Jet Lag Calculator - Recovery Estimator',
        metaDescription: 'Calculate expected jet lag recovery days based on time zones crossed and flight direction.'
    },
    {
        id: 8008,
        name: 'Layover Time Calculator',
        description: 'Calculate the duration of a layover between two connecting flights.',
        slug: 'layover-time-calculator',
        category: 'travel-adventure',
        metaTitle: 'Layover Time Calculator - Connection Duration',
        metaDescription: 'Determine the exact time available between connecting flights to ensure you have enough time to transfer.'
    },
    {
        id: 8009,
        name: 'Travel Buffer Time Calculator',
        description: 'Calculate how much buffer time to add to your schedule for safe travel planning.',
        slug: 'travel-buffer-time-calculator',
        category: 'travel-adventure',
        metaTitle: 'Travel Buffer Time Calculator - Safety Margin Planner',
        metaDescription: 'Calculate appropriate buffer time for your trips to account for delays, traffic, and unexpected events.'
    },
    {
        id: 8010,
        name: 'Travel Days Calculator',
        description: 'Calculate the total number of days and nights for a trip based on start and end dates.',
        slug: 'travel-days-calculator',
        category: 'travel-adventure',
        metaTitle: 'Travel Days Calculator - Count Days and Nights',
        metaDescription: 'Easily calculate the total duration of your trip in days and nights from your departure and return dates.'
    },
    {
        id: 8011,
        name: 'Backpack Weight Calculator',
        description: 'Calculate your total pack weight and see how it compares to your body weight for optimal hiking performance.',
        slug: 'backpack-weight-calculator',
        category: 'travel-adventure',
        metaTitle: 'Backpack Weight Calculator - Hiking Base Weight',
        metaDescription: 'Analyze your backpacking gear weight and get recommendations based on your body weight.'
    },
    {
        id: 8012,
        name: 'Bus vs. Train Cost Calculator',
        description: 'Compare the total costs of taking a bus versus a train for your next trip to find the most economical option.',
        slug: 'bus-vs-train-cost-calculator',
        category: 'travel-adventure',
        metaTitle: 'Bus vs. Train Cost Calculator - Compare Fares',
        metaDescription: 'Find the cheapest ground transport option by comparing bus and train ticket prices, baggage fees, and total travel costs.'
    },
    {
        id: 8013,
        name: 'Car vs. Flight Cost Calculator',
        description: 'Determine whether driving or flying is the cheaper option for your next trip by comparing total costs.',
        slug: 'car-vs-flight-calculator',
        category: 'travel-adventure',
        metaTitle: 'Car vs. Flight Cost Calculator - Drive or Fly?',
        metaDescription: 'Compare the total cost of driving versus flying, including fuel, efficiency, tickets, baggage, and airport transfers.'
    },
    {
        id: 8014,
        name: 'Cost Per Mile Calculator',
        description: 'Calculate the exact cost per mile (or kilometer) for your trip to better understand your travel efficiency.',
        slug: 'cost-per-mile-calculator',
        category: 'travel-adventure',
        metaTitle: 'Cost Per Mile Calculator - Travel Efficiency',
        metaDescription: 'Determine your cost per mile or kilometer for any trip based on total expenses and distance traveled.'
    },
    {
        id: 8015,
        name: 'Cruise Cost Calculator',
        description: 'Estimate the true total cost of a cruise vacation by factoring in hidden fees, gratuities, and excursions.',
        slug: 'cruise-cost-calculator',
        category: 'travel-adventure',
        metaTitle: 'Cruise Cost Calculator - Total Vacation Budget',
        metaDescription: 'Calculate the real cost of a cruise including taxes, port fees, gratuities, insurance, and onboard spending.'
    },
    {
        id: 8016,
        name: 'EV Charging Cost Calculator',
        description: 'Calculate the cost to charge your electric vehicle for a specific trip distance.',
        slug: 'ev-charging-cost-calculator',
        category: 'travel-adventure',
        metaTitle: 'EV Charging Cost Calculator - Electric Vehicle Trip Cost',
        metaDescription: 'Estimate the electricity cost for an EV road trip based on efficiency, distance, and charging rates.'
    },
    {
        id: 8017,
        name: 'Fuel Cost Calculator',
        description: 'Estimate the total fuel cost for a road trip based on distance, fuel efficiency, and gas prices.',
        slug: 'fuel-cost-calculator',
        category: 'travel-adventure',
        metaTitle: 'Fuel Cost Calculator - Gas Price Estimator',
        metaDescription: 'Calculate gas or diesel costs for your road trip. Supports MPG, L/100km, gallons, and liters.'
    },
    {
        id: 8018,
        name: 'Group Expense Splitter',
        description: 'Easily split travel expenses among a group of friends or family members.',
        slug: 'group-expense-splitter',
        category: 'travel-adventure',
        metaTitle: 'Group Expense Splitter - Travel Cost Sharing',
        metaDescription: 'Track who paid what and calculate exactly who owes whom for shared travel expenses.'
    },
    {
        id: 8019,
        name: 'Hiking Calorie Calculator',
        description: 'Estimate the number of calories burned during a hike based on weight, duration, and intensity.',
        slug: 'hiking-calorie-calculator',
        category: 'travel-adventure',
        metaTitle: 'Hiking Calorie Calculator - Energy Burned',
        metaDescription: 'Calculate calories burned while hiking based on your body weight, hike duration, and trail difficulty.'
    },
    {
        id: 8020,
        name: 'Hiking Time Calculator',
        description: 'Estimate how long a hike will take based on distance, elevation gain, and your pace.',
        slug: 'hiking-time-calculator',
        category: 'travel-adventure',
        metaTitle: 'Hiking Time Calculator - Naismith\'s Rule',
        metaDescription: 'Predict hiking duration using distance and elevation gain. Plan your trek with accurate time estimates.'
    },
    {
        id: 8021,
        name: 'Hotel Cost Calculator',
        description: 'Calculate the total cost of your hotel stay including taxes, fees, and multiple rooms.',
        slug: 'hotel-cost-calculator',
        category: 'travel-adventure',
        metaTitle: 'Hotel Cost Calculator - Total Stay Estimation',
        metaDescription: 'Compute the full price of hotel accommodation including nightly rates, taxes, and service fees.'
    },
    {
        id: 8022,
        name: 'Multi-Stop Route Planner',
        description: 'Calculate the total distance and estimated driving time for a trip with multiple stops.',
        slug: 'multi-stop-route-planner',
        category: 'travel-adventure',
        metaTitle: 'Multi-Stop Route Planner - Trip Distance & Time',
        metaDescription: 'Plan a road trip with multiple stops. Calculate total distance and driving time between all waypoints.'
    },
    {
        id: 8023,
        name: 'Rental Car Cost Calculator',
        description: 'Estimate the full cost of renting a car, including insurance, taxes, and daily rates.',
        slug: 'rental-car-cost-calculator',
        category: 'travel-adventure',
        metaTitle: 'Rental Car Cost Calculator - Total Rental Price',
        metaDescription: 'Calculate the total cost of a rental car booking including daily rates, insurance, taxes, and extra fees.'
    },
    {
        id: 8024,
        name: 'Trip Budget Calculator',
        description: 'Plan your entire travel budget including flights, accommodation, food, and activities.',
        slug: 'trip-budget-calculator',
        category: 'travel-adventure',
        metaTitle: 'Trip Budget Calculator - Vacation Cost Planner',
        metaDescription: 'Create a comprehensive budget for your trip. Track expenses for transport, lodging, food, and fun.'
    }
];
