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
  waistCircumference: z.number().positive(),
  systolicBP: z.number().positive(),
  diastolicBP: z.number().positive(),
  totalCholesterol: z.number().positive(),
  hdlCholesterol: z.number().positive(),
  triglycerides: z.number().positive(),
  fastingGlucose: z.number().positive(),
  cholesterolUnit: z.enum(['mg/dL', 'mmol/L']),
  glucoseUnit: z.enum(['mg/dL', 'mmol/L']),
  smoking: z.boolean(),
  diabetes: z.boolean(),
  familyHistory: z.boolean(),
  physicalActivity: z.enum(['sedentary', 'light', 'moderate', 'vigorous']),
});

type FormValues = z.infer<typeof formSchema>;

const calculateCardiometabolicAge = (values: FormValues) => {
  let metabolicAge = values.age;
  let adjustments = [];
  
  // Calculate BMI
  let bmi;
  if (values.unit === 'metric') {
    bmi = values.weight / ((values.height / 100) ** 2);
  } else {
    bmi = (values.weight / (values.height ** 2)) * 703;
  }
  
  // BMI adjustments
  if (bmi >= 35) {
    metabolicAge += 8;
    adjustments.push('Severe obesity (+8 years)');
  } else if (bmi >= 30) {
    metabolicAge += 5;
    adjustments.push('Obesity (+5 years)');
  } else if (bmi >= 25) {
    metabolicAge += 2;
    adjustments.push('Overweight (+2 years)');
  } else if (bmi < 18.5) {
    metabolicAge += 1;
    adjustments.push('Underweight (+1 year)');
  }
  
  // Waist circumference adjustments
  const waistThreshold = values.gender === 'male' ? 
    (values.unit === 'metric' ? 102 : 40) : 
    (values.unit === 'metric' ? 88 : 35);
  
  if (values.waistCircumference >= waistThreshold) {
    metabolicAge += 3;
    adjustments.push('Abdominal obesity (+3 years)');
  }
  
  // Blood pressure adjustments
  if (values.systolicBP >= 160 || values.diastolicBP >= 100) {
    metabolicAge += 6;
    adjustments.push('Stage 2 hypertension (+6 years)');
  } else if (values.systolicBP >= 140 || values.diastolicBP >= 90) {
    metabolicAge += 4;
    adjustments.push('Stage 1 hypertension (+4 years)');
  } else if (values.systolicBP >= 130 || values.diastolicBP >= 80) {
    metabolicAge += 2;
    adjustments.push('Elevated blood pressure (+2 years)');
  }
  
  // Cholesterol adjustments
  const cholThreshold = values.cholesterolUnit === 'mg/dL' ? 240 : 6.2;
  const hdlThreshold = values.cholesterolUnit === 'mg/dL' ? 40 : 1.0;
  const trigThreshold = values.cholesterolUnit === 'mg/dL' ? 200 : 2.3;
  
  if (values.totalCholesterol > cholThreshold) {
    metabolicAge += 2;
    adjustments.push('High total cholesterol (+2 years)');
  }
  
  if (values.hdlCholesterol < hdlThreshold) {
    metabolicAge += 2;
    adjustments.push('Low HDL cholesterol (+2 years)');
  }
  
  if (values.triglycerides > trigThreshold) {
    metabolicAge += 1;
    adjustments.push('High triglycerides (+1 year)');
  }
  
  // Glucose adjustments
  const glucoseThreshold = values.glucoseUnit === 'mg/dL' ? 126 : 7.0;
  if (values.fastingGlucose >= glucoseThreshold) {
    metabolicAge += 5;
    adjustments.push('Diabetes (+5 years)');
  } else if (values.fastingGlucose >= (values.glucoseUnit === 'mg/dL' ? 100 : 5.6)) {
    metabolicAge += 2;
    adjustments.push('Prediabetes (+2 years)');
  }
  
  // Lifestyle adjustments
  if (values.smoking) {
    metabolicAge += 4;
    adjustments.push('Smoking (+4 years)');
  }
  
  if (values.familyHistory) {
    metabolicAge += 2;
    adjustments.push('Family history (+2 years)');
  }
  
  if (values.physicalActivity === 'sedentary') {
    metabolicAge += 3;
    adjustments.push('Sedentary lifestyle (+3 years)');
  } else if (values.physicalActivity === 'light') {
    metabolicAge += 1;
    adjustments.push('Light activity (+1 year)');
  } else if (values.physicalActivity === 'vigorous') {
    metabolicAge -= 2;
    adjustments.push('Vigorous activity (-2 years)');
  }
  
  return { metabolicAge: Math.max(18, metabolicAge), bmi, adjustments };
};

