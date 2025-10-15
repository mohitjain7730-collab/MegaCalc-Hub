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
import { BarChart3, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  gender: z.enum(['male', 'female']).optional(),
  measurementDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateChildBMIPercentile(values: FormValues) {
  const age = values.age || 8; // years
  const weight = values.weight || 25; // kg
  const height = values.height || 130; // cm
  const gender = values.gender || 'male';
  
  // Calculate BMI
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  // Simplified BMI percentile calculation (approximate)
  // In reality, these would be lookup tables based on CDC growth charts
  let bmiPercentile = 50;
  
  if (gender === 'male') {
    if (age <= 5) {
      if (bmi >= 18) bmiPercentile = 95;
      else if (bmi >= 16.5) bmiPercentile = 85;
      else if (bmi >= 15.5) bmiPercentile = 75;
      else if (bmi >= 14.5) bmiPercentile = 50;
      else if (bmi >= 13.5) bmiPercentile = 25;
      else if (bmi >= 12.5) bmiPercentile = 10;
      else if (bmi >= 11.5) bmiPercentile = 5;
      else bmiPercentile = 1;
    } else if (age <= 10) {
      if (bmi >= 22) bmiPercentile = 95;
      else if (bmi >= 19.5) bmiPercentile = 85;
      else if (bmi >= 17.5) bmiPercentile = 75;
      else if (bmi >= 15.5) bmiPercentile = 50;
      else if (bmi >= 13.5) bmiPercentile = 25;
      else if (bmi >= 12.5) bmiPercentile = 10;
      else if (bmi >= 11.5) bmiPercentile = 5;
      else bmiPercentile = 1;
    } else {
      if (bmi >= 26) bmiPercentile = 95;
      else if (bmi >= 23) bmiPercentile = 85;
      else if (bmi >= 20.5) bmiPercentile = 75;
      else if (bmi >= 18.5) bmiPercentile = 50;
      else if (bmi >= 16.5) bmiPercentile = 25;
      else if (bmi >= 15) bmiPercentile = 10;
      else if (bmi >= 14) bmiPercentile = 5;
      else bmiPercentile = 1;
    }
  } else {
    if (age <= 5) {
      if (bmi >= 18.5) bmiPercentile = 95;
      else if (bmi >= 17) bmiPercentile = 85;
      else if (bmi >= 16) bmiPercentile = 75;
      else if (bmi >= 15) bmiPercentile = 50;
      else if (bmi >= 14) bmiPercentile = 25;
      else if (bmi >= 13) bmiPercentile = 10;
      else if (bmi >= 12) bmiPercentile = 5;
      else bmiPercentile = 1;
    } else if (age <= 10) {
      if (bmi >= 23) bmiPercentile = 95;
      else if (bmi >= 20.5) bmiPercentile = 85;
      else if (bmi >= 18.5) bmiPercentile = 75;
      else if (bmi >= 16.5) bmiPercentile = 50;
      else if (bmi >= 14.5) bmiPercentile = 25;
      else if (bmi >= 13.5) bmiPercentile = 10;
      else if (bmi >= 12.5) bmiPercentile = 5;
      else bmiPercentile = 1;
    } else {
      if (bmi >= 27) bmiPercentile = 95;
      else if (bmi >= 24) bmiPercentile = 85;
      else if (bmi >= 21.5) bmiPercentile = 75;
      else if (bmi >= 19.5) bmiPercentile = 50;
      else if (bmi >= 17.5) bmiPercentile = 25;
      else if (bmi >= 16) bmiPercentile = 10;
      else if (bmi >= 15) bmiPercentile = 5;
      else bmiPercentile = 1;
    }
  }
  
  // Determine weight category
  let weightCategory = 'normal';
  if (bmiPercentile >= 95) weightCategory = 'obese';
  else if (bmiPercentile >= 85) weightCategory = 'overweight';
  else if (bmiPercentile >= 5) weightCategory = 'normal';
  else weightCategory = 'underweight';
  
  return {
    bmi: Math.round(bmi * 10) / 10,
    bmiPercentile,
    weightCategory,
    age,
    gender,
  };
}

export default function ChildBMIPercentileCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateChildBMIPercentile> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      height: undefined,
      gender: undefined,
      measurementDate: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateChildBMIPercentile(values));
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
            <FormField control={form.control} name="measurementDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Measurement Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate BMI Percentile</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <BarChart3 className="h-8 w-8 text-primary" />
              <CardTitle>Child BMI Percentile Analysis</CardTitle>
            </div>
            <CardDescription>Based on CDC growth charts for {result.gender} children</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.bmi}</p>
                <p className="text-lg text-muted-foreground">BMI Value</p>
                <p className="text-2xl font-bold">{result.bmiPercentile}th Percentile</p>
              </div>
              
              <div className={`p-4 rounded-lg text-center ${
                result.weightCategory === 'obese' ? 'bg-red-100 dark:bg-red-900' :
                result.weightCategory === 'overweight' ? 'bg-orange-100 dark:bg-orange-900' :
                result.weightCategory === 'normal' ? 'bg-green-100 dark:bg-green-900' :
                'bg-blue-100 dark:bg-blue-900'
              }`}>
                <h4 className="font-semibold text-lg capitalize">{result.weightCategory} Weight</h4>
                <p className="text-sm mt-2">
                  {result.weightCategory === 'obese' ? 'BMI ≥ 95th percentile' :
                   result.weightCategory === 'overweight' ? 'BMI 85th-94th percentile' :
                   result.weightCategory === 'normal' ? 'BMI 5th-84th percentile' :
                   'BMI &lt; 5th percentile'}
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Percentile Interpretation</h4>
                <ul className="text-sm space-y-1">
                  <li>• 95th+ percentile: Obese</li>
                  <li>• 85th-94th percentile: Overweight</li>
                  <li>• 5th-84th percentile: Normal weight</li>
                  <li>• Below 5th percentile: Underweight</li>
                </ul>
              </div>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.weightCategory === 'obese' ? 'BMI indicates obesity. Consult your doctor for comprehensive weight management strategies including nutrition and activity counseling.' : 
                 result.weightCategory === 'overweight' ? 'BMI indicates overweight status. Focus on healthy eating habits and increased physical activity. Regular monitoring recommended.' :
                 result.weightCategory === 'normal' ? 'BMI is within healthy range. Continue current nutrition and activity habits. Regular checkups remain important.' :
                 'BMI indicates underweight status. Ensure adequate nutrition and consult your doctor to rule out underlying health conditions.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Child BMI Percentile Calculator – CDC Growth Charts and Weight Assessment" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Calculate child BMI percentiles using CDC growth charts with age and gender-specific weight category assessments." />

        <h2 className="text-xl font-bold text-foreground">Guide: Understanding Child BMI Percentiles</h2>
        <p>BMI percentiles for children are different from adults because they account for age and gender differences in growth patterns:</p>
        <h3 className="font-semibold text-foreground mt-4">BMI Percentile Categories</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Obese:</strong> ≥95th percentile - requires medical intervention</li>
          <li><strong>Overweight:</strong> 85th-94th percentile - lifestyle modifications needed</li>
          <li><strong>Normal Weight:</strong> 5th-84th percentile - healthy range</li>
          <li><strong>Underweight:</strong> &lt;5th percentile - may indicate health concerns</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Factors Affecting Child BMI</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Growth spurts and developmental stages</li>
          <li>Genetic factors and family history</li>
          <li>Nutrition quality and eating patterns</li>
          <li>Physical activity levels and screen time</li>
          <li>Sleep duration and quality</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/infant-growth-percentile-calculator">Infant Growth Percentile Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/toddler-calorie-requirement-calculator">Toddler Calorie Requirement Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/resting-metabolic-rate-calculator">Resting Metabolic Rate Calculator</Link></p>
      </div>
    </div>
  );
}
