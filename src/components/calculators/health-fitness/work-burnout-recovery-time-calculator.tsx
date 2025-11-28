'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HeartPulse, Target, Activity, Shield, BookMarked, CalendarHeart } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  weeklyHours: z.number({ invalid_type_error: 'Enter weekly work hours' }).min(10).max(90),
  stressScore: z.number({ invalid_type_error: 'Enter stress rating' }).min(1).max(10),
  sleepDebtHours: z.number({ invalid_type_error: 'Enter sleep debt hours' }).min(0).max(30),
  daysOffPlanned: z.number({ invalid_type_error: 'Enter upcoming full days off' }).min(0).max(30),
  supportScore: z.number({ invalid_type_error: 'Enter support score' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  recoveryDays: number;
  burnoutLevel: 'low' | 'moderate' | 'high';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Estimate your average weekly work hours over the last 1–3 months.',
  'Rate your perceived work stress on a 1–10 scale.',
  'Calculate approximate sleep debt by comparing actual vs ideal sleep over the past week.',
  'Enter how many full days off (with minimal work) you have planned in the next month.',
  'Rate how supported you feel at work and outside (1–10), then review recovery time estimates.',
];

const faqs = [
  {
    question: 'What does “burnout” mean in this tool?',
    answer:
      'Here, burnout refers to sustained emotional exhaustion, cynicism, and reduced sense of effectiveness related to work demands.',
  },
  {
    question: 'Is this a diagnostic burnout scale?',
    answer:
      'No. It is a heuristic estimator that blends workload, stress, sleep, time-off, and support to suggest recovery timelines.',
  },
  {
    question: 'Why focus on days off?',
    answer:
      'Deep recovery requires actual off-duty time where you can rest and replenish, not just shorter evenings after long days.',
  },
  {
    question: 'Can this replace professional advice?',
    answer:
      'No. Use it as a planning and reflection aid. Occupational health or mental health professionals can provide personalized guidance.',
  },
  {
    question: 'What if taking time off is not possible right now?',
    answer:
      'Even micro-breaks, task renegotiation, and stronger boundaries can help while you plan for fuller recovery later.',
  },
  {
    question: 'Does exercise speed up recovery?',
    answer:
      'Gentle, enjoyable movement can help, especially when it supports sleep and mood, but overtraining can backfire if you are already exhausted.',
  },
  {
    question: 'How does support score affect results?',
    answer:
      'Higher emotional and practical support usually shortens recovery time. Lower support extends it in this model.',
  },
  {
    question: 'Can I use this with my manager or HR?',
    answer:
      'Yes. Sharing blunt workload and recovery estimates can spark more realistic planning conversations.',
  },
  {
    question: 'How often should I recalculate?',
    answer:
      'Weekly or at the end of intense project phases works well. Compare trends rather than fixating on a single number.',
  },
  {
    question: 'What if I already feel emotionally numb?',
    answer:
      'That can be a sign of advanced burnout or depression. Consider professional help and urgent workload changes.',
  },
];

const relatedCalculators = [
  {
    name: 'Stress Level Self-Assessment Calculator',
    slug: 'stress-level-self-assessment-calculator',
    description: 'Gauge your general stress load alongside burnout.',
  },
  {
    name: 'Work-Life Balance Time Allocation Calculator',
    slug: 'work-life-balance-time-allocation-calculator',
    description: 'Visualize how your weekly hours split across work, rest, and play.',
  },
  {
    name: 'Sleep Debt Calculator',
    slug: 'sleep-debt-calculator-hf',
    description: 'Quantify lost sleep contributing to burnout.',
  },
  {
    name: 'Emotional Wellbeing Index Calculator',
    slug: 'emotional-wellbeing-index-calculator',
    description: 'Check the wider emotional impact of your workload.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/work-burnout-recovery-time-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Work Burnout Recovery Time Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Work Burnout Recovery Time Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate decompression time from work burnout using workload, stress, sleep debt, time off, and support.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const workloadFactor = (values.weeklyHours - 35) * 0.8;
  const stressFactor = values.stressScore * 2.5;
  const sleepDebtFactor = values.sleepDebtHours * 0.8;
  const timeOffBuffer = values.daysOffPlanned * 1.2;
  const supportBuffer = (values.supportScore - 5) * 1.5;

  const rawRecoveryDays = workloadFactor + stressFactor + sleepDebtFactor - timeOffBuffer - supportBuffer + 7;
  const recoveryDays = Math.max(3, Math.round(clamp(rawRecoveryDays, 3, 60)));

  let burnoutLevel: ResultPayload['burnoutLevel'] = 'low';
  let interpretation = 'Current pattern suggests low burnout risk with relatively short recovery needs.';

  if (recoveryDays >= 14 && recoveryDays < 30) {
    burnoutLevel = 'moderate';
    interpretation = 'Signs point to moderate burnout—planned decompression and boundary resets will be important.';
  }
  if (recoveryDays >= 30) {
    burnoutLevel = 'high';
    interpretation =
      'High burnout risk. Extended recovery time, workload redesign, and professional support may be necessary.';
  }

  const recommendations = [
    'Block at least one uninterrupted recovery evening per week with no work communication.',
    'Add brief movement, hydration, and sunlight breaks during long stretches of focus.',
    'Clarify “must-do” vs “nice-to-do” tasks with your manager or stakeholders.',
  ];

  if (burnoutLevel !== 'low') {
    recommendations.push('Explore options for redistributing workload, extending timelines, or rotating responsibilities.');
  }
  if (values.sleepDebtHours > 10) {
    recommendations.push('Prioritize sleep debt repayment with earlier bedtimes and tech-free wind-down routines.');
  }

  const plan = [
    { label: 'Next 72 hours', detail: 'Schedule at least one full off-duty block and one honest workload conversation.' },
    {
      label: 'Next 2 weeks',
      detail: 'Implement small boundary changes (no late emails, clearer stop times) and track how you feel.',
    },
    {
      label: 'Next 1–3 months',
      detail: 'Monitor burnout score after major deadlines and adjust work design with leadership where possible.',
    },
  ];

  return { recoveryDays, burnoutLevel, interpretation, recommendations, plan };
};

export default function WorkBurnoutRecoveryTimeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weeklyHours: undefined,
      stressScore: undefined,
      sleepDebtHours: undefined,
      daysOffPlanned: undefined,
      supportScore: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="work-burnout-recovery-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Work Burnout Recovery Time Calculator
          </CardTitle>
          <CardDescription>Estimate how long your body and mind may need to decompress from current workload.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your workload snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weeklyHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average weekly work hours</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 50"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stressScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work stress (1–10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 8"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sleepDebtHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep debt last 7 days (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 9"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="daysOffPlanned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full days off planned (next 30 days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 4"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supportScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support level (1–10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 6"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate recovery time
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-primary" />
              Interactive result & interpretation
            </CardTitle>
            <CardDescription>Translate your workload snapshot into recovery time and burnout level.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Estimated recovery time</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryDays} days</p>
                <p className="text-xs text-muted-foreground">Assuming meaningful changes and protected rest.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Burnout level</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.burnoutLevel}</p>
                <p className="text-xs text-muted-foreground">Based on workload, stress, sleep, and support.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Summary</p>
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
            <strong>Recovery time</strong> ≈ clamp\((weeklyHours − 35) × 0.8 + stress × 2.5 + sleepDebt × 0.8 − daysOff × 1.2 − (support −
            5) × 1.5 + 7\) into a 3–60 day window.
          </p>
          <p>Higher workload, stress, and sleep debt extend recovery, while more days off and stronger support shorten it.</p>
          <p>This is an estimation framework, not a promise—use it for planning and negotiation, not as medical advice.</p>
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
                <p className="text-sm text-muted-foreground">Hours above 40</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.max(0, (form.getValues().weeklyHours ?? 0) - 40)}
                </p>
                <p className="text-xs text-muted-foreground">Extra weekly load compared to a 40-hour baseline.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep debt per day</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().sleepDebtHours ?? 0) / 7).toFixed(1)} h
                </p>
                <p className="text-xs text-muted-foreground">Average deficit relative to your target sleep.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Time-off coverage</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().daysOffPlanned ?? 0) >= 4 ? 'Reasonable' : 'Tight'}
                </p>
                <p className="text-xs text-muted-foreground">Compare planned days off to the suggested recovery window.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Fill in your snapshot to see deeper burnout context metrics.</p>
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
          <p>Burnout builds slowly when recovery never quite catches up with demand.</p>
          <p>
            Use this calculator to make invisible load more visible, advocate for humane pacing, and protect your long-term capacity—not
            just short-term output.
          </p>
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
          <p>This Work Burnout Recovery Time Calculator turns your workload snapshot into an estimated decompression window.</p>
          <p>It blends hours, stress, sleep debt, time off, and support into a single burnout level and recovery estimate.</p>
          <p>Use it to advocate for sustainable pacing and to spark honest conversations about workload, not as a medical verdict.</p>
        </CardContent>
      </Card>
    </div>
  );
}


