'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  age: z.number({ invalid_type_error: 'Enter age' }).min(30).max(100),
  testosteroneLevel: z.number({ invalid_type_error: 'Enter testosterone level' }).min(100).max(1500).optional(),
  energyLevel: z.number({ invalid_type_error: 'Enter energy level' }).min(1).max(10),
  libido: z.number({ invalid_type_error: 'Enter libido' }).min(1).max(10),
  muscleMass: z.number({ invalid_type_error: 'Enter muscle mass' }).min(1).max(10),
  moodStability: z.number({ invalid_type_error: 'Enter mood stability' }).min(1).max(10),
  sleepQuality: z.number({ invalid_type_error: 'Enter sleep quality' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  riskScore: number;
  onsetProbability: number;
  estimatedOnsetAge: number;
  status: 'low-risk' | 'moderate-risk' | 'high-risk' | 'likely-onset';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your current age (andropause typically starts 40-60).',
  'Optionally enter testosterone level (ng/dL) from blood test if available.',
  'Rate energy level (1 = very low, 10 = very high).',
  'Rate libido/sex drive (1 = very low, 10 = very high).',
  'Rate muscle mass/maintenance (1 = declining, 10 = strong).',
  'Rate mood stability (1 = unstable, 10 = very stable).',
  'Rate sleep quality (1 = poor, 10 = excellent).',
  'Review risk score, onset probability, and estimated onset age.',
];

const faqs = [
  {
    question: 'What is andropause?',
    answer:
      'Andropause (male menopause) is the gradual decline in testosterone and other hormones with age. It typically starts in the 40s-50s and progresses slowly over years.',
  },
  {
    question: 'Is andropause the same as menopause?',
    answer:
      'No. Andropause is more gradual and variable. Testosterone declines slowly (1-2% per year after 30), unlike the rapid hormonal changes in female menopause.',
  },
  {
    question: 'What are common symptoms?',
    answer:
      'Symptoms include low energy, reduced libido, decreased muscle mass, mood changes, sleep issues, and sometimes cognitive changes. Not all men experience all symptoms.',
  },
  {
    question: 'How is it diagnosed?',
    answer:
      'Diagnosis requires blood tests showing low testosterone (<300 ng/dL in men) along with symptoms. Age-related decline is normal, but significant drops may indicate andropause.',
  },
  {
    question: 'Can I prevent andropause?',
    answer:
      'You cannot prevent age-related decline, but lifestyle changes (exercise, sleep, stress management, healthy weight) can slow the decline and reduce symptoms.',
  },
  {
    question: 'What about testosterone replacement?',
    answer:
      'Testosterone replacement therapy (TRT) may be appropriate if levels are clinically low and symptoms are significant. Consult a healthcare provider for evaluation.',
  },
  {
    question: 'Does exercise help?',
    answer:
      'Yes. Regular resistance training and high-intensity exercise can boost testosterone and slow age-related decline. Exercise also supports muscle mass and energy.',
  },
  {
    question: 'How does sleep affect it?',
    answer:
      'Poor sleep can lower testosterone and worsen andropause symptoms. Prioritize 7-9 hours of quality sleep to support hormone production.',
  },
  {
    question: 'When should I see a doctor?',
    answer:
      'See a healthcare provider if you have significant symptoms (low energy, reduced libido, mood changes) or if testosterone levels are low (<300 ng/dL).',
  },
  {
    question: 'Can diet help?',
    answer:
      'Yes. Balanced nutrition with adequate protein, healthy fats, zinc, and vitamin D can support testosterone production. Avoid excessive alcohol and processed foods.',
  },
];

const relatedCalculators = [
  {
    name: 'Testosterone Deficiency Risk Calculator',
    slug: 'testosterone-deficiency-risk-calculator',
    description: 'Assess risk factors for low testosterone.',
  },
  {
    name: 'Testosterone-to-Cortisol Ratio Calculator',
    slug: 'testosterone-to-cortisol-ratio-calculator',
    description: 'Check hormonal balance during andropause transition.',
  },
  {
    name: 'Muscle Recovery Time by Age Calculator',
    slug: 'muscle-recovery-time-by-age-calculator',
    description: 'Track recovery changes that occur with andropause.',
  },
  {
    name: 'Exercise Recovery Score (HRV + Sleep Integration)',
    slug: 'exercise-recovery-score-hrv-sleep-integration',
    description: 'Monitor recovery to optimize exercise during andropause.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/andropause-onset-risk-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Andropause Onset Risk Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Andropause Onset Risk Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate andropause onset risk, probability, and age from age, testosterone level, energy, libido, muscle mass, mood, and sleep.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Age factor (older = higher risk)
  const ageRisk = clamp((values.age - 30) / 50 * 30, 0, 30); // 0-30 points
  
  // Testosterone factor (if provided)
  let testosteroneRisk = 0;
  if (values.testosteroneLevel) {
    if (values.testosteroneLevel < 300) {
      testosteroneRisk = 25; // Clinically low
    } else if (values.testosteroneLevel < 400) {
      testosteroneRisk = 15; // Borderline low
    } else if (values.testosteroneLevel < 500) {
      testosteroneRisk = 5; // Slightly low
    }
  } else {
    // Estimate based on age (average decline ~1-2% per year after 30)
    const estimatedTestosterone = 700 - (values.age - 30) * 10; // Rough estimate
    if (estimatedTestosterone < 300) {
      testosteroneRisk = 20;
    } else if (estimatedTestosterone < 400) {
      testosteroneRisk = 10;
    }
  }
  
  // Symptom scores (lower = higher risk)
  const energyRisk = clamp((10 - values.energyLevel) / 10 * 15, 0, 15); // 0-15 points
  const libidoRisk = clamp((10 - values.libido) / 10 * 15, 0, 15); // 0-15 points
  const muscleRisk = clamp((10 - values.muscleMass) / 10 * 10, 0, 10); // 0-10 points
  const moodRisk = clamp((10 - values.moodStability) / 10 * 5, 0, 5); // 0-5 points
  const sleepRisk = clamp((10 - values.sleepQuality) / 10 * 5, 0, 5); // 0-5 points
  
  const riskScore = clamp(ageRisk + testosteroneRisk + energyRisk + libidoRisk + muscleRisk + moodRisk + sleepRisk, 0, 100);
  const onsetProbability = riskScore;
  
  // Estimate onset age (typically 40-60, earlier if high risk)
  let estimatedOnsetAge = 50; // Average
  if (riskScore >= 70) {
    estimatedOnsetAge = 40; // Early onset
  } else if (riskScore >= 50) {
    estimatedOnsetAge = 45;
  } else if (riskScore >= 30) {
    estimatedOnsetAge = 55;
  } else {
    estimatedOnsetAge = 60; // Later onset
  }

  let status: ResultPayload['status'] = 'low-risk';
  let interpretation = 'Your risk for andropause onset appears low. Continue maintaining healthy lifestyle habits.';

  if (riskScore >= 70) {
    status = 'likely-onset';
    interpretation = 'High risk suggests andropause may have begun or is imminent. Consult a healthcare provider for evaluation and treatment options.';
  } else if (riskScore >= 50) {
    status = 'high-risk';
    interpretation = 'High risk factors detected. Andropause may be approaching. Consider lifestyle changes and discuss with a healthcare provider.';
  } else if (riskScore >= 30) {
    status = 'moderate-risk';
    interpretation = 'Moderate risk factors present. Monitor symptoms and consider lifestyle adjustments to support hormone health.';
  }

  const recommendations = [
    'Engage in regular resistance training and high-intensity exercise to support testosterone production and slow age-related decline.',
    'Prioritize sleep (7-9 hours) and stress management, as both significantly affect testosterone levels.',
    'Maintain healthy weight and balanced nutrition with adequate protein, healthy fats, zinc, and vitamin D.',
  ];
  if (status === 'high-risk' || status === 'likely-onset') {
    recommendations.push('Consult a healthcare provider for testosterone testing and evaluation. Consider treatment options if levels are clinically low.');
  }
  if (status === 'likely-onset') {
    recommendations.push('Testosterone replacement therapy (TRT) may be appropriate if levels are low and symptoms are significant. Discuss with your healthcare provider.');
  }

  const plan = [
    { label: 'This Week', detail: 'Document all symptoms and schedule appointment with healthcare provider for testosterone testing if risk is high.' },
    { label: 'Next Month', detail: 'Implement lifestyle changes (exercise, sleep, stress reduction) to support hormone health.' },
    { label: 'Ongoing', detail: 'Continue monitoring symptoms, follow treatment plan if prescribed, and maintain healthy habits for long-term wellness.' },
  ];

  return { riskScore, onsetProbability, estimatedOnsetAge, status, interpretation, recommendations, plan };
};

export default function AndropauseOnsetRiskEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      testosteroneLevel: undefined,
      energyLevel: undefined,
      libido: undefined,
      muscleMass: undefined,
      moodStability: undefined,
      sleepQuality: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="andropause-risk-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Andropause Onset Risk Estimator
          </CardTitle>
          <CardDescription>Estimate andropause onset risk, probability, and age from age, testosterone level, energy, libido, muscle mass, mood, and sleep.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your age and symptoms</CardTitle>
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
                        <Input type="number" step="1" placeholder="e.g., 48" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="testosteroneLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Testosterone (ng/dL) - optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 350" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                <FormField
                  control={form.control}
                  name="libido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Libido/sex drive (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="muscleMass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Muscle mass/maintenance (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="moodStability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mood stability (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep quality (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate risk
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
            <CardDescription>See risk score, onset probability, estimated onset age, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk score</p>
                <p className="text-2xl font-semibold text-primary">{result.riskScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Onset probability</p>
                <p className="text-2xl font-semibold text-primary">{result.onsetProbability.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Estimated onset age</p>
                <p className="text-2xl font-semibold text-primary">{result.estimatedOnsetAge}</p>
                <p className="text-xs text-muted-foreground">Years</p>
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
          <p><strong>Risk score</strong> = age risk (0-30) + testosterone risk (0-25) + energy risk (0-15) + libido risk (0-15) + muscle risk (0-10) + mood risk (0-5) + sleep risk (0-5), max 100.</p>
          <p><strong>Onset probability</strong> = risk score (same calculation).</p>
          <p><strong>Estimated onset age</strong>: Based on risk score (40-60 years, typically 50). Higher risk = earlier estimated onset.</p>
          <p>Older age, low testosterone, low energy/libido/muscle, poor mood/sleep increase risk score.</p>
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
                <p className="text-sm text-muted-foreground">Years until estimated onset</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.max(0, result.estimatedOnsetAge - (form.getValues().age ?? 0))} years
                </p>
                <p className="text-xs text-muted-foreground">From current age</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Symptom severity</p>
                <p className="text-xl font-semibold text-primary">
                  {result.riskScore >= 70 ? 'High' : result.riskScore >= 50 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Based on risk score</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Management priority</p>
                <p className="text-xl font-semibold text-primary">
                  {result.riskScore >= 70 ? 'High' : result.riskScore >= 50 ? 'Moderate' : 'Low'}
                </p>
                <p className="text-xs text-muted-foreground">Consider treatment if high</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your age and symptoms to see additional insights.</p>
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
          <p>Andropause (male menopause) is the gradual decline in testosterone with age, typically starting in the 40s-50s. Symptoms include low energy, reduced libido, decreased muscle mass, and mood changes.</p>
          <p>Use this calculator to estimate andropause onset risk, probability, and age from symptoms and testosterone levels to guide prevention and treatment.</p>
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
          <p>This tool estimates andropause onset risk, probability, and age from age, testosterone level (optional), energy, libido, muscle mass, mood stability, and sleep quality.</p>
          <p>Outputs include risk score, onset probability, estimated onset age, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

