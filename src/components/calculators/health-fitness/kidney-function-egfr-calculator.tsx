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
  race: z.enum(['black', 'non-black']),
  serumCreatinine: z.number().positive(),
  unit: z.enum(['mg/dL', 'μmol/L']),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  bodySizeUnit: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

const calculateEGFR = (values: FormValues) => {
  // Convert creatinine to mg/dL if needed
  let creatinine = values.serumCreatinine;
  if (values.unit === 'μmol/L') {
    creatinine = values.serumCreatinine / 88.4; // Convert μmol/L to mg/dL
  }
  
  // Calculate BMI if weight and height are provided
  let bmi = null;
  if (values.weight && values.height) {
    if (values.bodySizeUnit === 'metric') {
      bmi = values.weight / ((values.height / 100) ** 2);
    } else {
      bmi = (values.weight / (values.height ** 2)) * 703;
    }
  }
  
  // CKD-EPI equation for eGFR
  let eGFR;
  
  if (values.gender === 'female') {
    if (values.race === 'black') {
      if (creatinine <= 0.7) {
        eGFR = 166 * Math.pow(creatinine / 0.7, -0.329) * Math.pow(0.993, values.age);
      } else {
        eGFR = 166 * Math.pow(creatinine / 0.7, -1.209) * Math.pow(0.993, values.age);
      }
    } else {
      if (creatinine <= 0.7) {
        eGFR = 144 * Math.pow(creatinine / 0.7, -0.329) * Math.pow(0.993, values.age);
      } else {
        eGFR = 144 * Math.pow(creatinine / 0.7, -1.209) * Math.pow(0.993, values.age);
      }
    }
  } else {
    if (values.race === 'black') {
      if (creatinine <= 0.9) {
        eGFR = 163 * Math.pow(creatinine / 0.9, -0.411) * Math.pow(0.993, values.age);
      } else {
        eGFR = 163 * Math.pow(creatinine / 0.9, -1.209) * Math.pow(0.993, values.age);
      }
    } else {
      if (creatinine <= 0.9) {
        eGFR = 141 * Math.pow(creatinine / 0.9, -0.411) * Math.pow(0.993, values.age);
      } else {
        eGFR = 141 * Math.pow(creatinine / 0.9, -1.209) * Math.pow(0.993, values.age);
      }
    }
  }
  
  return { eGFR: Math.round(eGFR), bmi };
};

const getKidneyFunctionStage = (eGFR: number) => {
  if (eGFR >= 90) return { 
    stage: 'G1', 
    description: 'Normal or High', 
    color: 'text-green-600', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-200',
    risk: 'Low'
  };
  if (eGFR >= 60) return { 
    stage: 'G2', 
    description: 'Mildly Decreased', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50', 
    borderColor: 'border-yellow-200',
    risk: 'Low'
  };
  if (eGFR >= 45) return { 
    stage: 'G3a', 
    description: 'Mildly to Moderately Decreased', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50', 
    borderColor: 'border-orange-200',
    risk: 'Moderate'
  };
  if (eGFR >= 30) return { 
    stage: 'G3b', 
    description: 'Moderately to Severely Decreased', 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200',
    risk: 'High'
  };
  if (eGFR >= 15) return { 
    stage: 'G4', 
    description: 'Severely Decreased', 
    color: 'text-red-700', 
    bgColor: 'bg-red-100', 
    borderColor: 'border-red-300',
    risk: 'Very High'
  };
  return { 
    stage: 'G5', 
    description: 'Kidney Failure', 
    color: 'text-red-800', 
    bgColor: 'bg-red-200', 
    borderColor: 'border-red-400',
    risk: 'Critical'
  };
};

