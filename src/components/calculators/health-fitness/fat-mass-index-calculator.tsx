'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, AlertTriangle, Shield } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  age: z.number().min(18).max(120),
  gender: z.enum(['male', 'female']),
  weight: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
  bodyFatPercentage: z.number().min(0).max(100),
  method: z.enum(['manual', 'estimated']),
});

type FormValues = z.infer<typeof formSchema>;

const calculateFatMassIndex = (values: FormValues) => {
  let weight, height;
  
  if (values.unit === 'metric') {
    weight = values.weight;
    height = values.height / 100; // Convert cm to meters
  } else {
    weight = values.weight * 0.453592; // Convert lbs to kg
    height = values.height * 0.0254; // Convert inches to meters
  }
  
  // Calculate fat mass
  const fatMass = (values.bodyFatPercentage / 100) * weight;
  
  // Calculate Fat Mass Index (FMI)
  const fmi = fatMass / (height * height);
  
  // Calculate BMI for comparison
  const bmi = weight / (height * height);
  
  return { fmi, fatMass, bmi, weight, height };
};

const getFMIStatus = (fmi: number, gender: string, age: number) => {
  // Age and gender-adjusted thresholds
  let thresholds;
  
  if (gender === 'male') {
    if (age < 30) {
      thresholds = { low: 2.0, moderate: 4.0, high: 6.0 };
    } else if (age < 50) {
      thresholds = { low: 2.5, moderate: 4.5, high: 6.5 };
    } else {
      thresholds = { low: 3.0, moderate: 5.0, high: 7.0 };
    }
  } else {
    if (age < 30) {
      thresholds = { low: 3.0, moderate: 5.0, high: 7.0 };
    } else if (age < 50) {
      thresholds = { low: 3.5, moderate: 5.5, high: 7.5 };
    } else {
      thresholds = { low: 4.0, moderate: 6.0, high: 8.0 };
    }
  }
  
  if (fmi < thresholds.low) return { 
    status: 'Low Fat Mass', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50', 
    borderColor: 'border-blue-200',
    risk: 'Low',
    description: 'Very low body fat percentage'
  };
  if (fmi < thresholds.moderate) return { 
    status: 'Normal Fat Mass', 
    color: 'text-green-600', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-200',
    risk: 'Low',
    description: 'Healthy body fat percentage'
  };
  if (fmi < thresholds.high) return { 
    status: 'Moderate Fat Mass', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50', 
    borderColor: 'border-yellow-200',
    risk: 'Moderate',
    description: 'Elevated body fat percentage'
  };
  return { 
    status: 'High Fat Mass', 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200',
    risk: 'High',
    description: 'High body fat percentage'
  };
};

const estimateBodyFatPercentage = (values: FormValues) => {
  let weight, height;
  
  if (values.unit === 'metric') {
    weight = values.weight;
    height = values.height / 100;
  } else {
    weight = values.weight * 0.453592;
    height = values.height * 0.0254;
  }
  
  const bmi = weight / (height * height);
  
  // Simple estimation based on BMI and gender
  if (values.gender === 'male') {
    return Math.max(5, Math.min(35, 1.20 * bmi + 0.23 * values.age - 16.2));
  } else {
    return Math.max(8, Math.min(40, 1.20 * bmi + 0.23 * values.age - 5.4));
  }
};

