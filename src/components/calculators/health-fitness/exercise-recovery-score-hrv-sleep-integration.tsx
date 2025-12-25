'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HeartPulse, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  hrvMs: z.number({ invalid_type_error: 'Enter HRV' }).min(20).max(200),
  sleepHours: z.number({ invalid_type_error: 'Enter sleep hours' }).min(4).max(12),
  sleepQuality: z.number({ invalid_type_error: 'Enter sleep quality' }).min(1).max(10),
  trainingLoad: z.number({ invalid_type_error: 'Enter training load' }).min(1).max(10),
  stressLevel: z.number({ invalid_type_error: 'Enter stress level' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  recoveryScore: number;
  hrvStatus: number;
  readinessLevel: 'ready' | 'moderate' | 'rest-needed';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Measure your HRV (heart rate variability) in milliseconds using a wearable or app.',
  'Log average nightly sleep hours and rate sleep quality (1-10) over the past few days.',
  'Rate your recent training load (1-10) and current stress level (1-10).',
  'Review the recovery score and readiness level to guide training decisions.',
  'Use the output to adjust training intensity, rest days, or recovery strategies.',
];

const faqs = [
  {
    question: 'What is HRV and why does it matter?',
    answer:
      'Heart rate variability measures variation between heartbeats. Higher HRV generally indicates better recovery and readiness for training.',
  },
  {
    question: 'How do I measure HRV?',
    answer:
      'Use a chest strap, smartwatch, or HRV app. Measure in the morning after waking, before activity, for most consistent readings.',
  },
  {
    question: 'What is a good HRV range?',
    answer:
      'HRV varies widely by individual (20–200+ ms). Track your baseline and trends rather than comparing to others. Higher relative to your baseline is better.',
  },
  {
    question: 'How does sleep affect recovery?',
    answer:
      'Sleep is critical for recovery. Poor sleep (duration or quality) reduces HRV, impairs muscle repair, and limits readiness for intense training.',
  },
  {
    question: 'Can I train if recovery score is low?',
    answer:
      'Low recovery suggests light activity or rest. Pushing through can increase injury risk and delay recovery. Adjust intensity or take a rest day.',
  },
  {
    question: 'How often should I check recovery?',
    answer:
      'Daily morning checks provide the most useful data. Track trends over weeks to identify patterns and optimize training schedules.',
  },
  {
    question: 'Does stress affect HRV?',
    answer:
      'Yes. Physical, mental, and emotional stress can lower HRV. Managing stress through rest, meditation, or light movement supports recovery.',
  },
  {
    question: 'What if HRV drops after training?',
    answer:
      'Temporary drops are normal after intense sessions. Persistent low HRV suggests overreaching or insufficient recovery. Reduce training load.',
  },
  {
    question: 'Can I improve HRV?',
    answer:
      'Yes. Consistent sleep, stress management, proper nutrition, and appropriate training load can improve HRV over time.',
  },
  {
    question: 'Should I use HRV for every workout?',
    answer:
      'Not necessary for every session, but regular monitoring (daily or 3–4x/week) helps optimize training and prevent overtraining.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Quality vs Productivity Correlation Calculator',
    slug: 'sleep-quality-vs-productivity-correlation-calculator',
    description: 'Track sleep impact on daily performance.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Monitor cortisol and melatonin for recovery.',
  },
  {
    name: 'Training Stress Score Calculator',
    slug: 'running-pace-calculator',
    description: 'Quantify training load alongside recovery metrics.',
  },
  {
    name: 'Recovery Heart Rate Calculator',
    slug: 'target-heart-rate-calculator',
    description: 'Measure heart rate recovery after exercise.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/exercise-recovery-score-hrv-sleep-integration';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Exercise Recovery Score (HRV + Sleep Integration)', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Exercise Recovery Score (HRV + Sleep Integration)',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate recovery score and readiness level from HRV, sleep, training load, and stress.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Normalize HRV (assuming baseline around 50-60ms, good around 70-100ms+)
  const hrvScore = clamp((values.hrvMs - 30) / 100 * 40, 0, 40); // 0-40 points
  const sleepScore = clamp((values.sleepHours / 9 * 25) + (values.sleepQuality / 10 * 20), 0, 45); // 0-45 points
  const trainingPenalty = clamp((values.trainingLoad - 5) / 5 * 10, -10, 10); // -10 to +10 points
  const stressPenalty = clamp((values.stressLevel - 3) / 7 * 15, 0, 15); // 0-15 penalty
  const recoveryScore = clamp(hrvScore + sleepScore - trainingPenalty - stressPenalty, 0, 100);
  const hrvStatus = clamp((values.hrvMs / 100) * 100, 0, 100);

  let readinessLevel: ResultPayload['readinessLevel'] = 'ready';
  let interpretation =
    'In this snapshot, your HRV, sleep, training, and stress entries together suggest your body may feel reasonably supported for your usual movement.';

  if (recoveryScore < 60) {
    readinessLevel = 'moderate';
    interpretation =
      'Recovery looks somewhat in-between right now. You might find it helpful to lean toward gentler training, active recovery, or a flexible plan today.';
  }
  if (recoveryScore < 40) {
    readinessLevel = 'rest-needed';
    interpretation =
      'This pattern hints that extra rest and lighter movement could feel kinder to your body today. You can always adjust training to match how you actually feel.';
  }

  const recommendations = [
    'If you use HRV, taking readings at similar times (for example, in the morning) can make trends easier to notice.',
    'Gently moving toward 7–9 hours of sleep, when realistic, can support how recovered you feel from training.',
    'You can let the score nudge you toward lighter or heavier days, while still prioritizing how your body actually feels over any single number.',
  ];
  if (readinessLevel === 'moderate') {
    recommendations.push('On “in‑between” days, many people find that light activity, stretching, or easy movement feels better than pushing hard.');
  }
  if (readinessLevel === 'rest-needed') {
    recommendations.push('When you feel run down, a softer day—rest, gentle walks, or calm routines—can be a helpful experiment if it fits your life.');
  }

  const plan = [
    { label: 'Today', detail: 'Notice your HRV, sleep, and how your body actually feels, and shape your movement plan around that combination.' },
    { label: 'This Week', detail: 'Keep an eye on how different types of days (busy vs. calm, hard vs. easy sessions) seem to show up in your scores and your body.' },
    { label: 'Ongoing', detail: 'Over time, keep only the training and recovery rhythms that help you feel more steady and energized overall.' },
  ];

  return { recoveryScore, hrvStatus, readinessLevel, interpretation, recommendations, plan };
};

export default function ExerciseRecoveryScoreHRVSleepIntegration() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hrvMs: undefined,
      sleepHours: undefined,
      sleepQuality: undefined,
      trainingLoad: undefined,
      stressLevel: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="exercise-recovery-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Exercise Recovery Score (HRV + Sleep Integration)
          </CardTitle>
          <CardDescription>Estimate recovery score and readiness level from HRV, sleep, training load, and stress.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your recovery metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hrvMs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HRV (milliseconds)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 65" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Sleep hours</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.25" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                <FormField
                  control={form.control}
                  name="trainingLoad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training load (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate recovery score
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
            <CardDescription>See recovery score, HRV status, and readiness level.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery score</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">A 0–100 snapshot of how this model views your current recovery inputs.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">HRV status</p>
                <p className="text-2xl font-semibold text-primary">{result.hrvStatus.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">A simple, normalized view of the HRV value you entered.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Readiness</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.readinessLevel.replace('-', ' ')}</p>
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
          <p><strong>HRV score</strong> = (HRV − 30) / 100 × 40, clamped to 0-40 points.</p>
          <p><strong>Sleep score</strong> = (sleepHours / 9 × 25) + (sleepQuality / 10 × 20), clamped to 0-45 points.</p>
          <p><strong>Recovery score</strong> = HRV score + sleep score − training penalty − stress penalty, clamped to 0-100.</p>
          <p>Higher HRV, better sleep, appropriate training load, and lower stress increase recovery score.</p>
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
                <p className="text-sm text-muted-foreground">Sleep support</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().sleepHours ?? 0) >= 7 && (form.getValues().sleepQuality ?? 0) >= 7 ? 'Good' : 'Needs improvement')}
                </p>
                <p className="text-xs text-muted-foreground">Target: 7-9 hrs, quality 7+</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Training balance</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().trainingLoad ?? 0) <= 7 ? 'Appropriate' : 'High')}
                </p>
                <p className="text-xs text-muted-foreground">Consider recovery needs</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stress impact</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().stressLevel ?? 0) <= 5 ? 'Low' : 'High')}
                </p>
                <p className="text-xs text-muted-foreground">Target: ≤5 for recovery</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your recovery metrics to see additional insights.</p>
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
          <p>Recovery from exercise depends on HRV, sleep quality/duration, training load, and stress. Higher HRV and better sleep support readiness for training.</p>
          <p>Use this calculator to assess daily recovery and adjust training intensity based on readiness level.</p>
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
          <p>This tool brings together HRV, sleep, training load, and stress into one simple recovery snapshot within this model.</p>
          <p>You can treat the scores and labels as gentle prompts for adjusting training and rest in ways that feel kind to your body, alongside professional guidance if needed.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}

