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
  waistCircumference: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

const calculateWaistBMIRatio = (values: FormValues) => {
  let bmi, waist;
  
  if (values.unit === 'metric') {
    bmi = values.weight / ((values.height / 100) ** 2);
    waist = values.waistCircumference;
  } else {
    bmi = (values.weight / (values.height ** 2)) * 703;
    waist = values.waistCircumference * 2.54; // Convert inches to cm
  }
  
  const ratio = waist / bmi;
  return { ratio, bmi, waist };
};

const getRiskLevel = (ratio: number, gender: string, age: number) => {
  // Age-adjusted thresholds
  const ageFactor = age >= 65 ? 0.1 : age >= 45 ? 0.05 : 0;
  
  let thresholds;
  if (gender === 'male') {
    thresholds = {
      low: 0.45 + ageFactor,
      moderate: 0.50 + ageFactor,
      high: 0.55 + ageFactor,
    };
  } else {
    thresholds = {
      low: 0.42 + ageFactor,
      moderate: 0.47 + ageFactor,
      high: 0.52 + ageFactor,
    };
  }
  
  if (ratio <= thresholds.low) return { 
    level: 'Low Risk', 
    color: 'text-green-600', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-200',
    risk: 'Low'
  };
  if (ratio <= thresholds.moderate) return { 
    level: 'Moderate Risk', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50', 
    borderColor: 'border-yellow-200',
    risk: 'Moderate'
  };
  if (ratio <= thresholds.high) return { 
    level: 'High Risk', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50', 
    borderColor: 'border-orange-200',
    risk: 'High'
  };
  return { 
    level: 'Very High Risk', 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200',
    risk: 'Very High'
  };
};

