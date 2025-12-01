'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Moon, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  totalSleepHours: z.number({ invalid_type_error: 'Enter total sleep hours' }).min(3).max(12),
  remSleepMinutes: z.number({ invalid_type_error: 'Enter REM sleep minutes' }).min(0).max(300).optional(),
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
  sleepQuality: z.number({ invalid_type_error: 'Enter sleep quality' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  remPercentage: number;
  remMinutes: number;
  remHours: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total sleep hours per night (from sleep tracker or estimate).',
  'Optionally enter REM sleep minutes if measured (from sleep tracker).',
  'Enter your age (REM sleep decreases with age).',
  'Rate overall sleep quality (1 = poor, 10 = excellent).',
  'Review REM sleep percentage, minutes, and recommendations.',
];

const faqs = [
  {
    question: 'What is REM sleep?',
    answer:
      'REM (Rapid Eye Movement) sleep is a sleep stage characterized by rapid eye movements, vivid dreams, and high brain activity. It is important for memory consolidation, learning, and emotional processing.',
  },
  {
    question: 'How much REM sleep do I need?',
    answer:
      'Adults typically need 20-25% of total sleep time in REM. For 7-8 hours of sleep, this is approximately 90-120 minutes of REM per night.',
  },
  {
    question: 'How does age affect REM sleep?',
    answer:
      'REM sleep decreases with age. Young adults (18-30) get ~20-25% REM, middle-aged (30-60) get ~15-20%, and older adults (60+) get ~10-15%.',
  },
  {
    question: 'What happens if I don\'t get enough REM?',
    answer:
      'Insufficient REM sleep can impair memory, learning, mood, and cognitive function. It may also affect emotional regulation and creativity.',
  },
  {
    question: 'How can I increase REM sleep?',
    answer:
      'Improve sleep hygiene: maintain consistent sleep schedule, avoid alcohol before bed, reduce stress, ensure adequate total sleep time, and create a sleep-conducive environment.',
  },
  {
    question: 'Does alcohol affect REM sleep?',
    answer:
      'Yes. Alcohol suppresses REM sleep, especially in the first half of the night. Even moderate alcohol consumption can reduce REM sleep quality.',
  },
  {
    question: 'What about sleep disorders?',
    answer:
      'Sleep disorders (sleep apnea, insomnia) can disrupt REM sleep. If you consistently have low REM sleep, consult a healthcare provider or sleep specialist.',
  },
  {
    question: 'Can I track REM sleep?',
    answer:
      'Yes. Sleep trackers (wearables, apps) can estimate REM sleep, though accuracy varies. Polysomnography (sleep study) is the gold standard for measuring sleep stages.',
  },
  {
    question: 'Does exercise affect REM sleep?',
    answer:
      'Regular exercise can improve REM sleep quality and duration. However, intense exercise close to bedtime may initially reduce REM, then increase it later in the night.',
  },
  {
    question: 'What is REM rebound?',
    answer:
      'REM rebound occurs after REM sleep deprivation. The body compensates by increasing REM sleep in subsequent nights, often with more vivid dreams.',
  },
];

const relatedCalculators = [
  {
    name: 'Deep Sleep Comfort Range Estimator',
    slug: 'deep-sleep-requirement-estimator',
    description: 'Calculate deep sleep needs alongside REM sleep.',
  },
  {
    name: 'Sleep Quality vs Productivity Correlation Calculator',
    slug: 'sleep-quality-vs-productivity-correlation-calculator',
    description: 'Track overall sleep quality and productivity.',
  },
  {
    name: 'Exercise Recovery Score (HRV + Sleep Integration)',
    slug: 'exercise-recovery-score-hrv-sleep-integration',
    description: 'Monitor recovery including sleep stages.',
  },
  {
    name: 'Hormone Support Lifestyle Score Calculator',
    slug: 'daily-testosterone-boosting-habits-score-calculator',
    description: 'Improve sleep habits that affect REM sleep.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/rem-sleep-percentage-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'REM Sleep Balance Wellness Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'REM Sleep Balance Wellness Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate REM sleep percentage and duration from total sleep hours, REM minutes, age, and sleep quality.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  let remMinutes: number;
  let remPercentage: number;
  
  if (values.remSleepMinutes) {
    // Use provided REM minutes
    remMinutes = values.remSleepMinutes;
    remPercentage = (remMinutes / (values.totalSleepHours * 60)) * 100;
  } else {
    // Estimate REM based on age and sleep quality
    // Baseline REM percentage by age
    let baselineREM: number;
    if (values.age < 30) {
      baselineREM = 22; // ~22% for young adults
    } else if (values.age < 60) {
      baselineREM = 18; // ~18% for middle-aged
    } else {
      baselineREM = 13; // ~13% for older adults
    }
    
    // Adjust for sleep quality (poor sleep reduces REM)
    const qualityAdjustment = (values.sleepQuality - 5) / 10; // -0.4 to +0.5
    remPercentage = clamp(baselineREM + (qualityAdjustment * 5), 5, 30); // Clamp to 5-30%
    remMinutes = (values.totalSleepHours * 60 * remPercentage) / 100;
  }
  
  const remHours = remMinutes / 60;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your estimated REM sleep balance wellness score suggests a general lifestyle tendency that may support balanced sleep cycles. This is a personal insight, not a medical evaluation.';

  // Age-appropriate targets
  let targetREM: number;
  if (values.age < 30) {
    targetREM = 20; // 20-25% target
  } else if (values.age < 60) {
    targetREM = 17; // 15-20% target
  } else {
    targetREM = 12; // 10-15% target
  }

  if (remPercentage < targetREM - 5) {
    status = 'low';
    interpretation = 'Your estimated REM sleep balance wellness score suggests a mixed pattern of habits. You may consider lifestyle improvements such as regular bedtimes, reduced screen time, or stress management. This is a general wellness insight, not a medical diagnosis.';
  } else if (remPercentage < targetREM - 2) {
    status = 'moderate';
    interpretation = 'Your estimated REM sleep balance wellness score suggests a moderate lifestyle tendency. This is a personal insight, not a medical evaluation.';
  } else if (remPercentage < targetREM + 3) {
    status = 'good';
    interpretation = 'Your estimated REM sleep balance wellness score suggests a good lifestyle tendency. This is a lifestyle assessment, not a medical evaluation.';
  }

  const recommendations = [
    'You may consider maintaining a consistent sleep schedule (same bedtime and wake time) for general wellness support.',
    'You may consider avoiding alcohol before bed for overall wellness.',
    'You may consider ensuring adequate total sleep time (7-9 hours for adults) for general wellness.',
  ];
  if (status === 'low' || status === 'moderate') {
    recommendations.push('You may consider reducing stress and creating a sleep-conducive environment (dark, cool, quiet) for general wellness support.');
  }
  if (values.sleepQuality < 6) {
    recommendations.push('You may consider addressing sleep quality through lifestyle changes. This is a general wellness suggestion, not medical advice.');
  }

  const plan = [
    { label: 'This Week', detail: 'Track sleep using a sleep tracker or journal. Note total sleep time and estimate REM sleep if possible.' },
    { label: 'This Month', detail: 'Implement sleep hygiene improvements: consistent schedule, reduce alcohol, improve sleep environment.' },
    { label: 'Ongoing', detail: 'Monitor REM sleep trends. If consistently low, consider consulting a sleep specialist to rule out sleep disorders.' },
  ];

  return { remPercentage, remMinutes, remHours, status, interpretation, recommendations, plan };
};

export default function REMSleepPercentageCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalSleepHours: undefined,
      remSleepMinutes: undefined,
      age: undefined,
      sleepQuality: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="rem-sleep-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            REM Sleep Balance Wellness Estimator
          </CardTitle>
          <CardDescription>Estimate your REM sleep balance wellness score based on sleep patterns, age, and sleep quality. This is a general wellness insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your sleep data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalSleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total sleep hours</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="remSleepMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>REM sleep minutes (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="5" placeholder="e.g., 90" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                  name="sleepQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep quality (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate REM sleep
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
            <CardDescription>See REM sleep percentage, duration, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">REM percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.remPercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of total sleep</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">REM minutes</p>
                <p className="text-2xl font-semibold text-primary">{result.remMinutes.toFixed(0)} min</p>
                <p className="text-xs text-muted-foreground">Per night</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">REM hours</p>
                <p className="text-2xl font-semibold text-primary">{result.remHours.toFixed(1)} hours</p>
                <p className="text-xs text-muted-foreground">Per night</p>
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
          <p>
            <strong>REM percentage</strong> = (REM minutes / total sleep minutes) × 100.
          </p>
          <p>
            <strong>If REM minutes not provided</strong>: Estimated based on age (young adults ~22%, middle-aged ~18%, older ~13%) adjusted for sleep quality.
          </p>
          <p>
            <strong>Age-appropriate targets</strong>: &lt;30 years: 20-25%, 30-60 years: 15-20%, 60+ years: 10-15%.
          </p>
          <p>REM sleep decreases with age and is affected by sleep quality, alcohol, stress, and total sleep time.</p>
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
                <p className="text-sm text-muted-foreground">Target REM (age-based)</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const age = form.getValues().age ?? 30;
                    if (age < 30) return '20-25%';
                    if (age < 60) return '15-20%';
                    return '10-15%';
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Recommended range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">REM vs target</p>
                <p className="text-xl font-semibold text-primary">
                  {(() => {
                    const age = form.getValues().age ?? 30;
                    const target = age < 30 ? 22.5 : age < 60 ? 17.5 : 12.5;
                    const diff = result.remPercentage - target;
                    return diff >= 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">Difference from target</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Non-REM sleep</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().totalSleepHours ?? 0) * 60 - result.remMinutes).toFixed(0)} min
                </p>
                <p className="text-xs text-muted-foreground">Per night</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your sleep data to see additional insights.</p>
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
          <p>REM (Rapid Eye Movement) sleep is important for memory consolidation, learning, and emotional processing. Adults typically need 20-25% of total sleep time in REM, though this decreases with age.</p>
          <p>Use this calculator to assess REM sleep percentage and duration from total sleep hours, REM minutes (if measured), age, and sleep quality.</p>
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
          <p>This tool estimates REM sleep balance wellness score from total sleep hours, REM sleep minutes (optional), age, and sleep quality.</p>
          <p>Outputs include REM percentage, REM minutes, REM hours, status, recommendations, an action plan, and supporting metrics.</p>
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



