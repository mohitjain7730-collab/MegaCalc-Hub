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
  systolicBP: z.number().positive(),
  diastolicBP: z.number().positive(),
  diabetes: z.boolean(),
  kidneyDisease: z.boolean(),
  heartDisease: z.boolean(),
  stroke: z.boolean(),
  familyHistory: z.boolean(),
  smoking: z.boolean(),
  cholesterol: z.number().positive().optional(),
  cholesterolUnit: z.enum(['mg/dL', 'mmol/L']),
});

type FormValues = z.infer<typeof formSchema>;

const calculateHypertensionStage = (values: FormValues) => {
  const { systolicBP, diastolicBP } = values;
  
  let stage = '';
  let riskLevel = '';
  let recommendations = [];
  
  // Determine hypertension stage based on AHA guidelines
  if (systolicBP < 120 && diastolicBP < 80) {
    stage = 'Normal';
    riskLevel = 'Low';
    recommendations = ['Maintain healthy lifestyle', 'Regular monitoring'];
  } else if (systolicBP < 130 && diastolicBP < 80) {
    stage = 'Elevated';
    riskLevel = 'Low-Moderate';
    recommendations = ['Lifestyle modifications', 'Regular monitoring', 'Consider DASH diet'];
  } else if (systolicBP < 140 && diastolicBP < 90) {
    stage = 'Stage 1 Hypertension';
    riskLevel = 'Moderate';
    recommendations = ['Lifestyle modifications', 'Consider medication', 'Regular monitoring'];
  } else if (systolicBP < 160 && diastolicBP < 100) {
    stage = 'Stage 2 Hypertension';
    riskLevel = 'High';
    recommendations = ['Medication likely needed', 'Lifestyle modifications', 'Regular monitoring'];
  } else {
    stage = 'Stage 3 Hypertension (Hypertensive Crisis)';
    riskLevel = 'Very High';
    recommendations = ['Immediate medical attention', 'Medication required', 'Lifestyle modifications'];
  }
  
  // Calculate cardiovascular risk score
  let riskScore = 0;
  if (values.age >= 65) riskScore += 3;
  else if (values.age >= 55) riskScore += 2;
  else if (values.age >= 45) riskScore += 1;
  
  if (values.gender === 'male') riskScore += 1;
  if (values.diabetes) riskScore += 2;
  if (values.kidneyDisease) riskScore += 2;
  if (values.heartDisease) riskScore += 3;
  if (values.stroke) riskScore += 3;
  if (values.familyHistory) riskScore += 1;
  if (values.smoking) riskScore += 2;
  
  if (values.cholesterol) {
    const cholThreshold = values.cholesterolUnit === 'mg/dL' ? 200 : 5.2;
    if (values.cholesterol > cholThreshold) riskScore += 1;
  }
  
  return { stage, riskLevel, riskScore, recommendations };
};

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'Low': return { color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    case 'Low-Moderate': return { color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    case 'Moderate': return { color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    case 'High': return { color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    case 'Very High': return { color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-300' };
    default: return { color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
  }
};

export default function HypertensionStageCalculator() {
  const [result, setResult] = useState<{ 
    stage: string; 
    riskLevel: string; 
    riskScore: number;
    recommendations: string[];
    colors: { color: string; bgColor: string; borderColor: string };
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      systolicBP: undefined,
      diastolicBP: undefined,
      diabetes: false,
      kidneyDisease: false,
      heartDisease: false,
      stroke: false,
      familyHistory: false,
      smoking: false,
      cholesterol: undefined,
      cholesterolUnit: 'mg/dL',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { stage, riskLevel, riskScore, recommendations } = calculateHypertensionStage(values);
    const colors = getRiskColor(riskLevel);
    setResult({ stage, riskLevel, riskScore, recommendations, colors });
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
            <h3 className="text-lg font-semibold">Blood Pressure Measurements</h3>
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
            <h3 className="text-lg font-semibold">Medical History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="diabetes" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Diabetes</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="kidneyDisease" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Chronic Kidney Disease</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="heartDisease" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Heart Disease</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="stroke" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Previous Stroke</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="familyHistory" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Family History of Hypertension</FormLabel>
                </FormItem>
              )} />
              
              <FormField control={form.control} name="smoking" render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                  </FormControl>
                  <FormLabel>Current Smoking</FormLabel>
                </FormItem>
              )} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="cholesterol" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Cholesterol (optional)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
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
          </div>

          <Button type="submit" className="w-full">Calculate Hypertension Stage</Button>
        </form>
      </Form>

      {result && (
        <Card className={`mt-8 ${result.colors.bgColor} ${result.colors.borderColor} border-2`}>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Your Hypertension Assessment</CardTitle>
                <CardDescription>Blood Pressure Stage and Cardiovascular Risk</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <p className="text-4xl font-bold">{result.stage}</p>
                <p className="text-lg">Blood Pressure Stage</p>
              </div>
              <div className={`text-2xl font-semibold ${result.colors.color}`}>
                {result.riskLevel} Risk
              </div>
              <div className="text-sm text-muted-foreground">
                Cardiovascular Risk Score: {result.riskScore}
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-lg">Recommendations:</h4>
              <ul className="list-disc ml-6 space-y-1">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm">{rec}</li>
                ))}
              </ul>
              
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-3">Risk Interpretation:</h4>
                {result.riskLevel === 'Low' && (
                  <div className="space-y-2">
                    <p className="text-green-700">✅ <strong>Low Risk:</strong> Your blood pressure is within normal limits.</p>
                    <ul className="list-disc ml-6 text-sm text-green-700">
                      <li>Continue maintaining healthy lifestyle</li>
                      <li>Regular blood pressure monitoring</li>
                      <li>Annual health checkups</li>
                    </ul>
                  </div>
                )}
                {result.riskLevel === 'Low-Moderate' && (
                  <div className="space-y-2">
                    <p className="text-yellow-700">⚠️ <strong>Low-Moderate Risk:</strong> Your blood pressure is elevated but not yet hypertensive.</p>
                    <ul className="list-disc ml-6 text-sm text-yellow-700">
                      <li>Focus on lifestyle modifications</li>
                      <li>DASH diet recommended</li>
                      <li>Regular exercise routine</li>
                      <li>Monitor blood pressure regularly</li>
                    </ul>
                  </div>
                )}
                {result.riskLevel === 'Moderate' && (
                  <div className="space-y-2">
                    <p className="text-orange-700">🔶 <strong>Moderate Risk:</strong> You have Stage 1 hypertension.</p>
                    <ul className="list-disc ml-6 text-sm text-orange-700">
                      <li>Lifestyle modifications essential</li>
                      <li>Consider medication with doctor</li>
                      <li>Regular blood pressure monitoring</li>
                      <li>Cardiovascular risk assessment</li>
                    </ul>
                  </div>
                )}
                {result.riskLevel === 'High' && (
                  <div className="space-y-2">
                    <p className="text-red-700">🔴 <strong>High Risk:</strong> You have Stage 2 hypertension.</p>
                    <ul className="list-disc ml-6 text-sm text-red-700">
                      <li>Medication likely required</li>
                      <li>Comprehensive lifestyle changes</li>
                      <li>Regular medical follow-up</li>
                      <li>Monitor for complications</li>
                    </ul>
                  </div>
                )}
                {result.riskLevel === 'Very High' && (
                  <div className="space-y-2">
                    <p className="text-red-800">🚨 <strong>Very High Risk:</strong> You have Stage 3 hypertension (hypertensive crisis).</p>
                    <ul className="list-disc ml-6 text-sm text-red-800">
                      <li>Immediate medical attention required</li>
                      <li>Emergency evaluation may be needed</li>
                      <li>Aggressive treatment required</li>
                      <li>Close medical monitoring</li>
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
              <h4 className="font-semibold text-foreground mb-1">Blood Pressure</h4>
              <p>Systolic (top number) and diastolic (bottom number) measurements. Take multiple readings for accuracy.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Medical History</h4>
              <p>Previous conditions that increase cardiovascular risk and affect treatment decisions.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Lifestyle Factors</h4>
              <p>Smoking and family history significantly impact cardiovascular risk assessment.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Cholesterol</h4>
              <p>Total cholesterol level helps assess overall cardiovascular risk profile.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>This calculator uses the American Heart Association (AHA) guidelines for hypertension classification. The stages are based on blood pressure measurements and associated cardiovascular risk factors.</p>
            <p className="mt-2">The risk assessment considers multiple factors including age, gender, medical history, and lifestyle factors to provide a comprehensive evaluation of your cardiovascular risk.</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="further-reading">
          <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on hypertension management and cardiovascular risk assessment, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.heart.org/en/health-topics/high-blood-pressure" target="_blank" rel="noopener noreferrer" className="text-primary underline">American Heart Association - High Blood Pressure</a></li>
              <li><a href="https://www.nhlbi.nih.gov/health-topics/high-blood-pressure" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Heart, Lung, and Blood Institute - High Blood Pressure</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Hypertension Stage Calculator – Assess Your Blood Pressure and Cardiovascular Risk" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Comprehensive hypertension assessment using AHA guidelines to evaluate blood pressure stages and cardiovascular risk factors." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Hypertension</h2>
        <p itemProp="description">Hypertension (high blood pressure) is a major risk factor for cardiovascular disease, stroke, and kidney disease. Early detection and management can significantly reduce these risks.</p>

        <h3 className="font-semibold text-foreground mt-6">Blood Pressure Categories</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Normal:</strong> &lt;120/80 mmHg</li>
          <li><strong>Elevated:</strong> 120-129/&lt;80 mmHg</li>
          <li><strong>Stage 1 Hypertension:</strong> 130-139/80-89 mmHg</li>
          <li><strong>Stage 2 Hypertension:</strong> 140-159/90-99 mmHg</li>
          <li><strong>Stage 3 Hypertension:</strong> ≥160/≥100 mmHg</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Risk Factors</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Age:</strong> Risk increases with age</li>
          <li><strong>Family history:</strong> Genetic predisposition</li>
          <li><strong>Lifestyle:</strong> Poor diet, lack of exercise, smoking</li>
          <li><strong>Medical conditions:</strong> Diabetes, kidney disease, obesity</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Management Strategies</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>DASH diet:</strong> Low sodium, high potassium, fruits and vegetables</li>
          <li><strong>Regular exercise:</strong> At least 150 minutes of moderate activity weekly</li>
          <li><strong>Weight management:</strong> Achieve and maintain healthy weight</li>
          <li><strong>Medication:</strong> When lifestyle changes aren't sufficient</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/cardiovascular-disease-risk-calculator" className="text-primary underline">Cardiovascular Disease Risk Calculator</Link></p>
          <p><Link href="/category/health-fitness/stroke-risk-calculator" className="text-primary underline">Stroke Risk Calculator</Link></p>
          <p><Link href="/category/health-fitness/kidney-function-egfr-calculator" className="text-primary underline">Kidney Function (eGFR) Calculator</Link></p>
        </div>
      </section>
      
      <EmbedWidget calculatorSlug="hypertension-stage-calculator" calculatorName="Hypertension Stage Calculator" />
    </div>
  );
}
