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
  waistCircumference: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
  systolicBP: z.number().positive(),
  diastolicBP: z.number().positive(),
  fastingGlucose: z.number().positive(),
  hdlCholesterol: z.number().positive(),
  triglycerides: z.number().positive(),
  glucoseUnit: z.enum(['mg/dL', 'mmol/L']),
  cholesterolUnit: z.enum(['mg/dL', 'mmol/L']),
});

type FormValues = z.infer<typeof formSchema>;

const calculateMetabolicSyndromeRisk = (values: FormValues) => {
  let criteria = 0;
  const results = [];
  
  // Waist circumference criteria
  const waistThreshold = values.gender === 'male' ? 
    (values.unit === 'metric' ? 102 : 40) : 
    (values.unit === 'metric' ? 88 : 35);
  
  if (values.waistCircumference >= waistThreshold) {
    criteria++;
    results.push('Abdominal obesity');
  }
  
  // Blood pressure criteria
  if (values.systolicBP >= 130 || values.diastolicBP >= 85) {
    criteria++;
    results.push('Elevated blood pressure');
  }
  
  // Fasting glucose criteria
  const glucoseThreshold = values.glucoseUnit === 'mg/dL' ? 100 : 5.6;
  if (values.fastingGlucose >= glucoseThreshold) {
    criteria++;
    results.push('Elevated fasting glucose');
  }
  
  // HDL cholesterol criteria
  const hdlThreshold = values.gender === 'male' ? 
    (values.cholesterolUnit === 'mg/dL' ? 40 : 1.0) : 
    (values.cholesterolUnit === 'mg/dL' ? 50 : 1.3);
  
  if (values.hdlCholesterol < hdlThreshold) {
    criteria++;
    results.push('Low HDL cholesterol');
  }
  
  // Triglycerides criteria
  const trigThreshold = values.cholesterolUnit === 'mg/dL' ? 150 : 1.7;
  if (values.triglycerides >= trigThreshold) {
    criteria++;
    results.push('Elevated triglycerides');
  }
  
  return { criteria, results };
};

const getRiskLevel = (criteria: number) => {
  if (criteria < 3) return { 
    level: 'No Metabolic Syndrome', 
    color: 'text-green-600', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-200',
    risk: 'Low'
  };
  if (criteria === 3) return { 
    level: 'Metabolic Syndrome', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50', 
    borderColor: 'border-yellow-200',
    risk: 'Moderate'
  };
  if (criteria === 4) return { 
    level: 'Severe Metabolic Syndrome', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50', 
    borderColor: 'border-orange-200',
    risk: 'High'
  };
  return { 
    level: 'Very Severe Metabolic Syndrome', 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200',
    risk: 'Very High'
  };
};

