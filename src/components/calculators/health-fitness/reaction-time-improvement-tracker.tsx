'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TimerReset, Zap, Target, ActivitySquare, ShieldCheck } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  baselineMs: z.number({ invalid_type_error: 'Enter baseline reaction time' }).min(50).max(1000),
  latestMs: z.number({ invalid_type_error: 'Enter latest reaction time' }).min(50).max(1000),
  sessionsPerWeek: z.number({ invalid_type_error: 'Enter sessions per week' }).min(0).max(14),
  sleepHours: z.number({ invalid_type_error: 'Enter average sleep' }).min(4).max(10),
  caffeineCups: z.number({ invalid_type_error: 'Enter cups per day' }).min(0).max(8),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  improvementPct: number;
  consistencyScore: number;
  status: 'on-track' | 'stalled' | 'regressing';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Record baseline reaction time from a consistent test (same device, lighting, and time of day).',
  'Log your latest average after training or focus cycles.',
  'Count focused reaction-drill sessions you perform each week.',
  'Track average nightly sleep and caffeinated drinks to gauge recovery.',
  'Review the output and adjust drills, recovery, or habits for the next block.',
];

const faqs = [
  { question: 'What counts as a reaction drill?', answer: 'Aim trainers, ball-drop catches, sprint starts, racquet feeds, or light/sound response apps.' },
  { question: 'How often should I retest?', answer: 'Weekly or biweekly provides clean trend data without day-to-day noise.' },
  { question: 'Do I need special hardware?', answer: 'No—consistency matters more than equipment. Just log which tool you used.' },
  { question: 'How much improvement is realistic?', answer: '5–10% faster in 4–6 weeks is excellent for most people.' },
  { question: 'Why include sleep and caffeine?', answer: 'Reaction speed is tightly tied to recovery quality and stimulant timing.' },
  { question: 'Can I use this for esports training?', answer: 'Absolutely. Track aim-trainer scores or custom reaction tests the same way athletes track sprints.' },
  { question: 'Should I test dominant and non-dominant sides?', answer: 'If your sport uses both, track the slower side to keep training priorities clear.' },
  { question: 'What if I regress?', answer: 'Take a deload, improve sleep, or switch drill stimuli; the tool will highlight when adjustments are needed.' },
  { question: 'Does hydration matter?', answer: 'Yes. Pair this with a hydration calculator to keep cognitive speed sharp.' },
  { question: 'Can mindfulness help?', answer: 'Definitely—calmer nervous systems react faster. See the meditation streak tracker for ideas.' },
];

const relatedCalculators = [
  { name: 'Cognitive Focus Efficiency Calculator', slug: 'cognitive-focus-efficiency-calculator', description: 'Check whether your planning habits support deep focus.' },
  { name: 'Mental Fatigue Index Calculator', slug: 'mental-fatigue-index-calculator', description: 'Monitor cognitive load so fatigue doesn’t slow responses.' },
  { name: 'Meditation Streak Mindfulness Tracker', slug: 'meditation-streak-mindfulness-progress-tracker', description: 'Layer mindfulness for calmer, faster reactions.' },
  { name: 'Stress Hormone Balance Calculator', slug: 'stress-hormone-balance-calculator', description: 'See how cortisol vs melatonin balance affects alertness.' },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/reaction-time-improvement-tracker';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Reaction Time Improvement Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Reaction Time Improvement Tracker',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate reaction-time improvements, training consistency, and action steps.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const improvementPct = ((values.baselineMs - values.latestMs) / values.baselineMs) * 100;
  const sleepScore = clamp(((values.sleepHours - 6) / 2) * 20, -20, 20);
  const practiceScore = clamp(values.sessionsPerWeek * 5, 0, 40);
  const caffeinePenalty = clamp(values.caffeineCups * 3, 0, 30);
  const consistencyScore = clamp(60 + sleepScore + practiceScore - caffeinePenalty, 0, 100);

  let status: ResultPayload['status'] = 'on-track';
  let interpretation =
    'Your entries point to a generally positive pattern in your reaction practice and everyday habits. You can keep building on what already feels supportive.';

  if (improvementPct < 1) {
    status = 'stalled';
    interpretation =
      'Your numbers look fairly steady right now. You might experiment with small tweaks to drills, sleep, or caffeine timing and see how that feels over time.';
  }
  if (improvementPct < 0) {
    status = 'regressing';
    interpretation =
      'This result suggests your recent test came out a bit slower. It can help to look at things like tiredness, stress, or test setup and gently adjust if you wish.';
  }

  const recommendations = [
    'A brief warm‑up with light movement before you test can make sessions feel smoother and more comfortable.',
    'Noting the testing context (device, time of day, environment) makes it easier to compare sessions in a like‑for‑like way.',
    'Many people find reaction drills feel better when done at a time of day they naturally feel more alert.',
  ];
  if (status === 'stalled') {
    recommendations.push('You could gently vary your drills—for example, mixing in different visual or sound cues—to keep practice interesting.');
  }
  if (status === 'regressing') {
    recommendations.push('If life allows, you might try an easier week, slightly earlier caffeine cut‑offs, or a bit more sleep before your next test.');
  }

  const plan = [
    { label: 'Gentle start', detail: 'A few minutes of breathing, stretching, or easy drills can help you ease into practice days.' },
    { label: 'Midweek check‑in', detail: 'Glance at how your sleep, stress, and practice times have felt and make small adjustments if you’d like.' },
    { label: 'Weekly reflection', detail: 'Compare your recent tests with your baseline and choose one simple experiment for the next week.' },
  ];

  return { improvementPct, consistencyScore, status, interpretation, recommendations, plan };
};

