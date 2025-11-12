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
import { Zap, HeartPulse, Calendar, Droplet, Scale, Ruler } from 'lucide-react';

const formSchema = z.object({
  age: z.number().min(18).max(120).optional(),
  gender: z.enum(['male', 'female']).optional(),
  race: z.enum(['black', 'non-black']).optional(),
  serumCreatinine: z.number().positive().optional(),
  unit: z.enum(['mg/dL', 'μmol/L']).optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  bodySizeUnit: z.enum(['metric', 'imperial']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  egfr: number;
  stage: string;
  description: string;
  risk: string;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Assess current kidney function: review eGFR results and identify risk factors' },
  { week: 2, focus: 'Control blood pressure: aim for <130/80 mmHg through lifestyle and medication if needed' },
  { week: 3, focus: 'Manage diabetes if present: keep blood sugar well controlled' },
  { week: 4, focus: 'Adopt kidney-friendly diet: low sodium, adequate protein, limit processed foods' },
  { week: 5, focus: 'Stay hydrated: drink adequate water but avoid excessive fluid intake' },
  { week: 6, focus: 'Regular exercise: maintain cardiovascular health to support kidney function' },
  { week: 7, focus: 'Reassess kidney function and compare improvements' },
  { week: 8, focus: 'Maintain healthy habits and schedule regular follow-up with healthcare providers' },
];

const faqs: [string, string][] = [
  ['What is eGFR?', 'eGFR (estimated Glomerular Filtration Rate) measures how well your kidneys filter waste from your blood. It\'s the best indicator of kidney function.'],
  ['How is eGFR calculated?', 'This calculator uses the CKD-EPI equation, which considers age, gender, race, and serum creatinine level to estimate kidney function.'],
  ['What is a normal eGFR?', 'Normal eGFR is 90+ mL/min/1.73m². Values below 60 indicate chronic kidney disease, with lower values indicating more severe disease.'],
  ['Does age affect eGFR?', 'Yes, kidney function naturally declines with age. The CKD-EPI equation adjusts for age to provide accurate estimates across age groups.'],
  ['Why does race matter in eGFR calculation?', 'African Americans tend to have higher muscle mass, which affects creatinine levels. The equation adjusts for this to provide accurate eGFR estimates.'],
  ['Can I improve my eGFR?', 'While eGFR decline with age is normal, you can slow progression by controlling blood pressure, managing diabetes, maintaining healthy diet, and avoiding nephrotoxic substances.'],
  ['What if my eGFR is low?', 'Low eGFR requires medical evaluation. Work with healthcare providers to identify causes, slow progression, and manage complications.'],
  ['How often should I check eGFR?', 'Frequency depends on your health status. Those with kidney disease may need monitoring every 3–6 months, while healthy individuals may check annually.'],
  ['Is this calculator a medical diagnosis?', 'No, this is an educational tool. Consult healthcare professionals for medical evaluation, diagnosis, and treatment of kidney disease.'],
  ['What medications can affect eGFR?', 'Some medications can harm kidneys (NSAIDs, certain antibiotics). Always discuss medications with healthcare providers, especially if you have kidney disease.'],
];

const understandingInputs = [
  { label: 'Age (years)', description: 'Your age in years (18–120). Kidney function naturally declines with age.' },
  { label: 'Gender', description: 'Biological sex, as the CKD-EPI equation uses different coefficients for males and females.' },
  { label: 'Race/Ethnicity', description: 'Black/African American or Non-Black. African Americans tend to have higher muscle mass, affecting creatinine levels.' },
  { label: 'Serum Creatinine', description: 'A waste product from muscle metabolism measured in blood. Higher levels indicate reduced kidney function.' },
  { label: 'Creatinine Units', description: 'mg/dL (US standard) or μmol/L (international). The calculator converts as needed.' },
  { label: 'Weight & Height (Optional)', description: 'Used to calculate BMI for overall health assessment, but not required for eGFR calculation.' },
];

const calculateEGFR = (values: FormValues) => {
  if (!values.age || !values.gender || !values.race || !values.serumCreatinine || !values.unit) return null;
  
  let creatinine = values.serumCreatinine;
  if (values.unit === 'μmol/L') {
    creatinine = values.serumCreatinine / 88.4;
  }
  
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
  
  return Math.round(eGFR);
};

const getKidneyFunctionStage = (eGFR: number) => {
  if (eGFR >= 90) return { stage: 'G1', description: 'Normal or High', risk: 'Low' };
  if (eGFR >= 60) return { stage: 'G2', description: 'Mildly Decreased', risk: 'Low' };
  if (eGFR >= 45) return { stage: 'G3a', description: 'Mildly to Moderately Decreased', risk: 'Moderate' };
  if (eGFR >= 30) return { stage: 'G3b', description: 'Moderately to Severely Decreased', risk: 'High' };
  if (eGFR >= 15) return { stage: 'G4', description: 'Severely Decreased', risk: 'Very High' };
  return { stage: 'G5', description: 'Kidney Failure', risk: 'Critical' };
};

const interpret = (eGFR: number) => {
  if (eGFR >= 90) return 'Normal or high kidney function. Continue maintaining a healthy lifestyle.';
  if (eGFR >= 60) return 'Mildly decreased kidney function. Monitor regularly and maintain healthy habits.';
  if (eGFR >= 45) return 'Mildly to moderately decreased function. Medical evaluation recommended.';
  if (eGFR >= 30) return 'Moderately to severely decreased function. Immediate medical evaluation required.';
  if (eGFR >= 15) return 'Severely decreased function. Urgent specialist care (nephrologist) essential.';
  return 'Kidney failure. Immediate specialist care required. Dialysis or transplant evaluation may be needed.';
};

const recommendations = (eGFR: number) => {
  const base = [
    'Control blood pressure: aim for <130/80 mmHg through lifestyle and medication if needed',
    'Manage diabetes if present: keep blood sugar well controlled',
    'Adopt kidney-friendly diet: low sodium, adequate protein, limit processed foods',
  ];
  if (eGFR < 30) {
    return [
      ...base,
      'Seek immediate medical evaluation and nephrology consultation',
      'Prepare for potential dialysis or transplant evaluation',
      'Comprehensive medical management needed',
    ];
  }
  if (eGFR < 45) {
    return [
      ...base,
      'Seek medical evaluation and consider nephrology consultation',
      'Regular monitoring of kidney function every 3–6 months',
      'Avoid nephrotoxic medications and substances',
    ];
  }
  if (eGFR < 60) {
    return [
      ...base,
      'Monitor kidney function regularly',
      'Discuss with healthcare providers about risk factors',
    ];
  }
  return [
    ...base,
    'Continue maintaining healthy lifestyle and regular health monitoring',
  ];
};

const warningSigns = () => [
  'This calculator is educational and not a medical diagnosis. Consult healthcare professionals for medical evaluation and treatment.',
  'If you have symptoms like swelling, fatigue, changes in urination, or high blood pressure, seek medical attention.',
  'Low eGFR requires medical evaluation to identify causes and prevent progression to kidney failure.',
];

export default function KidneyFunctionEGFRCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
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

  const bodySizeUnit = form.watch('bodySizeUnit');

  const onSubmit = (values: FormValues) => {
    const eGFR = calculateEGFR(values);
    if (eGFR === null) {
      setResult(null);
      return;
    }

    const stageInfo = getKidneyFunctionStage(eGFR);

    setResult({
      status: 'Calculated',
      interpretation: interpret(eGFR),
      recommendations: recommendations(eGFR),
      warningSigns: warningSigns(),
      plan: plan(),
      egfr: eGFR,
      stage: stageInfo.stage,
      description: stageInfo.description,
      risk: stageInfo.risk,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5" /> Kidney Function (eGFR) Calculator</CardTitle>
          <CardDescription>Calculate your estimated Glomerular Filtration Rate using the CKD-EPI equation.</CardDescription>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="race" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Race/Ethnicity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select race/ethnicity" /></SelectTrigger>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <FormLabel className="flex items-center gap-2"><Droplet className="h-4 w-4" /> Serum Creatinine Level</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 1.0" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
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
                      <FormLabel className="flex items-center gap-2"><Scale className="h-4 w-4" /> Weight ({bodySizeUnit === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="height" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Ruler className="h-4 w-4" /> Height ({bodySizeUnit === 'metric' ? 'cm' : 'in'})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 175" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Button type="submit" className="w-full md:w-auto">Calculate eGFR</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Kidney Function Assessment</CardTitle></div>
              <CardDescription>Estimated Glomerular Filtration Rate (eGFR)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">eGFR</h4><p className="text-2xl font-bold text-primary">{result.egfr} mL/min/1.73m²</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Stage</h4><p className="text-2xl font-bold text-primary">{result.stage}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Risk</h4><p className="text-2xl font-bold text-primary">{result.risk}</p></div>
              </div>
              <div className="p-4 border rounded">
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Description</h4>
                <p className="text-lg font-bold text-primary">{result.description}</p>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Kidney Health Plan</CardTitle></CardHeader>
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
          <CardDescription>Accurate inputs ensure reliable eGFR calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for kidney and cardiovascular health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/hypertension-stage-calculator" className="text-primary hover:underline">Hypertension Stage</Link></h4><p className="text-sm text-muted-foreground">Assess blood pressure, a major kidney disease risk factor.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/diabetes-risk-type2-calculator" className="text-primary hover:underline">Type 2 Diabetes Risk</Link></h4><p className="text-sm text-muted-foreground">Evaluate diabetes risk, the leading cause of kidney disease.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cardiovascular-disease-risk-calculator" className="text-primary hover:underline">Cardiovascular Disease Risk</Link></h4><p className="text-sm text-muted-foreground">Heart and kidney health are closely linked.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cardiometabolic-age-calculator" className="text-primary hover:underline">Cardiometabolic Age</Link></h4><p className="text-sm text-muted-foreground">Assess overall metabolic health status.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Understanding Kidney Function</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>The kidneys filter waste and excess fluid from your blood. eGFR is the best measure of kidney function, indicating how well your kidneys are working. Normal eGFR is 90+ mL/min/1.73m². Values below 60 indicate chronic kidney disease. Slow progression by controlling blood pressure, managing diabetes, maintaining healthy diet, and avoiding nephrotoxic substances. Regular monitoring helps track kidney health over time.</p>
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
