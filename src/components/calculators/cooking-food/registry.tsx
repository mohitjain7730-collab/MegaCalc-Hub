import dynamic from 'next/dynamic';
import React from 'react';
import type { ComponentType } from 'react';

const BriningSolutionCalculatorComponent_0 = dynamic(() => import('./brining-solution-calculator'));
const CookingTimeAdjusterComponent_1 = dynamic(() => import('./cooking-time-adjuster'));
const MeatThawingTimeCalculatorComponent_2 = dynamic(() => import('./meat-thawing-time-calculator'));
const RecipeIngredientConverterComponent_3 = dynamic(() => import('./recipe-ingredient-converter'));
const RecipeNutritionCalculatorComponent_4 = dynamic(() => import('./recipe-nutrition-calculator'));

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
