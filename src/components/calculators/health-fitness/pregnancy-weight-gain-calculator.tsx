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
import { Heart, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  prePregnancyWeight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  currentWeight: z.number().positive().optional(),
  gestationalWeeks: z.number().positive().optional(),
  pregnancyType: z.enum(['singleton', 'twins', 'triplets']).optional(),
  age: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculatePregnancyWeightGain(values: FormValues) {
  const prePregnancyWeight = values.prePregnancyWeight || 60; // kg
  const height = values.height || 165; // cm
  const currentWeight = values.currentWeight || prePregnancyWeight;
  const gestationalWeeks = values.gestationalWeeks || 20;
  const age = values.age || 28;
  
  // Calculate pre-pregnancy BMI
  const heightInMeters = height / 100;
  const prePregnancyBMI = prePregnancyWeight / (heightInMeters * heightInMeters);
  
  // Determine BMI category and recommended weight gain
  let recommendedGain: { min: number; max: number; label: string };
  
  if (prePregnancyBMI < 18.5) {
    recommendedGain = { min: 12.5, max: 18, label: 'Underweight (BMI < 18.5)' };
  } else if (prePregnancyBMI < 25) {
    recommendedGain = { min: 11.5, max: 16, label: 'Normal weight (BMI 18.5-24.9)' };
  } else if (prePregnancyBMI < 30) {
    recommendedGain = { min: 7, max: 11.5, label: 'Overweight (BMI 25-29.9)' };
  } else {
    recommendedGain = { min: 5, max: 9, label: 'Obese (BMI ≥ 30)' };
  }
  
  // Adjust for multiple pregnancies
  if (values.pregnancyType === 'twins') {
    recommendedGain.min += 8;
    recommendedGain.max += 12;
  } else if (values.pregnancyType === 'triplets') {
    recommendedGain.min += 15;
    recommendedGain.max += 20;
  }
  
  // Calculate current weight gain
  const currentGain = currentWeight - prePregnancyWeight;
  
  // Calculate expected gain at current gestational week
  const expectedGainAtWeek = (recommendedGain.min + recommendedGain.max) / 2 * (gestationalWeeks / 40);
  
  // Determine status
  let status = 'on-track';
  let message = '';
  
  if (currentGain < recommendedGain.min * 0.8) {
    status = 'under-gaining';
    message = 'Below recommended weight gain range';
  } else if (currentGain > recommendedGain.max * 1.2) {
    status = 'over-gaining';
    message = 'Above recommended weight gain range';
  } else {
    status = 'on-track';
    message = 'Within recommended weight gain range';
  }
  
  return {
    prePregnancyBMI: Math.round(prePregnancyBMI * 10) / 10,
    recommendedGain,
    currentGain: Math.round(currentGain * 10) / 10,
    expectedGainAtWeek: Math.round(expectedGainAtWeek * 10) / 10,
    status,
    message,
  };
}

export default function PregnancyWeightGainCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculatePregnancyWeightGain> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prePregnancyWeight: undefined,
      height: undefined,
      currentWeight: undefined,
      gestationalWeeks: undefined,
      pregnancyType: undefined,
      age: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculatePregnancyWeightGain(values));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="prePregnancyWeight" render={({ field }) => (
              <FormItem>
                <FormLabel>Pre-Pregnancy Weight (kg)</FormLabel>
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
            <FormField control={form.control} name="currentWeight" render={({ field }) => (
              <FormItem>
                <FormLabel>Current Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="gestationalWeeks" render={({ field }) => (
              <FormItem>
                <FormLabel>Gestational Weeks</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="pregnancyType" render={({ field }) => (
              <FormItem>
                <FormLabel>Pregnancy Type</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="singleton">Single Baby</option>
                  <option value="twins">Twins</option>
                  <option value="triplets">Triplets</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem>
                <FormLabel>Age (years)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Weight Gain</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Heart className="h-8 w-8 text-primary" />
              <CardTitle>Pregnancy Weight Gain Analysis</CardTitle>
            </div>
            <CardDescription>Based on IOM guidelines and your BMI category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{result.prePregnancyBMI}</p>
                  <p className="text-sm text-muted-foreground">Pre-Pregnancy BMI</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{result.currentGain} kg</p>
                  <p className="text-sm text-muted-foreground">Current Weight Gain</p>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{result.recommendedGain.label}</h4>
                <p className="text-sm">Recommended total weight gain: <strong>{result.recommendedGain.min} - {result.recommendedGain.max} kg</strong></p>
                <p className="text-sm">Expected gain at {result.gestationalWeeks} weeks: <strong>{result.expectedGainAtWeek} kg</strong></p>
              </div>
              
              <div className={`p-4 rounded-lg ${
                result.status === 'on-track' ? 'bg-green-100 dark:bg-green-900' :
                result.status === 'under-gaining' ? 'bg-yellow-100 dark:bg-yellow-900' :
                'bg-red-100 dark:bg-red-900'
              }`}>
                <h4 className="font-semibold capitalize">{result.status.replace('-', ' ')}</h4>
                <p className="text-sm">{result.message}</p>
              </div>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.status === 'on-track' ? 'Your weight gain is within the recommended range for a healthy pregnancy. Continue with your current nutrition and exercise routine.' : 
                 result.status === 'under-gaining' ? 'Your weight gain is below recommendations. Consult your healthcare provider about increasing caloric intake and nutrition quality.' :
                 'Your weight gain is above recommendations. Discuss with your healthcare provider about appropriate dietary modifications and exercise.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Pregnancy Weight Gain Calculator – IOM Guidelines and BMI-Based Recommendations" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Calculate appropriate pregnancy weight gain based on pre-pregnancy BMI and gestational age with IOM guidelines." />

        <h2 className="text-xl font-bold text-foreground">Guide: Healthy Pregnancy Weight Gain</h2>
        <p>Proper weight gain during pregnancy supports fetal development and maternal health. Here are the key guidelines:</p>
        <h3 className="font-semibold text-foreground mt-4">IOM Weight Gain Recommendations</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Underweight (BMI &lt; 18.5): 12.5-18 kg total gain</li>
          <li>Normal weight (BMI 18.5-24.9): 11.5-16 kg total gain</li>
          <li>Overweight (BMI 25-29.9): 7-11.5 kg total gain</li>
          <li>Obese (BMI ≥ 30): 5-9 kg total gain</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Weight Gain Pattern</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>First trimester: 0.5-2 kg (minimal gain)</li>
          <li>Second trimester: 0.4-0.6 kg per week</li>
          <li>Third trimester: 0.4-0.6 kg per week</li>
          <li>Multiple pregnancies: Additional 8-12 kg for twins</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/due-date-calculator">Due Date Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/breastfeeding-calorie-needs-calculator">Breastfeeding Calorie Needs Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/food-allergy-risk-score-calculator">Food Allergy Risk Score Calculator</Link></p>
      </div>
    </div>
  );
}
