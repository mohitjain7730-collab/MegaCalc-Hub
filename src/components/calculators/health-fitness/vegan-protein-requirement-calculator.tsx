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
import { Leaf, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  gender: z.enum(['male', 'female']).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very-active']).optional(),
  goals: z.enum(['maintenance', 'muscle-gain', 'weight-loss', 'athletic-performance']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateVeganProteinRequirement(values: FormValues) {
  const weight = values.weight || 70; // kg
  const age = values.age || 30;
  const gender = values.gender || 'male';
  
  // Base protein requirement (g per kg body weight)
  let proteinPerKg = 0.8; // RDA for adults
  
  // Activity level adjustments
  if (values.activityLevel === 'very-active') proteinPerKg = 1.6;
  else if (values.activityLevel === 'active') proteinPerKg = 1.4;
  else if (values.activityLevel === 'moderate') proteinPerKg = 1.2;
  else if (values.activityLevel === 'light') proteinPerKg = 1.0;
  
  // Goal adjustments
  if (values.goals === 'muscle-gain') proteinPerKg = Math.max(proteinPerKg, 1.6);
  else if (values.goals === 'weight-loss') proteinPerKg = Math.max(proteinPerKg, 1.2);
  else if (values.goals === 'athletic-performance') proteinPerKg = Math.max(proteinPerKg, 1.4);
  
  // Age adjustments (higher protein needs for older adults)
  if (age > 65) proteinPerKg += 0.2;
  
  // Gender adjustments (slightly higher for males)
  if (gender === 'male') proteinPerKg += 0.1;
  
  const dailyProtein = weight * proteinPerKg;
  
  // Vegan protein sources recommendations
  const proteinSources = {
    legumes: Math.round(dailyProtein * 0.4), // 40% from legumes
    nutsSeeds: Math.round(dailyProtein * 0.2), // 20% from nuts/seeds
    grains: Math.round(dailyProtein * 0.25), // 25% from whole grains
    vegetables: Math.round(dailyProtein * 0.15), // 15% from vegetables
  };
  
  return {
    dailyProtein: Math.round(dailyProtein),
    proteinPerKg: Math.round(proteinPerKg * 10) / 10,
    proteinSources,
  };
}

export default function VeganProteinRequirementCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateVeganProteinRequirement> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      height: undefined,
      gender: undefined,
      activityLevel: undefined,
      goals: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateVeganProteinRequirement(values));
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
            <FormField control={form.control} name="activityLevel" render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Level</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light Activity</option>
                  <option value="moderate">Moderate Activity</option>
                  <option value="active">Active</option>
                  <option value="very-active">Very Active</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="goals" render={({ field }) => (
              <FormItem>
                <FormLabel>Fitness Goals</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="maintenance">Weight Maintenance</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="athletic-performance">Athletic Performance</option>
                </select>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Protein Requirements</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Leaf className="h-8 w-8 text-primary" />
              <CardTitle>Vegan Protein Requirements</CardTitle>
            </div>
            <CardDescription>Daily protein needs for optimal health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold">{result.dailyProtein} g</p>
                <p className="text-sm text-muted-foreground">Daily Protein Target</p>
                <p className="text-lg text-muted-foreground">{result.proteinPerKg} g/kg body weight</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded">
                  <p className="font-semibold">Legumes</p>
                  <p className="text-xl font-bold">{result.proteinSources.legumes} g</p>
                  <p className="text-xs text-muted-foreground">Beans, lentils, tofu</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded">
                  <p className="font-semibold">Nuts & Seeds</p>
                  <p className="text-xl font-bold">{result.proteinSources.nutsSeeds} g</p>
                  <p className="text-xs text-muted-foreground">Almonds, chia, hemp</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded">
                  <p className="font-semibold">Whole Grains</p>
                  <p className="text-xl font-bold">{result.proteinSources.grains} g</p>
                  <p className="text-xs text-muted-foreground">Quinoa, oats, rice</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded">
                  <p className="font-semibold">Vegetables</p>
                  <p className="text-xl font-bold">{result.proteinSources.vegetables} g</p>
                  <p className="text-xs text-muted-foreground">Broccoli, spinach</p>
                </div>
              </div>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.dailyProtein >= 100 ? 'High protein needs. Focus on complete protein sources and consider protein supplements if needed.' : 
                 result.dailyProtein >= 70 ? 'Moderate protein needs. A well-planned vegan diet can easily meet these requirements.' :
                 result.dailyProtein >= 50 ? 'Standard protein needs. Include a variety of plant proteins throughout the day.' :
                 'Lower protein needs. Focus on whole foods and balanced meals.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Vegan Protein Requirement Calculator – Plant-Based Nutrition Planning" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Calculate optimal protein intake for vegans based on activity level and fitness goals with plant-based food recommendations." />

        <h2 className="text-xl font-bold text-foreground">Guide: Meeting Protein Needs on a Vegan Diet</h2>
        <p>Plant-based proteins can fully meet your nutritional needs with proper planning. Here's how:</p>
        <h3 className="font-semibold text-foreground mt-4">Complete Protein Sources</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Quinoa, buckwheat, and hemp seeds</li>
          <li>Combining legumes with grains (rice and beans)</li>
          <li>Soy products (tofu, tempeh, edamame)</li>
          <li>Nutritional yeast and spirulina</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Protein Timing</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Distribute protein throughout the day</li>
          <li>Include protein in every meal and snack</li>
          <li>Post-workout: 20-30g within 2 hours</li>
          <li>Pre-workout: 15-20g 1-2 hours before</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/mediterranean-diet-compliance-calculator">Mediterranean Diet Compliance Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/dash-diet-sodium-intake-calculator">DASH Diet Sodium Intake Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/lactose-tolerance-estimator">Lactose Tolerance Estimator</Link></p>
      </div>
    </div>
  );
}