export default function FatMassIndexCalculator() {
  const [result, setResult] = useState<{ 
    fmi: number; 
    fatMass: number;
    bmi: number;
    status: { 
      status: string; 
      color: string; 
      bgColor: string; 
      borderColor: string;
      risk: string;
      description: string;
    } 
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      weight: undefined,
      height: undefined,
      unit: 'metric',
      bodyFatPercentage: undefined,
      method: 'manual',
    },
  });

  const onSubmit = (values: FormValues) => {
    let bodyFatPercentage = values.bodyFatPercentage;
    
    // If using estimated method, calculate body fat percentage
    if (values.method === 'estimated') {
      bodyFatPercentage = estimateBodyFatPercentage(values);
    }
    
    const { fmi, fatMass, bmi } = calculateFatMassIndex({ ...values, bodyFatPercentage });
    const status = getFMIStatus(fmi, values.gender, values.age);
    setResult({ fmi, fatMass, bmi, status });
  };

  const unit = form.watch('unit');
  const method = form.watch('method');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem>
                <FormLabel>Age (years)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Body Measurements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem>
                  <FormLabel>Units</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                      <SelectItem value="imperial">Imperial (lbs, in)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="weight" render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="height" render={({ field }) => (
                <FormItem>
                  <FormLabel>Height ({unit === 'metric' ? 'cm' : 'in'})</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Body Fat Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="method" render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                      <SelectItem value="estimated">Estimated</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              
              {method === 'manual' && (
                <FormField control={form.control} name="bodyFatPercentage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Fat Percentage (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </div>
            
            {method === 'estimated' && (
              <div className="text-sm text-muted-foreground">
                <p>Body fat percentage will be estimated based on your age, gender, weight, and height using a validated formula.</p>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">Calculate Fat Mass Index</Button>
        </form>
      </Form>

      {result && (
        <Card className={`mt-8 ${result.status.bgColor} ${result.status.borderColor} border-2`}>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Your Fat Mass Index Assessment</CardTitle>
                <CardDescription>Body fat analysis and health evaluation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <p className="text-4xl font-bold">{result.fmi.toFixed(2)}</p>
                <p className="text-lg">Fat Mass Index (FMI)</p>
              </div>
              <div className={`text-2xl font-semibold ${result.status.color}`}>
                {result.status.status}
              </div>
              <div className="text-sm text-muted-foreground">
                {result.status.description}
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <h4 className="font-semibold">Fat Mass</h4>
                  <p className="text-2xl font-bold text-blue-600">{result.fatMass.toFixed(1)} kg</p>
                  <p className="text-sm text-muted-foreground">Total body fat</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <h4 className="font-semibold">BMI</h4>
                  <p className="text-2xl font-bold text-purple-600">{result.bmi.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Body Mass Index</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-3">Health Interpretation:</h4>
                {result.status.risk === 'Low' && result.status.status === 'Low Fat Mass' && (
                  <div className="space-y-2">
                    <p className="text-blue-700">ℹ️ <strong>Low Fat Mass:</strong> Your body fat percentage is very low.</p>
                    <ul className="list-disc ml-6 text-sm text-blue-700">
                      <li>May indicate underweight or very lean physique</li>
                      <li>Ensure adequate nutrition and energy intake</li>
                      <li>Monitor for signs of insufficient body fat</li>
                      <li>Consider consulting with a healthcare provider</li>
                    </ul>
                  </div>
                )}
                {result.status.risk === 'Low' && result.status.status === 'Normal Fat Mass' && (
                  <div className="space-y-2">
                    <p className="text-green-700">✅ <strong>Normal Fat Mass:</strong> Your body fat percentage is within healthy range.</p>
                    <ul className="list-disc ml-6 text-sm text-green-700">
                      <li>Healthy body composition</li>
                      <li>Good metabolic health</li>
                      <li>Continue maintaining current lifestyle</li>
                      <li>Regular health monitoring</li>
                    </ul>
                  </div>
                )}
                {result.status.risk === 'Moderate' && (
                  <div className="space-y-2">
                    <p className="text-yellow-700">⚠️ <strong>Moderate Fat Mass:</strong> Your body fat percentage is elevated.</p>
                    <ul className="list-disc ml-6 text-sm text-yellow-700">
                      <li>Consider lifestyle modifications</li>
                      <li>Focus on healthy diet and exercise</li>
                      <li>Monitor cardiovascular risk</li>
                      <li>Regular health checkups</li>
                    </ul>
                  </div>
                )}
                {result.status.risk === 'High' && (
                  <div className="space-y-2">
                    <p className="text-red-700">🚨 <strong>High Fat Mass:</strong> Your body fat percentage is significantly elevated.</p>
                    <ul className="list-disc ml-6 text-sm text-red-700">
                      <li>Increased risk of metabolic diseases</li>
                      <li>Comprehensive lifestyle intervention needed</li>
                      <li>Consider medical evaluation</li>
                      <li>Focus on sustainable weight management</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
          <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Body Measurements</h4>
              <p>Weight and height are used to calculate BMI and provide context for body fat assessment.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Body Fat Percentage</h4>
              <p>Can be measured using DEXA, BIA, skinfold calipers, or estimated using formulas based on age, gender, and BMI.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Age & Gender</h4>
              <p>Body fat distribution and healthy ranges vary significantly by age and gender.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Assessment Method</h4>
              <p>Choose between manual entry of measured body fat percentage or estimated calculation.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>Fat Mass Index (FMI) is calculated as fat mass divided by height squared (kg/m²). It provides a more specific measure of body fat than BMI alone.</p>
            <p className="mt-2">FMI helps distinguish between muscle mass and fat mass, providing a better assessment of body composition and associated health risks.</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="further-reading">
          <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on body composition assessment and fat mass index, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.acsm.org/read-research/resource-library" target="_blank" rel="noopener noreferrer" className="text-primary underline">American College of Sports Medicine - Body Composition</a></li>
              <li><a href="https://www.nhlbi.nih.gov/health-topics/obesity" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Heart, Lung, and Blood Institute - Obesity</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Fat Mass Index Calculator – Assess Your Body Fat and Health Risk" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Comprehensive body fat assessment using Fat Mass Index to evaluate body composition and associated health risks." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Fat Mass Index</h2>
        <p itemProp="description">Fat Mass Index (FMI) is a specialized measure that focuses specifically on body fat mass relative to height. Unlike BMI, FMI provides a more accurate assessment of body composition and associated health risks.</p>

        <h3 className="font-semibold text-foreground mt-6">What is Fat Mass Index?</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Specific measure:</strong> Focuses on fat mass rather than total body weight</li>
          <li><strong>Height-adjusted:</strong> Accounts for body size differences</li>
          <li><strong>Health indicator:</strong> Better predictor of metabolic risk than BMI</li>
          <li><strong>Composition tool:</strong> Helps distinguish between muscle and fat mass</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Healthy FMI Ranges</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Men:</strong> 2.0-4.0 kg/m² (varies by age)</li>
          <li><strong>Women:</strong> 3.0-5.0 kg/m² (varies by age)</li>
          <li><strong>Age factors:</strong> Ranges increase slightly with age</li>
          <li><strong>Individual variation:</strong> Consider overall health and fitness level</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Health Implications</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Metabolic health:</strong> High FMI increases diabetes risk</li>
          <li><strong>Cardiovascular risk:</strong> Elevated FMI increases heart disease risk</li>
          <li><strong>Inflammation:</strong> Excess fat mass promotes chronic inflammation</li>
          <li><strong>Mobility:</strong> High FMI can affect physical function</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Improvement Strategies</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Resistance training:</strong> Build and maintain muscle mass</li>
          <li><strong>Cardiovascular exercise:</strong> Burn excess fat mass</li>
          <li><strong>Balanced nutrition:</strong> Adequate protein, controlled calories</li>
          <li><strong>Sleep and stress management:</strong> Support healthy metabolism</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary underline">Body Fat Percentage Calculator</Link></p>
          <p><Link href="/category/health-fitness/lean-body-mass-calculator" className="text-primary underline">Lean Body Mass Calculator</Link></p>
          <p><Link href="/category/health-fitness/bmi-calculator" className="text-primary underline">BMI Calculator</Link></p>
        </div>
      </section>
      
      <EmbedWidget calculatorSlug="fat-mass-index-calculator" calculatorName="Fat Mass Index Calculator" />
    </div>
  );
}
