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
  age: z.number({ invalid_type_error: 'Enter age' }).min(18).max(100),
  totalSleepHours: z.number({ invalid_type_error: 'Enter total sleep hours' }).min(3).max(12),
  deepSleepMinutes: z.number({ invalid_type_error: 'Enter deep sleep minutes' }).min(0).max(300).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very-active']),
  recoveryNeeds: z.number({ invalid_type_error: 'Enter recovery needs' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  requiredDeepSleep: number;
  requiredDeepSleepPercent: number;
  currentDeepSleep: number;
  currentDeepSleepPercent: number;
  deepSleepGap: number;
  status: 'optimal' | 'adequate' | 'insufficient' | 'deficient';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your age (deep sleep decreases with age).',
  'Enter total sleep hours per night.',
  'Optionally enter deep sleep minutes if measured (from sleep tracker).',
  'Select activity level (higher activity may require more deep sleep).',
  'Rate recovery needs (1 = low, 10 = high recovery needed).',
  'Review required deep sleep, current deep sleep, gap, and recommendations.',
];

const faqs = [
  {
    question: 'What is deep sleep?',
    answer:
      'Deep sleep (slow-wave sleep, stages 3-4) is the most restorative sleep stage. It is characterized by slow brain waves, minimal muscle activity, and is essential for physical recovery, growth hormone release, and immune function.',
  },
  {
    question: 'How much deep sleep do I need?',
    answer:
      'Adults typically need 13-23% of total sleep time in deep sleep. For 7-8 hours of sleep, this is approximately 60-90 minutes of deep sleep per night.',
  },
  {
    question: 'How does age affect deep sleep?',
    answer:
      'Deep sleep decreases significantly with age. Young adults (18-30) get ~20% deep sleep, middle-aged (30-60) get ~15%, and older adults (60+) get ~10% or less.',
  },
  {
    question: 'What happens if I don\'t get enough deep sleep?',
    answer:
      'Insufficient deep sleep can impair physical recovery, growth hormone production, immune function, and cognitive performance. You may feel less rested and recover slower from exercise.',
  },
  {
    question: 'How can I increase deep sleep?',
    answer:
      'Improve sleep hygiene: maintain consistent schedule, avoid alcohol/caffeine before bed, exercise regularly (but not too close to bedtime), reduce stress, and ensure adequate total sleep time.',
  },
  {
    question: 'Does exercise affect deep sleep?',
    answer:
      'Yes. Regular exercise, especially resistance training, can increase deep sleep. However, intense exercise very close to bedtime may initially reduce deep sleep, then increase it later in the night.',
  },
  {
    question: 'What about alcohol and caffeine?',
    answer:
      'Alcohol suppresses deep sleep, especially in the first half of the night. Caffeine can reduce deep sleep if consumed too close to bedtime. Avoid both for optimal deep sleep.',
  },
  {
    question: 'Can I track deep sleep?',
    answer:
      'Yes. Sleep trackers (wearables, apps) can estimate deep sleep, though accuracy varies. Polysomnography (sleep study) is the gold standard for measuring sleep stages.',
  },
  {
    question: 'Does stress affect deep sleep?',
    answer:
      'Yes. High stress and anxiety can reduce deep sleep. Stress management techniques (meditation, relaxation) can help improve deep sleep quality.',
  },
  {
    question: 'What if I consistently get low deep sleep?',
    answer:
      'If deep sleep is consistently low despite good sleep hygiene, consider consulting a sleep specialist. Sleep disorders (sleep apnea, restless legs) can disrupt deep sleep.',
  },
];

const relatedCalculators = [
  {
    name: 'REM Sleep Balance Wellness Estimator',
    slug: 'rem-sleep-percentage-calculator',
    description: 'Track REM sleep alongside deep sleep.',
  },
  {
    name: 'Sleep Quality vs Productivity Correlation Calculator',
    slug: 'sleep-quality-vs-productivity-correlation-calculator',
    description: 'Monitor overall sleep quality and productivity.',
  },
  {
    name: 'Exercise Recovery Score (HRV + Sleep Integration)',
    slug: 'exercise-recovery-score-hrv-sleep-integration',
    description: 'Track recovery including deep sleep stages.',
  },
  {
    name: 'Muscle Recovery Time by Age Calculator',
    slug: 'muscle-recovery-time-by-age-calculator',
    description: 'Plan recovery that depends on deep sleep.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/deep-sleep-requirement-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Deep Sleep Comfort Range Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Deep Sleep Comfort Range Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate deep sleep requirements and assess current deep sleep from age, total sleep, activity level, and recovery needs.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate required deep sleep percentage based on age
  let baseDeepSleepPercent: number;
  if (values.age < 30) {
    baseDeepSleepPercent = 20; // ~20% for young adults
  } else if (values.age < 60) {
    baseDeepSleepPercent = 15; // ~15% for middle-aged
  } else {
    baseDeepSleepPercent = 10; // ~10% for older adults
  }
  
  // Adjust for activity level (higher activity may need more deep sleep)
  const activityMultipliers: Record<string, number> = {
    'sedentary': 1.0,
    'light': 1.05,
    'moderate': 1.1,
    'active': 1.15,
    'very-active': 1.2,
  };
  const activityMultiplier = activityMultipliers[values.activityLevel] || 1.0;
  
  // Adjust for recovery needs (higher recovery needs = more deep sleep)
  const recoveryMultiplier = 1 + ((values.recoveryNeeds - 5) / 10); // 0.5 to 1.5
  
  const requiredDeepSleepPercent = clamp(baseDeepSleepPercent * activityMultiplier * recoveryMultiplier, 10, 25);
  const requiredDeepSleep = (values.totalSleepHours * 60 * requiredDeepSleepPercent) / 100;
  
  // Calculate current deep sleep
  let currentDeepSleep: number;
  let currentDeepSleepPercent: number;
  
  if (values.deepSleepMinutes) {
    currentDeepSleep = values.deepSleepMinutes;
    currentDeepSleepPercent = (currentDeepSleep / (values.totalSleepHours * 60)) * 100;
  } else {
    // Estimate based on age (typically lower than required)
    currentDeepSleepPercent = baseDeepSleepPercent * 0.8; // Assume 80% of optimal
    currentDeepSleep = (values.totalSleepHours * 60 * currentDeepSleepPercent) / 100;
  }
  
  const deepSleepGap = requiredDeepSleep - currentDeepSleep;

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your estimated deep sleep comfort range suggests a general lifestyle tendency that may support restorative sleep. This is a personal insight, not a medical evaluation.';

  if (deepSleepGap > 30) {
    status = 'deficient';
    interpretation = 'Your estimated deep sleep comfort range suggests you may benefit from a calmer wind-down routine or more consistent bedtimes for deeper rest. This is a general wellness insight, not a medical diagnosis.';
  } else if (deepSleepGap > 15) {
    status = 'insufficient';
    interpretation = 'Your estimated deep sleep comfort range suggests areas where lifestyle improvements may support deeper rest. This is a lifestyle assessment, not a medical evaluation.';
  } else if (deepSleepGap > 5) {
    status = 'adequate';
    interpretation = 'Your estimated deep sleep comfort range suggests a moderate lifestyle tendency. This is a personal insight, not a medical evaluation.';
  }

  const recommendations = [
    'You may consider maintaining a consistent sleep schedule (same bedtime and wake time) for general wellness support.',
    'You may consider avoiding alcohol and caffeine before bed for overall wellness.',
    'You may consider engaging in regular exercise, especially resistance training, for general wellness. Avoid intense exercise too close to bedtime.',
  ];
  if (status === 'insufficient' || status === 'deficient') {
    recommendations.push('You may consider ensuring adequate total sleep time (7-9 hours for adults) for general wellness support.');
  }
  if (values.recoveryNeeds >= 7) {
    recommendations.push('You may consider prioritizing sleep quality and stress management techniques for general wellness support. This is not medical advice.');
  }

  const plan = [
    { label: 'This Week', detail: 'Track deep sleep using a sleep tracker if available. Note patterns and identify factors that may affect deep sleep.' },
    { label: 'This Month', detail: 'Implement sleep hygiene improvements: consistent schedule, reduce alcohol/caffeine, optimize sleep environment, manage stress.' },
    { label: 'Ongoing', detail: 'Monitor deep sleep trends. If consistently low despite good sleep hygiene, consider consulting a sleep specialist to rule out sleep disorders.' },
  ];

  return { requiredDeepSleep, requiredDeepSleepPercent, currentDeepSleep, currentDeepSleepPercent, deepSleepGap, status, interpretation, recommendations, plan };
};

export default function DeepSleepRequirementEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      totalSleepHours: undefined,
      deepSleepMinutes: undefined,
      activityLevel: 'moderate',
      recoveryNeeds: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="deep-sleep-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Deep Sleep Comfort Range Estimator
          </CardTitle>
          <CardDescription>Estimate your deep sleep comfort range and wellness score based on age, sleep patterns, activity level, and recovery needs. This is a general wellness insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your sleep and recovery factors</CardTitle>
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
                        <Input type="number" step="1" placeholder="e.g., 40" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                  name="deepSleepMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deep sleep minutes (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="5" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity level</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value as 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active')}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="sedentary">Sedentary</option>
                          <option value="light">Light</option>
                          <option value="moderate">Moderate</option>
                          <option value="active">Active</option>
                          <option value="very-active">Very Active</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recoveryNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery needs (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate deep sleep needs
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
            <CardDescription>See required deep sleep, current deep sleep, gap, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Required deep sleep</p>
                <p className="text-2xl font-semibold text-primary">{result.requiredDeepSleep.toFixed(0)} min</p>
                <p className="text-xs text-muted-foreground">Per night</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current deep sleep</p>
                <p className="text-2xl font-semibold text-primary">{result.currentDeepSleep.toFixed(0)} min</p>
                <p className="text-xs text-muted-foreground">Per night</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Deep sleep gap</p>
                <p className="text-2xl font-semibold text-primary">{result.deepSleepGap >= 0 ? '+' : ''}{result.deepSleepGap.toFixed(0)} min</p>
                <p className="text-xs text-muted-foreground">Difference</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground mb-2">Required: {result.requiredDeepSleepPercent.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Current: {result.currentDeepSleepPercent.toFixed(1)}%</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Gap: {result.deepSleepGap >= 0 ? '+' : ''}{result.deepSleepGap.toFixed(0)} minutes</p>
                <p className="text-xs text-muted-foreground">Required - Current</p>
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
            <strong>Base deep sleep %</strong>: &lt;30 years: 20%, 30-60 years: 15%, 60+ years: 10%.
          </p>
          <p><strong>Required deep sleep %</strong> = base % × activity multiplier (1.0-1.2) × recovery multiplier (0.5-1.5), clamped to 10-25%.</p>
          <p><strong>Required deep sleep</strong> = total sleep hours × 60 × required % / 100.</p>
          <p><strong>Current deep sleep</strong> = provided deep sleep minutes, or estimated as base % × 0.8 (80% of optimal).</p>
          <p><strong>Deep sleep gap</strong> = required − current.</p>
          <p>Higher activity and recovery needs increase required deep sleep. Age decreases both required and actual deep sleep.</p>
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
                <p className="text-sm text-muted-foreground">Required %</p>
                <p className="text-xl font-semibold text-primary">
                  {result.requiredDeepSleepPercent.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Of total sleep</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current %</p>
                <p className="text-xl font-semibold text-primary">
                  {result.currentDeepSleepPercent.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Of total sleep</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Gap percentage</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.requiredDeepSleepPercent - result.currentDeepSleepPercent).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Points difference</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your sleep and recovery factors to see additional insights.</p>
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
          <p>Deep sleep (slow-wave sleep) is the most restorative sleep stage, essential for physical recovery, growth hormone release, and immune function. Adults typically need 13-23% of total sleep time in deep sleep.</p>
          <p>Use this calculator to estimate deep sleep requirements based on age, activity level, and recovery needs, and assess current deep sleep to identify gaps.</p>
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
          <p>This tool estimates deep sleep comfort range and wellness score from age, total sleep hours, deep sleep minutes (optional), activity level, and recovery needs.</p>
          <p>Outputs include required deep sleep, current deep sleep, deep sleep gap, status, recommendations, an action plan, and supporting metrics.</p>
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

