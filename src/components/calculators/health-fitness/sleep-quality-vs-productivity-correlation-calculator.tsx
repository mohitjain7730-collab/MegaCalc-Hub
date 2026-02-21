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
  sleepHours: z.number({ invalid_type_error: 'Enter sleep hours' }).min(4).max(12),
  sleepQuality: z.number({ invalid_type_error: 'Enter sleep quality' }).min(1).max(10),
  productivityScore: z.number({ invalid_type_error: 'Enter productivity score' }).min(1).max(10),
  focusLevel: z.number({ invalid_type_error: 'Enter focus level' }).min(1).max(10),
  energyLevel: z.number({ invalid_type_error: 'Enter energy level' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  correlationScore: number;
  sleepImpact: number;
  productivityGap: number;
  status: 'strong-link' | 'moderate-link' | 'weak-link';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Log average nightly sleep hours and rate sleep quality (1-10) over the past week.',
  'Rate your productivity (1-10), focus level (1-10), and energy level (1-10) for the same period.',
  'Review the correlation score and sleep impact on productivity metrics.',
  'Use the output to identify sleep patterns that may be limiting your performance.',
  'Adjust sleep duration, quality, or timing based on recommendations.',
];

const faqs = [
  {
    question: 'What does the correlation score represent?',
    answer:
      'It estimates how strongly sleep quality and duration correlate with your productivity, focus, and energy levels based on your inputs.',
  },
  {
    question: 'How much sleep do I need for optimal productivity?',
    answer:
      'Most adults need 7â€“9 hours of quality sleep. Individual needs vary, but consistently getting less than 6 hours typically reduces performance.',
  },
  {
    question: 'Does sleep quality matter more than duration?',
    answer:
      'Both matter. Quality sleep (deep, uninterrupted) can partially compensate for slightly shorter duration, but both are important.',
  },
  {
    question: 'Can I catch up on sleep over weekends?',
    answer:
      'Partial recovery is possible, but consistent daily sleep is better than weekend catch-up for sustained productivity.',
  },
  {
    question: 'How does sleep affect focus and energy?',
    answer:
      'Poor sleep reduces cognitive function, attention span, and physical energy. Even one night of poor sleep can impact next-day performance.',
  },
  {
    question: 'What if my productivity is high despite poor sleep?',
    answer:
      'Some people can function short-term on less sleep, but chronic sleep debt eventually catches up. Track trends over weeks, not single days.',
  },
  {
    question: 'Does timing matter (early vs late sleep)?',
    answer:
      'Yes. Aligning sleep with your natural circadian rhythm improves quality. Most people benefit from consistent bedtimes and wake times.',
  },
  {
    question: 'Can naps help productivity?',
    answer:
      'Short naps (10â€“30 minutes) can boost alertness, but they do not fully replace nighttime sleep for cognitive recovery.',
  },
  {
    question: 'What about caffeine to offset poor sleep?',
    answer:
      'Caffeine can mask sleepiness temporarily but does not restore cognitive function. It can also disrupt sleep if consumed too late.',
  },
  {
    question: 'How long does it take to see productivity improvements?',
    answer:
      'Most people notice better focus and energy within 1â€“2 weeks of improving sleep duration and quality consistently.',
  },
];

const relatedCalculators = [
  {
    name: 'Sleep Debt Calculator',
    slug: 'habit-streak-tracker-calculator',
    description: 'Quantify accumulated sleep debt and recovery needs.',
  },
  {
    name: 'Sleep Efficiency Calculator',
    slug: 'sleep-efficiency-calculator',
    description: 'Measure sleep efficiency and identify improvement areas.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Check cortisol and melatonin alignment for better sleep.',
  },
  {
    name: 'Caffeine Cutoff Sleep Impact Calculator',
    slug: 'caffeine-cutoff-sleep-impact-calculator',
    description: 'Plan caffeine timing to protect sleep quality.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/sleep-quality-vs-productivity-correlation-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Sleep Quality vs Productivity Correlation Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sleep Quality vs Productivity Correlation Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate correlation between sleep quality and productivity metrics to optimize performance.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const sleepScore = (values.sleepHours / 9 * 40) + (values.sleepQuality / 10 * 40); // 0-80 points
  const productivityScore = (values.productivityScore / 10 * 30) + (values.focusLevel / 10 * 20) + (values.energyLevel / 10 * 20); // 0-70 points
  const correlationScore = clamp((sleepScore * 0.6 + productivityScore * 0.4) * 1.2, 0, 100);
  const sleepImpact = clamp((sleepScore / 80) * 100, 0, 100);
  const productivityGap = clamp(70 - productivityScore, 0, 70);

  let status: ResultPayload['status'] = 'strong-link';
  let interpretation =
    'In this simple snapshot, your current sleep and productivity ratings tend to move together in a supportive way.';

  if (correlationScore < 60) {
    status = 'moderate-link';
    interpretation =
      'Here, sleep and productivity are somewhat related in your entries, and there may be room to gently explore how small sleep tweaks feel for your day.';
  }
  if (correlationScore < 40) {
    status = 'weak-link';
    interpretation =
      'This pattern suggests that, for now, other factors may be influencing how your days feel as much as, or more than, sleep itself.';
  }

  const recommendations = [
    'If it fits your life, you can gently experiment with getting closer to 7â€“9 hours of sleep and see how that affects your days.',
    'Keeping a fairly regular sleep and wake window often helps many people feel more settled and clear during the day.',
    'A simple, calming windâ€‘down routineâ€”such as dimmer lights, fewer screens, or quiet activitiesâ€”can make it easier to ease into sleep.',
  ];
  if (status === 'moderate-link') {
    recommendations.push('You might track your sleep and daytime experience for a couple of weeks to notice small patterns that feel worth exploring.');
  }
  if (status === 'weak-link') {
    recommendations.push('It may also be helpful to reflect on other piecesâ€”like stress, food, movement, or workloadâ€”that could be shaping how your days feel.');
  }

  const plan = [
    { label: 'This Week', detail: 'Notice your sleep and daily focus/energy scores without trying to change much yet.' },
    { label: 'Next 2 Weeks', detail: 'If youâ€™d like, try one gentle changeâ€”like a slightly earlier windâ€‘downâ€”and observe how your days feel.' },
    { label: 'Ongoing', detail: 'Over time, keep only the sleep habits that genuinely help you feel better, and let go of what feels forced.' },
  ];

  return { correlationScore, sleepImpact, productivityGap, status, interpretation, recommendations, plan };
};

export default function SleepQualityVsProductivityCorrelationCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sleepHours: undefined,
      sleepQuality: undefined,
      productivityScore: undefined,
      focusLevel: undefined,
      energyLevel: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="sleep-productivity-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Sleep Quality vs Productivity Correlation Calculator
          </CardTitle>
          <CardDescription>Estimate correlation between sleep quality and productivity metrics to optimize performance.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your sleep and productivity data</CardTitle>
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
                      <FormLabel>Average sleep hours</FormLabel>
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
                  name="productivityScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Productivity score (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="focusLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Focus level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate correlation
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
            <CardDescription>See correlation score, sleep impact, and productivity insights.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Correlation score</p>
                <p className="text-2xl font-semibold text-primary">{result.correlationScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">A 0â€“100 view of how closely these particular sleep and day ratings move together.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep impact</p>
                <p className="text-2xl font-semibold text-primary">{result.sleepImpact.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">A rough sense of how strong a role your sleep pattern might be playing in this snapshot.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Productivity gap</p>
                <p className="text-2xl font-semibold text-primary">{result.productivityGap.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">A simple indication of how much â€œheadroomâ€ you feel there might be in your current days.</p>
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
          <p><strong>Sleep score</strong> = (sleepHours / 9 Ã— 40) + (sleepQuality / 10 Ã— 40), max 80 points.</p>
          <p><strong>Productivity score</strong> = (productivityScore / 10 Ã— 30) + (focusLevel / 10 Ã— 20) + (energyLevel / 10 Ã— 20), max 70 points.</p>
          <p><strong>Correlation score</strong> = (sleepScore Ã— 0.6 + productivityScore Ã— 0.4) Ã— 1.2, clamped to 0-100.</p>
          <p>Higher sleep duration, quality, and productivity metrics increase the correlation score.</p>
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
                <p className="text-sm text-muted-foreground">Sleep adequacy</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().sleepHours ?? 0) >= 7 && (form.getValues().sleepHours ?? 0) <= 9 ? 'Optimal' : (form.getValues().sleepHours ?? 0) < 7 ? 'Insufficient' : 'Excessive')}
                </p>
                <p className="text-xs text-muted-foreground">Target: 7-9 hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Quality adequacy</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().sleepQuality ?? 0) >= 7 ? 'Good' : 'Needs improvement')}
                </p>
                <p className="text-xs text-muted-foreground">Target: 7-10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Productivity potential</p>
                <p className="text-xl font-semibold text-primary">
                  {(100 - result.productivityGap).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Current productivity level</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your sleep and productivity data to see additional metrics.</p>
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
                <Link href={`/health-fitness/${calc.slug}`} className="text-primary hover:underline">
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
          <p>Sleep quality and duration strongly correlate with productivity, focus, and energy levels. Most adults need 7â€“9 hours of quality sleep for optimal performance.</p>
          <p>Use this calculator to identify sleep patterns that may be limiting productivity and plan improvements.</p>
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
          <p>This tool offers a simple snapshot of how your own sleep ratings and daily productivity, focus, and energy scores relate in this model.</p>
          <p>You can use the outputs as gentle prompts for experimenting with sleep habits that feel realistic for you, alongside other life factors and any professional advice.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}

