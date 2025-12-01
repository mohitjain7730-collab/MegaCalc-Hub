'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Target, Compass, Clock8, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  plannedTasks: z.number({ invalid_type_error: 'Enter number of tasks' }).min(1).max(20),
  completedTasks: z.number({ invalid_type_error: 'Enter number of tasks' }).min(0).max(20),
  majorDistractions: z.number({ invalid_type_error: 'Enter interruptions' }).min(0).max(40),
  flowMinutes: z.number({ invalid_type_error: 'Enter minutes' }).min(0).max(360),
  multitaskPercent: z.number({ invalid_type_error: 'Enter percent' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  efficiencyScore: number;
  completionRate: number;
  flowConsistency: number;
  state: 'focused' | 'fragile' | 'fragmented';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'List how many meaningful tasks you planned today (no micro tasks).',
  'Log how many you actually finished or advanced substantially.',
  'Count major distractions (Slack fire drills, unexpected calls, urgent requests).',
  'Track flow minutes—time you felt immersed and productive.',
  'Estimate the percentage of time you were multitasking or context switching.',
  'Use the output to tighten boundaries and improve tomorrow’s game plan.',
];

const faqs = [
  {
    question: 'What is the Cognitive Focus Efficiency score?',
    answer: 'It blends task completion, flow time, distractions, and multitasking to show how efficiently you convert time into meaningful output.',
  },
  {
    question: 'How accurate is “flow minutes”?',
    answer: 'It’s subjective. Use journaling, wearable focus modes, or apps like RescueTime to refine the estimate.',
  },
  {
    question: 'Can I include meetings as tasks?',
    answer: 'Only if they directly advance your goals. Otherwise treat them as constraints when interpreting the score.',
  },
  {
    question: 'How often should I run this?',
    answer: 'Daily during sprints or once per week to ensure your systems support deep work.',
  },
  {
    question: 'What if I overplan tasks?',
    answer: 'The completion rate will dip, revealing an opportunity to plan fewer but bigger outcomes.',
  },
  {
    question: 'Does multitasking ever help?',
    answer: 'Rarely. This tool penalizes multitasking to nudge single-tasking, especially for creative work.',
  },
  {
    question: 'How can I raise flow minutes?',
    answer: 'Protect a 90-minute block with notifications off, full-screen apps, and a clear objective.',
  },
  {
    question: 'Is a high score sustainable?',
    answer: 'Yes if you also monitor the Mental Fatigue Index and recovery habits so you don’t overextend.',
  },
  {
    question: 'What’s a good benchmark?',
    answer: 'Scores ≥70 signal strong focus. 50–69 is fragile—tighten boundaries. Under 50 indicates fragmentation.',
  },
  {
    question: 'Can teams use this?',
    answer: 'Absolutely—compare averages to identify process bottlenecks or meeting overload.',
  },
];

const relatedCalculators = [
  { name: 'Mental Fatigue Index Calculator', slug: 'mental-fatigue-index-calculator', description: 'Pair fatigue insights with focus efficiency.' },
  { name: 'Habit Streak Tracker Calculator', slug: 'habit-streak-tracker-calculator', description: 'Keep daily focus rituals consistent.' },
  { name: 'Screen Time vs Sleep Impact Calculator', slug: 'screen-time-vs-sleep-impact-calculator', description: 'See how evening screens affect next-day focus.' },
  { name: 'Caffeine Cutoff Sleep Impact Calculator', slug: 'caffeine-cutoff-sleep-impact-calculator', description: 'Dial in stimulant timing to boost next-day clarity.' },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/cognitive-focus-efficiency-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Cognitive Focus Efficiency Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Cognitive Focus Efficiency Calculator',
      description: 'Measure how well you convert planned tasks and flow minutes into meaningful output.',
      author: { '@type': 'Organization', name: 'Mycalculating.com' },
      publisher: { '@type': 'Organization', name: 'Mycalculating.com' },
      url: baseUrl,
      mainEntityOfPage: baseUrl,
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Cognitive Focus Efficiency Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: ['Efficiency score', 'Flow consistency', 'Action plan'],
      url: baseUrl,
      description: 'Blend tasks, distractions, flow, and multitasking into a single focus efficiency metric.',
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const completionRate = clamp(Math.round((values.completedTasks / values.plannedTasks) * 100), 0, 150);
  const distractionPenalty = values.majorDistractions * 2 + values.multitaskPercent * 0.6;
  const flowBonus = values.flowMinutes / 2;
  const rawScore = completionRate + flowBonus - distractionPenalty;
  const efficiencyScore = clamp(Math.round(rawScore / 1.2), 0, 100);
  const flowConsistency = clamp(Math.round((values.flowMinutes / (values.plannedTasks * 30)) * 100), 0, 120);

  let state: ResultPayload['state'] = 'focused';
  let interpretation =
    'Your entries suggest today’s focus and follow-through felt relatively smooth overall. You can keep leaning on the habits that supported that.';

  if (efficiencyScore < 70) {
    state = 'fragile';
    interpretation =
      'You’re getting meaningful things done, and there also seems to be room to soften interruptions or multitasking a bit.';
  }
  if (efficiencyScore < 50) {
    state = 'fragmented';
    interpretation =
      'The pattern you entered looks quite scattered today. It may help to experiment with fewer priorities or gentler boundaries around focus time.';
  }

  const recommendations = [
    'Try choosing a small number of “nice-to-finish” tasks so your day feels more realistic and spacious.',
    'When possible, soften non‑essential notifications during focus moments so you can stay with one thing at a time.',
    'Noting distractions as they happen can gently highlight patterns you might want to adjust later.',
  ];
  if (state === 'fragile') {
    recommendations.push('You might experiment with turning one recurring meeting or check‑in into a written update instead.');
  }
  if (state === 'fragmented') {
    recommendations.push('A short weekly review to look at commitments and pick one simple guiding priority can make future days feel lighter.');
  }

  const plan = [
    { label: 'Pre-focus moment', detail: 'Take a few minutes to outline what would feel good to complete and gently tidy your workspace or tabs.' },
    { label: 'Midday check‑in', detail: 'Pause around the middle of the day to notice what helped or pulled your attention away.' },
    { label: 'End-of-day wind‑down', detail: 'Note a few wins, park loose ideas for tomorrow, and pick one or two priorities for next time.' },
  ];

  return { efficiencyScore, completionRate, flowConsistency, state, interpretation, recommendations, plan };
};

export default function CognitiveFocusEfficiencyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plannedTasks: undefined,
      completedTasks: undefined,
      majorDistractions: undefined,
      flowMinutes: undefined,
      multitaskPercent: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="focus-efficiency-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items.center gap-2">
            <Target className="h-5 w-5" />
            Cognitive Focus Efficiency Calculator
          </CardTitle>
          <CardDescription>Measure how effectively you convert time into meaningful work.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your day</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="plannedTasks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planned tasks</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={1}
                          placeholder="e.g., 5"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="completedTasks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completed tasks</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={1}
                          placeholder="e.g., 4"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="majorDistractions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Major distractions</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={1}
                          placeholder="e.g., 6"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flowMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flow minutes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={5}
                          placeholder="e.g., 120"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="multitaskPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time spent multitasking (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={1}
                          placeholder="e.g., 25"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate efficiency
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items.center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              Interactive result & interpretation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency score</p>
                <p className="text-2xl font-semibold text-primary">{result.efficiencyScore}</p>
                <p className="text-xs text-muted-foreground">Rough pattern: ≥70 more focused · 50–69 somewhat pulled · {'<'}50 very scattered</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Completion rate</p>
                <p className="text-2xl font-semibold text-primary">{result.completionRate}%</p>
                <p className="text-xs text-muted-foreground">Keep between 80–110% for realism.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Flow consistency</p>
                <p className="text-2xl font-semibold text-primary">{result.flowConsistency}%</p>
                <p className="text-xs text-muted-foreground">Based on 30 min of flow per key task.</p>
              </div>
            </div>
            <div className="rounded border p-4 bg-muted/50">
              <p className="text-sm uppercase tracking-wide text-muted-foreground mb-1">Status</p>
              <p className="text-lg font-semibold capitalize">{result.state}</p>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                  {result.recommendations.map((rec) => (
                    <li key={rec}>{rec}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 border rounded">
                <h4 className="font-semibold mb-2">Action plan</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {result.plan.map((step) => (
                    <li key={step.label}>
                      <span className="font-semibold">{step.label}:</span> {step.detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items.center gap-2">
            <Clock8 className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Completion Rate</strong> = Completed ÷ Planned × 100 (capped at 150%)
          </p>
          <p>
            <strong>Efficiency Score</strong> = clamp((Completion rate + Flow minutes ÷ 2 − Distraction penalty) ÷ 1.2)
          </p>
          <p>
            <strong>Flow Consistency</strong> = Flow minutes ÷ (Planned tasks × 30) × 100
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
          <CardTitle>Additional calculation</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            (() => {
              const values = form.getValues();
              const taskGap = (values.plannedTasks ?? 0) - (values.completedTasks ?? 0);
              const flowHours = Math.max((values.flowMinutes ?? 0) / 60, 0.5);
              const interruptionsPerHour = (values.majorDistractions ?? 0) / flowHours;
              const multitaskDrag = (values.multitaskPercent ?? 0) * 0.6;
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded">
                    <p className="text-sm text-muted-foreground">Task realism gap</p>
                    <p className="text-xl font-semibold text-primary">{taskGap}</p>
                    <p className="text-xs text-muted-foreground">Positive numbers mean you planned more than you finished.</p>
                  </div>
                  <div className="p-4 border rounded">
                    <p className="text-sm text-muted-foreground">Interruptions/hr</p>
                    <p className="text-xl font-semibold text-primary">{interruptionsPerHour.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Keep this below 4 whenever possible.</p>
                  </div>
                  <div className="p-4 border rounded">
                    <p className="text-sm text-muted-foreground">Multitask drag</p>
                    <p className="text-xl font-semibold text-primary">{multitaskDrag.toFixed(1)} pts</p>
                    <p className="text-xs text-muted-foreground">Penalty applied to the score.</p>
                  </div>
                </div>
              );
            })()
          ) : (
            <p className="text-sm text-muted-foreground">Run the calculator to reveal task realism, interruptions per hour, and multitask drag.</p>
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
            Focus is a skill. When you track the inputs and outputs daily, you can iterate like an athlete—tighten routines, protect energy,
            and finish each day with momentum.
          </p>
          <p>
            Use this calculator with your planner or project tool. Review on Fridays to reinforce what worked and cut what didn’t.
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
          <CardTitle className="flex items.center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tool looks at planned and completed tasks, flow time, distractions, and multitasking to offer a simple snapshot of how your day felt for focus.</p>
          <p>You can treat the numbers and suggestions as gentle prompts for experimenting with boundaries, planning, and routines that feel kinder to your attention.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}


