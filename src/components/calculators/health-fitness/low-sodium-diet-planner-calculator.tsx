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
import { Info, Droplets } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very-active']).optional(),
  healthCondition: z.enum(['healthy', 'high-blood-pressure', 'heart-disease', 'kidney-disease', 'diabetes']).optional(),
  currentSodiumIntake: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateSodiumRecommendation(values: FormValues) {
  const age = values.age || 30;
  const weight = values.weight || 70;
  
  // Base recommendation: 2,300mg for healthy adults
  let recommendedSodium = 2300; // mg
  
  // Health condition adjustments
  if (values.healthCondition === 'high-blood-pressure') recommendedSodium = 1500;
  else if (values.healthCondition === 'heart-disease') recommendedSodium = 1500;
  else if (values.healthCondition === 'kidney-disease') recommendedSodium = 1000;
  else if (values.healthCondition === 'diabetes') recommendedSodium = 1500;
  
  // Age adjustments
  if (age > 50) recommendedSodium = Math.min(recommendedSodium, 1500);
  
  // Activity level adjustments (more active = more sodium needed)
  if (values.activityLevel === 'very-active') recommendedSodium += 500;
  else if (values.activityLevel === 'active') recommendedSodium += 300;
  else if (values.activityLevel === 'moderate') recommendedSodium += 100;
  
  const currentIntake = values.currentSodiumIntake || 0;
  const reductionNeeded = Math.max(0, currentIntake - recommendedSodium);
  
  return {
    recommendedSodium: Math.round(recommendedSodium),
    reductionNeeded: Math.round(reductionNeeded),
    currentIntake: currentIntake,
  };
}

export default function LowSodiumDietPlannerCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateSodiumRecommendation> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      activityLevel: undefined,
      healthCondition: undefined,
      currentSodiumIntake: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateSodiumRecommendation(values));
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
            <FormField control={form.control} name="currentSodiumIntake" render={({ field }) => (
              <FormItem>
                <FormLabel>Current Daily Sodium Intake (mg)</FormLabel>
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
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light Activity</option>
                  <option value="moderate">Moderate Activity</option>
                  <option value="active">Active</option>
                  <option value="very-active">Very Active</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="healthCondition" render={({ field }) => (
              <FormItem>
                <FormLabel>Health Condition</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="healthy">Healthy</option>
                  <option value="high-blood-pressure">High Blood Pressure</option>
                  <option value="heart-disease">Heart Disease</option>
                  <option value="kidney-disease">Kidney Disease</option>
                  <option value="diabetes">Diabetes</option>
                </select>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Sodium Recommendation</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Droplets className="h-8 w-8 text-primary" />
              <CardTitle>Sodium Intake Recommendations</CardTitle>
            </div>
            <CardDescription>Personalized sodium guidelines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{result.recommendedSodium} mg</p>
                <p className="text-sm text-muted-foreground">Recommended Daily Intake</p>
              </div>
              {result.currentIntake > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{result.reductionNeeded} mg</p>
                  <p className="text-sm text-muted-foreground">Reduction Needed</p>
                </div>
              )}
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.recommendedSodium <= 1500 ? 'Low sodium diet recommended for your health condition. Focus on fresh, unprocessed foods.' : 
                 result.recommendedSodium <= 2000 ? 'Moderate sodium restriction. Limit processed foods and restaurant meals.' :
                 'Standard sodium intake. Maintain balance with potassium-rich foods.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Low-Sodium Diet Planner Calculator – Personalized Sodium Intake Guidelines" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Calculate optimal sodium intake based on health conditions and activity level with practical diet planning tips." />

        <h2 className="text-xl font-bold text-foreground">Guide: Implementing a Low-Sodium Diet</h2>
        <p>Reducing sodium intake can improve heart health and blood pressure. Here's how to make the transition:</p>
        <h3 className="font-semibold text-foreground mt-4">High-Sodium Foods to Limit</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Processed meats (bacon, deli meats, sausages)</li>
          <li>Canned soups and vegetables</li>
          <li>Frozen meals and packaged foods</li>
          <li>Restaurant and fast food meals</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Low-Sodium Alternatives</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Fresh fruits and vegetables</li>
          <li>Lean proteins (chicken, fish, beans)</li>
          <li>Whole grains and nuts</li>
          <li>Herbs and spices instead of salt</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/dash-diet-sodium-intake-calculator">DASH Diet Sodium Intake Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/mediterranean-diet-compliance-calculator">Mediterranean Diet Compliance Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/gluten-intake-tracker-calculator">Gluten Intake Tracker Calculator</Link></p>
      </div>
    </div>
  );
}