export default function MetabolicSyndromeRiskCalculator() {
  const [result, setResult] = useState<{ 
    criteria: number; 
    results: string[];
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
      waistCircumference: undefined,
      unit: 'metric',
      systolicBP: undefined,
      diastolicBP: undefined,
      fastingGlucose: undefined,
      hdlCholesterol: undefined,
      triglycerides: undefined,
      glucoseUnit: 'mg/dL',
      cholesterolUnit: 'mg/dL',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { criteria, results } = calculateMetabolicSyndromeRisk(values);
    const riskLevel = getRiskLevel(criteria);
    setResult({ criteria, results, riskLevel });
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
            <h3 className="text-lg font-semibold">Anthropometric Measurements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <SelectItem value="metric">Metric (cm)</SelectItem>
                      <SelectItem value="imperial">Imperial (inches)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              
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
              
              <FormField control={form.control} name="fastingGlucose" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fasting Glucose</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
              
              <FormField control={form.control} name="hdlCholesterol" render={({ field }) => (
                <FormItem>
                  <FormLabel>HDL Cholesterol</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="triglycerides" render={({ field }) => (
                <FormItem>
                  <FormLabel>Triglycerides</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <Button type="submit" className="w-full">Calculate Metabolic Syndrome Risk</Button>
        </form>
      </Form>

      {result && (
        <Card className={`mt-8 ${result.riskLevel.bgColor} ${result.riskLevel.borderColor} border-2`}>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Your Metabolic Syndrome Assessment</CardTitle>
                <CardDescription>Based on ATP III criteria</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <p className="text-4xl font-bold">{result.criteria}/5</p>
                <p className="text-lg">Criteria Met</p>
              </div>
              <div className={`text-2xl font-semibold ${result.riskLevel.color}`}>
                {result.riskLevel.level}
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-lg">Abnormal Criteria:</h4>
              {result.results.length > 0 ? (
                <ul className="list-disc ml-6 space-y-1">
                  {result.results.map((criterion, index) => (
                    <li key={index} className="text-sm">{criterion}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-green-700">✅ All criteria within normal limits</p>
              )}
              
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-3">Risk Interpretation:</h4>
                {result.criteria < 3 && (
                  <div className="space-y-2">
                    <p className="text-green-700">✅ <strong>No Metabolic Syndrome:</strong> You do not meet the criteria for metabolic syndrome. Continue maintaining a healthy lifestyle.</p>
                    <ul className="list-disc ml-6 text-sm text-green-700">
                      <li>Maintain regular exercise routine</li>
                      <li>Follow a balanced diet</li>
                      <li>Monitor your health regularly</li>
                    </ul>
                  </div>
                )}
                {result.criteria >= 3 && result.criteria < 4 && (
                  <div className="space-y-2">
                    <p className="text-yellow-700">⚠️ <strong>Metabolic Syndrome:</strong> You meet the criteria for metabolic syndrome. Lifestyle modifications are recommended.</p>
                    <ul className="list-disc ml-6 text-sm text-yellow-700">
                      <li>Focus on weight loss if overweight</li>
                      <li>Increase physical activity</li>
                      <li>Improve diet quality</li>
                      <li>Discuss with your healthcare provider</li>
                    </ul>
                  </div>
                )}
                {result.criteria >= 4 && (
                  <div className="space-y-2">
                    <p className="text-red-700">🚨 <strong>High Risk:</strong> You have multiple metabolic risk factors. Medical evaluation and intervention recommended.</p>
                    <ul className="list-disc ml-6 text-sm text-red-700">
                      <li>Seek medical evaluation promptly</li>
                      <li>Consider comprehensive lifestyle intervention</li>
                      <li>Regular monitoring of cardiovascular risk factors</li>
                      <li>Potential medication evaluation</li>
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
              <h4 className="font-semibold text-foreground mb-1">Waist Circumference</h4>
              <p>Measure at the narrowest point between ribs and hips. Men: ≥102cm (40"), Women: ≥88cm (35").</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Blood Pressure</h4>
              <p>Systolic ≥130 mmHg or Diastolic ≥85 mmHg indicates elevated blood pressure.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Fasting Glucose</h4>
              <p>≥100 mg/dL (5.6 mmol/L) indicates elevated fasting glucose.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">HDL Cholesterol</h4>
              <p>Men: &lt;40 mg/dL (1.0 mmol/L), Women: &lt;50 mg/dL (1.3 mmol/L) indicates low HDL.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Triglycerides</h4>
              <p>≥150 mg/dL (1.7 mmol/L) indicates elevated triglycerides.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>This calculator uses the ATP III (Adult Treatment Panel III) criteria for metabolic syndrome. You must have at least 3 of the 5 criteria to be diagnosed with metabolic syndrome.</p>
            <p className="mt-2">Metabolic syndrome significantly increases your risk of developing type 2 diabetes, cardiovascular disease, and stroke. Early identification and intervention can help prevent these complications.</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="further-reading">
          <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on metabolic syndrome and cardiovascular risk assessment, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.nhlbi.nih.gov/health-topics/metabolic-syndrome" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Heart, Lung, and Blood Institute - Metabolic Syndrome</a></li>
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
        <meta itemProp="headline" content="Metabolic Syndrome Risk Calculator – Assess Your Cardiovascular and Diabetes Risk" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Comprehensive metabolic syndrome risk assessment using ATP III criteria to evaluate cardiovascular and diabetes risk factors." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Metabolic Syndrome</h2>
        <p itemProp="description">Metabolic syndrome is a cluster of conditions that occur together, increasing your risk of heart disease, stroke, and type 2 diabetes. Early identification and intervention can significantly reduce these risks.</p>

        <h3 className="font-semibold text-foreground mt-6">The Five Criteria</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Abdominal obesity:</strong> Waist circumference above normal limits</li>
          <li><strong>Elevated blood pressure:</strong> Systolic ≥130 or Diastolic ≥85 mmHg</li>
          <li><strong>Elevated fasting glucose:</strong> ≥100 mg/dL (5.6 mmol/L)</li>
          <li><strong>Low HDL cholesterol:</strong> Men &lt;40, Women &lt;50 mg/dL</li>
          <li><strong>Elevated triglycerides:</strong> ≥150 mg/dL (1.7 mmol/L)</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Health Implications</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Cardiovascular disease:</strong> 2-3x higher risk of heart attack and stroke</li>
          <li><strong>Type 2 diabetes:</strong> 5x higher risk of developing diabetes</li>
          <li><strong>Other complications:</strong> Fatty liver disease, sleep apnea, certain cancers</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Prevention and Management</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Weight management:</strong> Achieve and maintain healthy weight</li>
          <li><strong>Physical activity:</strong> At least 150 minutes of moderate exercise weekly</li>
          <li><strong>Healthy diet:</strong> Focus on whole foods, limit processed foods</li>
          <li><strong>Regular monitoring:</strong> Track blood pressure, glucose, and cholesterol</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/cardiovascular-disease-risk-calculator" className="text-primary underline">Cardiovascular Disease Risk Calculator</Link></p>
          <p><Link href="/category/health-fitness/diabetes-risk-type2-calculator" className="text-primary underline">Type 2 Diabetes Risk Calculator</Link></p>
          <p><Link href="/category/health-fitness/waist-to-hip-ratio-calculator" className="text-primary underline">Waist-to-Hip Ratio Calculator</Link></p>
        </div>
      </section>
      
      <EmbedWidget calculatorSlug="metabolic-syndrome-risk-calculator" calculatorName="Metabolic Syndrome Risk Calculator" />
    </div>
  );
}
