'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  sleepHours: z.number({ invalid_type_error: 'Enter sleep hours' }).min(3).max(12),
  stressLevel: z.number({ invalid_type_error: 'Enter stress level' }).min(1).max(10),
  exerciseFrequency: z.number({ invalid_type_error: 'Enter exercise frequency' }).min(0).max(7),
  dietQuality: z.number({ invalid_type_error: 'Enter diet quality' }).min(1).max(10),
  hydrationLevel: z.number({ invalid_type_error: 'Enter hydration level' }).min(1).max(10),
  alcoholUnits: z.number({ invalid_type_error: 'Enter alcohol units' }).min(0).max(20),
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  wellnessIndex: number;
  lifestyleScore: number;
  status: 'excellent' | 'good' | 'moderate' | 'needs-improvement';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter average nightly sleep hours (7-9 hours optimal).',
  'Rate your stress level (1 = low, 10 = very high).',
  'Enter exercise frequency (days per week).',
  'Rate your diet quality (1 = poor, 10 = excellent).',
  'Rate your hydration level (1 = poor, 10 = excellent).',
  'Enter weekly alcohol units (0-2 optimal).',
  'Enter your age.',
  'Review your wellness index, lifestyle score, and general wellness insights.',
];

const faqs = [
  {
    question: 'How does sleep affect wellness?',
    answer:
      'Adequate sleep (7-9 hours) supports overall wellness. Quality sleep helps with recovery, mood, and general health. This is a general wellness insight, not a medical evaluation.',
  },
  {
    question: 'How does stress affect wellness?',
    answer:
      'Chronic stress can impact general wellness. Managing stress through relaxation, exercise, or mindfulness may support overall wellness. This is a lifestyle assessment, not a medical diagnosis.',
  },
  {
    question: 'How does exercise support wellness?',
    answer:
      'Regular exercise (3-5 days per week) supports general wellness. Moderate exercise can help with energy, mood, and overall health. This is a general wellness insight.',
  },
  {
    question: 'How does diet quality affect wellness?',
    answer:
      'A balanced diet supports overall wellness. Eating a variety of nutritious foods can contribute to general health. This is a lifestyle assessment, not a medical evaluation.',
  },
  {
    question: 'How does hydration affect wellness?',
    answer:
      'Adequate hydration supports general wellness. Staying well-hydrated helps with energy, mood, and overall health. This is a lifestyle insight.',
  },
  {
    question: 'How does alcohol consumption affect wellness?',
    answer:
      'Moderate or low alcohol consumption may support general wellness. Excessive alcohol can impact overall health. This is a general wellness insight, not a medical evaluation.',
  },
  {
    question: 'How long does it take to see lifestyle improvements?',
    answer:
      'Lifestyle changes typically show general wellness benefits over 2-3 months. Consistency is key. This is a personal insight, not a medical evaluation.',
  },
  {
    question: 'What about supplements?',
    answer:
      'Some people consider supplements for general wellness support, but consult a qualified professional before starting any supplement regimen. This is not medical advice.',
  },
  {
    question: 'When should I see a healthcare provider?',
    answer:
      'For any health concerns, please consult a qualified professional. This calculator provides general wellness insights only, not medical diagnosis.',
  },
  {
    question: 'Is this a medical evaluation?',
    answer:
      'No. This tool provides general wellness and lifestyle insights for educational purposes only. It is not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.',
  },
];

