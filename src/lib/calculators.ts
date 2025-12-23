
import { Calculator } from '../types';
import { business_startup_calculators } from '../data/calculators/business-startup';
import { conversion_calculators } from '../data/calculators/conversion';
import { cooking_food_calculators } from '../data/calculators/cooking-food';
import { engineering_calculators } from '../data/calculators/engineering';
import { environment_calculators } from '../data/calculators/environment';
import { finance_calculators } from '../data/calculators/finance';
import { health_fitness_calculators } from '../data/calculators/health-fitness';
import { home_improvement_calculators } from '../data/calculators/home-improvement';
import { personal_budgeting_calculators } from '../data/calculators/personal-budgeting';
import { technology_calculators } from '../data/calculators/technology';
import { time_date_calculators } from '../data/calculators/time-date';
import { travel_adventure_calculators } from '../data/calculators/travel-adventure';

export const calculators: Calculator[] = [
  ...business_startup_calculators,
  ...conversion_calculators,
  ...cooking_food_calculators,
  ...engineering_calculators,
  ...environment_calculators,
  ...finance_calculators,
  ...health_fitness_calculators,
  ...home_improvement_calculators,
  ...personal_budgeting_calculators,
  ...technology_calculators,
  ...time_date_calculators,
  ...travel_adventure_calculators,
];