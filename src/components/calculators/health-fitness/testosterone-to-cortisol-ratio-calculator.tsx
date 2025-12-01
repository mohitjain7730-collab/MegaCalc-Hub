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
  trainingLoad: z.number({ invalid_type_error: 'Enter recent training load' }).min(0).max(20),
  perceivedStress: z.number({ invalid_type_error: 'Enter how stressed you feel' }).min(0).max(10),
  sleepHours: z.number({ invalid_type_error: 'Enter average sleep hours' }).min(3).max(12),
  recoveryTime: z.number({ invalid_type_error: 'Enter daily wind‑down time' }).min(0).max(6),
  muscleTiredness: z.number({ invalid_type_error: 'Enter muscle tiredness level' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  ratioScore: number;
  balanceIndex: number;
  status: 'ease-leaning' | 'balanced-load' | 'strain-leaning';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Think about your typical week of movement, work, and general life load.',
  'Rate how intense your recent training or physical load has felt.',
  'Add a simple self-rating for stress, sleep, daily wind-down time, and how tired your muscles feel.',
  'Review a gentle balance index that blends “push” and “recovery” habits into one simple snapshot.',
  'Use the insights as a starting point for adjusting training, rest, and stress-support habits if you wish.',
];

const faqs = [
  {
    question: 'What does this training strain vs recovery index represent?',
    answer:
      'It blends simple self-ratings of training load, stress, sleep, wind-down time, and muscle tiredness into one number so you can reflect on how balanced your current season feels.',
  },
  {
    question: 'Is this checking my testosterone-to-cortisol ratio or hormone levels?',
    answer:
      'No. This tool does not measure or estimate actual hormone levels. It simply uses your answers about training, stress, and rest to create a lifestyle-pattern index inspired by the idea of balancing “push” and “recovery.”',
  },
  {
    question: 'Can this tell me if my hormones are normal or medically balanced?',
    answer:
      'No. Only lab testing and a qualified clinician can comment on hormone levels or balance. This tool is purely for personal reflection on habits, not for diagnosis or medical assessment.',
  },
  {
    question: 'Who might find this index helpful?',
    answer:
      'People who train, work, or parent a lot and want a quick, gentle snapshot of how their current mix of effort, rest, and stress-support habits feels right now.',
  },
  {
    question: 'What if my score looks more strain-leaning?',
    answer:
      'That can be a nudge to experiment with small changes, like extra rest, lighter sessions, or a bit more wind-down time. If you feel unwell or worried, it’s important to speak with a healthcare professional.',
  },
  {
    question: 'Do I need lab tests to use this tool?',
    answer:
      'No. This tool is intentionally based only on simple self-ratings so you can reflect on patterns without needing any laboratory measurements.',
  },
  {
    question: 'Will this tool change how I should train?',
    answer:
      'It doesn’t prescribe a program. It simply offers ideas you can try, alongside listening to your body, your schedule, and any guidance from a coach or clinician.',
  },
  {
    question: 'Can I use this instead of medical advice?',
    answer:
      'No. This is an educational wellness tool only. Always rely on qualified healthcare professionals for any concerns about hormones, fatigue, or health conditions.',
  },
  {
    question: 'How often can I check in with this index?',
    answer:
      'You can use it weekly, monthly, or whenever your routine changes to see how your answers shift over time and what feels most sustainable for you.',
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

const baseUrl = 'https://mycalculating.com/category/health-fitness/training-strain-vs-recovery-pattern-index';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Training Strain vs Recovery Pattern Index', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Training Strain vs Recovery Pattern Index',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Blend simple self-ratings of training load, stress, sleep, and recovery into a gentle index of how your current push-vs-rest pattern feels.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Simple push vs rest style index from lifestyle inputs only
  const loadScore = clamp((values.trainingLoad / 20) * 100, 0, 100);
  const stressScore = clamp((values.perceivedStress / 10) * 100, 0, 100);
  const sleepSupport = clamp(((values.sleepHours - 3) / 9) * 100, 0, 100);
  const recoverySupport = clamp((values.recoveryTime / 6) * 100, 0, 100);
  const muscleTired = clamp((values.muscleTiredness / 10) * 100, 0, 100);

  // Higher load + stress + tiredness increase "push"; sleep + recovery time increase "rest"
  const pushSide = (loadScore + stressScore + muscleTired) / 3;
  const restSide = (sleepSupport + recoverySupport) / 2;

  const rawIndex = clamp(50 + (pushSide - restSide) / 4, 0, 100);
  const ratioScore = rawIndex;
  const balanceIndex = rawIndex;

  let status: ResultPayload['status'] = 'balanced-load';
  let interpretation =
    'Your answers suggest a fairly balanced mix of effort and recovery right now, though only you can feel how sustainable it truly is.';

  if (rawIndex >= 70) {
    status = 'strain-leaning';
    interpretation =
      'This looks like a more “full” season with relatively more push than recovery; it may be worth exploring where small extra pockets of rest or support could fit.';
  } else if (rawIndex <= 40) {
    status = 'ease-leaning';
    interpretation =
      'Things currently lean more toward ease or lighter load; that can be a valuable season for rebuilding, recharging, or simply maintaining what feels good.';
  }

  const recommendations: string[] = [
    'Notice how your current mix of training, work, and life responsibilities actually feels in your body across a typical week.',
    'If you can, gently protect a few anchor habits—like a consistent bedtime or short wind-down—rather than trying to change everything at once.',
    'Consider chatting with a coach or professional if you are unsure how to balance training intensity with enough recovery time.',
  ];

  if (status === 'strain-leaning') {
    recommendations.push(
      'You might experiment with slightly lighter days, deload weeks, or extra rest blocks and see how your mood, sleep, and energy respond.'
    );
  }
  if (status === 'ease-leaning') {
    recommendations.push(
      'If it feels right, you could gently add small, enjoyable bits of movement or structure, noticing whether they support your overall energy.'
    );
  }

  const plan = [
    {
      label: 'This Week',
      detail:
        'Take a quick note each day on your stress, sleep, and muscle tiredness to see how they line up with your training or workload.',
    },
    {
      label: 'Next Month',
      detail:
        'Experiment with one or two small tweaks—like one extra early night, a lighter session, or a short walk break—and see which changes feel most supportive.',
    },
    {
      label: 'Ongoing',
      detail:
        'Revisit this index when your schedule, workload, or training block changes so you can keep adjusting toward a pattern that feels sustainable.',
    },
  ];

  return { ratioScore, balanceIndex, status, interpretation, recommendations, plan };
};

export default function TrainingStrainVsRecoveryPatternIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainingLoad: undefined,
      perceivedStress: undefined,
      sleepHours: undefined,
      recoveryTime: undefined,
      muscleTiredness: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="testosterone-cortisol-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Training Strain vs Recovery Pattern Index
          </CardTitle>
          <CardDescription>
            Explore a gentle wellness-style snapshot of how your current mix of training strain, stress, sleep, and recovery time feels right now.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Check in with your training and recovery habits</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="trainingLoad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training or activity load this week (0–20)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 10 for a pretty full week"
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
                  name="perceivedStress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How stressed have you felt lately? (0–10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="0 = very calm, 10 = maxed out"
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
                  name="sleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average sleep hours per night (3–12)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 7.5"
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
                  name="recoveryTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wind-down or recovery time most days (hours, 0–6)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="e.g., 1.5 hours of stretching, walks, or quiet time"
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
                  name="muscleTiredness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How tired or heavy do your muscles feel? (0–10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="0 = totally fresh, 10 = very wiped out"
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
                View pattern insight
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
            Pattern insight
            </CardTitle>
          <CardDescription>See a simple snapshot of how your current training, stress, and recovery mix might feel overall.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Pattern index</p>
                <p className="text-2xl font-semibold text-primary">{result.ratioScore.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">0–100 snapshot from this simple model.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Balance feel</p>
                <p className="text-2xl font-semibold text-primary">{result.balanceIndex.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Higher values lean toward a “fuller” push side.</p>
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
            How this index is put together
          </CardTitle>
        </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Load side</strong> mixes your training/activity load, how stressed you feel, and how tired your muscles feel into a simple “push”
              number.
            </p>
            <p>
              <strong>Recovery side</strong> blends your average sleep hours and daily wind-down or recovery time into a basic “rest and reset” number.
            </p>
            <p>
              <strong>Pattern index</strong> then gently compares these two sides and scales the result on a 0–100 line, where higher values lean more
              strain-leaning and lower values lean more ease-leaning.
            </p>
            <p>
              This is a rough wellness-style framework only—it is not measuring hormones, injury risk, or any medical condition.
            </p>
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
          <CardTitle>Additional pattern details</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Training or activity load</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().trainingLoad ?? 0).toFixed(0)} / 20
                </p>
                <p className="text-xs text-muted-foreground">Self-rated for this recent period</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Average sleep</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().sleepHours ?? 0).toFixed(1)} hours
                </p>
                <p className="text-xs text-muted-foreground">Rough nightly average</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Overall feel</p>
                <p className="text-xl font-semibold text-primary">
                  {result.status === 'strain-leaning'
                    ? 'More strain-leaning'
                    : result.status === 'ease-leaning'
                    ? 'More ease-leaning'
                    : 'Somewhere in the middle'}
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
          <p>
            This tool offers a gentle snapshot of how your current mix of training, life load, stress, sleep, and recovery time might feel overall, using only
            your own simple self-ratings.
          </p>
          <p>
            The index is not a hormone measure or performance test; it is simply a way to notice patterns over time and spark small, sustainable adjustments to
            your habits if you choose.
          </p>
          <p>
            If you are ever concerned about fatigue, pain, mood, or possible hormonal issues, it is important to talk with a qualified healthcare professional
            rather than relying on any online tool.
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
          <p>
            This tool combines self-rated training load, stress, sleep, recovery time, and muscle tiredness into a simple pattern index of how “full” your
            current season feels.
          </p>
          <p>
            The numbers and labels are meant to support reflection and gentle habit experiments, not to diagnose any condition or judge how you are doing.
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It does not measure hormones, diagnose any
        condition, or replace personalized training or medical advice. For concerns about your health, hormones, or training load, please consult a qualified
        professional.
      </p>
    </div>
  );
}

