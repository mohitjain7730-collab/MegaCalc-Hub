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
import { Wheat, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  breadSlices: z.number().positive().optional(),
  pastaServing: z.number().positive().optional(),
  cerealServing: z.number().positive().optional(),
  beerGlasses: z.number().positive().optional(),
  cookies: z.number().positive().optional(),
  crackers: z.number().positive().optional(),
  otherGluten: z.number().positive().optional(),
  weight: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateGlutenIntake(values: FormValues) {
  // Estimated gluten content in common foods (grams)
  const glutenPerBreadSlice = 2.4; // grams
  const glutenPerPastaServing = 3.2; // grams
  const glutenPerCerealServing = 1.8; // grams
  const glutenPerBeerGlass = 0.8; // grams
  const glutenPerCookie = 0.6; // grams
  const glutenPerCracker = 0.4; // grams
  
  const totalGluten = 
    (values.breadSlices || 0) * glutenPerBreadSlice +
    (values.pastaServing || 0) * glutenPerPastaServing +
    (values.cerealServing || 0) * glutenPerCerealServing +
    (values.beerGlasses || 0) * glutenPerBeerGlass +
    (values.cookies || 0) * glutenPerCookie +
    (values.crackers || 0) * glutenPerCracker +
    (values.otherGluten || 0);
  
  const weight = values.weight || 70; // kg
  const glutenPerKg = totalGluten / weight;
  
  return {
    totalGluten: Math.round(totalGluten * 10) / 10,
    glutenPerKg: Math.round(glutenPerKg * 10) / 10,
  };
}

export default function GlutenIntakeTrackerCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateGlutenIntake> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      breadSlices: undefined,
      pastaServing: undefined,
      cerealServing: undefined,
      beerGlasses: undefined,
      cookies: undefined,
      crackers: undefined,
      otherGluten: undefined,
      weight: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateGlutenIntake(values));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="breadSlices" render={({ field }) => (
              <FormItem>
                <FormLabel>Bread Slices</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="pastaServing" render={({ field }) => (
              <FormItem>
                <FormLabel>Pasta Servings (1 cup each)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="cerealServing" render={({ field }) => (
              <FormItem>
                <FormLabel>Cereal Servings (1 cup each)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="beerGlasses" render={({ field }) => (
              <FormItem>
                <FormLabel>Beer Glasses (12 oz each)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="cookies" render={({ field }) => (
              <FormItem>
                <FormLabel>Cookies</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="crackers" render={({ field }) => (
              <FormItem>
                <FormLabel>Crackers</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="otherGluten" render={({ field }) => (
              <FormItem>
                <FormLabel>Other Gluten Sources (grams)</FormLabel>
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
          </div>
          <Button type="submit">Calculate Gluten Intake</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Wheat className="h-8 w-8 text-primary" />
              <CardTitle>Daily Gluten Intake</CardTitle>
            </div>
            <CardDescription>Based on your food consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{result.totalGluten} g</p>
              <p className="text-lg text-muted-foreground">{result.glutenPerKg} g/kg body weight</p>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.totalGluten >= 20 ? 'High gluten intake. Consider reducing for better digestive health.' : 
                 result.totalGluten >= 10 ? 'Moderate gluten intake. Monitor for any sensitivity symptoms.' :
                 result.totalGluten >= 5 ? 'Low gluten intake. Good for those with mild sensitivity.' :
                 'Very low gluten intake. Suitable for gluten-sensitive individuals.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Gluten Intake Tracker Calculator – Daily Consumption Analysis" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Track daily gluten intake from common foods and assess consumption levels for health optimization." />

        <h2 className="text-xl font-bold text-foreground">Guide: Managing Gluten Intake</h2>
        <p>Understanding your gluten consumption helps with digestive health and dietary planning:</p>
        <h3 className="font-semibold text-foreground mt-4">Common Gluten Sources</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Wheat, barley, rye, and triticale</li>
          <li>Bread, pasta, cereals, and baked goods</li>
          <li>Beer and malt beverages</li>
          <li>Processed foods and sauces</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Reducing Gluten Intake</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Choose gluten-free alternatives (rice, quinoa, oats)</li>
          <li>Read food labels carefully</li>
          <li>Cook more meals at home</li>
          <li>Focus on naturally gluten-free foods</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/low-sodium-diet-planner-calculator">Low-Sodium Diet Planner Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/dash-diet-sodium-intake-calculator">DASH Diet Sodium Intake Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/mediterranean-diet-compliance-calculator">Mediterranean Diet Compliance Calculator</Link></p>
      </div>
    </div>
  );
}
