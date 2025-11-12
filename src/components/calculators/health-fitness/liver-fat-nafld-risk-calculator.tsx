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
import Link from 'next/link';
import { Zap, AlertTriangle, Calendar, Scale, Ruler, Activity, Wind } from 'lucide-react';

const formSchema = z.object({
  age: z.number().min(18).max(120).optional(),
  gender: z.enum(['male', 'female']).optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  unit: z.enum(['metric', 'imperial']).optional(),
  waistCircumference: z.number().positive().optional(),
  bmi: z.number().positive().optional(),
  diabetes: z.boolean().optional(),
  hypertension: z.boolean().optional(),
  metabolicSyndrome: z.boolean().optional(),
  alcoholIntake: z.enum(['none', 'light', 'moderate', 'heavy']).optional(),
  physicalActivity: z.enum(['sedentary', 'light', 'moderate', 'vigorous']).optional(),
  familyHistory: z.boolean().optional(),
  medications: z.object({
    statins: z.boolean().optional(),
    metformin: z.boolean().optional(),
    insulin: z.boolean().optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  riskScore: number;
  riskLevel: string;
  probability: string;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Assess current health metrics: BMI, waist circumference, and liver function if available' },
  { week: 2, focus: 'Begin weight loss if overweight: aim for 5–10% body weight reduction' },
  { week: 3, focus: 'Adopt Mediterranean-style diet: reduce processed foods, increase fruits, vegetables, and whole grains' },
  { week: 4, focus: 'Increase physical activity: 150+ minutes/week moderate exercise' },
  { week: 5, focus: 'Limit or eliminate alcohol consumption to reduce liver stress' },
  { week: 6, focus: 'Focus on blood sugar control if diabetic: monitor glucose and follow medical advice' },
  { week: 7, focus: 'Reassess risk factors and compare improvements' },
  { week: 8, focus: 'Maintain healthy habits and schedule follow-up liver function testing if high risk' },
];

const faqs: [string, string][] = [
  ['What is NAFLD?', 'Non-Alcoholic Fatty Liver Disease (NAFLD) is a condition where fat builds up in the liver without excessive alcohol consumption. It\'s closely linked to metabolic syndrome and can progress to more serious liver disease.'],
  ['How is NAFLD risk calculated?', 'The calculator considers age, gender, BMI, waist circumference, medical conditions (diabetes, hypertension, metabolic syndrome), lifestyle factors (alcohol, physical activity), and family history to estimate risk.'],
  ['What is a high NAFLD risk score?', 'Scores above 9 indicate very high risk (>60% probability), 7–9 high risk (30–60%), 4–6 moderate risk (10–30%), and ≤3 low risk (<10%).'],
  ['Can I prevent NAFLD?', 'Yes, through weight loss (5–10% body weight), regular exercise, healthy diet (Mediterranean-style), limiting alcohol, and controlling diabetes and blood pressure.'],
  ['How often should I check my NAFLD risk?', 'Reassess every 3–6 months or after significant lifestyle changes. Regular monitoring helps track improvements.'],
  ['Does age affect NAFLD risk?', 'Yes, risk increases with age, especially after 45. The calculator adjusts for age in the risk assessment.'],
  ['What if my risk score is very high?', 'Focus on immediate lifestyle modifications, consider liver function testing, and consult healthcare providers for comprehensive evaluation and management.'],
  ['Is this calculator a medical diagnosis?', 'No, this is an educational tool. Consult healthcare professionals for medical evaluation, liver function testing, and treatment of NAFLD.'],
  ['Can medications affect NAFLD risk?', 'Some medications like statins and metformin may have protective effects, while others can contribute to liver stress. Discuss with healthcare providers.'],
  ['What lifestyle changes have the biggest impact?', 'Weight loss (5–10%), regular exercise, healthy diet, alcohol reduction, and controlling diabetes and blood pressure have the most significant effects on NAFLD risk.'],
];

const understandingInputs = [
  { label: 'Age (years)', description: 'Your age in years (18–120). Risk increases with age, especially after 45.' },
  { label: 'Gender', description: 'Biological sex, as males have slightly higher NAFLD risk than females.' },
  { label: 'Weight & Height', description: 'Body measurements used to calculate BMI, a key NAFLD risk factor.' },
  { label: 'Waist Circumference', description: 'Abdominal fat measurement; higher values indicate increased metabolic and NAFLD risk.' },
  { label: 'BMI', description: 'Body Mass Index (if known). Obesity (BMI ≥30) significantly increases NAFLD risk.' },
  { label: 'Medical Conditions', description: 'Diabetes, hypertension, and metabolic syndrome are major NAFLD risk factors.' },
  { label: 'Lifestyle Factors', description: 'Alcohol intake and physical activity level significantly impact liver health.' },
  { label: 'Medications', description: 'Some medications (statins, metformin) may have protective effects against NAFLD progression.' },
];

const calculateNAFLDRisk = (values: FormValues) => {
  if (!values.age || !values.gender) return null;
  
  let riskScore = 0;
  
  // Age factor
  if (values.age >= 60) riskScore += 3;
  else if (values.age >= 45) riskScore += 2;
  else if (values.age >= 30) riskScore += 1;
  
  // Gender factor
  if (values.gender === 'male') riskScore += 1;
  
  // BMI factor
  if (values.bmi) {
    if (values.bmi >= 35) riskScore += 4;
    else if (values.bmi >= 30) riskScore += 3;
    else if (values.bmi >= 25) riskScore += 2;
  }
  
  // Waist circumference
  if (values.waistCircumference && values.unit) {
    const waistThreshold = values.gender === 'male' ? 
      (values.unit === 'metric' ? 102 : 40) : 
      (values.unit === 'metric' ? 88 : 35);
    if (values.waistCircumference >= waistThreshold) riskScore += 2;
  }
  
  // Medical conditions
  if (values.diabetes) riskScore += 3;
  if (values.hypertension) riskScore += 2;
  if (values.metabolicSyndrome) riskScore += 3;
  
  // Lifestyle factors
  if (values.alcoholIntake === 'heavy') riskScore += 2;
  else if (values.alcoholIntake === 'moderate') riskScore += 1;
  
  if (values.physicalActivity === 'sedentary') riskScore += 2;
  else if (values.physicalActivity === 'light') riskScore += 1;
  
  if (values.familyHistory) riskScore += 1;
  
  // Protective factors
  if (values.medications?.statins) riskScore -= 1;
  if (values.medications?.metformin) riskScore -= 1;
  
  return Math.max(0, riskScore);
};

const interpret = (score: number) => {
  if (score <= 3) return 'Low risk—minimal NAFLD risk. Continue maintaining a healthy lifestyle.';
  if (score <= 6) return 'Moderate risk—some NAFLD risk factors present. Lifestyle modifications recommended.';
  if (score <= 9) return 'High risk—significant NAFLD risk factors. Medical evaluation and lifestyle intervention recommended.';
  return 'Very high risk—multiple NAFLD risk factors. Urgent medical consultation and comprehensive lifestyle intervention needed.';
};

const recommendations = (score: number) => {
  const base = [
    'Aim for 5–10% body weight reduction if overweight or obese',
    'Engage in regular physical activity (150+ minutes/week moderate exercise)',
    'Adopt a Mediterranean-style diet: reduce processed foods, increase fruits, vegetables, and whole grains',
  ];
  if (score > 9) {
    return [
      ...base,
      'Schedule immediate medical evaluation and liver function testing',
      'Consider specialist referral (gastroenterologist) for comprehensive assessment',
      'Implement aggressive lifestyle changes and monitor progress regularly',
    ];
  }
  if (score > 6) {
    return [
      ...base,
      'Seek medical evaluation and consider liver function testing',
      'Focus on controlling diabetes and blood pressure if present',
      'Limit or eliminate alcohol consumption',
    ];
  }
  if (score > 3) {
    return [
      ...base,
      'Monitor abdominal fat accumulation and work on reducing waist circumference',
      'Consider liver function testing if risk persists',
    ];
  }
  return [
    ...base,
    'Maintain current healthy habits and continue regular health monitoring',
  ];
};

const warningSigns = () => [
  'This calculator is educational and not a medical diagnosis. Consult healthcare professionals for medical evaluation and liver function testing.',
  'If you have symptoms like persistent fatigue, abdominal pain, or jaundice, seek immediate medical attention.',
  'NAFLD can progress to NASH (steatohepatitis) and cirrhosis if not addressed. Early intervention is important.',
];

export default function LiverFatNAFLDRiskCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      weight: undefined,
      height: undefined,
      unit: 'metric',
      waistCircumference: undefined,
      bmi: undefined,
      diabetes: false,
      hypertension: false,
      metabolicSyndrome: false,
      alcoholIntake: 'none',
      physicalActivity: 'sedentary',
      familyHistory: false,
      medications: {
        statins: false,
        metformin: false,
        insulin: false,
      },
    },
  });

  const unit = form.watch('unit');

  const onSubmit = (values: FormValues) => {
    const riskScore = calculateNAFLDRisk(values);
    if (riskScore === null) {
      setResult(null);
      return;
    }

    let riskLevel = 'Low Risk';
    let probability = '< 10%';
    if (riskScore > 9) {
      riskLevel = 'Very High Risk';
      probability = '> 60%';
    } else if (riskScore > 6) {
      riskLevel = 'High Risk';
      probability = '30–60%';
    } else if (riskScore > 3) {
      riskLevel = 'Moderate Risk';
      probability = '10–30%';
    }

    setResult({
      status: 'Calculated',
      interpretation: interpret(riskScore),
      recommendations: recommendations(riskScore),
      warningSigns: warningSigns(),
      plan: plan(),
      riskScore,
      riskLevel,
      probability,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Liver Fat (NAFLD) Risk Calculator</CardTitle>
          <CardDescription>Assess your risk for Non-Alcoholic Fatty Liver Disease based on metabolic factors and lifestyle.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
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
                      <FormLabel className="flex items-center gap-2"><Scale className="h-4 w-4" /> Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="height" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Ruler className="h-4 w-4" /> Height ({unit === 'metric' ? 'cm' : 'in'})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 175" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="waistCircumference" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waist Circumference ({unit === 'metric' ? 'cm' : 'inches'})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 85" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="bmi" render={({ field }) => (
                    <FormItem>
                      <FormLabel>BMI (if known)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 25.5" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
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
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Type 2 Diabetes</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="hypertension" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Hypertension</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="metabolicSyndrome" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Metabolic Syndrome</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="familyHistory" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Family History of Liver Disease</FormLabel>
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="alcoholIntake" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alcohol Intake</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select alcohol intake" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="light">Light (1–2 drinks/week)</SelectItem>
                        <SelectItem value="moderate">Moderate (3–7 drinks/week)</SelectItem>
                        <SelectItem value="heavy">Heavy (8+ drinks/week)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="physicalActivity" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Physical Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select activity level" /></SelectTrigger>
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

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Current Medications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="medications.statins" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Statins</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="medications.metformin" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Metformin</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="medications.insulin" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Insulin</FormLabel>
                    </FormItem>
                  )} />
                </div>
              </div>

              <Button type="submit" className="w-full md:w-auto">Calculate NAFLD Risk</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>NAFLD Risk Assessment</CardTitle></div>
              <CardDescription>Non-Alcoholic Fatty Liver Disease Risk Evaluation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Risk Score</h4><p className="text-2xl font-bold text-primary">{result.riskScore}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Risk Level</h4><p className="text-2xl font-bold text-primary">{result.riskLevel}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Probability</h4><p className="text-2xl font-bold text-primary">{result.probability}</p></div>
              </div>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2">{result.recommendations.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2">{result.warningSigns.map((w,i)=>(<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul></CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week NAFLD Prevention Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead>
                  <tbody>{plan().map(p=>(<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Accurate inputs ensure reliable NAFLD risk estimation</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for metabolic and liver health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/metabolic-syndrome-risk-calculator" className="text-primary hover:underline">Metabolic Syndrome Risk</Link></h4><p className="text-sm text-muted-foreground">Evaluate metabolic syndrome indicators linked to NAFLD.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/waist-to-bmi-ratio-risk-calculator" className="text-primary hover:underline">Waist-to-BMI Ratio</Link></h4><p className="text-sm text-muted-foreground">Assess central obesity and metabolic risk.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/bmi-calculator" className="text-primary hover:underline">BMI Calculator</Link></h4><p className="text-sm text-muted-foreground">Calculate body mass index for health assessment.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cardiometabolic-age-calculator" className="text-primary hover:underline">Cardiometabolic Age</Link></h4><p className="text-sm text-muted-foreground">Evaluate overall metabolic health status.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Understanding NAFLD</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>NAFLD is the most common chronic liver disease worldwide, affecting 25–30% of the general population. It\'s closely linked to metabolic syndrome, obesity, diabetes, and hypertension. Early identification and intervention can prevent progression to more serious liver disease (NASH, cirrhosis). Improve NAFLD risk through weight loss (5–10%), regular exercise, healthy diet, limiting alcohol, and controlling diabetes and blood pressure.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO-oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{faqs.map(([q,a],i)=>(<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}
