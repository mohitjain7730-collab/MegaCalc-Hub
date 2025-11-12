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
import { Zap, Heart, Calendar, Droplet, HeartPulse } from 'lucide-react';

const formSchema = z.object({
  age: z.number().min(40).max(80).optional(),
  gender: z.enum(['male', 'female']).optional(),
  race: z.enum(['white', 'black', 'hispanic', 'asian', 'other']).optional(),
  smoking: z.boolean().optional(),
  diabetes: z.boolean().optional(),
  hypertension: z.boolean().optional(),
  familyHistory: z.boolean().optional(),
  cholesterol: z.number().positive().optional(),
  hdlCholesterol: z.number().positive().optional(),
  cholesterolUnit: z.enum(['mg/dL', 'mmol/L']).optional(),
  systolicBP: z.number().positive().optional(),
  diastolicBP: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  riskScore: number;
  category: string;
  description: string;
  percentile: string;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Assess current cardiovascular risk factors: age, smoking, diabetes, hypertension, cholesterol' },
  { week: 2, focus: 'Adopt heart-healthy diet: Mediterranean-style eating, reduce processed foods and saturated fats' },
  { week: 3, focus: 'Begin regular exercise: 150+ minutes/week moderate activity' },
  { week: 4, focus: 'Focus on risk factor control: blood pressure, cholesterol, diabetes management' },
  { week: 5, focus: 'Consider smoking cessation if applicable: major risk factor for coronary calcium' },
  { week: 6, focus: 'Discuss coronary calcium scan with healthcare provider if high risk' },
  { week: 7, focus: 'Reassess risk factors and compare improvements' },
  { week: 8, focus: 'Maintain healthy habits and continue regular cardiovascular monitoring' },
];

const faqs: [string, string][] = [
  ['What is coronary calcium?', 'Coronary artery calcium is a marker of atherosclerosis (plaque buildup) in the coronary arteries. It\'s one of the strongest predictors of future cardiovascular events.'],
  ['How is coronary calcium score estimated?', 'This calculator estimates your risk of having significant coronary calcium based on age, gender, race, and cardiovascular risk factors (smoking, diabetes, hypertension, cholesterol).'],
  ['What is a coronary calcium scan?', 'A CT scan that measures calcium deposits in coronary arteries. The actual score ranges from 0 (no calcium) to 400+ (severe calcium). This calculator estimates risk, not the actual scan result.'],
  ['What is a good coronary calcium score?', 'A score of 0 indicates no detectable calcium (lowest risk). Scores 1–99 indicate mild calcium, 100–399 moderate, and 400+ severe calcium (highest risk).'],
  ['Who should get a coronary calcium scan?', 'Typically recommended for intermediate-risk individuals (40–75 years) to refine cardiovascular risk assessment and guide treatment decisions.'],
  ['Can I prevent coronary calcium?', 'Yes, through lifestyle modifications (diet, exercise, smoking cessation), controlling risk factors (blood pressure, cholesterol, diabetes), and medications (statins) when indicated.'],
  ['Does age affect coronary calcium?', 'Yes, calcium accumulation increases with age. The calculator adjusts for age, as older individuals are more likely to have detectable calcium.'],
  ['Is this calculator a medical diagnosis?', 'No, this is an educational tool. The actual coronary calcium score requires a CT scan. Consult healthcare professionals for medical evaluation and testing.'],
  ['What if my estimated risk is high?', 'Consider discussing coronary calcium scan with healthcare providers, aggressive risk factor modification, and potentially preventive medications (statins, aspirin).'],
  ['How often should I reassess?', 'Reassess every 3–5 years or after significant lifestyle changes. If you have a coronary calcium scan, follow-up scans may be recommended every 3–5 years.'],
];

const understandingInputs = [
  { label: 'Age (years)', description: 'Your age in years (40–80). Calcium accumulation increases with age, so age is a major risk factor.' },
  { label: 'Gender', description: 'Biological sex, as men have higher coronary calcium risk than women, especially at younger ages.' },
  { label: 'Race/Ethnicity', description: 'Some ethnic groups may have different calcium patterns, though individual risk factors matter more.' },
  { label: 'Cardiovascular Risk Factors', description: 'Smoking, diabetes, hypertension, and family history are major contributors to coronary calcium development.' },
  { label: 'Cholesterol Levels (optional)', description: 'Total and HDL cholesterol help assess overall cardiovascular risk profile.' },
  { label: 'Blood Pressure (optional)', description: 'Hypertension accelerates coronary artery disease and calcium deposition.' },
];

const calculateCalciumScore = (values: FormValues) => {
  if (!values.age || !values.gender) return null;
  
  let score = 0;
  
  // Age factor (most significant)
  if (values.age >= 70) score += 8;
  else if (values.age >= 60) score += 6;
  else if (values.age >= 50) score += 4;
  else if (values.age >= 45) score += 2;
  
  // Gender factor
  if (values.gender === 'male') score += 2;
  
  // Race factor
  if (values.race === 'black' || values.race === 'hispanic') score += 1;
  
  // Risk factors
  if (values.smoking) score += 3;
  if (values.diabetes) score += 3;
  if (values.hypertension) score += 2;
  if (values.familyHistory) score += 2;
  
  // Cholesterol factors
  if (values.cholesterol && values.cholesterolUnit) {
    const cholThreshold = values.cholesterolUnit === 'mg/dL' ? 200 : 5.2;
    if (values.cholesterol > cholThreshold) score += 1;
  }
  
  if (values.hdlCholesterol && values.cholesterolUnit) {
    const hdlThreshold = values.cholesterolUnit === 'mg/dL' ? 40 : 1.0;
    if (values.hdlCholesterol < hdlThreshold) score += 1;
  }
  
  // Blood pressure factors
  if (values.systolicBP && values.systolicBP >= 140) score += 1;
  if (values.diastolicBP && values.diastolicBP >= 90) score += 1;
  
  return score;
};

const getCalciumScoreCategory = (score: number) => {
  if (score <= 3) return { category: 'Low Risk', description: 'Minimal coronary calcium expected', percentile: '< 25th percentile' };
  if (score <= 6) return { category: 'Moderate Risk', description: 'Some coronary calcium likely', percentile: '25th–50th percentile' };
  if (score <= 9) return { category: 'High Risk', description: 'Significant coronary calcium expected', percentile: '50th–75th percentile' };
  return { category: 'Very High Risk', description: 'Extensive coronary calcium likely', percentile: '> 75th percentile' };
};

const interpret = (category: string) => {
  if (category === 'Low Risk') return 'Low risk—minimal coronary calcium expected. Continue maintaining a healthy lifestyle.';
  if (category === 'Moderate Risk') return 'Moderate risk—some coronary calcium likely. Consider coronary calcium scan and focus on risk factor modification.';
  if (category === 'High Risk') return 'High risk—significant coronary calcium expected. Coronary calcium scan recommended, aggressive risk factor modification needed.';
  return 'Very high risk—extensive coronary calcium likely. Immediate coronary calcium scan, comprehensive cardiovascular evaluation, and aggressive preventive treatment recommended.';
};

const recommendations = (category: string) => {
  const base = [
    'Adopt heart-healthy diet: Mediterranean-style eating, reduce processed foods and saturated fats',
    'Engage in regular exercise: 150+ minutes/week moderate activity',
    'Control risk factors: blood pressure, cholesterol, diabetes management',
  ];
  if (category === 'Very High Risk' || category === 'High Risk') {
    return [
      ...base,
      'Consider coronary calcium scan to quantify actual calcium burden',
      'Discuss preventive medications (statins, aspirin) with healthcare providers',
      'Comprehensive cardiovascular evaluation and regular follow-up',
    ];
  }
  if (category === 'Moderate Risk') {
    return [
      ...base,
      'Consider coronary calcium scan to refine risk assessment',
      'Focus on risk factor modification',
    ];
  }
  return [
    ...base,
    'Continue maintaining healthy habits and regular cardiovascular monitoring',
  ];
};

const warningSigns = () => [
  'This calculator is an educational estimate, not a medical diagnosis. The actual coronary calcium score requires a CT scan.',
  'If you have symptoms like chest pain, shortness of breath, or other cardiovascular symptoms, seek immediate medical attention.',
  'High estimated risk warrants discussion with healthcare providers about coronary calcium scanning and preventive strategies.',
];

export default function CoronaryCalciumScoreEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      race: undefined,
      smoking: false,
      diabetes: false,
      hypertension: false,
      familyHistory: false,
      cholesterol: undefined,
      hdlCholesterol: undefined,
      cholesterolUnit: 'mg/dL',
      systolicBP: undefined,
      diastolicBP: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const riskScore = calculateCalciumScore(values);
    if (riskScore === null) {
      setResult(null);
      return;
    }

    const categoryInfo = getCalciumScoreCategory(riskScore);

    setResult({
      status: 'Calculated',
      interpretation: interpret(categoryInfo.category),
      recommendations: recommendations(categoryInfo.category),
      warningSigns: warningSigns(),
      plan: plan(),
      riskScore,
      category: categoryInfo.category,
      description: categoryInfo.description,
      percentile: categoryInfo.percentile,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5" /> Coronary Calcium Score Estimator</CardTitle>
          <CardDescription>Estimate your risk of having significant coronary artery calcium based on cardiovascular risk factors.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Age (years)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 55" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
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
                        <SelectItem value="white">White/Caucasian</SelectItem>
                        <SelectItem value="black">Black/African American</SelectItem>
                        <SelectItem value="hispanic">Hispanic/Latino</SelectItem>
                        <SelectItem value="asian">Asian</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cardiovascular Risk Factors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="smoking" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Current Smoking</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="diabetes" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Diabetes</FormLabel>
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
                  <FormField control={form.control} name="familyHistory" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel>Family History of Heart Disease</FormLabel>
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Laboratory Values (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="cholesterol" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Droplet className="h-4 w-4" /> Total Cholesterol</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 200" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="hdlCholesterol" render={({ field }) => (
                    <FormItem>
                      <FormLabel>HDL Cholesterol</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
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
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Blood Pressure (Optional)</h3>
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

              <Button type="submit" className="w-full md:w-auto">Estimate Coronary Calcium Score</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Coronary Calcium Score Estimate</CardTitle></div>
              <CardDescription>Predicted coronary artery calcium burden</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Risk Score</h4><p className="text-2xl font-bold text-primary">{result.riskScore}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Category</h4><p className="text-2xl font-bold text-primary">{result.category}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Description</h4><p className="text-lg font-bold text-primary">{result.description}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Percentile</h4><p className="text-lg font-bold text-primary">{result.percentile}</p></div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Cardiovascular Risk Reduction Plan</CardTitle></CardHeader>
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
          <CardDescription>Accurate inputs ensure reliable coronary calcium risk estimation</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for cardiovascular risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cardiovascular-disease-risk-calculator" className="text-primary hover:underline">Cardiovascular Disease Risk</Link></h4><p className="text-sm text-muted-foreground">Assess overall cardiovascular risk factors.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/heart-attack-framingham-risk-calculator" className="text-primary hover:underline">Heart Attack Framingham Risk</Link></h4><p className="text-sm text-muted-foreground">Evaluate 10-year heart attack risk.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cholesterol-risk-calculator" className="text-primary hover:underline">Cholesterol Risk</Link></h4><p className="text-sm text-muted-foreground">Assess cholesterol-related cardiovascular risk.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/hypertension-stage-calculator" className="text-primary hover:underline">Hypertension Stage</Link></h4><p className="text-sm text-muted-foreground">Evaluate blood pressure and cardiovascular risk.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Understanding Coronary Calcium</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Coronary artery calcium is a marker of atherosclerosis and is one of the strongest predictors of future cardiovascular events. The actual coronary calcium score is measured by CT scan (ranges from 0 to 400+), but this calculator estimates your risk based on established risk factors. Higher scores predict increased cardiovascular risk. Improve risk through lifestyle modifications, controlling risk factors, and potentially preventive medications. Consider coronary calcium scanning for intermediate-risk individuals to refine risk assessment.</p>
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
