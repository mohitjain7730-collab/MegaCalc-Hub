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
import { Moon, Calendar, AlertTriangle, Zap } from 'lucide-react';

const formSchema = z.object({
  age: z.number().min(18).max(120).optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  gender: z.enum(['male', 'female']).optional(),
  neckCircumference: z.number().positive().optional(),
  snoring: z.enum(['never', 'occasional', 'frequent']).optional(),
  daytimeSleepiness: z.enum(['never', 'occasional', 'frequent']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  riskScore: number;
  riskLevel: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Assess sleep quality: track sleep patterns, snoring frequency, and daytime sleepiness' },
  { week: 2, focus: 'Begin weight management if overweight: aim for 5-10% weight loss to reduce risk' },
  { week: 3, focus: 'Improve sleep position: sleep on your side instead of your back to reduce airway obstruction' },
  { week: 4, focus: 'Limit alcohol consumption, especially before bedtime, as it relaxes airway muscles' },
  { week: 5, focus: 'Establish consistent sleep schedule: go to bed and wake up at the same time daily' },
  { week: 6, focus: 'Quit smoking if applicable: smoking increases inflammation and airway obstruction' },
  { week: 7, focus: 'Increase physical activity: regular exercise can improve sleep quality and reduce risk' },
  { week: 8, focus: 'Reassess symptoms and consider professional sleep evaluation if risk remains high' },
];

const faqs: [string, string][] = [
  ['What is sleep apnea?', 'Sleep apnea is a serious sleep disorder where breathing repeatedly stops and starts during sleep. The most common type is obstructive sleep apnea (OSA), where throat muscles relax and block the airway.'],
  ['What are the main symptoms of sleep apnea?', 'Common symptoms include loud snoring, episodes of breathing cessation during sleep (witnessed by partner), gasping or choking during sleep, excessive daytime sleepiness, morning headaches, difficulty concentrating, and irritability.'],
  ['Who is at risk for sleep apnea?', 'Risk factors include being overweight, male gender, age over 40, large neck circumference (>17 inches men, >16 inches women), family history, smoking, alcohol use, nasal congestion, and certain medical conditions.'],
  ['How is sleep apnea diagnosed?', 'Sleep apnea is diagnosed through a sleep study (polysomnography) conducted in a sleep lab or with a home sleep test. These tests monitor breathing, oxygen levels, heart rate, and sleep stages throughout the night.'],
  ['Can sleep apnea be treated without CPAP?', 'Yes, lifestyle changes like weight loss, positional therapy, avoiding alcohol, and quitting smoking can help. Oral appliances and surgery may be options for some people, but CPAP remains the gold standard treatment.'],
  ['What happens if sleep apnea is left untreated?', 'Untreated sleep apnea increases risk of high blood pressure, heart disease, stroke, type 2 diabetes, metabolic syndrome, liver problems, and complications with medications and surgery. It also causes daytime fatigue and accidents.'],
  ['How does weight affect sleep apnea?', 'Excess weight, especially around the neck, increases risk of airway obstruction. Weight loss of just 10% can significantly reduce sleep apnea severity. Maintaining healthy weight is crucial for prevention and management.'],
  ['Is this calculator a medical diagnosis?', 'No, this is a screening tool for educational purposes only. It cannot diagnose sleep apnea. If you have symptoms or high risk score, consult a healthcare provider or sleep specialist for proper evaluation.'],
  ['What is the difference between snoring and sleep apnea?', 'Snoring is the sound of air passing through narrowed airways. Sleep apnea involves complete or partial airway blockage causing breathing pauses. Not all snorers have sleep apnea, but loud, frequent snoring is a warning sign.'],
  ['Can children have sleep apnea?', 'Yes, children can have sleep apnea, often due to enlarged tonsils or adenoids. Symptoms include snoring, restless sleep, bedwetting, daytime sleepiness, and behavioral problems. Pediatric sleep apnea requires medical evaluation.'],
];

const understandingInputs = [
  { label: 'Age (years)', description: 'Your age in years. Risk increases with age, especially after 40, as muscle tone decreases and risk factors accumulate.' },
  { label: 'Weight (kg)', description: 'Your body weight in kilograms. Excess weight, particularly around the neck, significantly increases sleep apnea risk by narrowing the airway.' },
  { label: 'Height (cm)', description: 'Your height in centimeters. Used with weight to calculate BMI, which is a key risk factor for sleep apnea.' },
  { label: 'Gender', description: 'Biological sex. Men have 2-3 times higher risk of sleep apnea than women, though risk increases in women after menopause.' },
  { label: 'Neck Circumference (cm)', description: 'Measure around the neck at the level of the Adam\'s apple. Larger neck circumference (>43cm men, >40cm women) increases risk of airway obstruction.' },
  { label: 'Snoring Frequency', description: 'How often you snore: Never, Occasional, or Frequent. Frequent loud snoring is a strong indicator of potential sleep apnea.' },
  { label: 'Daytime Sleepiness', description: 'Frequency of excessive daytime sleepiness or fatigue. Frequent sleepiness despite adequate sleep time is a key symptom of sleep apnea.' },
];

const calculateRisk = (values: FormValues) => {
  if (!values.age || !values.weight || !values.height || !values.neckCircumference) return null;
  
  const bmi = values.weight / ((values.height / 100) ** 2);
  let riskScore = 0;
  
  if (values.age >= 50) riskScore += 2;
  else if (values.age >= 40) riskScore += 1;
  
  if (bmi >= 30) riskScore += 3;
  else if (bmi >= 25) riskScore += 1;
  
  if (values.gender === 'male') riskScore += 1;
  
  if (values.neckCircumference >= 43) riskScore += 2;
  else if (values.neckCircumference >= 40) riskScore += 1;
  
  if (values.snoring === 'frequent') riskScore += 2;
  else if (values.snoring === 'occasional') riskScore += 1;
  
  if (values.daytimeSleepiness === 'frequent') riskScore += 2;
  else if (values.daytimeSleepiness === 'occasional') riskScore += 1;
  
  let riskLevel;
  if (riskScore <= 2) riskLevel = 'Low Risk';
  else if (riskScore <= 5) riskLevel = 'Moderate Risk';
  else if (riskScore <= 8) riskLevel = 'High Risk';
  else riskLevel = 'Very High Risk';
  
  return { riskScore, riskLevel };
};

const interpret = (riskLevel: string, riskScore: number) => {
  if (riskLevel === 'Low Risk') return 'Your risk factors for sleep apnea are minimal. Continue healthy sleep habits and regular exercise to maintain low risk.';
  if (riskLevel === 'Moderate Risk') return 'You have some risk factors for sleep apnea. Consider lifestyle modifications and discuss symptoms with your healthcare provider.';
  if (riskLevel === 'High Risk') return 'You have multiple risk factors for sleep apnea. Professional evaluation with a sleep specialist is strongly recommended.';
  return 'You have significant risk factors for sleep apnea. Immediate consultation with a sleep specialist is recommended for proper evaluation and treatment.';
};

const recommendations = (riskLevel: string) => {
  const base = [
    'Maintain healthy weight through diet and exercise',
    'Sleep on your side instead of your back',
    'Limit alcohol consumption, especially before bedtime',
  ];
  
  if (riskLevel === 'Very High Risk' || riskLevel === 'High Risk') {
    return [
      ...base,
      'Seek professional sleep evaluation with a sleep specialist',
      'Consider a sleep study (polysomnography) for diagnosis',
      'Discuss treatment options with healthcare providers',
      'Quit smoking if applicable',
    ];
  }
  
  if (riskLevel === 'Moderate Risk') {
    return [
      ...base,
      'Monitor symptoms and track sleep quality',
      'Consider discussing with healthcare provider',
      'Improve sleep hygiene and maintain consistent sleep schedule',
    ];
  }
  
  return [
    ...base,
    'Continue maintaining healthy lifestyle habits',
    'Regular exercise and good sleep hygiene',
    'Monitor for any new symptoms',
  ];
};

const warningSigns = () => [
  'This calculator is a screening tool only and not a medical diagnosis. Sleep apnea requires professional evaluation and diagnosis.',
  'If you experience loud snoring, witnessed breathing pauses, excessive daytime sleepiness, or morning headaches, consult a healthcare provider.',
  'Untreated sleep apnea can lead to serious health complications including high blood pressure, heart disease, stroke, and diabetes. Early diagnosis and treatment are important.',
];

export default function SleepApneaRiskCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      height: undefined,
      gender: undefined,
      neckCircumference: undefined,
      snoring: undefined,
      daytimeSleepiness: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const calc = calculateRisk(values);
    if (!calc) {
      setResult(null);
      return;
    }

    setResult({
      riskScore: calc.riskScore,
      riskLevel: calc.riskLevel,
      interpretation: interpret(calc.riskLevel, calc.riskScore),
      recommendations: recommendations(calc.riskLevel),
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Moon className="h-5 w-5" /> Sleep Apnea Risk Calculator</CardTitle>
          <CardDescription>Assess your risk for sleep apnea based on common risk factors. This is a screening tool and not a medical diagnosis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Age (years)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
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
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="height" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 175" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="neckCircumference" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Neck Circumference (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 40" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="snoring" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Snoring Frequency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="occasional">Occasional</SelectItem>
                        <SelectItem value="frequent">Frequent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="daytimeSleepiness" render={({ field }) => (
                <FormItem>
                  <FormLabel>Daytime Sleepiness</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="occasional">Occasional</SelectItem>
                      <SelectItem value="frequent">Frequent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full md:w-auto">Calculate Sleep Apnea Risk</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Sleep Apnea Risk Assessment</CardTitle></div>
              <CardDescription>Based on your risk factors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Risk Score</h4><p className="text-2xl font-bold text-primary">{result.riskScore}/12</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Risk Level</h4><p className="text-2xl font-bold text-primary">{result.riskLevel}</p></div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Sleep Apnea Risk Reduction Plan</CardTitle></CardHeader>
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
          <CardDescription>Key risk factors for sleep apnea assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for sleep and health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/bmi-calculator" className="text-primary hover:underline">BMI Calculator</Link></h4><p className="text-sm text-muted-foreground">Assess body weight status, a key risk factor for sleep apnea.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/waist-to-hip-ratio-calculator" className="text-primary hover:underline">Waist-to-Hip Ratio</Link></h4><p className="text-sm text-muted-foreground">Evaluate body fat distribution and metabolic risk.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Calculate calorie needs for healthy weight management.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cardiometabolic-age-calculator" className="text-primary hover:underline">Cardiometabolic Age</Link></h4><p className="text-sm text-muted-foreground">Assess overall metabolic health and cardiovascular risk.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Understanding Sleep Apnea</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Sleep apnea is a serious sleep disorder where breathing repeatedly stops and starts during sleep. Obstructive sleep apnea (OSA) is the most common type, caused by relaxed throat muscles blocking the airway. Risk factors include excess weight, large neck circumference, age, male gender, and lifestyle factors. Untreated sleep apnea increases risk of high blood pressure, heart disease, stroke, and diabetes. Treatment options include CPAP therapy, lifestyle changes, oral appliances, and in some cases, surgery. Early diagnosis and treatment are crucial for preventing complications and improving quality of life.</p>
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
