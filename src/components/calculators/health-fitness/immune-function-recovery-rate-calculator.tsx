'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Zap, Target, Activity, AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  sleepQuality: z.number({ invalid_type_error: 'Enter sleep quality' }).min(1).max(10),
  stressLevel: z.number({ invalid_type_error: 'Enter stress level' }).min(1).max(10),
  nutritionScore: z.number({ invalid_type_error: 'Enter nutrition score' }).min(0).max(20),
  exerciseLevel: z.number({ invalid_type_error: 'Enter exercise level' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  sleepQuality: number;
  stressLevel: number;
  nutritionScore: number;
  exerciseLevel: number;
  recoveryRate: number;
  rateIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter sleep quality (1 = poor, 10 = excellent) from sleep assessment.',
  'Enter stress level (1 = low, 10 = high) from stress assessment.',
  'Enter nutrition score (0-20) from dietary assessment.',
  'Enter exercise level (0 = none, 10 = extensive) from activity assessment.',
  'Review immune function recovery rate, immune health status, and recommendations.',
];

const faqs = [
  {
    question: 'What is immune function recovery rate?',
    answer:
      'Immune function recovery rate refers to how quickly the immune system recovers and functions optimally after challenges like illness, stress, or immune suppression. It reflects immune resilience and health.',
  },
  {
    question: 'What affects immune recovery rate?',
    answer:
      'Immune recovery is affected by sleep quality, stress levels, nutrition, exercise, age, overall health, and lifestyle factors. Good sleep, low stress, proper nutrition, and moderate exercise support faster recovery.',
  },
  {
    question: 'How does sleep affect immune recovery?',
    answer:
      'Quality sleep is essential for immune function and recovery. During sleep, the immune system repairs, produces immune cells, and regulates immune responses. Poor sleep impairs immune recovery and function.',
  },
  {
    question: 'How does stress affect immune recovery?',
    answer:
      'Chronic stress suppresses immune function and slows recovery. Stress hormones (cortisol) can impair immune cell function and reduce immune response. Managing stress supports faster immune recovery.',
  },
  {
    question: 'How does nutrition affect immune recovery?',
    answer:
      'Adequate nutrition, especially vitamins (C, D, zinc), protein, and antioxidants, supports immune cell production and function. Poor nutrition impairs immune recovery and increases infection risk.',
  },
  {
    question: 'How does exercise affect immune recovery?',
    answer:
      'Moderate exercise supports immune function and recovery, while excessive exercise can temporarily suppress immunity. Regular moderate exercise enhances immune resilience and recovery capacity.',
  },
  {
    question: 'Can I improve immune recovery rate?',
    answer:
      'Yes. Improve immune recovery through quality sleep, stress management, balanced nutrition, moderate exercise, adequate hydration, and healthy lifestyle habits that support immune function.',
  },
  {
    question: 'What about immune supplements?',
    answer:
      'Some supplements (vitamin C, D, zinc, probiotics) may support immune function, but a balanced diet and healthy lifestyle are most important. Consult healthcare provider before immune supplements.',
  },
  {
    question: 'How long does immune recovery take?',
    answer:
      'Immune recovery time varies with the challenge and individual factors. After illness, recovery may take days to weeks. Supporting immune health through lifestyle can accelerate recovery.',
  },
  {
    question: 'When should I consult a healthcare provider?',
    answer:
      'Consult a healthcare provider if you have frequent infections, slow recovery from illness, immune system concerns, or if you need guidance on supporting immune function and recovery.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Quality vs Longevity Correlation Calculator',
    slug: 'sleep-quality-vs-longevity-correlation-calculator',
    description: 'Assess sleep quality alongside immune recovery.',
  },
  {
    name: 'Biological Stress Load (Allostatic Load) Calculator',
    slug: 'biological-stress-load-allostatic-load-calculator',
    description: 'Evaluate stress affecting immune function.',
  },
  {
    name: 'Nutrient Density to Calorie Ratio Calculator',
    slug: 'nutrient-density-to-calorie-ratio-calculator',
    description: 'Assess nutrition supporting immune health.',
  },
  {
    name: 'Vitamin C Immunity Boost Score Calculator',
    slug: 'vitamin-c-immunity-boost-score-calculator',
    description: 'Track immune-supporting nutrients.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/immune-function-recovery-rate-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Immune Function Recovery Rate Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Immune Function Recovery Rate Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate immune function recovery rate from sleep quality, stress level, nutrition score, and exercise level.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const sleepQuality = values.sleepQuality;
  const stressLevel = values.stressLevel;
  const nutritionScore = values.nutritionScore;
  const exerciseLevel = values.exerciseLevel;
  
  // Calculate recovery rate (0-100, higher = faster recovery)
  let recoveryRate = 50;
  
  // Sleep quality component (0-30 points)
  if (sleepQuality >= 8) {
    recoveryRate += 25; // Excellent
  } else if (sleepQuality >= 6) {
    recoveryRate += 15; // Good
  } else if (sleepQuality < 4) {
    recoveryRate -= 20; // Poor
  } else {
    recoveryRate -= 5; // Moderate
  }
  
  // Stress level component (0-30 points, inverted)
  // Lower stress = higher recovery
  if (stressLevel <= 3) {
    recoveryRate += 25; // Low stress
  } else if (stressLevel <= 5) {
    recoveryRate += 12; // Moderate stress
  } else if (stressLevel >= 8) {
    recoveryRate -= 25; // High stress
  } else {
    recoveryRate -= 10; // Elevated stress
  }
  
  // Nutrition component (0-25 points)
  if (nutritionScore >= 15) {
    recoveryRate += 22; // Excellent
  } else if (nutritionScore >= 10) {
    recoveryRate += 12; // Good
  } else if (nutritionScore < 5) {
    recoveryRate -= 18; // Poor
  } else {
    recoveryRate -= 5; // Moderate
  }
  
  // Exercise component (0-15 points)
  // Moderate exercise is optimal
  if (exerciseLevel >= 5 && exerciseLevel <= 7) {
    recoveryRate += 12; // Optimal
  } else if (exerciseLevel >= 3 && exerciseLevel < 5) {
    recoveryRate += 6; // Moderate
  } else if (exerciseLevel > 8) {
    recoveryRate -= 5; // Excessive (may suppress)
  } else if (exerciseLevel < 2) {
    recoveryRate -= 3; // Too low
  }
  
  recoveryRate = clamp(recoveryRate, 0, 100);
  const rateIndex = recoveryRate; // Same value

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your immune function recovery rate appears optimal. Continue maintaining healthy lifestyle habits that support immune health.';

  if (recoveryRate < 40 || sleepQuality < 4 || stressLevel > 7) {
    status = 'low';
    interpretation = 'Your immune function recovery rate is low. Poor sleep, high stress, or inadequate nutrition may be impairing immune recovery. Focus on improving these factors significantly.';
  } else if (recoveryRate < 60 || sleepQuality < 6 || stressLevel > 6) {
    status = 'moderate';
    interpretation = 'Your immune function recovery rate is moderate. Improving sleep, reducing stress, and optimizing nutrition can enhance immune recovery and resilience.';
  } else if (recoveryRate < 75) {
    status = 'good';
    interpretation = 'Your immune function recovery rate is good. Continue maintaining healthy habits to support optimal immune function and recovery.';
  }

  const recommendations = [
    'Prioritize quality sleep: aim for 7-9 hours of quality sleep per night to support immune function, cell repair, and immune recovery. Sleep is essential for immune health.',
    'Manage stress effectively: chronic stress suppresses immune function. Use stress management techniques (meditation, relaxation, exercise) to support immune recovery.',
    'Optimize nutrition: consume a balanced diet rich in vitamins (C, D, zinc), protein, and antioxidants to support immune cell production and function.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('Address factors impairing immune recovery. Poor sleep, high stress, or inadequate nutrition significantly impact immune function and recovery rate.');
  }
  if (sleepQuality < 6) {
    recommendations.push('Improve sleep quality significantly. Quality sleep is critical for immune function and recovery. Address sleep issues to support immune health.');
  }
  if (stressLevel > 6) {
    recommendations.push('Reduce stress levels. High stress significantly impairs immune function and recovery. Implement stress management strategies to support immune health.');
  }

  const plan = [
    { label: 'This Week', detail: 'Assess current sleep quality, stress levels, nutrition, and exercise. Calculate immune recovery rate and identify areas for improvement.' },
    { label: 'This Month', detail: 'Implement lifestyle improvements: optimize sleep, reduce stress, improve nutrition, and maintain moderate exercise to support immune recovery.' },
    { label: 'Ongoing', detail: 'Monitor immune recovery through regular assessment of lifestyle factors. Maintain healthy habits to support optimal immune function and recovery capacity.' },
  ];

  return { sleepQuality, stressLevel, nutritionScore, exerciseLevel, recoveryRate, rateIndex, status, interpretation, recommendations, plan };
};

export default function ImmuneFunctionRecoveryRateCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sleepQuality: undefined,
      stressLevel: undefined,
      nutritionScore: undefined,
      exerciseLevel: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="immune-recovery-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Immune Function Recovery Rate Calculator
          </CardTitle>
          <CardDescription>Calculate immune function recovery rate from sleep quality, stress level, nutrition score, and exercise level.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your immune recovery data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sleepQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep quality (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Stress level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nutritionScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nutrition score (0-20)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 14" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="exerciseLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise level (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate recovery rate
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
            <CardDescription>See immune function recovery rate, immune health status, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep quality</p>
                <p className="text-2xl font-semibold text-primary">{result.sleepQuality.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stress level</p>
                <p className="text-2xl font-semibold text-primary">{result.stressLevel.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery rate</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryRate.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
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
                    <AlertTriangle className="h-4 w-4" />
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
          <p>
            <strong>Immune recovery rate</strong> = calculated from sleep quality (0-30 points), stress level (0-30 points, inverted), nutrition score (0-25 points), and exercise level (0-15 points, optimal: 5-7).
          </p>
          <p>
            <strong>Components</strong>: Quality sleep and good nutrition support recovery. Low stress enhances recovery. Moderate exercise is optimal; excessive exercise may temporarily suppress immunity.
          </p>
          <p>
            <strong>Optimal ranges</strong>: Sleep quality: 8-10, Stress level: 1-3, Nutrition score: 15-20, Exercise level: 5-7. Higher recovery rates indicate better immune resilience and recovery capacity.
          </p>
          <p>Immune recovery rate is affected by lifestyle factors that support or impair immune function. Good sleep, low stress, proper nutrition, and moderate exercise optimize immune recovery.</p>
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
                <p className="text-sm text-muted-foreground">Target recovery rate</p>
                <p className="text-xl font-semibold text-primary">&gt; 75</p>
                <p className="text-xs text-muted-foreground">Optimal range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Rate index</p>
                <p className="text-xl font-semibold text-primary">{result.rateIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery status</p>
                <p className="text-xl font-semibold text-primary">
                  {result.recoveryRate >= 75 ? 'Optimal' : result.recoveryRate >= 60 ? 'Good' : result.recoveryRate >= 40 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on rate</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your immune recovery data to see additional insights.</p>
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
          <p>Immune function recovery rate reflects how quickly the immune system recovers and functions optimally. It is affected by sleep quality, stress levels, nutrition, and exercise. Good lifestyle habits support faster immune recovery.</p>
          <p>Use this calculator to assess immune function recovery rate from sleep quality, stress level, nutrition score, and exercise level.</p>
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
          <p>This tool calculates immune function recovery rate from sleep quality, stress level, nutrition score, and exercise level.</p>
          <p>Outputs include sleep quality, stress level, nutrition score, exercise level, recovery rate, rate index, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

