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
  age: z.number().positive().optional(),
  gender: z.enum(['male', 'female']).optional(),
  bloodPressure: z.enum(['normal', 'pre-hypertension', 'stage1-hypertension', 'stage2-hypertension']).optional(),
  currentSodiumIntake: z.number().positive().optional(),
  dashLevel: z.enum(['standard', 'lower-sodium']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateDashSodiumRecommendation(values: FormValues) {
  // DASH diet sodium recommendations
  let recommendedSodium = 2300; // mg for standard DASH
  
  if (values.dashLevel === 'lower-sodium') {
    recommendedSodium = 1500; // mg for lower sodium DASH
  }
  
  // Blood pressure adjustments
  if (values.bloodPressure === 'stage2-hypertension') recommendedSodium = 1500;
  else if (values.bloodPressure === 'stage1-hypertension') recommendedSodium = 1500;
  else if (values.bloodPressure === 'pre-hypertension') recommendedSodium = 1500;
  
  // Age and gender considerations
  const age = values.age || 40;
  if (age > 50) recommendedSodium = Math.min(recommendedSodium, 1500);
  
  const currentIntake = values.currentSodiumIntake || 0;
  const reductionNeeded = Math.max(0, currentIntake - recommendedSodium);
  
  // Calculate DASH compliance score
  let complianceScore = 100;
  if (currentIntake > recommendedSodium) {
    complianceScore = Math.max(0, 100 - ((currentIntake - recommendedSodium) / recommendedSodium) * 100);
  }
  
  return {
    recommendedSodium: Math.round(recommendedSodium),
    reductionNeeded: Math.round(reductionNeeded),
    currentIntake: currentIntake,
    complianceScore: Math.round(complianceScore),
  };
}

export default function DashDietSodiumIntakeCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateDashSodiumRecommendation> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      bloodPressure: undefined,
      currentSodiumIntake: undefined,
      dashLevel: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateDashSodiumRecommendation(values));
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
            <FormField control={form.control} name="currentSodiumIntake" render={({ field }) => (
              <FormItem>
                <FormLabel>Current Daily Sodium Intake (mg)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="bloodPressure" render={({ field }) => (
              <FormItem>
                <FormLabel>Blood Pressure Status</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="normal">Normal</option>
                  <option value="pre-hypertension">Pre-hypertension</option>
                  <option value="stage1-hypertension">Stage 1 Hypertension</option>
                  <option value="stage2-hypertension">Stage 2 Hypertension</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="dashLevel" render={({ field }) => (
              <FormItem>
                <FormLabel>DASH Diet Level</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="standard">Standard DASH (2300mg)</option>
                  <option value="lower-sodium">Lower Sodium DASH (1500mg)</option>
                </select>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate DASH Sodium Goals</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Heart className="h-8 w-8 text-primary" />
              <CardTitle>DASH Diet Sodium Guidelines</CardTitle>
            </div>
            <CardDescription>Personalized recommendations for heart health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{result.recommendedSodium} mg</p>
                <p className="text-sm text-muted-foreground">DASH Diet Target</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{result.complianceScore}%</p>
                <p className="text-sm text-muted-foreground">Current Compliance</p>
              </div>
              {result.reductionNeeded > 0 && (
                <div className="text-center">
                  <p className="text-xl font-bold text-orange-600">{result.reductionNeeded} mg</p>
                  <p className="text-sm text-muted-foreground">Reduction Needed</p>
                </div>
              )}
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.complianceScore >= 90 ? 'Excellent DASH compliance! You are meeting the heart-healthy sodium targets.' : 
                 result.complianceScore >= 70 ? 'Good compliance. Small adjustments can help you reach optimal levels.' :
                 result.complianceScore >= 50 ? 'Moderate compliance. Focus on reducing processed foods and restaurant meals.' :
                 'Low compliance. Consider working with a dietitian to implement DASH principles.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="DASH Diet Sodium Intake Calculator – Heart-Healthy Eating Guidelines" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Calculate optimal sodium intake for DASH diet compliance with blood pressure management recommendations." />

        <h2 className="text-xl font-bold text-foreground">Guide: Following the DASH Diet</h2>
        <p>The DASH diet emphasizes heart-healthy foods while limiting sodium. Here's how to implement it:</p>
        <h3 className="font-semibold text-foreground mt-4">DASH Diet Principles</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Rich in fruits, vegetables, and whole grains</li>
          <li>Includes lean proteins and low-fat dairy</li>
          <li>Limits saturated fats and sodium</li>
          <li>Emphasizes potassium, calcium, and magnesium</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Sodium Management Strategies</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Read nutrition labels carefully</li>
          <li>Cook more meals at home</li>
          <li>Use herbs and spices instead of salt</li>
          <li>Choose fresh over processed foods</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/low-sodium-diet-planner-calculator">Low-Sodium Diet Planner Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/mediterranean-diet-compliance-calculator">Mediterranean Diet Compliance Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/vegan-protein-requirement-calculator">Vegan Protein Requirement Calculator</Link></p>
      </div>
    </div>
  );
}
