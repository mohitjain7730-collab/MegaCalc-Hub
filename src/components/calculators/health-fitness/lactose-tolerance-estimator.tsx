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
import { Milk, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().positive().optional(),
  ethnicity: z.enum(['northern-european', 'eastern-european', 'african', 'asian', 'hispanic', 'mixed', 'other']).optional(),
  symptomsAfterDairy: z.enum(['none', 'mild', 'moderate', 'severe']).optional(),
  dairyConsumption: z.enum(['daily', 'weekly', 'monthly', 'rarely', 'never']).optional(),
  familyHistory: z.enum(['none', 'one-parent', 'both-parents', 'siblings', 'extended-family']).optional(),
  lactoseAmount: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateLactoseTolerance(values: FormValues) {
  const age = values.age || 30;
  
  // Base tolerance level (grams of lactose per day)
  let toleranceLevel = 12; // Average adult tolerance
  
  // Age factor (lactose tolerance decreases with age)
  if (age < 20) toleranceLevel = 15;
  else if (age > 50) toleranceLevel = 8;
  else if (age > 65) toleranceLevel = 5;
  
  // Ethnicity factor
  if (values.ethnicity === 'northern-european') toleranceLevel += 5;
  else if (values.ethnicity === 'eastern-european') toleranceLevel += 3;
  else if (values.ethnicity === 'african') toleranceLevel -= 3;
  else if (values.ethnicity === 'asian') toleranceLevel -= 5;
  else if (values.ethnicity === 'hispanic') toleranceLevel -= 2;
  
  // Symptoms factor
  if (values.symptomsAfterDairy === 'severe') toleranceLevel = 0;
  else if (values.symptomsAfterDairy === 'moderate') toleranceLevel = Math.min(toleranceLevel, 6);
  else if (values.symptomsAfterDairy === 'mild') toleranceLevel = Math.min(toleranceLevel, 10);
  
  // Family history factor
  if (values.familyHistory === 'both-parents') toleranceLevel -= 5;
  else if (values.familyHistory === 'one-parent') toleranceLevel -= 2;
  else if (values.familyHistory === 'siblings') toleranceLevel -= 3;
  
  // Current dairy consumption factor
  if (values.dairyConsumption === 'never') toleranceLevel = 0;
  else if (values.dairyConsumption === 'rarely') toleranceLevel = Math.min(toleranceLevel, 3);
  else if (values.dairyConsumption === 'monthly') toleranceLevel = Math.min(toleranceLevel, 8);
  else if (values.dairyConsumption === 'weekly') toleranceLevel = Math.min(toleranceLevel, 12);
  
  const tolerancePercentage = Math.max(0, Math.min(100, (toleranceLevel / 15) * 100));
  
  // Lactose content in common foods (grams)
  const lactoseContent = {
    milk: 12, // per cup
    yogurt: 8, // per cup
    cheese: 3, // per ounce
    iceCream: 9, // per cup
    butter: 0.1, // per tablespoon
  };
  
  return {
    toleranceLevel: Math.round(toleranceLevel),
    tolerancePercentage: Math.round(tolerancePercentage),
    lactoseContent,
  };
}

export default function LactoseToleranceEstimator() {
  const [result, setResult] = useState<ReturnType<typeof calculateLactoseTolerance> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      ethnicity: undefined,
      symptomsAfterDairy: undefined,
      dairyConsumption: undefined,
      familyHistory: undefined,
      lactoseAmount: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateLactoseTolerance(values));
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
            <FormField control={form.control} name="ethnicity" render={({ field }) => (
              <FormItem>
                <FormLabel>Ethnicity</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="northern-european">Northern European</option>
                  <option value="eastern-european">Eastern European</option>
                  <option value="african">African</option>
                  <option value="asian">Asian</option>
                  <option value="hispanic">Hispanic</option>
                  <option value="mixed">Mixed</option>
                  <option value="other">Other</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="symptomsAfterDairy" render={({ field }) => (
              <FormItem>
                <FormLabel>Symptoms After Dairy Consumption</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="none">None</option>
                  <option value="mild">Mild (bloating, gas)</option>
                  <option value="moderate">Moderate (cramps, diarrhea)</option>
                  <option value="severe">Severe (severe digestive issues)</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="dairyConsumption" render={({ field }) => (
              <FormItem>
                <FormLabel>Current Dairy Consumption</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="rarely">Rarely</option>
                  <option value="never">Never</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="familyHistory" render={({ field }) => (
              <FormItem>
                <FormLabel>Family History of Lactose Intolerance</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="none">None</option>
                  <option value="one-parent">One Parent</option>
                  <option value="both-parents">Both Parents</option>
                  <option value="siblings">Siblings</option>
                  <option value="extended-family">Extended Family</option>
                </select>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Lactose Tolerance</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Milk className="h-8 w-8 text-primary" />
              <CardTitle>Lactose Tolerance Assessment</CardTitle>
            </div>
            <CardDescription>Your estimated lactose tolerance level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold">{result.toleranceLevel} g</p>
                <p className="text-sm text-muted-foreground">Daily Lactose Tolerance</p>
                <p className="text-lg text-muted-foreground">{result.tolerancePercentage}% tolerance level</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                  <p className="font-semibold">Milk (1 cup)</p>
                  <p>{result.lactoseContent.milk}g lactose</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                  <p className="font-semibold">Yogurt (1 cup)</p>
                  <p>{result.lactoseContent.yogurt}g lactose</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                  <p className="font-semibold">Cheese (1 oz)</p>
                  <p>{result.lactoseContent.cheese}g lactose</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                  <p className="font-semibold">Ice Cream (1 cup)</p>
                  <p>{result.lactoseContent.iceCream}g lactose</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded">
                  <p className="font-semibold">Butter (1 tbsp)</p>
                  <p>{result.lactoseContent.butter}g lactose</p>
                </div>
              </div>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.toleranceLevel >= 12 ? 'High lactose tolerance. You can likely consume most dairy products without issues.' : 
                 result.toleranceLevel >= 8 ? 'Moderate lactose tolerance. You may tolerate small amounts of dairy or lactose-free options.' :
                 result.toleranceLevel >= 4 ? 'Low lactose tolerance. Consider lactose-free alternatives or lactase supplements.' :
                 'Very low lactose tolerance. Avoid dairy products or use lactase supplements before consuming dairy.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Lactose Tolerance Estimator – Dairy Sensitivity Assessment" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Estimate your lactose tolerance based on age, ethnicity, and symptoms with practical dietary recommendations." />

        <h2 className="text-xl font-bold text-foreground">Guide: Managing Lactose Intolerance</h2>
        <p>Lactose intolerance affects 65% of the global population. Here's how to manage it effectively:</p>
        <h3 className="font-semibold text-foreground mt-4">Lactose-Free Alternatives</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Plant-based milks (almond, soy, oat, coconut)</li>
          <li>Lactose-free dairy products</li>
          <li>Hard cheeses (naturally lower in lactose)</li>
          <li>Greek yogurt (often well-tolerated)</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Management Strategies</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Take lactase supplements before dairy consumption</li>
          <li>Start with small amounts and gradually increase</li>
          <li>Consume dairy with other foods to slow digestion</li>
          <li>Focus on calcium-rich non-dairy sources</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/vegan-protein-requirement-calculator">Vegan Protein Requirement Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/gluten-intake-tracker-calculator">Gluten Intake Tracker Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/mediterranean-diet-compliance-calculator">Mediterranean Diet Compliance Calculator</Link></p>
      </div>
    </div>
  );
}
