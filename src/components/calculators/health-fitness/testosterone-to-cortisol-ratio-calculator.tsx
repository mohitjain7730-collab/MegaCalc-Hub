'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Scale, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  testosteroneLevel: z.number({ invalid_type_error: 'Enter testosterone level' }).min(100).max(1500),
  cortisolLevel: z.number({ invalid_type_error: 'Enter cortisol level' }).min(1).max(50),
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
  gender: z.enum(['male', 'female']),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  ratio: number;
  ratioStatus: number;
  status: 'optimal' | 'moderate' | 'low-testosterone' | 'high-cortisol';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your testosterone level (ng/dL) from a blood test.',
  'Enter your cortisol level (μg/dL) from the same test.',
  'Enter your age and gender (normal ranges differ by gender and age).',
  'Note the time of day the test was taken (cortisol varies throughout the day).',
  'Review the testosterone-to-cortisol ratio and balance status.',
];

const faqs = [
  {
    question: 'What is the testosterone-to-cortisol ratio?',
    answer:
      'It measures the balance between anabolic (testosterone) and catabolic (cortisol) hormones. Higher ratios generally indicate better recovery, muscle building capacity, and lower stress impact.',
  },
  {
    question: 'What is a healthy ratio?',
    answer:
      'Ideal ratios vary by gender, age, and time of day. Generally: men 20:1 to 30:1 (morning), women 5:1 to 15:1. Lower ratios may indicate high stress or low testosterone.',
  },
  {
    question: 'How do I get hormone levels tested?',
    answer:
      'Consult a healthcare provider. Blood tests measure testosterone and cortisol. Timing matters—cortisol is highest in the morning, testosterone varies less.',
  },
  {
    question: 'Does time of day matter?',
    answer:
      'Yes. Cortisol peaks in the morning and declines throughout the day. Testosterone is relatively stable but may be slightly higher in the morning. Morning tests are standard.',
  },
  {
    question: 'What if my ratio is low?',
    answer:
      'Low ratios may indicate high cortisol (stress), low testosterone, or both. Lifestyle changes (sleep, stress management, exercise) or medical treatment may help.',
  },
  {
    question: 'Can men and women use this?',
    answer:
      'Yes, but normal ranges differ significantly. Men typically have 10-20x higher testosterone than women. The calculator accounts for gender differences.',
  },
  {
    question: 'What affects the ratio?',
    answer:
      'Stress, sleep, exercise, diet, age, medications, and health conditions can affect both testosterone and cortisol levels and their ratio.',
  },
  {
    question: 'Can I improve the ratio naturally?',
    answer:
      'Possibly. Reducing stress, improving sleep, regular exercise, balanced nutrition, and avoiding overtraining may help improve the ratio.',
  },
  {
    question: 'When should I retest?',
    answer:
      'Retest after 2-3 months of lifestyle changes or as recommended by your healthcare provider. Hormone levels can fluctuate.',
  },
  {
    question: 'Is this a medical diagnosis?',
    answer:
      'No. This is an educational tool. Always consult healthcare providers for hormone testing, diagnosis, and treatment recommendations.',
  },
];

