import React from 'react';
import type { ComponentType } from 'react';

import BriningSolutionCalculatorComponent_0 from './brining-solution-calculator';
import CookingTimeAdjusterComponent_1 from './cooking-time-adjuster';
import MeatThawingTimeCalculatorComponent_2 from './meat-thawing-time-calculator';
import RecipeIngredientConverterComponent_3 from './recipe-ingredient-converter';
import RecipeNutritionCalculatorComponent_4 from './recipe-nutrition-calculator';

// Static imports for SSR - full content in initial HTML for SEO
const components: Record<string, ComponentType> = {
  'brining-solution-calculator': BriningSolutionCalculatorComponent_0,
  'cooking-time-adjuster': CookingTimeAdjusterComponent_1,
  'meat-thawing-time-calculator': MeatThawingTimeCalculatorComponent_2,
  'recipe-ingredient-converter': RecipeIngredientConverterComponent_3,
  'recipe-nutrition-calculator': RecipeNutritionCalculatorComponent_4,
};

export default function CalculatorRegistry({ calculatorSlug }: { calculatorSlug: string }) {
  const Component = components[calculatorSlug];

  if (!Component) {
    console.warn(`Calculator not found in registry: ${calculatorSlug}`);
    return <div className="p-8 text-center text-muted-foreground">Calculator not found.</div>;
  }

  return <Component />;
}
