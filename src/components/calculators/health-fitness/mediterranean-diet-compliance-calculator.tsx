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
  oliveOilServings: z.number().positive().optional(),
  fishServings: z.number().positive().optional(),
  vegetablesServings: z.number().positive().optional(),
  fruitsServings: z.number().positive().optional(),
  nutsServings: z.number().positive().optional(),
  legumesServings: z.number().positive().optional(),
  wholeGrainsServings: z.number().positive().optional(),
  redMeatServings: z.number().positive().optional(),
  processedFoodServings: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateMediterraneanCompliance(values: FormValues) {
  // Ideal Mediterranean diet servings per week
  const idealServings = {
    oliveOil: 14, // daily
    fish: 3, // per week
    vegetables: 21, // daily
    fruits: 21, // daily
    nuts: 7, // daily
    legumes: 7, // daily
    wholeGrains: 21, // daily
    redMeat: 2, // per week
    processedFood: 0, // avoid
  };
  
  const actualServings = {
    oliveOil: values.oliveOilServings || 0,
    fish: values.fishServings || 0,
    vegetables: values.vegetablesServings || 0,
    fruits: values.fruitsServings || 0,
    nuts: values.nutsServings || 0,
    legumes: values.legumesServings || 0,
    wholeGrains: values.wholeGrainsServings || 0,
    redMeat: values.redMeatServings || 0,
    processedFood: values.processedFoodServings || 0,
  };
  
  // Calculate compliance percentage for each category
  const compliance = {
    oliveOil: Math.min(100, (actualServings.oliveOil / idealServings.oliveOil) * 100),
    fish: Math.min(100, (actualServings.fish / idealServings.fish) * 100),
    vegetables: Math.min(100, (actualServings.vegetables / idealServings.vegetables) * 100),
    fruits: Math.min(100, (actualServings.fruits / idealServings.fruits) * 100),
    nuts: Math.min(100, (actualServings.nuts / idealServings.nuts) * 100),
    legumes: Math.min(100, (actualServings.legumes / idealServings.legumes) * 100),
    wholeGrains: Math.min(100, (actualServings.wholeGrains / idealServings.wholeGrains) * 100),
    redMeat: Math.max(0, 100 - (actualServings.redMeat / idealServings.redMeat) * 100),
    processedFood: Math.max(0, 100 - (actualServings.processedFood * 50)), // Penalty for processed foods
  };
  
  // Calculate overall compliance
  const overallCompliance = Object.values(compliance).reduce((sum, value) => sum + value, 0) / Object.keys(compliance).length;
  
  return {
    overallCompliance: Math.round(overallCompliance),
    complianceBreakdown: compliance,
  };
}

export default function MediterraneanDietComplianceCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateMediterraneanCompliance> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oliveOilServings: undefined,
      fishServings: undefined,
      vegetablesServings: undefined,
      fruitsServings: undefined,
      nutsServings: undefined,
      legumesServings: undefined,
      wholeGrainsServings: undefined,
      redMeatServings: undefined,
      processedFoodServings: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateMediterraneanCompliance(values));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="oliveOilServings" render={({ field }) => (
              <FormItem>
                <FormLabel>Olive Oil Servings (per week)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="fishServings" render={({ field }) => (
              <FormItem>
                <FormLabel>Fish Servings (per week)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="vegetablesServings" render={({ field }) => (
              <FormItem>
                <FormLabel>Vegetables Servings (per week)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="fruitsServings" render={({ field }) => (
              <FormItem>
                <FormLabel>Fruits Servings (per week)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="nutsServings" render={({ field }) => (
              <FormItem>
                <FormLabel>Nuts Servings (per week)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="legumesServings" render={({ field }) => (
              <FormItem>
                <FormLabel>Legumes Servings (per week)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="wholeGrainsServings" render={({ field }) => (
              <FormItem>
                <FormLabel>Whole Grains Servings (per week)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="redMeatServings" render={({ field }) => (
              <FormItem>
                <FormLabel>Red Meat Servings (per week)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="processedFoodServings" render={({ field }) => (
              <FormItem>
                <FormLabel>Processed Food Servings (per week)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Mediterranean Diet Compliance</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Leaf className="h-8 w-8 text-primary" />
              <CardTitle>Mediterranean Diet Compliance</CardTitle>
            </div>
            <CardDescription>Your adherence to Mediterranean diet principles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-4xl font-bold">{result.overallCompliance}%</p>
              <p className="text-lg text-muted-foreground">Overall Compliance Score</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded">
                  <p className="font-semibold">Olive Oil</p>
                  <p>{Math.round(result.complianceBreakdown.oliveOil)}%</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded">
                  <p className="font-semibold">Fish</p>
                  <p>{Math.round(result.complianceBreakdown.fish)}%</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded">
                  <p className="font-semibold">Vegetables</p>
                  <p>{Math.round(result.complianceBreakdown.vegetables)}%</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded">
                  <p className="font-semibold">Fruits</p>
                  <p>{Math.round(result.complianceBreakdown.fruits)}%</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded">
                  <p className="font-semibold">Nuts</p>
                  <p>{Math.round(result.complianceBreakdown.nuts)}%</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded">
                  <p className="font-semibold">Legumes</p>
                  <p>{Math.round(result.complianceBreakdown.legumes)}%</p>
                </div>
              </div>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.overallCompliance >= 80 ? 'Excellent Mediterranean diet adherence! You are following heart-healthy principles very well.' : 
                 result.overallCompliance >= 60 ? 'Good compliance. Focus on increasing plant-based foods and reducing processed items.' :
                 result.overallCompliance >= 40 ? 'Moderate compliance. Gradually increase fruits, vegetables, and healthy fats.' :
                 'Low compliance. Start by adding more plant-based foods and reducing processed foods.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Mediterranean Diet Compliance Calculator – Heart-Healthy Eating Assessment" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Assess your adherence to Mediterranean diet principles with personalized recommendations for optimal health." />

        <h2 className="text-xl font-bold text-foreground">Guide: Embracing the Mediterranean Diet</h2>
        <p>The Mediterranean diet is associated with reduced heart disease risk and longevity. Here's how to adopt it:</p>
        <h3 className="font-semibold text-foreground mt-4">Core Components</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Daily: Olive oil, vegetables, fruits, whole grains</li>
          <li>Weekly: Fish, nuts, legumes, moderate wine</li>
          <li>Monthly: Red meat and sweets</li>
          <li>Avoid: Processed foods, refined sugars</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Health Benefits</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Reduced cardiovascular disease risk</li>
          <li>Lower inflammation markers</li>
          <li>Improved cognitive function</li>
          <li>Better weight management</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/dash-diet-sodium-intake-calculator">DASH Diet Sodium Intake Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/low-sodium-diet-planner-calculator">Low-Sodium Diet Planner Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/vegan-protein-requirement-calculator">Vegan Protein Requirement Calculator</Link></p>
      </div>
    </div>
  );
}
