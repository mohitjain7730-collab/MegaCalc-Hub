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
import { Activity, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  gender: z.enum(['male', 'female']).optional(),
  bodyFatPercentage: z.number().positive().optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very-active']).optional(),
  goal: z.enum(['maintain', 'lose', 'gain']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateRestingMetabolicRate(values: FormValues) {
  const age = values.age || 30;
  const weight = values.weight || 70; // kg
  const height = values.height || 170; // cm
  const gender = values.gender || 'male';
  const bodyFatPercentage = values.bodyFatPercentage || 20; // %
  
  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Katch-McArdle equation (more accurate if body fat % is known)
  let leanBodyMass = weight * (1 - bodyFatPercentage / 100);
  let katchMcArdleBmr = 370 + (21.6 * leanBodyMass);
  
  // Use Katch-McArdle if body fat % is provided, otherwise use Mifflin-St Jeor
  let finalBmr = bodyFatPercentage ? katchMcArdleBmr : bmr;
  
  // Activity level multipliers for Total Daily Energy Expenditure (TDEE)
  const activityMultipliers = {
    sedentary: 1.2,      // Little to no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Heavy exercise 6-7 days/week
    'very-active': 1.9,  // Very heavy exercise, physical job
  };
  
  const activityLevel = values.activityLevel || 'moderate';
  const tdee = finalBmr * activityMultipliers[activityLevel];
  
  // Goal-based calorie adjustments
  let targetCalories = tdee;
  if (values.goal === 'lose') {
    targetCalories = tdee - 500; // 1 lb per week deficit
  } else if (values.goal === 'gain') {
    targetCalories = tdee + 300; // Slow weight gain
  }
  
  // Calculate macronutrient breakdown
  const proteinGrams = Math.round((targetCalories * 0.25) / 4); // 25% protein
  const fatGrams = Math.round((targetCalories * 0.25) / 9); // 25% fat
  const carbGrams = Math.round((targetCalories * 0.50) / 4); // 50% carbs
  
  return {
    bmr: Math.round(finalBmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    proteinGrams,
    fatGrams,
    carbGrams,
    activityLevel,
    goal: values.goal || 'maintain',
    leanBodyMass: Math.round(leanBodyMass * 10) / 10,
  };
}

export default function RestingMetabolicRateCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateRestingMetabolicRate> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      height: undefined,
      gender: undefined,
      bodyFatPercentage: undefined,
      activityLevel: undefined,
      goal: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateRestingMetabolicRate(values));
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
            <FormField control={form.control} name="bodyFatPercentage" render={({ field }) => (
              <FormItem>
                <FormLabel>Body Fat Percentage (optional)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="activityLevel" render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Level</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="sedentary">Sedentary (little/no exercise)</option>
                  <option value="light">Light Activity (1-3 days/week)</option>
                  <option value="moderate">Moderate Activity (3-5 days/week)</option>
                  <option value="active">Active (6-7 days/week)</option>
                  <option value="very-active">Very Active (2x/day or physical job)</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="goal" render={({ field }) => (
              <FormItem>
                <FormLabel>Weight Goal</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="maintain">Maintain Current Weight</option>
                  <option value="lose">Lose Weight (1 lb/week)</option>
                  <option value="gain">Gain Weight</option>
                </select>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate RMR & TDEE</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Activity className="h-8 w-8 text-primary" />
              <CardTitle>Metabolic Rate Analysis</CardTitle>
            </div>
            <CardDescription>Resting Metabolic Rate and Total Daily Energy Expenditure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">RMR</h4>
                  <p className="text-3xl font-bold">{result.bmr}</p>
                  <p className="text-sm text-muted-foreground">calories/day</p>
                  <p className="text-xs text-muted-foreground">Resting Metabolic Rate</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">TDEE</h4>
                  <p className="text-3xl font-bold">{result.tdee}</p>
                  <p className="text-sm text-muted-foreground">calories/day</p>
                  <p className="text-xs text-muted-foreground">Total Daily Energy Expenditure</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Target Intake</h4>
                  <p className="text-3xl font-bold">{result.targetCalories}</p>
                  <p className="text-sm text-muted-foreground">calories/day</p>
                  <p className="text-xs text-muted-foreground">For {result.goal} weight</p>
                </div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Macronutrient Breakdown</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold">{result.proteinGrams}g</p>
                    <p className="text-sm text-muted-foreground">Protein (25%)</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{result.fatGrams}g</p>
                    <p className="text-sm text-muted-foreground">Fat (25%)</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{result.carbGrams}g</p>
                    <p className="text-sm text-muted-foreground">Carbs (50%)</p>
                  </div>
                </div>
              </div>
              
              {result.leanBodyMass && (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                  <h4 className="font-semibold mb-2">Body Composition</h4>
                  <p className="text-lg font-bold">{result.leanBodyMass} kg</p>
                  <p className="text-sm text-muted-foreground">Lean Body Mass</p>
                </div>
              )}
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.goal === 'lose' ? 'Calorie deficit of 500 calories daily will result in approximately 1 lb of weight loss per week. Combine with strength training to preserve muscle mass.' : 
                 result.goal === 'gain' ? 'Calorie surplus of 300 calories daily will result in gradual weight gain. Focus on strength training and adequate protein intake.' :
                 'Maintenance calories calculated based on your current activity level. Monitor weight and adjust intake as needed based on results.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Resting Metabolic Rate Calculator – BMR, TDEE, and Macronutrient Planning" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Calculate resting metabolic rate, total daily energy expenditure, and macronutrient requirements for weight management goals." />

        <h2 className="text-xl font-bold text-foreground">Guide: Understanding Metabolic Rate and Energy Needs</h2>
        <p>Your metabolic rate determines how many calories you burn at rest and throughout the day. Understanding this helps optimize nutrition and fitness goals:</p>
        <h3 className="font-semibold text-foreground mt-4">Key Metabolic Terms</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>RMR (Resting Metabolic Rate):</strong> Calories burned at complete rest</li>
          <li><strong>BMR (Basal Metabolic Rate):</strong> Minimum calories for basic functions</li>
          <li><strong>TDEE (Total Daily Energy Expenditure):</strong> Total calories burned including activity</li>
          <li><strong>NEAT (Non-Exercise Activity Thermogenesis):</strong> Calories from daily activities</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Factors Affecting Metabolic Rate</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Age (decreases ~2-3% per decade after 20)</li>
          <li>Gender (men typically have higher RMR)</li>
          <li>Body composition (muscle burns more calories)</li>
          <li>Activity level and exercise frequency</li>
          <li>Hormones and genetics</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/child-bmi-percentile-calculator">Child BMI Percentile Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/toddler-calorie-requirement-calculator">Toddler Calorie Requirement Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/breastfeeding-calorie-needs-calculator">Breastfeeding Calorie Needs Calculator</Link></p>
      </div>
    </div>
  );
}
