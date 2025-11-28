'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
  gender: z.enum(['male', 'female']),
  bmi: z.number({ invalid_type_error: 'Enter BMI' }).min(15).max(50),
  exerciseFrequency: z.number({ invalid_type_error: 'Enter exercise frequency' }).min(0).max(7),
  sleepHours: z.number({ invalid_type_error: 'Enter sleep hours' }).min(3).max(12),
  stressLevel: z.number({ invalid_type_error: 'Enter stress level' }).min(0).max(10),
  alcoholUnits: z.number({ invalid_type_error: 'Enter alcohol units' }).min(0).max(20),
  energyLevel: z.number({ invalid_type_error: 'Enter energy level' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  riskScore: number;
  deficiencyLevel: number;
  status: 'low-risk' | 'moderate-risk' | 'high-risk';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your age and gender (normal ranges differ significantly by gender).',
  'Input your BMI (body mass index).',
  'Count exercise sessions per week (0-7).',
  'Log average nightly sleep hours.',
  'Rate stress level (0 = none, 10 = severe).',
  'Count weekly alcohol units (1 unit = 1 drink).',
  'Rate energy level (1 = very low, 10 = very high).',
  'Review risk score, deficiency level, and recommendations.',
];

const faqs = [
  {
    question: 'What is testosterone deficiency?',
    answer:
      'Testosterone deficiency (hypogonadism) occurs when testosterone levels are below normal for age and gender. Symptoms include low energy, reduced muscle mass, mood changes, and decreased libido.',
  },
  {
    question: 'Is this a medical diagnosis?',
    answer:
      'No. This is an educational tool. Only healthcare providers can diagnose testosterone deficiency through blood tests and medical evaluation.',
  },
  {
    question: 'What are normal testosterone levels?',
    answer:
      'Normal ranges vary by age and gender. Men: typically 300-1000 ng/dL (declines with age). Women: typically 15-70 ng/dL (much lower).',
  },
  {
    question: 'What causes low testosterone?',
    answer:
      'Causes include aging, obesity, chronic stress, poor sleep, excessive alcohol, certain medications, and medical conditions (diabetes, hypothyroidism).',
  },
  {
    question: 'Can women have testosterone deficiency?',
    answer:
      'Yes, though less common. Women need testosterone for energy, muscle mass, and libido. Low levels can cause similar symptoms as in men.',
  },
  {
    question: 'How does age affect testosterone?',
    answer:
      'Testosterone naturally declines with age (starting around 30 in men, more gradually in women). However, significant declines may indicate deficiency.',
  },
  {
    question: 'Can lifestyle changes help?',
    answer:
      'Yes. Regular exercise, adequate sleep, stress reduction, healthy weight, and limiting alcohol can support testosterone production.',
  },
  {
    question: 'What about testosterone replacement?',
    answer:
      'Testosterone replacement therapy (TRT) may be appropriate if levels are clinically low and symptoms are significant. Consult a healthcare provider.',
  },
  {
    question: 'Does exercise help?',
    answer:
      'Yes. Resistance training and high-intensity exercise can boost testosterone. However, overtraining can lower it. Balance is key.',
  },
  {
    question: 'When should I see a doctor?',
    answer:
      'See a healthcare provider if you have symptoms of low testosterone (low energy, reduced muscle mass, mood changes, low libido) for evaluation and testing.',
  },
];

const relatedCalculators = [
  {
    name: 'Testosterone-to-Cortisol Ratio Calculator',
    slug: 'testosterone-to-cortisol-ratio-calculator',
    description: 'Calculate testosterone-to-cortisol ratio to assess hormonal balance.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Monitor cortisol and stress that can affect testosterone.',
  },
  {
    name: 'Exercise Recovery Score (HRV + Sleep Integration)',
    slug: 'exercise-recovery-score-hrv-sleep-integration',
    description: 'Track recovery to optimize exercise for testosterone support.',
  },
  {
    name: 'BMI Calculator',
    slug: 'bmi-calculator',
    description: 'Track BMI as obesity can lower testosterone.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/testosterone-deficiency-risk-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Testosterone Deficiency Risk Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Testosterone Deficiency Risk Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate testosterone deficiency risk from age, BMI, exercise, sleep, stress, alcohol, and energy levels.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Age factor (older = higher risk)
  const ageRisk = clamp((values.age - 30) / 50 * 20, 0, 20); // 0-20 points
  
  // BMI factor (higher BMI = higher risk, especially >30)
  const bmiRisk = clamp((values.bmi - 22) / 28 * 25, 0, 25); // 0-25 points
  
  // Exercise protection (more exercise = lower risk)
  const exerciseProtection = clamp((7 - values.exerciseFrequency) / 7 * 15, 0, 15); // 0-15 points (less exercise = higher risk)
  
  // Sleep impact (less sleep = higher risk)
  const sleepRisk = clamp((7 - values.sleepHours) / 4 * 15, 0, 15); // 0-15 points
  
  // Stress impact
  const stressRisk = clamp((values.stressLevel / 10) * 15, 0, 15); // 0-15 points
  
  // Alcohol impact
  const alcoholRisk = clamp(values.alcoholUnits / 10 * 10, 0, 10); // 0-10 points
  
  // Energy level (lower energy = higher risk indicator)
  const energyRisk = clamp((10 - values.energyLevel) / 10 * 10, 0, 10); // 0-10 points
  
  const riskScore = clamp(ageRisk + bmiRisk + exerciseProtection + sleepRisk + stressRisk + alcoholRisk + energyRisk, 0, 100);
  const deficiencyLevel = riskScore;

  let status: ResultPayload['status'] = 'low-risk';
  let interpretation = 'Your lifestyle factors suggest low risk for testosterone deficiency. Maintain current habits.';

  if (riskScore > 50) {
    status = 'high-risk';
    interpretation = 'Multiple risk factors present. Consider consulting a healthcare provider for testosterone testing and evaluation.';
  } else if (riskScore > 30) {
    status = 'moderate-risk';
    interpretation = 'Some risk factors detected. Consider lifestyle adjustments to support testosterone production.';
  }

  const recommendations = [
    'Maintain healthy BMI (18.5-25) through balanced nutrition and regular exercise. Obesity can lower testosterone.',
    'Engage in regular resistance training and high-intensity exercise (3-5 times/week) to support testosterone production.',
    'Prioritize sleep (7-9 hours nightly) as poor sleep can significantly lower testosterone levels.',
  ];
  if (status === 'moderate-risk') {
    recommendations.push('Reduce stress through meditation, sleep, and stress management techniques. Chronic stress can suppress testosterone.');
  }
  if (status === 'high-risk') {
    recommendations.push('Consult a healthcare provider for testosterone testing if you have symptoms (low energy, reduced muscle mass, mood changes, low libido).');
  }

  const plan = [
    { label: 'This Week', detail: 'Log all inputs to establish baseline. Identify highest risk factors.' },
    { label: 'Next Month', detail: 'Focus on reducing top 2-3 risk factors (e.g., sleep, exercise, stress).' },
    { label: 'Ongoing', detail: 'Consider testosterone testing if symptoms persist or risk remains high after lifestyle changes.' },
  ];

  return { riskScore, deficiencyLevel, status, interpretation, recommendations, plan };
};

export default function TestosteroneDeficiencyRiskCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: 'male',
      bmi: undefined,
      exerciseFrequency: undefined,
      sleepHours: undefined,
      stressLevel: undefined,
      alcoholUnits: undefined,
      energyLevel: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="testosterone-deficiency-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Testosterone Deficiency Risk Calculator
          </CardTitle>
          <CardDescription>Estimate testosterone deficiency risk from age, BMI, exercise, sleep, stress, alcohol, and energy levels.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your risk factors</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as 'male' | 'female')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bmi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BMI</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 28" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exerciseFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise sessions per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep hours per night</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stressLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stress level (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alcoholUnits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alcohol units per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="energyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Energy level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate risk
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See risk score, deficiency level, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk score</p>
                <p className="text-2xl font-semibold text-primary">{result.riskScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100 (lower is better)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Deficiency level</p>
                <p className="text-2xl font-semibold text-primary">{result.deficiencyLevel.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                    {result.recommendations.map((rec) => (
                      <li key={rec}>{rec}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Action plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {result.plan.map((step) => (
                      <li key={step.label}>
                        <span className="font-semibold">{step.label}:</span> {step.detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Risk score</strong> = age risk (0-20) + BMI risk (0-25) + exercise protection (0-15) + sleep risk (0-15) + stress risk (0-15) + alcohol risk (0-10) + energy risk (0-10), clamped to 0-100.</p>
          <p><strong>Deficiency level</strong> = risk score (same calculation).</p>
          <p><strong>Status</strong>: &lt;30 = low-risk, 30-50 = moderate-risk, &gt;50 = high-risk.</p>
          <p>Higher age, BMI, stress, alcohol, less exercise, poor sleep, and lower energy increase risk score.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional calculations</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">BMI risk</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().bmi ?? 0) > 30 ? 'High' : (form.getValues().bmi ?? 0) > 25 ? 'Moderate' : 'Low')}
                </p>
                <p className="text-xs text-muted-foreground">Target: 18.5-25</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exercise support</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().exerciseFrequency ?? 0) >= 4 ? 'Good' : 'Needs improvement')}
                </p>
                <p className="text-xs text-muted-foreground">Target: 4+ sessions/week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep support</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().sleepHours ?? 0) >= 7 ? 'Good' : 'Needs improvement')}
                </p>
                <p className="text-xs text-muted-foreground">Target: 7-9 hours</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your risk factors to see additional insights.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related calculators</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedCalculators.map((calc) => (
            <div key={calc.slug} className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href={`/category/health-fitness/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Testosterone deficiency risk depends on age, BMI, exercise, sleep, stress, alcohol, and energy levels. Higher age, obesity, poor sleep, high stress, and low exercise increase risk.</p>
          <p>Use this calculator to assess risk, identify contributing factors, and plan lifestyle changes to support testosterone production.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h4 className="font-semibold">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tool estimates testosterone deficiency risk from age, gender, BMI, exercise frequency, sleep hours, stress level, alcohol units, and energy level.</p>
          <p>Outputs include risk score, deficiency level, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