const relatedCalculators = [
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Monitor cortisol and stress impact on hormones.',
  },
  {
    name: 'Exercise Recovery Score (HRV + Sleep Integration)',
    slug: 'exercise-recovery-score-hrv-sleep-integration',
    description: 'Track recovery that affects testosterone-to-cortisol ratio.',
  },
  {
    name: 'Sleep Quality vs Productivity Correlation Calculator',
    slug: 'sleep-quality-vs-productivity-correlation-calculator',
    description: 'Improve sleep to support hormonal balance.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/testosterone-to-cortisol-ratio-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Testosterone-to-Cortisol Ratio Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Testosterone-to-Cortisol Ratio Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate testosterone-to-cortisol ratio from hormone levels to assess anabolic-catabolic balance and recovery capacity.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate ratio (testosterone in ng/dL, cortisol in μg/dL)
  // Convert cortisol to ng/dL for ratio: 1 μg/dL = 10 ng/dL
  const cortisolNgDl = values.cortisolLevel * 10;
  const ratio = values.testosteroneLevel / cortisolNgDl;
  
  // Ideal ratios by gender and time of day
  let idealRatio = 25; // Default for men, morning
  if (values.gender === 'female') {
    idealRatio = 10; // Women have lower testosterone
  }
  if (values.timeOfDay === 'afternoon') {
    idealRatio *= 0.7; // Cortisol lower in afternoon
  } else if (values.timeOfDay === 'evening') {
    idealRatio *= 0.5; // Cortisol much lower in evening
  }
  
  const ratioStatus = clamp((ratio / idealRatio) * 100, 0, 200);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your testosterone-to-cortisol ratio appears optimal. Maintain current habits.';

  if (ratio < idealRatio * 0.5) {
    if (values.testosteroneLevel < (values.gender === 'male' ? 300 : 15)) {
      status = 'low-testosterone';
      interpretation = 'Ratio suggests low testosterone relative to cortisol. Consider lifestyle changes or consult a healthcare provider.';
    } else {
      status = 'high-cortisol';
      interpretation = 'Ratio indicates high cortisol (stress) relative to testosterone. Focus on stress reduction and recovery.';
    }
  } else if (ratio < idealRatio * 0.7) {
    status = 'moderate';
    interpretation = 'Ratio is moderate. Consider lifestyle adjustments to optimize balance and support recovery.';
  }

  const recommendations = [
    'Ensure hormone testing is done at the right time (morning for cortisol, consistent timing for testosterone).',
    'Reduce stress through meditation, sleep, and stress management to lower cortisol and support testosterone.',
    'Prioritize sleep (7-9 hours) and recovery to support healthy hormone balance.',
  ];
  if (status === 'low-testosterone') {
    recommendations.push('Consider lifestyle changes (exercise, nutrition, sleep) or discuss testosterone replacement with a healthcare provider if levels are clinically low.');
  }
  if (status === 'high-cortisol') {
    recommendations.push('Focus on stress reduction, adequate rest, and avoiding overtraining to lower cortisol levels.');
  }

  const plan = [
    { label: 'This Week', detail: 'Review hormone test results with a healthcare provider to confirm ratio and discuss options.' },
    { label: 'Next Month', detail: 'Implement lifestyle changes (stress reduction, sleep, exercise) to support hormonal balance.' },
    { label: 'Ongoing', detail: 'Retest hormones after 2-3 months to track ratio improvements and adjust treatment if needed.' },
  ];

  return { ratio, ratioStatus, status, interpretation, recommendations, plan };
};

export default function TestosteroneToCortisolRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      testosteroneLevel: undefined,
      cortisolLevel: undefined,
      age: undefined,
      gender: 'male',
      timeOfDay: 'morning',
    },
  });

  return (
    <div className="space-y-8">
      <Script id="testosterone-cortisol-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Testosterone-to-Cortisol Ratio Calculator
          </CardTitle>
          <CardDescription>Calculate testosterone-to-cortisol ratio from hormone levels to assess anabolic-catabolic balance and recovery capacity.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your hormone levels</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="testosteroneLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Testosterone (ng/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 650" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cortisolLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cortisol (μg/dL)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 15.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                  name="timeOfDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time of day tested</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as 'morning' | 'afternoon' | 'evening')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="evening">Evening</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate ratio
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
            <CardDescription>See testosterone-to-cortisol ratio and balance status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.ratio.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Testosterone:Cortisol</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ratio status</p>
                <p className="text-2xl font-semibold text-primary">{result.ratioStatus.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">% of ideal (100% = optimal)</p>
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
          <p><strong>Ratio</strong> = testosterone (ng/dL) / (cortisol (μg/dL) × 10).</p>
          <p><strong>Ideal ratios</strong>: Men (morning) ≈ 20-30:1, Women (morning) ≈ 5-15:1. Afternoon/evening ratios adjust for lower cortisol.</p>
          <p><strong>Ratio status</strong> = (actual ratio / ideal ratio) × 100, clamped to 0-200%.</p>
          <p>Higher ratios indicate better anabolic-catabolic balance, supporting recovery and muscle building capacity.</p>
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
                <p className="text-sm text-muted-foreground">Testosterone level</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().testosteroneLevel ?? 0).toFixed(0)} ng/dL
                </p>
                <p className="text-xs text-muted-foreground">From blood test</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cortisol level</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().cortisolLevel ?? 0).toFixed(1)} μg/dL
                </p>
                <p className="text-xs text-muted-foreground">From blood test</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Balance assessment</p>
                <p className="text-xl font-semibold text-primary">
                  {result.ratioStatus >= 80 ? 'Good' : result.ratioStatus >= 50 ? 'Moderate' : 'Needs improvement'}
                </p>
                <p className="text-xs text-muted-foreground">Based on ratio status</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your hormone levels to see additional insights.</p>
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
          <p>The testosterone-to-cortisol ratio measures anabolic-catabolic balance. Higher ratios support recovery, muscle building, and lower stress impact.</p>
          <p>Use this calculator to assess your ratio from blood test results and plan lifestyle or medical interventions to optimize balance.</p>
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
          <p>This tool calculates testosterone-to-cortisol ratio from hormone levels (ng/dL and μg/dL) and assesses balance status based on gender, age, and time of day.</p>
          <p>Outputs include ratio, ratio status, balance status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