export default function ReactionTimeImprovementTracker() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baselineMs: undefined,
      latestMs: undefined,
      sessionsPerWeek: undefined,
      sleepHours: undefined,
      caffeineCups: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="reaction-time-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TimerReset className="h-5 w-5" />
            Reaction Time Improvement Tracker
          </CardTitle>
          <CardDescription>Measure improvement percentage, consistency score, and habit gaps instantly.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="baselineMs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baseline reaction time (ms)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 320" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="latestMs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latest reaction time (ms)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 285" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sessionsPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reaction sessions per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Average sleep per night (hrs)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.25" placeholder="e.g., 7.2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caffeineCups"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caffeinated drinks per day</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 2.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate improvement
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
              Interactive result & interpretation
            </CardTitle>
            <CardDescription>Track progress plus the patterns driving it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Improvement</p>
                <p className="text-2xl font-semibold text-primary">{result.improvementPct.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">This compares your latest entry with your starting point for a simple progress snapshot.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Consistency score</p>
                <p className="text-2xl font-semibold text-primary">{result.consistencyScore}</p>
                <p className="text-xs text-muted-foreground">A blend of sleep, practice frequency, and caffeine habits, viewed as a general pattern.</p>
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
                    <ActivitySquare className="h-4 w-4" />
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
            <ShieldCheck className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Improvement %</strong> = ((baseline − latest) ÷ baseline) × 100</p>
          <p><strong>Consistency score</strong> = clamp(60 + sleepScore + practiceScore − caffeinePenalty)</p>
          <p>sleepScore = ((sleep − 6) ÷ 2) × 20 · practiceScore = sessions × 5 · caffeinePenalty = cups × 3</p>
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
                <p className="text-sm text-muted-foreground">Sessions gap</p>
                <p className="text-xl font-semibold text-primary">
                  {(Math.max(0, 5 - (form.getValues().sessionsPerWeek ?? 0))).toFixed(1)} sessions
                </p>
                <p className="text-xs text-muted-foreground">Aim for ~5 focused sessions weekly.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep delta</p>
                <p className="text-xl font-semibold text-primary">
                  {((form.getValues().sleepHours ?? 0) - 7.5).toFixed(1)} hrs
                </p>
                <p className="text-xs text-muted-foreground">Positive = surplus sleep vs 7.5-hr goal.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Caffeine load</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().caffeineCups ?? 0) * 3} penalty pts
                </p>
                <p className="text-xs text-muted-foreground">Keep penalty ≤9 pts for best sleep.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your data to unlock session, sleep, and caffeine insights.</p>
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
          <p>Reaction time gains require consistent testing, plenty of sleep, and mindful caffeine habits. This tool provides the feedback loop.</p>
          <p>Pair it with mindfulness, strength, and hydration strategies for long-term neural speed.</p>
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
            <ShieldCheck className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tracker blends your reaction‑time entries with sleep, practice, and caffeine habits to give a simple view of how your routine feels over time.</p>
          <p>You can treat the results as gentle guidance for experimenting with practice structure and daily rhythms that feel sustainable and supportive.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}


