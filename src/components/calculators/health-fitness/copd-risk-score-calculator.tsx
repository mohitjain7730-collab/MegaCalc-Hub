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
import { AlertTriangle, Calendar, Zap } from 'lucide-react';

const formSchema = z.object({
  age: z.number().min(18).max(120).optional(),
  gender: z.enum(['male', 'female']).optional(),
  smokingHistory: z.enum(['never', 'former', 'current']).optional(),
  packYears: z.number().min(0).optional(),
  cough: z.boolean().optional(),
  sputum: z.boolean().optional(),
  breathlessness: z.boolean().optional(),
  wheezing: z.boolean().optional(),
  occupational: z.boolean().optional(),
  pollution: z.boolean().optional(),
  secondhand: z.boolean().optional(),
  asthma: z.boolean().optional(),
  diabetes: z.boolean().optional(),
  heartDisease: z.boolean().optional(),
  lungCancer: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  score: number;
  riskLevel: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Assess current respiratory symptoms and smoking status. Document frequency of cough, breathlessness, and other symptoms' },
  { week: 2, focus: 'If smoking, begin smoking cessation program. Seek support from healthcare providers or smoking cessation programs' },
  { week: 3, focus: 'Improve indoor air quality: reduce exposure to dust, chemicals, and pollutants. Use air purifiers if needed' },
  { week: 4, focus: 'Begin regular exercise program: start with light activities and gradually increase intensity as tolerated' },
  { week: 5, focus: 'Focus on respiratory health: practice breathing exercises and techniques to improve lung function' },
  { week: 6, focus: 'Get flu and pneumonia vaccinations to prevent respiratory infections that can worsen COPD' },
  { week: 7, focus: 'Reassess symptoms and consider pulmonary function testing if risk remains high' },
  { week: 8, focus: 'Continue lifestyle modifications and maintain regular follow-up with healthcare providers' },
];

const faqs: [string, string][] = [
  ['What is COPD?', 'COPD (Chronic Obstructive Pulmonary Disease) is a progressive lung disease that makes breathing difficult. It includes emphysema and chronic bronchitis, typically caused by long-term exposure to lung irritants, especially cigarette smoke.'],
  ['What are the main symptoms of COPD?', 'Common symptoms include persistent cough with or without mucus, shortness of breath (especially during physical activity), wheezing, chest tightness, frequent respiratory infections, and fatigue. Symptoms typically worsen over time.'],
  ['Who is at risk for COPD?', 'Primary risk factors include smoking (current or former), age over 40, occupational exposure to dust and chemicals, air pollution, secondhand smoke, genetic factors (alpha-1 antitrypsin deficiency), and history of respiratory infections in childhood.'],
  ['How is COPD diagnosed?', 'COPD is diagnosed through pulmonary function tests (spirometry) that measure lung capacity and airflow. Doctors also consider symptoms, medical history, physical examination, and imaging tests like chest X-rays or CT scans.'],
  ['Can COPD be prevented?', 'Yes, the most important prevention is avoiding smoking and secondhand smoke. Other preventive measures include reducing exposure to occupational dust and chemicals, improving indoor air quality, and getting regular exercise.'],
  ['Is COPD curable?', 'COPD is not curable, but it is treatable. Early diagnosis and treatment can slow disease progression, improve symptoms, and enhance quality of life. Treatment includes medications, pulmonary rehabilitation, oxygen therapy, and lifestyle changes.'],
  ['What is the difference between COPD and asthma?', 'COPD is typically caused by long-term exposure to irritants and is progressive, while asthma is often triggered by allergens and can be reversible. However, some people may have both conditions (asthma-COPD overlap).'],
  ['How does smoking affect COPD?', 'Smoking is the leading cause of COPD, responsible for 80-90% of cases. It damages airways and lung tissue, causing inflammation and narrowing. Quitting smoking is the most important step in preventing and managing COPD.'],
  ['Is this calculator a medical diagnosis?', 'No, this is an educational screening tool. COPD requires professional medical evaluation, including pulmonary function tests, for accurate diagnosis. Consult healthcare providers if you have symptoms or high risk score.'],
  ['What treatments are available for COPD?', 'Treatments include bronchodilators and inhaled corticosteroids, pulmonary rehabilitation programs, oxygen therapy for advanced cases, vaccinations (flu and pneumonia), and in severe cases, surgery or lung transplantation. Lifestyle changes are also essential.'],
];

const understandingInputs = [
  { label: 'Age (years)', description: 'Your age in years. COPD risk increases significantly with age, especially after 40, as lung function naturally declines and cumulative exposure to risk factors increases.' },
  { label: 'Gender', description: 'Biological sex. Historically, men had higher COPD rates, but rates in women have increased. Men may have higher risk due to occupational exposures and smoking patterns.' },
  { label: 'Smoking History', description: 'Your smoking status: Never, Former, or Current. Smoking is the primary cause of COPD, with current smokers having the highest risk.' },
  { label: 'Pack Years', description: 'Pack years = (cigarettes per day ÷ 20) × years smoked. Higher pack years significantly increase COPD risk. For example, 1 pack/day for 20 years = 20 pack years.' },
  { label: 'Respiratory Symptoms', description: 'Chronic cough, sputum production, breathlessness, and wheezing are key indicators of respiratory disease and COPD risk.' },
  { label: 'Environmental Exposure', description: 'Occupational exposure (dust, chemicals), air pollution, and secondhand smoke all increase COPD risk by damaging lung tissue over time.' },
  { label: 'Medical History', description: 'Conditions like asthma, diabetes, heart disease, and lung cancer can increase COPD risk or indicate shared risk factors and complications.' },
];

const calculateCOPDRisk = (values: FormValues) => {
  let riskScore = 0;
  
  if (values.age) {
    if (values.age >= 65) riskScore += 3;
    else if (values.age >= 45) riskScore += 2;
    else if (values.age >= 35) riskScore += 1;
  }
  
  if (values.gender === 'male') riskScore += 1;
  
  if (values.smokingHistory === 'current') {
    riskScore += 4;
    if (values.packYears && values.packYears >= 20) riskScore += 2;
    else if (values.packYears && values.packYears >= 10) riskScore += 1;
  } else if (values.smokingHistory === 'former') {
    riskScore += 2;
    if (values.packYears && values.packYears >= 20) riskScore += 1;
  }
  
  if (values.cough) riskScore += 1;
  if (values.sputum) riskScore += 1;
  if (values.breathlessness) riskScore += 2;
  if (values.wheezing) riskScore += 1;
  
  if (values.occupational) riskScore += 1;
  if (values.pollution) riskScore += 1;
  if (values.secondhand) riskScore += 1;
  
  if (values.asthma) riskScore += 1;
  if (values.diabetes) riskScore += 1;
  if (values.heartDisease) riskScore += 1;
  if (values.lungCancer) riskScore += 2;
  
  let riskLevel;
  if (riskScore <= 3) riskLevel = 'Low Risk';
  else if (riskScore <= 6) riskLevel = 'Moderate Risk';
  else if (riskScore <= 9) riskLevel = 'High Risk';
  else riskLevel = 'Very High Risk';
  
  return { score: riskScore, riskLevel };
};

const interpret = (riskLevel: string, score: number) => {
  if (riskLevel === 'Low Risk') return 'Your risk factors for COPD are minimal. Continue maintaining a healthy lifestyle and avoid smoking to maintain low risk.';
  if (riskLevel === 'Moderate Risk') return 'You have some risk factors for COPD. Consider lifestyle modifications, especially smoking cessation if applicable, and discuss with your healthcare provider.';
  if (riskLevel === 'High Risk') return 'You have significant risk factors for COPD. Professional evaluation and pulmonary function testing are recommended.';
  return 'You have multiple risk factors for COPD. Urgent medical consultation and comprehensive pulmonary assessment are needed.';
};

const recommendations = (riskLevel: string) => {
  const base = [
    'Quit smoking if applicable - this is the most important step',
    'Avoid secondhand smoke and reduce exposure to air pollution',
    'Improve indoor air quality and reduce occupational exposure if possible',
  ];
  
  if (riskLevel === 'Very High Risk' || riskLevel === 'High Risk') {
    return [
      ...base,
      'Seek medical evaluation promptly for pulmonary function testing',
      'Consider comprehensive lifestyle intervention and pulmonary rehabilitation',
      'Get flu and pneumonia vaccinations to prevent respiratory infections',
      'Regular monitoring of respiratory symptoms and lung function',
    ];
  }
  
  if (riskLevel === 'Moderate Risk') {
    return [
      ...base,
      'Consider pulmonary function testing if symptoms are present',
      'Discuss prevention strategies with your healthcare provider',
      'Regular exercise to maintain lung function',
    ];
  }
  
  return [
    ...base,
    'Continue maintaining healthy lifestyle habits',
    'Regular exercise and good respiratory health practices',
    'Monitor for any new respiratory symptoms',
  ];
};

const warningSigns = () => [
  'This calculator is for educational purposes only and not a medical diagnosis. COPD requires professional medical evaluation and pulmonary function tests for accurate diagnosis.',
  'If you experience persistent cough, shortness of breath, wheezing, or frequent respiratory infections, consult a healthcare provider for proper evaluation.',
  'Untreated COPD can lead to serious complications including respiratory failure, heart problems, and lung cancer. Early diagnosis and treatment are crucial for managing the disease.',
];

export default function COPDRiskScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      smokingHistory: undefined,
      packYears: undefined,
      cough: false,
      sputum: false,
      breathlessness: false,
      wheezing: false,
      occupational: false,
      pollution: false,
      secondhand: false,
      asthma: false,
      diabetes: false,
      heartDisease: false,
      lungCancer: false,
    },
  });

  const onSubmit = (values: FormValues) => {
    const calc = calculateCOPDRisk(values);
    if (!calc) {
      setResult(null);
      return;
    }

    setResult({
      score: calc.score,
      riskLevel: calc.riskLevel,
      interpretation: interpret(calc.riskLevel, calc.score),
      recommendations: recommendations(calc.riskLevel),
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> COPD Risk Score Calculator</CardTitle>
          <CardDescription>Assess your risk for Chronic Obstructive Pulmonary Disease based on risk factors, symptoms, and medical history.</CardDescription>
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
                <h3 className="text-lg font-semibold">Smoking History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="smokingHistory" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Smoking Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select smoking status" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="never">Never Smoked</SelectItem>
                          <SelectItem value="former">Former Smoker</SelectItem>
                          <SelectItem value="current">Current Smoker</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="packYears" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pack Years (if applicable)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Respiratory Symptoms</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField control={form.control} name="cough" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel className="text-sm">Cough</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="sputum" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel className="text-sm">Sputum</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="breathlessness" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel className="text-sm">Breathlessness</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="wheezing" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel className="text-sm">Wheezing</FormLabel>
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Environmental Exposure</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="occupational" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel className="text-sm">Occupational Exposure</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="pollution" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel className="text-sm">Air Pollution</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="secondhand" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel className="text-sm">Secondhand Smoke</FormLabel>
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Medical History</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField control={form.control} name="asthma" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel className="text-sm">Asthma</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="diabetes" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel className="text-sm">Diabetes</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="heartDisease" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel className="text-sm">Heart Disease</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lungCancer" render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input type="checkbox" checked={field.value || false} onChange={(e)=>field.onChange(e.target.checked)} className="rounded" />
                      </FormControl>
                      <FormLabel className="text-sm">Lung Cancer</FormLabel>
                    </FormItem>
                  )} />
                </div>
              </div>

              <Button type="submit" className="w-full md:w-auto">Calculate COPD Risk Score</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Your COPD Risk Assessment</CardTitle></div>
              <CardDescription>Based on your responses, here's your risk evaluation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Risk Score</h4><p className="text-2xl font-bold text-primary">{result.score}</p></div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week COPD Risk Reduction Plan</CardTitle></CardHeader>
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
          <CardDescription>Key factors affecting COPD risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for respiratory health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/lung-function-calculator" className="text-primary hover:underline">Lung Function Calculator</Link></h4><p className="text-sm text-muted-foreground">Assess lung capacity and respiratory function.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/smoking-cessation-calculator" className="text-primary hover:underline">Smoking Cessation Calculator</Link></h4><p className="text-sm text-muted-foreground">Track benefits of quitting smoking.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/air-quality-impact-calculator" className="text-primary hover:underline">Air Quality Impact</Link></h4><p className="text-sm text-muted-foreground">Evaluate effects of air pollution on health.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/sleep-apnea-risk-calculator" className="text-primary hover:underline">Sleep Apnea Risk</Link></h4><p className="text-sm text-muted-foreground">Assess risk for sleep-related breathing disorders.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Understanding COPD</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>COPD (Chronic Obstructive Pulmonary Disease) is a progressive lung disease that makes breathing difficult. It includes emphysema and chronic bronchitis, typically caused by long-term exposure to lung irritants, especially cigarette smoke. The disease is characterized by persistent respiratory symptoms and airflow limitation. Early diagnosis and treatment can slow progression and improve quality of life. Prevention focuses on avoiding smoking, reducing exposure to pollutants, and maintaining good respiratory health through exercise and vaccinations.</p>
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
