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
import { AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().positive().optional(),
  gender: z.enum(['male', 'female']).optional(),
  familyHistory: z.enum(['none', 'one-parent', 'both-parents', 'siblings', 'extended-family']).optional(),
  existingAllergies: z.enum(['none', 'environmental', 'food', 'both']).optional(),
  eczema: z.enum(['never', 'mild', 'moderate', 'severe']).optional(),
  asthma: z.enum(['never', 'mild', 'moderate', 'severe']).optional(),
  earlyIntroduction: z.enum(['yes', 'no', 'partial']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateAllergyRiskScore(values: FormValues) {
  let riskScore = 0;
  const age = values.age || 30;
  
  // Age factor (children are at higher risk)
  if (age < 5) riskScore += 30;
  else if (age < 18) riskScore += 20;
  else if (age < 30) riskScore += 10;
  
  // Family history factor
  if (values.familyHistory === 'both-parents') riskScore += 25;
  else if (values.familyHistory === 'one-parent') riskScore += 15;
  else if (values.familyHistory === 'siblings') riskScore += 10;
  else if (values.familyHistory === 'extended-family') riskScore += 5;
  
  // Existing allergies factor
  if (values.existingAllergies === 'both') riskScore += 20;
  else if (values.existingAllergies === 'food') riskScore += 15;
  else if (values.existingAllergies === 'environmental') riskScore += 10;
  
  // Eczema factor
  if (values.eczema === 'severe') riskScore += 20;
  else if (values.eczema === 'moderate') riskScore += 15;
  else if (values.eczema === 'mild') riskScore += 10;
  
  // Asthma factor
  if (values.asthma === 'severe') riskScore += 15;
  else if (values.asthma === 'moderate') riskScore += 10;
  else if (values.asthma === 'mild') riskScore += 5;
  
  // Early introduction factor (protective)
  if (values.earlyIntroduction === 'yes') riskScore -= 10;
  else if (values.earlyIntroduction === 'partial') riskScore -= 5;
  
  const riskPercentage = Math.max(0, Math.min(100, riskScore));
  
  return {
    riskScore: Math.round(riskPercentage),
    riskLevel: riskPercentage >= 70 ? 'high' : riskPercentage >= 40 ? 'moderate' : riskPercentage >= 20 ? 'low' : 'minimal',
  };
}

export default function FoodAllergyRiskScoreCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateAllergyRiskScore> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      familyHistory: undefined,
      existingAllergies: undefined,
      eczema: undefined,
      asthma: undefined,
      earlyIntroduction: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateAllergyRiskScore(values));
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
            <FormField control={form.control} name="familyHistory" render={({ field }) => (
              <FormItem>
                <FormLabel>Family History of Allergies</FormLabel>
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
            <FormField control={form.control} name="existingAllergies" render={({ field }) => (
              <FormItem>
                <FormLabel>Existing Allergies</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="none">None</option>
                  <option value="environmental">Environmental Only</option>
                  <option value="food">Food Allergies</option>
                  <option value="both">Both Environmental & Food</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="eczema" render={({ field }) => (
              <FormItem>
                <FormLabel>Eczema History</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="never">Never</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="asthma" render={({ field }) => (
              <FormItem>
                <FormLabel>Asthma History</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="never">Never</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="earlyIntroduction" render={({ field }) => (
              <FormItem>
                <FormLabel>Early Food Introduction (ages 4-6 months)</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="yes">Yes, varied foods</option>
                  <option value="partial">Partial introduction</option>
                  <option value="no">No early introduction</option>
                </select>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Allergy Risk Score</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-primary" />
              <CardTitle>Food Allergy Risk Assessment</CardTitle>
            </div>
            <CardDescription>Based on genetic and environmental factors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold">{result.riskScore}%</p>
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-lg font-semibold capitalize">{result.riskLevel} Risk</p>
              </div>
              
              <div className={`p-4 rounded-lg ${
                result.riskLevel === 'high' ? 'bg-red-100 dark:bg-red-900' :
                result.riskLevel === 'moderate' ? 'bg-yellow-100 dark:bg-yellow-900' :
                result.riskLevel === 'low' ? 'bg-green-100 dark:bg-green-900' :
                'bg-blue-100 dark:bg-blue-900'
              }`}>
                <h4 className="font-semibold mb-2">Risk Level Indicators</h4>
                <ul className="text-sm space-y-1">
                  <li>• High (70%+): Multiple risk factors present</li>
                  <li>• Moderate (40-69%): Some risk factors identified</li>
                  <li>• Low (20-39%): Few risk factors</li>
                  <li>• Minimal (0-19%): Low risk profile</li>
                </ul>
              </div>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.riskLevel === 'high' ? 'High risk for food allergies. Consider allergy testing and work with an allergist for prevention strategies.' : 
                 result.riskLevel === 'moderate' ? 'Moderate risk for food allergies. Monitor for symptoms and consider gradual introduction of common allergens.' :
                 result.riskLevel === 'low' ? 'Low risk for food allergies. Standard food introduction practices are appropriate.' :
                 'Minimal risk for food allergies. Follow standard dietary guidelines and monitor for any unusual reactions.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Food Allergy Risk Score Calculator – Comprehensive Allergy Assessment" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Calculate food allergy risk based on family history, existing conditions, and environmental factors with prevention strategies." />

        <h2 className="text-xl font-bold text-foreground">Guide: Understanding Food Allergy Risk Factors</h2>
        <p>Food allergies affect 8% of children and 4% of adults. Understanding risk factors helps with prevention and management:</p>
        <h3 className="font-semibold text-foreground mt-4">Major Risk Factors</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Family history of allergies (especially both parents)</li>
          <li>Existing eczema or atopic dermatitis</li>
          <li>Asthma or respiratory allergies</li>
          <li>Young age (highest risk in early childhood)</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Prevention Strategies</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Early introduction of allergenic foods (4-6 months)</li>
          <li>Maintain skin barrier with moisturizers</li>
          <li>Breastfeed for at least 6 months when possible</li>
          <li>Work with healthcare providers for high-risk cases</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/pregnancy-weight-gain-calculator">Pregnancy Weight Gain Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/breastfeeding-calorie-needs-calculator">Breastfeeding Calorie Needs Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/child-bmi-percentile-calculator">Child BMI Percentile Calculator</Link></p>
      </div>
    </div>
  );
}