export default function KidneyFunctionEGFRCalculator() {
  const [result, setResult] = useState<{ 
    eGFR: number; 
    bmi: number | null;
    stage: { 
      stage: string; 
      description: string; 
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
      race: undefined,
      serumCreatinine: undefined,
      unit: 'mg/dL',
      weight: undefined,
      height: undefined,
      bodySizeUnit: 'metric',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { eGFR, bmi } = calculateEGFR(values);
    const stage = getKidneyFunctionStage(eGFR);
    setResult({ eGFR, bmi, stage });
  };

  const bodySizeUnit = form.watch('bodySizeUnit');

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="race" render={({ field }) => (
              <FormItem>
                <FormLabel>Race/Ethnicity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select race/ethnicity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="black">Black/African American</SelectItem>
                    <SelectItem value="non-black">Non-Black</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="unit" render={({ field }) => (
              <FormItem>
                <FormLabel>Creatinine Units</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mg/dL">mg/dL</SelectItem>
                    <SelectItem value="μmol/L">μmol/L</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Laboratory Values</h3>
            <FormField control={form.control} name="serumCreatinine" render={({ field }) => (
              <FormItem>
                <FormLabel>Serum Creatinine Level</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Body Measurements (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="bodySizeUnit" render={({ field }) => (
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
                  <FormLabel>Weight ({bodySizeUnit === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="height" render={({ field }) => (
                <FormItem>
                  <FormLabel>Height ({bodySizeUnit === 'metric' ? 'cm' : 'in'})</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <Button type="submit" className="w-full">Calculate eGFR</Button>
        </form>
      </Form>

      {result && (
        <Card className={`mt-8 ${result.stage.bgColor} ${result.stage.borderColor} border-2`}>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Your Kidney Function Assessment</CardTitle>
                <CardDescription>Estimated Glomerular Filtration Rate (eGFR)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <p className="text-4xl font-bold">{result.eGFR}</p>
                <p className="text-lg">mL/min/1.73m²</p>
              </div>
              <div className={`text-2xl font-semibold ${result.stage.color}`}>
                Stage {result.stage.stage}: {result.stage.description}
              </div>
              {result.bmi && (
                <div className="text-sm text-muted-foreground">
                  BMI: {result.bmi.toFixed(1)}
                </div>
              )}
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-3">Kidney Function Interpretation:</h4>
                {result.eGFR >= 90 && (
                  <div className="space-y-2">
                    <p className="text-green-700">✅ <strong>Normal or High Function:</strong> Your kidney function is normal or above normal.</p>
                    <ul className="list-disc ml-6 text-sm text-green-700">
                      <li>Continue maintaining a healthy lifestyle</li>
                      <li>Stay hydrated and maintain regular exercise</li>
                      <li>Regular health checkups</li>
                    </ul>
                  </div>
                )}
                {result.eGFR >= 60 && result.eGFR < 90 && (
                  <div className="space-y-2">
                    <p className="text-yellow-700">⚠️ <strong>Mildly Decreased Function:</strong> Your kidney function is slightly below normal.</p>
                    <ul className="list-disc ml-6 text-sm text-yellow-700">
                      <li>Monitor kidney function regularly</li>
                      <li>Maintain healthy blood pressure</li>
                      <li>Control diabetes if present</li>
                      <li>Discuss with your healthcare provider</li>
                    </ul>
                  </div>
                )}
                {result.eGFR >= 45 && result.eGFR < 60 && (
                  <div className="space-y-2">
                    <p className="text-orange-700">🔶 <strong>Mildly to Moderately Decreased:</strong> Your kidney function is moderately reduced.</p>
                    <ul className="list-disc ml-6 text-sm text-orange-700">
                      <li>Seek medical evaluation</li>
                      <li>Regular monitoring of kidney function</li>
                      <li>Lifestyle modifications may be needed</li>
                      <li>Consider nephrology consultation</li>
                    </ul>
                  </div>
                )}
                {result.eGFR >= 30 && result.eGFR < 45 && (
                  <div className="space-y-2">
                    <p className="text-red-700">🔴 <strong>Moderately to Severely Decreased:</strong> Your kidney function is significantly reduced.</p>
                    <ul className="list-disc ml-6 text-sm text-red-700">
                      <li>Immediate medical evaluation required</li>
                      <li>Regular nephrology follow-up</li>
                      <li>Comprehensive kidney care plan needed</li>
                      <li>Monitor for complications</li>
                    </ul>
                  </div>
                )}
                {result.eGFR >= 15 && result.eGFR < 30 && (
                  <div className="space-y-2">
                    <p className="text-red-800">🚨 <strong>Severely Decreased Function:</strong> Your kidney function is severely reduced.</p>
                    <ul className="list-disc ml-6 text-sm text-red-800">
                      <li>Urgent medical evaluation required</li>
                      <li>Specialist care (nephrologist) essential</li>
                      <li>Prepare for potential dialysis or transplant</li>
                      <li>Comprehensive medical management needed</li>
                    </ul>
                  </div>
                )}
                {result.eGFR < 15 && (
                  <div className="space-y-2">
                    <p className="text-red-900">🚨 <strong>Kidney Failure:</strong> Your kidney function is critically low.</p>
                    <ul className="list-disc ml-6 text-sm text-red-900">
                      <li>Immediate specialist care required</li>
                      <li>Dialysis or kidney transplant evaluation</li>
                      <li>Comprehensive medical management</li>
                      <li>Regular monitoring of complications</li>
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
              <p>Kidney function naturally declines with age. The eGFR calculation adjusts for age and gender differences.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Race/Ethnicity</h4>
              <p>African Americans tend to have higher muscle mass, affecting creatinine levels and eGFR calculations.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Serum Creatinine</h4>
              <p>A waste product from muscle metabolism. Higher levels indicate reduced kidney function.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Body Measurements</h4>
              <p>Optional for BMI calculation, which can help assess overall health status.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>This calculator uses the CKD-EPI (Chronic Kidney Disease Epidemiology Collaboration) equation, which is the most accurate method for estimating kidney function.</p>
            <p className="mt-2">eGFR represents how well your kidneys are filtering waste from your blood. Normal values are 90+ mL/min/1.73m², with values below 60 indicating chronic kidney disease.</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="further-reading">
          <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on kidney function assessment and chronic kidney disease, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.kidney.org/professionals/kdoqi/gfr_calculator" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Kidney Foundation - GFR Calculator</a></li>
              <li><a href="https://www.niddk.nih.gov/health-information/kidney-disease" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Institute of Diabetes and Digestive and Kidney Diseases</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Kidney Function (eGFR) Calculator – Assess Your Kidney Health and Function" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Comprehensive kidney function assessment using the CKD-EPI equation to estimate glomerular filtration rate and kidney health." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Kidney Function</h2>
        <p itemProp="description">The kidneys filter waste and excess fluid from your blood. eGFR (estimated Glomerular Filtration Rate) is the best measure of kidney function, indicating how well your kidneys are working.</p>

        <h3 className="font-semibold text-foreground mt-6">eGFR Stages</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Stage G1 (≥90):</strong> Normal or high function</li>
          <li><strong>Stage G2 (60-89):</strong> Mildly decreased function</li>
          <li><strong>Stage G3a (45-59):</strong> Mildly to moderately decreased</li>
          <li><strong>Stage G3b (30-44):</strong> Moderately to severely decreased</li>
          <li><strong>Stage G4 (15-29):</strong> Severely decreased</li>
          <li><strong>Stage G5 (&lt;15):</strong> Kidney failure</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Risk Factors for Kidney Disease</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Diabetes:</strong> Leading cause of kidney disease</li>
          <li><strong>High blood pressure:</strong> Second leading cause</li>
          <li><strong>Age:</strong> Risk increases after age 60</li>
          <li><strong>Family history:</strong> Genetic predisposition</li>
          <li><strong>Cardiovascular disease:</strong> Heart and kidney health are linked</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Prevention and Management</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Control blood pressure:</strong> Target &lt;130/80 mmHg</li>
          <li><strong>Manage diabetes:</strong> Keep blood sugar well controlled</li>
          <li><strong>Healthy diet:</strong> Low sodium, adequate protein</li>
          <li><strong>Regular exercise:</strong> Maintain cardiovascular health</li>
          <li><strong>Avoid nephrotoxic substances:</strong> Certain medications and supplements</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/blood-pressure-risk-calculator" className="text-primary underline">Blood Pressure Risk Calculator</Link></p>
          <p><Link href="/category/health-fitness/diabetes-risk-type2-calculator" className="text-primary underline">Type 2 Diabetes Risk Calculator</Link></p>
          <p><Link href="/category/health-fitness/cardiovascular-disease-risk-calculator" className="text-primary underline">Cardiovascular Disease Risk Calculator</Link></p>
        </div>
      </section>
      
      <EmbedWidget calculatorSlug="kidney-function-egfr-calculator" calculatorName="Kidney Function (eGFR) Calculator" />
    </div>
  );
}
