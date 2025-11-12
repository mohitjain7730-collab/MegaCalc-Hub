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
import { Zap, HeartPulse, Calendar, Droplet } from 'lucide-react';

const formSchema = z.object({
  age: z.number().min(18).max(120).optional(),
  gender: z.enum(['male', 'female']).optional(),
  systolicBP: z.number().positive().optional(),
  diastolicBP: z.number().positive().optional(),
  diabetes: z.boolean().optional(),
  kidneyDisease: z.boolean().optional(),
  heartDisease: z.boolean().optional(),
  stroke: z.boolean().optional(),
  familyHistory: z.boolean().optional(),
  smoking: z.boolean().optional(),
  cholesterol: z.number().positive().optional(),
  cholesterolUnit: z.enum(['mg/dL', 'mmol/L']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  stage: string;
  riskLevel: string;
  riskScore: number;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Assess current blood pressure: take multiple readings at different times' },
  { week: 2, focus: 'Adopt DASH diet: low sodium, high potassium, fruits, vegetables, and whole grains' },
  { week: 3, focus: 'Begin regular exercise: 150+ minutes/week moderate activity' },
  { week: 4, focus: 'Focus on weight management: aim for healthy BMI if overweight' },
  { week: 5, focus: 'Limit alcohol: no more than 1–2 drinks per day' },
  { week: 6, focus: 'Manage stress: meditation, breathing exercises, or relaxation techniques' },
  { week: 7, focus: 'Reassess blood pressure and compare improvements' },
  { week: 8, focus: 'Maintain healthy habits and continue regular monitoring with healthcare providers' },
];

const faqs: [string, string][] = [
  ['What is hypertension?', 'Hypertension (high blood pressure) is a condition where blood pressure is consistently elevated. It\'s a major risk factor for cardiovascular disease, stroke, and kidney disease.'],
  ['How is hypertension stage determined?', 'Stages are based on American Heart Association guidelines using systolic and diastolic blood pressure measurements. Higher readings indicate more severe hypertension.'],
  ['What are the blood pressure categories?', 'Normal: <120/80, Elevated: 120–129/<80, Stage 1: 130–139/80–89, Stage 2: 140–159/90–99, Stage 3: ≥160/≥100 mmHg.'],
  ['What causes hypertension?', 'Risk factors include age, family history, obesity, sedentary lifestyle, poor diet (high sodium), excessive alcohol, smoking, stress, and medical conditions (diabetes, kidney disease).'],
  ['Can I lower my blood pressure naturally?', 'Yes, through DASH diet, regular exercise, weight loss, limiting alcohol, stress management, and adequate sleep. Lifestyle changes can significantly reduce blood pressure.'],
  ['When do I need medication?', 'Medication is typically recommended for Stage 2 hypertension or Stage 1 with high cardiovascular risk. Always consult healthcare providers for treatment decisions.'],
  ['How often should I check my blood pressure?', 'If you have hypertension, monitor daily or as recommended by your healthcare provider. Take multiple readings at consistent times for accuracy.'],
  ['Is this calculator a medical diagnosis?', 'No, this is an educational tool. Consult healthcare professionals for medical evaluation, diagnosis, and treatment of hypertension.'],
  ['Can medications affect blood pressure?', 'Yes, some medications can raise or lower blood pressure. Always discuss medications with healthcare providers, especially if you have hypertension.'],
  ['What lifestyle changes have the biggest impact?', 'DASH diet, regular exercise, weight loss (if overweight), limiting alcohol, stress management, and adequate sleep have the most significant effects on blood pressure.'],
];

const understandingInputs = [
  { label: 'Age (years)', description: 'Your age in years (18–120). Risk increases with age, and treatment targets may vary by age group.' },
  { label: 'Gender', description: 'Biological sex, as hypertension patterns and risk may differ between males and females.' },
  { label: 'Systolic BP (mmHg)', description: 'The top number in blood pressure, representing pressure when the heart beats. Normal is <120 mmHg.' },
  { label: 'Diastolic BP (mmHg)', description: 'The bottom number in blood pressure, representing pressure when the heart rests. Normal is <80 mmHg.' },
  { label: 'Medical History', description: 'Previous conditions (diabetes, kidney disease, heart disease, stroke) that increase cardiovascular risk and affect treatment decisions.' },
  { label: 'Lifestyle Factors', description: 'Smoking and family history significantly impact cardiovascular risk assessment.' },
  { label: 'Cholesterol (optional)', description: 'Total cholesterol level helps assess overall cardiovascular risk profile.' },
];

const calculateHypertensionStage = (values: FormValues) => {
  if (!values.systolicBP || !values.diastolicBP) return null;
  
  const { systolicBP, diastolicBP } = values;
  
  let stage = '';
  let riskLevel = '';
  
  if (systolicBP < 120 && diastolicBP < 80) {
    stage = 'Normal';
    riskLevel = 'Low';
  } else if (systolicBP < 130 && diastolicBP < 80) {
    stage = 'Elevated';
    riskLevel = 'Low-Moderate';
  } else if (systolicBP < 140 && diastolicBP < 90) {
    stage = 'Stage 1 Hypertension';
    riskLevel = 'Moderate';
  } else if (systolicBP < 160 && diastolicBP < 100) {
    stage = 'Stage 2 Hypertension';
    riskLevel = 'High';
  } else {
    stage = 'Stage 3 Hypertension (Hypertensive Crisis)';
    riskLevel = 'Very High';
  }
  
  // Calculate cardiovascular risk score
  let riskScore = 0;
  if (values.age) {
    if (values.age >= 65) riskScore += 3;
    else if (values.age >= 55) riskScore += 2;
    else if (values.age >= 45) riskScore += 1;
  }
  
  if (values.gender === 'male') riskScore += 1;
  if (values.diabetes) riskScore += 2;
  if (values.kidneyDisease) riskScore += 2;
  if (values.heartDisease) riskScore += 3;
  if (values.stroke) riskScore += 3;
  if (values.familyHistory) riskScore += 1;
  if (values.smoking) riskScore += 2;
  
  if (values.cholesterol && values.cholesterolUnit) {
    const cholThreshold = values.cholesterolUnit === 'mg/dL' ? 200 : 5.2;
    if (values.cholesterol > cholThreshold) riskScore += 1;
  }
  
  return { stage, riskLevel, riskScore };
};

const interpret = (stage: string, riskLevel: string) => {
  if (stage === 'Normal') return 'Normal blood pressure. Continue maintaining a healthy lifestyle.';
  if (stage === 'Elevated') return 'Elevated blood pressure. Focus on lifestyle modifications to prevent progression to hypertension.';
  if (stage === 'Stage 1 Hypertension') return 'Stage 1 hypertension. Lifestyle modifications essential; consider medication with healthcare provider.';
  if (stage === 'Stage 2 Hypertension') return 'Stage 2 hypertension. Medication likely required along with comprehensive lifestyle changes.';
  return 'Stage 3 hypertension (hypertensive crisis). Immediate medical attention required. Emergency evaluation may be needed.';
};

const recommendations = (stage: string, riskLevel: string) => {
  const base = [
    'Adopt DASH diet: low sodium, high potassium, fruits, vegetables, and whole grains',
    'Engage in regular exercise: 150+ minutes/week moderate activity',
    'Aim for healthy weight: 5–10% weight loss can significantly lower blood pressure',
  ];
  if (stage.includes('Stage 3')) {
    return [
      ...base,
      'Seek immediate medical attention and emergency evaluation if needed',
      'Medication required along with aggressive lifestyle changes',
      'Close medical monitoring essential',
    ];
  }
  if (stage.includes('Stage 2')) {
    return [
      ...base,
      'Medication likely required—consult healthcare providers',
      'Comprehensive lifestyle changes essential',
      'Regular medical follow-up needed',
    ];
  }
  if (stage.includes('Stage 1')) {
    return [
      ...base,
      'Consider medication with healthcare provider, especially if high cardiovascular risk',
      'Regular blood pressure monitoring',
    ];
  }
  if (stage === 'Elevated') {
    return [
      ...base,
      'Focus on lifestyle modifications to prevent progression',
      'Regular blood pressure monitoring',
    ];
  }
  return [
    ...base,
    'Continue maintaining healthy habits and regular health monitoring',
  ];
};

const warningSigns = () => [
  'This calculator is educational and not a medical diagnosis. Consult healthcare professionals for medical evaluation and treatment.',
  'If you have Stage 3 hypertension (≥160/≥100) or symptoms like severe headache, chest pain, or shortness of breath, seek immediate medical attention.',
  'Uncontrolled hypertension can lead to heart attack, stroke, kidney disease, and other serious complications. Early intervention is important.',
];

export default function HypertensionStageCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
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
    const calc = calculateHypertensionStage(values);
    if (!calc) {
      setResult(null);
      return;
    }

    setResult({
      status: 'Calculated',
      interpretation: interpret(calc.stage, calc.riskLevel),
      recommendations: recommendations(calc.stage, calc.riskLevel),
      warningSigns: warningSigns(),
      plan: plan(),
      stage: calc.stage,
      riskLevel: calc.riskLevel,
      riskScore: calc.riskScore,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5" /> Hypertension Stage Calculator</CardTitle>
          <CardDescription>Assess your blood pressure stage and cardiovascular risk using AHA guidelines.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Age (years)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
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
                <h3 className="text-lg font-semibold">Blood Pressure Measurements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="systolicBP" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Systolic BP (mmHg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 120" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="diastolicBP" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Diastolic BP (mmHg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
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
                      <FormLabel>Diabetes</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="kidneyDisease" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Chronic Kidney Disease</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="heartDisease" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Heart Disease</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="stroke" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Previous Stroke</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="familyHistory" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Family History of Hypertension</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="smoking" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Current Smoking</FormLabel>
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="cholesterol" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Droplet className="h-4 w-4" /> Total Cholesterol (optional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 200" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="cholesterolUnit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cholesterol Units</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
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

              <Button type="submit" className="w-full md:w-auto">Calculate Hypertension Stage</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Hypertension Assessment</CardTitle></div>
              <CardDescription>Blood pressure stage and cardiovascular risk</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Blood Pressure Stage</h4><p className="text-2xl font-bold text-primary">{result.stage}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Risk Level</h4><p className="text-2xl font-bold text-primary">{result.riskLevel}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Risk Score</h4><p className="text-2xl font-bold text-primary">{result.riskScore}</p></div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Blood Pressure Management Plan</CardTitle></CardHeader>
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
          <CardDescription>Take multiple readings for accurate blood pressure assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for cardiovascular health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cardiovascular-disease-risk-calculator" className="text-primary hover:underline">Cardiovascular Disease Risk</Link></h4><p className="text-sm text-muted-foreground">Assess overall cardiovascular risk factors.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/stroke-risk-calculator" className="text-primary hover:underline">Stroke Risk</Link></h4><p className="text-sm text-muted-foreground">Evaluate stroke risk factors.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/kidney-function-egfr-calculator" className="text-primary hover:underline">Kidney Function (eGFR)</Link></h4><p className="text-sm text-muted-foreground">Hypertension can damage kidneys—monitor function.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cardiometabolic-age-calculator" className="text-primary hover:underline">Cardiometabolic Age</Link></h4><p className="text-sm text-muted-foreground">Assess overall metabolic health status.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Understanding Hypertension</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Hypertension is a major risk factor for cardiovascular disease, stroke, and kidney disease. Early detection and management can significantly reduce these risks. Lower blood pressure through DASH diet, regular exercise, weight management, limiting alcohol, stress management, and medication when needed. Regular monitoring helps track improvements and guide treatment decisions.</p>
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
