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
import { Baby, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very-active']).optional(),
  breastfeedingFrequency: z.enum(['exclusive', 'mostly-breastfeeding', 'mixed-feeding', 'occasional']).optional(),
  babyAge: z.number().positive().optional(),
  weightGoal: z.enum(['maintain', 'lose-slow', 'lose-moderate', 'gain']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateBreastfeedingCalorieNeeds(values: FormValues) {
  const age = values.age || 30;
  const weight = values.weight || 65; // kg
  const height = values.height || 165; // cm
  const babyAge = values.babyAge || 3; // months
  
  // Calculate BMR using Mifflin-St Jeor equation
  const heightInMeters = height / 100;
  const bmr = 10 * weight + 6.25 * height - 5 * age - 161; // Female BMR
  
  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    'very-active': 1.9,
  };
  
  const activityLevel = values.activityLevel || 'moderate';
  const maintenanceCalories = bmr * activityMultipliers[activityLevel];
  
  // Breastfeeding calorie needs
  let breastfeedingCalories = 0;
  if (values.breastfeedingFrequency === 'exclusive') {
    breastfeedingCalories = babyAge <= 6 ? 500 : 400;
  } else if (values.breastfeedingFrequency === 'mostly-breastfeeding') {
    breastfeedingCalories = babyAge <= 6 ? 400 : 300;
  } else if (values.breastfeedingFrequency === 'mixed-feeding') {
    breastfeedingCalories = babyAge <= 6 ? 200 : 150;
  } else if (values.breastfeedingFrequency === 'occasional') {
    breastfeedingCalories = 100;
  }
  
  // Total base calories needed
  const totalBaseCalories = maintenanceCalories + breastfeedingCalories;
  
  // Weight goal adjustments
  let adjustedCalories = totalBaseCalories;
  if (values.weightGoal === 'lose-slow') {
    adjustedCalories -= 250; // 0.5 lb per week loss
  } else if (values.weightGoal === 'lose-moderate') {
    adjustedCalories -= 500; // 1 lb per week loss
  } else if (values.weightGoal === 'gain') {
    adjustedCalories += 300; // Slow weight gain
  }
  
  // Minimum safe calories for breastfeeding
  const minimumCalories = 1800; // Below this may affect milk supply
  const finalCalories = Math.max(adjustedCalories, minimumCalories);
  
  return {
    bmr: Math.round(bmr),
    maintenanceCalories: Math.round(maintenanceCalories),
    breastfeedingCalories,
    totalBaseCalories: Math.round(totalBaseCalories),
    finalCalories: Math.round(finalCalories),
    isBelowMinimum: adjustedCalories < minimumCalories,
  };
}

export default function BreastfeedingCalorieNeedsCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateBreastfeedingCalorieNeeds> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      height: undefined,
      activityLevel: undefined,
      breastfeedingFrequency: undefined,
      babyAge: undefined,
      weightGoal: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateBreastfeedingCalorieNeeds(values));
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
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="weight" render={({ field }) => (
              <FormItem>
                <FormLabel>Current Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
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
            <FormField control={form.control} name="babyAge" render={({ field }) => (
              <FormItem>
                <FormLabel>Baby Age (months)</FormLabel>
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
                  <option value="sedentary">Sedentary (little/no exercise)</option>
                  <option value="light">Light Activity (light exercise 1-3 days/week)</option>
                  <option value="moderate">Moderate Activity (moderate exercise 3-5 days/week)</option>
                  <option value="active">Active (hard exercise 6-7 days/week)</option>
                  <option value="very-active">Very Active (very hard exercise, physical job)</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="breastfeedingFrequency" render={({ field }) => (
              <FormItem>
                <FormLabel>Breastfeeding Frequency</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="exclusive">Exclusive Breastfeeding</option>
                  <option value="mostly-breastfeeding">Mostly Breastfeeding</option>
                  <option value="mixed-feeding">Mixed Feeding</option>
                  <option value="occasional">Occasional Breastfeeding</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="weightGoal" render={({ field }) => (
              <FormItem>
                <FormLabel>Weight Goal</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="maintain">Maintain Current Weight</option>
                  <option value="lose-slow">Lose Weight Slowly (0.5 lb/week)</option>
                  <option value="lose-moderate">Lose Weight Moderately (1 lb/week)</option>
                  <option value="gain">Gain Weight</option>
                </select>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Calorie Needs</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Baby className="h-8 w-8 text-primary" />
              <CardTitle>Breastfeeding Calorie Needs</CardTitle>
            </div>
            <CardDescription>Daily calorie requirements for optimal milk production</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.finalCalories}</p>
                <p className="text-lg text-muted-foreground">Daily Calories Recommended</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded">
                  <p className="text-xl font-bold">{result.bmr}</p>
                  <p className="text-sm text-muted-foreground">BMR</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded">
                  <p className="text-xl font-bold">{result.maintenanceCalories}</p>
                  <p className="text-sm text-muted-foreground">Maintenance</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded">
                  <p className="text-xl font-bold">+{result.breastfeedingCalories}</p>
                  <p className="text-sm text-muted-foreground">Breastfeeding</p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded">
                  <p className="text-xl font-bold">{result.totalBaseCalories}</p>
                  <p className="text-sm text-muted-foreground">Total Base</p>
                </div>
              </div>
              
              {result.isBelowMinimum && (
                <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Important Note</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Your calculated needs are below the minimum safe level (1,800 calories) for breastfeeding mothers. 
                    This may affect milk supply. Consider adjusting your weight loss goals.
                  </p>
                </div>
              )}
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.breastfeedingCalories >= 400 ? 'High calorie needs due to exclusive breastfeeding. Focus on nutrient-dense foods and stay hydrated.' : 
                 result.breastfeedingCalories >= 200 ? 'Moderate calorie needs for mixed feeding. Balance nutrition with gradual weight management.' :
                 result.breastfeedingCalories > 0 ? 'Lower calorie needs for occasional breastfeeding. Focus on overall health and nutrition.' :
                 'No additional calories needed for breastfeeding. Focus on balanced nutrition and healthy lifestyle.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Breastfeeding Calorie Needs Calculator – Optimal Nutrition for Milk Production" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Calculate daily calorie needs for breastfeeding mothers based on activity level, feeding frequency, and weight goals." />

        <h2 className="text-xl font-bold text-foreground">Guide: Nutrition During Breastfeeding</h2>
        <p>Breastfeeding increases calorie and nutrient needs significantly. Proper nutrition supports both mother and baby health:</p>
        <h3 className="font-semibold text-foreground mt-4">Calorie Requirements</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Exclusive breastfeeding: +500 calories/day (first 6 months)</li>
          <li>Mixed feeding: +200-400 calories/day</li>
          <li>Minimum safe intake: 1,800 calories/day</li>
          <li>Gradual weight loss: 0.5-1 lb per week maximum</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Essential Nutrients</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Protein: 25g additional daily</li>
          <li>Calcium: 1,000mg daily for bone health</li>
          <li>Iron: 9mg daily (consider supplements)</li>
          <li>DHA: 200-300mg daily for baby brain development</li>
          <li>Vitamin D: 600-1000 IU daily</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/pregnancy-weight-gain-calculator">Pregnancy Weight Gain Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/infant-growth-percentile-calculator">Infant Growth Percentile Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/toddler-calorie-requirement-calculator">Toddler Calorie Requirement Calculator</Link></p>
      </div>
    </div>
  );
}