const getAgeComparison = (chronologicalAge: number, metabolicAge: number) => {
  const difference = metabolicAge - chronologicalAge;
  
  if (difference <= -5) return { 
    status: 'Excellent', 
    color: 'text-green-600', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-200',
    description: 'Your metabolic age is significantly younger than your chronological age'
  };
  if (difference <= -2) return { 
    status: 'Good', 
    color: 'text-green-500', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-200',
    description: 'Your metabolic age is younger than your chronological age'
  };
  if (difference <= 2) return { 
    status: 'Average', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50', 
    borderColor: 'border-yellow-200',
    description: 'Your metabolic age is similar to your chronological age'
  };
  if (difference <= 5) return { 
    status: 'Concerning', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50', 
    borderColor: 'border-orange-200',
    description: 'Your metabolic age is older than your chronological age'
  };
  return { 
    status: 'High Risk', 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200',
    description: 'Your metabolic age is significantly older than your chronological age'
  };
};

export default function CardiometabolicAgeCalculator() {
  const [result, setResult] = useState<{ 
    metabolicAge: number; 
    bmi: number;
    adjustments: string[];
    comparison: { 
      status: string; 
      color: string; 
      bgColor: string; 
      borderColor: string;
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
      waistCircumference: undefined,
      systolicBP: undefined,
      diastolicBP: undefined,
      totalCholesterol: undefined,
      hdlCholesterol: undefined,
      triglycerides: undefined,
      fastingGlucose: undefined,
      cholesterolUnit: 'mg/dL',
      glucoseUnit: 'mg/dL',
      smoking: false,
      diabetes: false,
      familyHistory: false,
      physicalActivity: 'sedentary',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { metabolicAge, bmi, adjustments } = calculateCardiometabolicAge(values);
    const comparison = getAgeComparison(values.age, metabolicAge);
    setResult({ metabolicAge, bmi, adjustments, comparison });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem>
                <FormLabel>Chronological Age (years)</FormLabel>
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
            
            <FormField control={form.control} name="waistCircumference" render={({ field }) => (
              <FormItem>
                <FormLabel>Waist Circumference ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Blood Pressure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="systolicBP" render={({ field }) => (
                <FormItem>
                  <FormLabel>Systolic BP (mmHg)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="diastolicBP" render={({ field }) => (
                <FormItem>
                  <FormLabel>Diastolic BP (mmHg)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Laboratory Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="totalCholesterol" render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Cholesterol</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="hdlCholesterol" render={({ field }) => (
                <FormItem>
                  <FormLabel>HDL Cholesterol</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="triglycerides" render={({ field }) => (
                <FormItem>
                  <FormLabel>Triglycerides</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="fastingGlucose" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fasting Glucose</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="cholesterolUnit" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cholesterol Units</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mg/dL">mg/dL</SelectItem>
                      <SelectItem value="mmol/L">mmol/L</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="glucoseUnit" render={({ field }) => (
                <FormItem>
                  <FormLabel>Glucose Units</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mg/dL">mg/dL</SelectItem>
                      <SelectItem value="mmol/L">mmol/L</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Lifestyle Factors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="smoking" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Current Smoking</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="diabetes" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Diabetes</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="familyHistory" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Family History of Heart Disease</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="physicalActivity" render={({ field }) => (
                <FormItem>
                  <FormLabel>Physical Activity Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="light">Light Activity</SelectItem>
                      <SelectItem value="moderate">Moderate Activity</SelectItem>
                      <SelectItem value="vigorous">Vigorous Activity</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <Button type="submit" className="w-full">Calculate Cardiometabolic Age</Button>
        </form>
      </Form>

      {result && (
        <Card className={`mt-8 ${result.comparison.bgColor} ${result.comparison.borderColor} border-2`}>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Your Cardiometabolic Age Assessment</CardTitle>
                <CardDescription>Metabolic age vs. chronological age comparison</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <p className="text-4xl font-bold">{result.metabolicAge}</p>
                <p className="text-lg">Metabolic Age</p>
              </div>
              <div className={`text-2xl font-semibold ${result.comparison.color}`}>
                {result.comparison.status}
              </div>
              <div className="text-sm text-muted-foreground">
                {result.comparison.description}
              </div>
              <div className="text-sm text-muted-foreground">
                BMI: {result.bmi.toFixed(1)}
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-lg">Age Adjustments:</h4>
              <ul className="list-disc ml-6 space-y-1">
                {result.adjustments.map((adjustment, index) => (
                  <li key={index} className="text-sm">{adjustment}</li>
                ))}
              </ul>
              
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-3">Interpretation:</h4>
                {result.comparison.status === 'Excellent' && (
                  <div className="space-y-2">
                    <p className="text-green-700">✅ <strong>Excellent:</strong> Your metabolic age is significantly younger than your chronological age.</p>
                    <ul className="list-disc ml-6 text-sm text-green-700">
                      <li>Excellent cardiovascular health</li>
                      <li>Continue current lifestyle</li>
                      <li>Regular health monitoring</li>
                    </ul>
                  </div>
                )}
                {result.comparison.status === 'Good' && (
                  <div className="space-y-2">
                    <p className="text-green-600">✅ <strong>Good:</strong> Your metabolic age is younger than your chronological age.</p>
                    <ul className="list-disc ml-6 text-sm text-green-600">
                      <li>Good cardiovascular health</li>
                      <li>Maintain current lifestyle</li>
                      <li>Continue preventive measures</li>
                    </ul>
                  </div>
                )}
                {result.comparison.status === 'Average' && (
                  <div className="space-y-2">
                    <p className="text-yellow-700">⚠️ <strong>Average:</strong> Your metabolic age is similar to your chronological age.</p>
                    <ul className="list-disc ml-6 text-sm text-yellow-700">
                      <li>Room for improvement</li>
                      <li>Focus on lifestyle modifications</li>
                      <li>Regular health monitoring</li>
                    </ul>
                  </div>
                )}
                {result.comparison.status === 'Concerning' && (
                  <div className="space-y-2">
                    <p className="text-orange-700">🔶 <strong>Concerning:</strong> Your metabolic age is older than your chronological age.</p>
                    <ul className="list-disc ml-6 text-sm text-orange-700">
                      <li>Lifestyle modifications needed</li>
                      <li>Focus on risk factor reduction</li>
                      <li>Consider medical evaluation</li>
                    </ul>
                  </div>
                )}
                {result.comparison.status === 'High Risk' && (
                  <div className="space-y-2">
                    <p className="text-red-700">🚨 <strong>High Risk:</strong> Your metabolic age is significantly older than your chronological age.</p>
                    <ul className="list-disc ml-6 text-sm text-red-700">
                      <li>Immediate lifestyle intervention required</li>
                      <li>Medical evaluation recommended</li>
                      <li>Comprehensive risk factor management</li>
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
              <p>Weight, height, and waist circumference help assess overall body composition and metabolic health.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Blood Pressure</h4>
              <p>Hypertension significantly accelerates cardiovascular aging and metabolic dysfunction.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Laboratory Values</h4>
              <p>Cholesterol and glucose levels are key indicators of metabolic health and cardiovascular risk.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Lifestyle Factors</h4>
              <p>Smoking, physical activity, and family history significantly impact metabolic aging.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>This calculator estimates your metabolic age based on various cardiovascular and metabolic risk factors. Metabolic age reflects how well your body is functioning compared to your chronological age.</p>
            <p className="mt-2">A younger metabolic age indicates better cardiovascular health, while an older metabolic age suggests accelerated aging and increased risk of cardiovascular disease.</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="further-reading">
          <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on metabolic age and cardiovascular risk assessment, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.heart.org/en/health-topics/cardiac-rehab" target="_blank" rel="noopener noreferrer" className="text-primary underline">American Heart Association - Cardiac Rehabilitation</a></li>
              <li><a href="https://www.nhlbi.nih.gov/health-topics/metabolic-syndrome" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Heart, Lung, and Blood Institute - Metabolic Syndrome</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Cardiometabolic Age Calculator – Assess Your Metabolic Health and Cardiovascular Risk" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Comprehensive cardiometabolic age assessment based on cardiovascular risk factors to evaluate metabolic health and aging." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Cardiometabolic Age</h2>
        <p itemProp="description">Cardiometabolic age reflects how well your cardiovascular and metabolic systems are functioning compared to your chronological age. It's a powerful indicator of overall health and longevity.</p>

        <h3 className="font-semibold text-foreground mt-6">What is Metabolic Age?</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Biological age:</strong> How old your body functions compared to your actual age</li>
          <li><strong>Health indicator:</strong> Reflects overall cardiovascular and metabolic health</li>
          <li><strong>Risk predictor:</strong> Predicts future health outcomes and longevity</li>
          <li><strong>Lifestyle impact:</strong> Can be improved through healthy lifestyle choices</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Factors Affecting Metabolic Age</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Body composition:</strong> BMI, waist circumference, muscle mass</li>
          <li><strong>Cardiovascular health:</strong> Blood pressure, cholesterol, heart function</li>
          <li><strong>Metabolic health:</strong> Blood sugar, insulin sensitivity, inflammation</li>
          <li><strong>Lifestyle factors:</strong> Diet, exercise, smoking, stress management</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Improving Metabolic Age</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Regular exercise:</strong> Both aerobic and strength training</li>
          <li><strong>Healthy diet:</strong> Mediterranean-style eating pattern</li>
          <li><strong>Stress management:</strong> Meditation, yoga, adequate sleep</li>
          <li><strong>Risk factor control:</strong> Blood pressure, cholesterol, blood sugar</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/cardiovascular-disease-risk-calculator" className="text-primary underline">Cardiovascular Disease Risk Calculator</Link></p>
          <p><Link href="/category/health-fitness/metabolic-syndrome-risk-calculator" className="text-primary underline">Metabolic Syndrome Risk Calculator</Link></p>
          <p><Link href="/category/health-fitness/waist-to-bmi-ratio-risk-calculator" className="text-primary underline">Waist-to-BMI Ratio Risk Calculator</Link></p>
        </div>
      </section>
      
      <EmbedWidget calculatorSlug="cardiometabolic-age-calculator" calculatorName="Cardiometabolic Age Calculator" />
    </div>
  );
}