const relatedCalculators = [
  {
    name: 'Testosterone-to-Cortisol Ratio Calculator',
    slug: 'testosterone-to-cortisol-ratio-calculator',
    description: 'Check hormonal balance that impacts fertility.',
  },
  {
    name: 'BMI Calculator',
    slug: 'bmi-calculator',
    description: 'Track BMI as obesity can affect sperm quality.',
  },
  {
    name: 'Exercise Recovery Score (HRV + Sleep Integration)',
    slug: 'exercise-recovery-score-hrv-sleep-integration',
    description: 'Monitor recovery and avoid overtraining that can affect fertility.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/male-fertility-sperm-health-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Male Wellness Lifestyle Index Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Male Wellness Lifestyle Index Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate your wellness index and lifestyle score based on sleep, stress, exercise, diet, hydration, and alcohol consumption.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  let score = 0;
  
  // Sleep (0-25 points, optimal 7-9 hours)
  if (values.sleepHours >= 7 && values.sleepHours <= 9) {
    score += 25;
  } else if (values.sleepHours >= 6 && values.sleepHours < 7) {
    score += 20;
  } else if (values.sleepHours > 9 && values.sleepHours <= 10) {
    score += 20;
  } else if (values.sleepHours >= 5 && values.sleepHours < 6) {
    score += 12;
  } else {
    score += 6;
  }
  
  // Stress (0-20 points, lower is better)
  if (values.stressLevel <= 3) {
    score += 20;
  } else if (values.stressLevel <= 5) {
    score += 15;
  } else if (values.stressLevel <= 7) {
    score += 8;
  } else {
    score += 3;
  }
  
  // Exercise (0-20 points, 3-5 days/week optimal)
  if (values.exerciseFrequency >= 3 && values.exerciseFrequency <= 5) {
    score += 20;
  } else if (values.exerciseFrequency === 2 || values.exerciseFrequency === 6) {
    score += 15;
  } else if (values.exerciseFrequency === 1 || values.exerciseFrequency === 7) {
    score += 10;
  } else {
    score += 5;
  }
  
  // Diet quality (0-15 points)
  score += (values.dietQuality / 10) * 15;
  
  // Hydration (0-10 points)
  score += (values.hydrationLevel / 10) * 10;
  
  // Alcohol (0-10 points, less is better)
  if (values.alcoholUnits === 0) {
    score += 10;
  } else if (values.alcoholUnits <= 2) {
    score += 8;
  } else if (values.alcoholUnits <= 5) {
    score += 5;
  } else if (values.alcoholUnits <= 10) {
    score += 2;
  } else {
    score += 0;
  }
  
  const wellnessIndex = clamp(score, 0, 100);
  const lifestyleScore = wellnessIndex;

  let status: ResultPayload['status'] = 'excellent';
  let interpretation = 'Your estimated wellness score suggests a lifestyle tendency that supports general wellness. This is a personal insight, not a medical evaluation.';

  if (wellnessIndex < 50) {
    status = 'needs-improvement';
    interpretation = 'Your estimated wellness score suggests areas where lifestyle improvements may be beneficial. This is a general wellness insight, not a medical evaluation.';
  } else if (wellnessIndex < 70) {
    status = 'moderate';
    interpretation = 'Your estimated wellness score suggests a moderate lifestyle tendency. This is a personal insight, not a medical evaluation.';
  } else if (wellnessIndex < 85) {
    status = 'good';
    interpretation = 'Your estimated wellness score suggests a good lifestyle tendency. This is a personal insight, not a medical evaluation.';
  }

  const recommendations = [
    'You may consider lifestyle improvements such as sleep, hydration, or stress management for general wellness support.',
    'Maintain a balanced diet, regular exercise, adequate sleep, and stress management for overall wellness.',
    'Limit alcohol consumption and stay well-hydrated to support general wellness.',
  ];

  const plan = [
    { label: 'This Week', detail: 'Focus on improving one lifestyle area, such as sleep quality or stress management.' },
    { label: 'Next 2-3 Months', detail: 'Implement gradual lifestyle changes. Consistency is key for long-term wellness support.' },
    { label: 'Ongoing', detail: 'Continue healthy habits for long-term wellness. This is a general lifestyle assessment, not a medical evaluation.' },
  ];

  return { wellnessIndex, lifestyleScore, status, interpretation, recommendations, plan };
};

export default function MaleFertilitySpermHealthIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sleepHours: undefined,
      stressLevel: undefined,
      exerciseFrequency: undefined,
      dietQuality: undefined,
      hydrationLevel: undefined,
      alcoholUnits: undefined,
      age: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="male-fertility-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Male Wellness Lifestyle Index Calculator
          </CardTitle>
          <CardDescription>Estimate your wellness index and lifestyle score based on sleep, stress, exercise, diet, hydration, and alcohol consumption.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your lifestyle factors</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep hours per night</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                  name="exerciseFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise frequency (days/week)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dietQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diet quality (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hydrationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hydration level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="1" placeholder="e.g., 32" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate wellness index
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
            <CardDescription>See your wellness index, lifestyle score, and general wellness insights.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wellness index</p>
                <p className="text-2xl font-semibold text-primary">{result.wellnessIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Lifestyle score</p>
                <p className="text-2xl font-semibold text-primary">{result.lifestyleScore.toFixed(0)}</p>
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
          <p><strong>Wellness index</strong> = sleep (0-25) + stress (0-20) + exercise (0-20) + diet (0-15) + hydration (0-10) + alcohol (0-10), max 100.</p>
          <p><strong>Lifestyle score</strong> = wellness index (same calculation).</p>
          <p><strong>General ranges</strong>: Sleep 7-9h, Stress â‰¤3, Exercise 3-5 days/week, Diet 7-10, Hydration 7-10, Alcohol 0-2 units/week.</p>
          <p>This is a general wellness assessment based on lifestyle factors. It is not a medical evaluation.</p>
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
                <p className="text-sm text-muted-foreground">Sleep quality</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().sleepHours ?? 0) >= 7 && (form.getValues().sleepHours ?? 0) <= 9 ? 'Good' : 'Could improve')}
                </p>
                <p className="text-xs text-muted-foreground">Target: 7-9 hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stress management</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().stressLevel ?? 0) <= 3 ? 'Good' : 'Could improve')}
                </p>
                <p className="text-xs text-muted-foreground">Target: â‰¤3</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Exercise consistency</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().exerciseFrequency ?? 0) >= 3 && (form.getValues().exerciseFrequency ?? 0) <= 5 ? 'Good' : 'Could improve')}
                </p>
                <p className="text-xs text-muted-foreground">Target: 3-5 days/week</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your lifestyle factors to see additional insights.</p>
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
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
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
          <p>General wellness is influenced by lifestyle factors such as sleep, stress management, exercise, diet quality, hydration, and alcohol consumption.</p>
          <p>Use this calculator to assess your wellness index based on lifestyle factors and get general wellness insights. This is not a medical evaluation.</p>
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
          <p>This tool estimates wellness index and lifestyle score from sleep hours, stress level, exercise frequency, diet quality, hydration level, alcohol units, and age.</p>
          <p>Outputs include wellness index, lifestyle score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.</p>
        </CardContent>
      </Card>
    </div>
  );
}