export default function WaistToBMIRatioRiskCalculator() {
  const [result, setResult] = useState<{ 
    ratio: number; 
    bmi: number;
    waist: number;
    riskLevel: { 
      level: string; 
      color: string; 
      bgColor: string; 
      borderColor: string;
      risk: string;
    } 
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      weight: undefined,
      height: undefined,
      waistCircumference: undefined,
      unit: 'metric',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { ratio, bmi, waist } = calculateWaistBMIRatio(values);
    const riskLevel = getRiskLevel(ratio, values.gender, values.age);
    setResult({ ratio, bmi, waist, riskLevel });
  };

  const unit = form.watch('unit');

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

          <Button type="submit" className="w-full">Calculate Waist-to-BMI Ratio Risk</Button>
        </form>
      </Form>

      {result && (
        <Card className={`mt-8 ${result.riskLevel.bgColor} ${result.riskLevel.borderColor} border-2`}>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Your Waist-to-BMI Ratio Assessment</CardTitle>
                <CardDescription>Central Obesity and Metabolic Risk Evaluation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <p className="text-4xl font-bold">{result.ratio.toFixed(2)}</p>
                <p className="text-lg">Waist-to-BMI Ratio</p>
              </div>
              <div className={`text-2xl font-semibold ${result.riskLevel.color}`}>
                {result.riskLevel.level}
              </div>
              <div className="text-sm text-muted-foreground">
                BMI: {result.bmi.toFixed(1)} | Waist: {result.waist.toFixed(1)} cm
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-3">Risk Interpretation:</h4>
                {result.riskLevel.risk === 'Low' && (
                  <div className="space-y-2">
                    <p className="text-green-700">✅ <strong>Low Risk:</strong> Your waist-to-BMI ratio indicates low central obesity risk.</p>
                    <ul className="list-disc ml-6 text-sm text-green-700">
                      <li>Good body fat distribution</li>
                      <li>Lower risk of metabolic complications</li>
                      <li>Continue maintaining healthy lifestyle</li>
                      <li>Regular health monitoring</li>
                    </ul>
                  </div>
                )}
                {result.riskLevel.risk === 'Moderate' && (
                  <div className="space-y-2">
                    <p className="text-yellow-700">⚠️ <strong>Moderate Risk:</strong> Your waist-to-BMI ratio suggests some central obesity risk.</p>
                    <ul className="list-disc ml-6 text-sm text-yellow-700">
                      <li>Monitor abdominal fat accumulation</li>
                      <li>Focus on core strengthening exercises</li>
                      <li>Consider dietary modifications</li>
                      <li>Regular health checkups recommended</li>
                    </ul>
                  </div>
                )}
                {result.riskLevel.risk === 'High' && (
                  <div className="space-y-2">
                    <p className="text-orange-700">🔶 <strong>High Risk:</strong> Your waist-to-BMI ratio indicates significant central obesity risk.</p>
                    <ul className="list-disc ml-6 text-sm text-orange-700">
                      <li>Increased risk of metabolic syndrome</li>
                      <li>Focus on targeted abdominal fat reduction</li>
                      <li>Comprehensive lifestyle intervention needed</li>
                      <li>Consider medical evaluation</li>
                    </ul>
                  </div>
                )}
                {result.riskLevel.risk === 'Very High' && (
                  <div className="space-y-2">
                    <p className="text-red-700">🚨 <strong>Very High Risk:</strong> Your waist-to-BMI ratio indicates very high central obesity risk.</p>
                    <ul className="list-disc ml-6 text-sm text-red-700">
                      <li>Significantly increased metabolic risk</li>
                      <li>Urgent lifestyle intervention required</li>
                      <li>Medical evaluation recommended</li>
                      <li>Consider specialist consultation</li>
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
              <h4 className="font-semibold text-foreground mb-1">Age & Gender</h4>
              <p>Risk thresholds are adjusted for age and gender, as central obesity risk increases with age and varies between sexes.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Weight & Height</h4>
              <p>Used to calculate BMI, which provides context for the waist circumference measurement.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Waist Circumference</h4>
              <p>Measure at the narrowest point between ribs and hips. This indicates abdominal fat accumulation.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Ratio Calculation</h4>
              <p>Waist-to-BMI ratio = Waist circumference (cm) ÷ BMI. This provides a more nuanced assessment than BMI alone.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>The Waist-to-BMI ratio is a more sophisticated measure than BMI alone, as it accounts for body fat distribution. Central obesity (excess abdominal fat) is a stronger predictor of metabolic risk than overall obesity.</p>
            <p className="mt-2">This ratio helps identify individuals who may have normal BMI but high abdominal fat, or those with high BMI but relatively low abdominal fat, providing a more personalized risk assessment.</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="further-reading">
          <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on central obesity assessment and metabolic risk, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight" target="_blank" rel="noopener noreferrer" className="text-primary underline">World Health Organization - Obesity and Overweight</a></li>
              <li><a href="https://www.heart.org/en/health-topics/metabolic-syndrome" target="_blank" rel="noopener noreferrer" className="text-primary underline">American Heart Association - Metabolic Syndrome</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Waist-to-BMI Ratio Risk Calculator – Assess Your Central Obesity and Metabolic Risk" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Comprehensive central obesity risk assessment using waist-to-BMI ratio to evaluate metabolic health and cardiovascular risk." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Waist-to-BMI Ratio</h2>
        <p itemProp="description">The waist-to-BMI ratio is a more sophisticated measure than BMI alone, as it accounts for body fat distribution. Central obesity (excess abdominal fat) is a stronger predictor of metabolic risk than overall obesity.</p>

        <h3 className="font-semibold text-foreground mt-6">Why This Ratio Matters</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Body fat distribution:</strong> Where fat is stored matters more than total fat</li>
          <li><strong>Metabolic risk:</strong> Abdominal fat is more metabolically active</li>
          <li><strong>Cardiovascular risk:</strong> Central obesity increases heart disease risk</li>
          <li><strong>Diabetes risk:</strong> Abdominal fat is linked to insulin resistance</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Health Implications</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Metabolic syndrome:</strong> Increased risk of multiple metabolic disorders</li>
          <li><strong>Type 2 diabetes:</strong> Higher risk of developing diabetes</li>
          <li><strong>Cardiovascular disease:</strong> Increased risk of heart disease and stroke</li>
          <li><strong>Inflammation:</strong> Abdominal fat produces inflammatory substances</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Improvement Strategies</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Targeted exercise:</strong> Focus on core strengthening and cardio</li>
          <li><strong>Diet modifications:</strong> Reduce processed foods and added sugars</li>
          <li><strong>Stress management:</strong> Chronic stress increases abdominal fat</li>
          <li><strong>Sleep quality:</strong> Poor sleep is linked to central obesity</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/waist-to-hip-ratio-calculator" className="text-primary underline">Waist-to-Hip Ratio Calculator</Link></p>
          <p><Link href="/category/health-fitness/waist-to-height-ratio-calculator" className="text-primary underline">Waist-to-Height Ratio Calculator</Link></p>
          <p><Link href="/category/health-fitness/metabolic-syndrome-risk-calculator" className="text-primary underline">Metabolic Syndrome Risk Calculator</Link></p>
        </div>
      </section>
      
      <EmbedWidget calculatorSlug="waist-to-bmi-ratio-risk-calculator" calculatorName="Waist-to-BMI Ratio Risk Calculator" />
    </div>
  );
}
