'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Utensils, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  gender: z.enum(['male', 'female']).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active']).optional(),
  growthPattern: z.enum(['normal', 'slow', 'rapid']).optional(),
  appetite: z.enum(['poor', 'fair', 'good', 'excellent']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateToddlerCalorieRequirements(values: FormValues) {
  const age = values.age || 2; // years
  const weight = values.weight || 12; // kg
  const height = values.height || 85; // cm
  const gender = values.gender || 'male';
  
  // Base calorie needs based on age and weight
  let baseCalories = 0;
  
  if (age < 1) {
    // 12-24 months
    baseCalories = weight * 100; // 100 kcal/kg
  } else if (age < 2) {
    // 24-36 months
    baseCalories = weight * 95; // 95 kcal/kg
  } else if (age < 3) {
    // 36-48 months
    baseCalories = weight * 90; // 90 kcal/kg
  } else {
    // 4+ years
    baseCalories = weight * 85; // 85 kcal/kg
  }
  
  // Activity level adjustments
  const activityMultipliers = {
    sedentary: 1.0,
    light: 1.1,
    moderate: 1.2,
    active: 1.3,
  };
  
  const activityLevel = values.activityLevel || 'moderate';
  let adjustedCalories = baseCalories * activityMultipliers[activityLevel];
  
  // Growth pattern adjustments
  if (values.growthPattern === 'rapid') {
    adjustedCalories += 100; // Additional calories for growth spurts
  } else if (values.growthPattern === 'slow') {
    adjustedCalories -= 50; // Reduced calories for slower growth
  }
  
  // Appetite considerations
  if (values.appetite === 'poor') {
    adjustedCalories = Math.min(adjustedCalories, baseCalories * 1.1); // Limit to minimal increase
  } else if (values.appetite === 'excellent') {
    adjustedCalories += 50; // Additional calories for high appetite
  }
  
  // Calculate macronutrient distribution
  const proteinGrams = Math.round((adjustedCalories * 0.15) / 4); // 15% of calories from protein
  const fatGrams = Math.round((adjustedCalories * 0.35) / 9); // 35% of calories from fat
  const carbGrams = Math.round((adjustedCalories * 0.50) / 4); // 50% of calories from carbohydrates
  
  // Meal distribution
  const breakfastCalories = Math.round(adjustedCalories * 0.25);
  const lunchCalories = Math.round(adjustedCalories * 0.30);
  const dinnerCalories = Math.round(adjustedCalories * 0.25);
  const snacksCalories = Math.round(adjustedCalories * 0.20);
  
  return {
    totalCalories: Math.round(adjustedCalories),
    baseCalories: Math.round(baseCalories),
    proteinGrams,
    fatGrams,
    carbGrams,
    mealDistribution: {
      breakfast: breakfastCalories,
      lunch: lunchCalories,
      dinner: dinnerCalories,
      snacks: snacksCalories,
    },
    ageGroup: age < 1 ? '12-24 months' : age < 2 ? '24-36 months' : age < 3 ? '36-48 months' : '4+ years',
  };
}

export default function ToddlerCalorieRequirementCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateToddlerCalorieRequirements> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      height: undefined,
      gender: undefined,
      activityLevel: undefined,
      growthPattern: undefined,
      appetite: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateToddlerCalorieRequirements(values));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem>
                <FormLabel>Age (years)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.5" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="weight" render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="height" render={({ field }) => (
              <FormItem>
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="activityLevel" render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Level</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="sedentary">Sedentary (minimal activity)</option>
                  <option value="light">Light Activity (some play)</option>
                  <option value="moderate">Moderate Activity (active play)</option>
                  <option value="active">Very Active (constant movement)</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="growthPattern" render={({ field }) => (
              <FormItem>
                <FormLabel>Growth Pattern</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="normal">Normal Growth</option>
                  <option value="slow">Slow Growth</option>
                  <option value="rapid">Rapid Growth</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="appetite" render={({ field }) => (
              <FormItem>
                <FormLabel>Current Appetite</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="poor">Poor (picky eater)</option>
                  <option value="fair">Fair (inconsistent)</option>
                  <option value="good">Good (eats well)</option>
                  <option value="excellent">Excellent (always hungry)</option>
                </select>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Calorie Requirements</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Utensils className="h-8 w-8 text-primary" />
              <CardTitle>Toddler Calorie Requirements</CardTitle>
            </div>
            <CardDescription>For {result.ageGroup} age group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.totalCalories}</p>
                <p className="text-lg text-muted-foreground">Daily Calories Recommended</p>
                <p className="text-sm text-muted-foreground">Base: {result.baseCalories} calories</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded">
                  <h4 className="font-semibold">Protein</h4>
                  <p className="text-xl font-bold">{result.proteinGrams}g</p>
                  <p className="text-xs text-muted-foreground">15% of calories</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded">
                  <h4 className="font-semibold">Fat</h4>
                  <p className="text-xl font-bold">{result.fatGrams}g</p>
                  <p className="text-xs text-muted-foreground">35% of calories</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded">
                  <h4 className="font-semibold">Carbs</h4>
                  <p className="text-xl font-bold">{result.carbGrams}g</p>
                  <p className="text-xs text-muted-foreground">50% of calories</p>
                </div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Daily Meal Distribution</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold">{result.mealDistribution.breakfast}</p>
                    <p className="text-sm text-muted-foreground">Breakfast (25%)</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{result.mealDistribution.lunch}</p>
                    <p className="text-sm text-muted-foreground">Lunch (30%)</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{result.mealDistribution.dinner}</p>
                    <p className="text-sm text-muted-foreground">Dinner (25%)</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{result.mealDistribution.snacks}</p>
                    <p className="text-sm text-muted-foreground">Snacks (20%)</p>
                  </div>
                </div>
              </div>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.totalCalories >= 1200 ? 'High calorie needs for active growing toddler. Ensure nutrient-dense foods and regular meal times.' : 
                 result.totalCalories >= 1000 ? 'Moderate calorie needs. Focus on balanced meals with healthy fats for brain development.' :
                 result.totalCalories >= 800 ? 'Lower calorie needs. Monitor growth and ensure adequate nutrition despite smaller portions.' :
                 'Very low calorie needs. Consult pediatrician to ensure adequate nutrition and growth.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Toddler Calorie Requirement Calculator – Age-Appropriate Nutrition and Growth" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Calculate daily calorie needs for toddlers based on age, weight, activity level, and growth patterns with meal distribution." />

        <h2 className="text-xl font-bold text-foreground">Guide: Toddler Nutrition and Calorie Needs</h2>
        <p>Toddlers have unique nutritional needs that support rapid brain development and physical growth. Understanding their calorie requirements helps ensure optimal development:</p>
        <h3 className="font-semibold text-foreground mt-4">Age-Based Calorie Requirements</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>12-24 months: ~100 kcal/kg body weight</li>
          <li>24-36 months: ~95 kcal/kg body weight</li>
          <li>36-48 months: ~90 kcal/kg body weight</li>
          <li>4+ years: ~85 kcal/kg body weight</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Macronutrient Distribution</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Protein: 15% of calories (essential for growth)</li>
          <li>Fat: 35% of calories (critical for brain development)</li>
          <li>Carbohydrates: 50% of calories (primary energy source)</li>
          <li>Focus on nutrient-dense foods over empty calories</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/infant-growth-percentile-calculator">Infant Growth Percentile Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/child-bmi-percentile-calculator">Child BMI Percentile Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/breastfeeding-calorie-needs-calculator">Breastfeeding Calorie Needs Calculator</Link></p>
      </div>
    </div>
  );
}
