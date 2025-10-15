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
import { TrendingUp, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  headCircumference: z.number().positive().optional(),
  gender: z.enum(['male', 'female']).optional(),
  measurementDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateInfantGrowthPercentiles(values: FormValues) {
  const age = values.age || 6; // months
  const weight = values.weight || 7; // kg
  const height = values.height || 65; // cm
  const headCircumference = values.headCircumference || 42; // cm
  const gender = values.gender || 'male';
  
  // Simplified WHO growth standards (approximate values)
  // In reality, these would be lookup tables with exact percentiles
  
  // Weight percentiles (approximate)
  let weightPercentile = 50;
  if (gender === 'male') {
    if (age <= 6) {
      if (weight >= 8.5) weightPercentile = 95;
      else if (weight >= 7.8) weightPercentile = 75;
      else if (weight >= 7.1) weightPercentile = 50;
      else if (weight >= 6.4) weightPercentile = 25;
      else weightPercentile = 5;
    } else {
      if (weight >= 9.5) weightPercentile = 95;
      else if (weight >= 8.8) weightPercentile = 75;
      else if (weight >= 8.1) weightPercentile = 50;
      else if (weight >= 7.4) weightPercentile = 25;
      else weightPercentile = 5;
    }
  } else {
    if (age <= 6) {
      if (weight >= 7.8) weightPercentile = 95;
      else if (weight >= 7.1) weightPercentile = 75;
      else if (weight >= 6.5) weightPercentile = 50;
      else if (weight >= 5.9) weightPercentile = 25;
      else weightPercentile = 5;
    } else {
      if (weight >= 8.8) weightPercentile = 95;
      else if (weight >= 8.1) weightPercentile = 75;
      else if (weight >= 7.5) weightPercentile = 50;
      else if (weight >= 6.9) weightPercentile = 25;
      else weightPercentile = 5;
    }
  }
  
  // Height percentiles (approximate)
  let heightPercentile = 50;
  if (gender === 'male') {
    if (age <= 6) {
      if (height >= 70) heightPercentile = 95;
      else if (height >= 67) heightPercentile = 75;
      else if (height >= 64) heightPercentile = 50;
      else if (height >= 61) heightPercentile = 25;
      else heightPercentile = 5;
    } else {
      if (height >= 75) heightPercentile = 95;
      else if (height >= 72) heightPercentile = 75;
      else if (height >= 69) heightPercentile = 50;
      else if (height >= 66) heightPercentile = 25;
      else heightPercentile = 5;
    }
  } else {
    if (age <= 6) {
      if (height >= 68) heightPercentile = 95;
      else if (height >= 65) heightPercentile = 75;
      else if (height >= 62) heightPercentile = 50;
      else if (height >= 59) heightPercentile = 25;
      else heightPercentile = 5;
    } else {
      if (height >= 73) heightPercentile = 95;
      else if (height >= 70) heightPercentile = 75;
      else if (height >= 67) heightPercentile = 50;
      else if (height >= 64) heightPercentile = 25;
      else heightPercentile = 5;
    }
  }
  
  // Head circumference percentiles (approximate)
  let headPercentile = 50;
  if (gender === 'male') {
    if (headCircumference >= 45) headPercentile = 95;
    else if (headCircumference >= 43.5) headPercentile = 75;
    else if (headCircumference >= 42) headPercentile = 50;
    else if (headCircumference >= 40.5) headPercentile = 25;
    else headPercentile = 5;
  } else {
    if (headCircumference >= 44) headPercentile = 95;
    else if (headCircumference >= 42.5) headPercentile = 75;
    else if (headCircumference >= 41) headPercentile = 50;
    else if (headCircumference >= 39.5) headPercentile = 25;
    else headPercentile = 5;
  }
  
  // Overall assessment
  const avgPercentile = (weightPercentile + heightPercentile + headPercentile) / 3;
  let growthStatus = 'normal';
  if (avgPercentile >= 90) growthStatus = 'above-average';
  else if (avgPercentile >= 75) growthStatus = 'above-average';
  else if (avgPercentile >= 25) growthStatus = 'normal';
  else if (avgPercentile >= 10) growthStatus = 'below-average';
  else growthStatus = 'concerning';
  
  return {
    weightPercentile,
    heightPercentile,
    headPercentile,
    avgPercentile: Math.round(avgPercentile),
    growthStatus,
  };
}

export default function InfantGrowthPercentileCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateInfantGrowthPercentiles> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      height: undefined,
      headCircumference: undefined,
      gender: undefined,
      measurementDate: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateInfantGrowthPercentiles(values));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem>
                <FormLabel>Age (months)</FormLabel>
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
                <FormLabel>Height/Length (cm)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="headCircumference" render={({ field }) => (
              <FormItem>
                <FormLabel>Head Circumference (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="measurementDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Measurement Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Growth Percentiles</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <CardTitle>Infant Growth Percentiles</CardTitle>
            </div>
            <CardDescription>Based on WHO growth standards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.avgPercentile}th</p>
                <p className="text-lg text-muted-foreground">Average Growth Percentile</p>
                <p className="text-lg font-semibold capitalize">{result.growthStatus} Growth</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg text-center">
                  <h4 className="font-semibold mb-2">Weight</h4>
                  <p className="text-2xl font-bold">{result.weightPercentile}th</p>
                  <p className="text-sm text-muted-foreground">Percentile</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center">
                  <h4 className="font-semibold mb-2">Height</h4>
                  <p className="text-2xl font-bold">{result.heightPercentile}th</p>
                  <p className="text-sm text-muted-foreground">Percentile</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg text-center">
                  <h4 className="font-semibold mb-2">Head Circumference</h4>
                  <p className="text-2xl font-bold">{result.headPercentile}th</p>
                  <p className="text-sm text-muted-foreground">Percentile</p>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${
                result.growthStatus === 'concerning' ? 'bg-red-100 dark:bg-red-900' :
                result.growthStatus === 'below-average' ? 'bg-yellow-100 dark:bg-yellow-900' :
                result.growthStatus === 'above-average' ? 'bg-blue-100 dark:bg-blue-900' :
                'bg-green-100 dark:bg-green-900'
              }`}>
                <h4 className="font-semibold mb-2">Growth Assessment</h4>
                <p className="text-sm">
                  {result.growthStatus === 'concerning' ? 'Growth below 10th percentile may indicate nutritional or health concerns.' :
                   result.growthStatus === 'below-average' ? 'Growth below 25th percentile - monitor closely and discuss with pediatrician.' :
                   result.growthStatus === 'above-average' ? 'Growth above 75th percentile - healthy growth pattern.' :
                   'Growth within normal range (25th-75th percentile).'}
                </p>
              </div>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.growthStatus === 'concerning' ? 'Growth percentiles below 10th may indicate feeding issues, health problems, or genetic factors. Consult your pediatrician immediately.' : 
                 result.growthStatus === 'below-average' ? 'Growth below 25th percentile warrants monitoring. Ensure adequate nutrition and discuss with healthcare provider.' :
                 result.growthStatus === 'above-average' ? 'Above-average growth is generally healthy. Monitor for signs of overfeeding or health conditions.' :
                 'Normal growth pattern. Continue current feeding and care practices. Regular pediatric checkups remain important.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Infant Growth Percentile Calculator – WHO Standards and Growth Monitoring" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Calculate infant growth percentiles for weight, height, and head circumference using WHO growth standards." />

        <h2 className="text-xl font-bold text-foreground">Guide: Understanding Infant Growth Percentiles</h2>
        <p>Growth percentiles help track your baby's development compared to other children of the same age and gender:</p>
        <h3 className="font-semibold text-foreground mt-4">Percentile Ranges</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>90th-100th percentile: Above average growth</li>
          <li>75th-89th percentile: Above average growth</li>
          <li>25th-74th percentile: Normal growth range</li>
          <li>10th-24th percentile: Below average growth</li>
          <li>5th-9th percentile: Concerning growth pattern</li>
          <li>Below 5th percentile: Requires medical attention</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Growth Monitoring</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Measure at least monthly during first year</li>
          <li>Track consistent growth along percentile curves</li>
          <li>Sudden drops or rises may indicate health issues</li>
          <li>Individual growth patterns vary significantly</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/breastfeeding-calorie-needs-calculator">Breastfeeding Calorie Needs Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/child-bmi-percentile-calculator">Child BMI Percentile Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/baby-sleep-needs-calculator">Baby Sleep Needs Calculator</Link></p>
      </div>
    </div>
  );
}
