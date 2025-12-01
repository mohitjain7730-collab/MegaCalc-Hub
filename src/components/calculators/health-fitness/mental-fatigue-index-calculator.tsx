'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BatteryMedium, Brain, Droplets, Hourglass, ShieldCheck } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breakSchema = z.enum(['poor', 'average', 'great']);

const formSchema = z.object({
  deepWorkHours: z.number({ invalid_type_error: 'Enter hours' }).min(0).max(8),
  contextSwitches: z.number({ invalid_type_error: 'Enter count' }).min(0).max(60),
  sleepHours: z.number({ invalid_type_error: 'Enter hours' }).min(4).max(10),
  hydrationLiters: z.number({ invalid_type_error: 'Enter liters' }).min(0).max(5),
  breakQuality: breakSchema,
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  fatigueScore: number;
  state: 'resilient' | 'amber' | 'depleted';
  interpretation: string;
  focusStability: number;
  recoveryGap: number;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Track deep work hours (focused, high-cognitive work) for a typical day.',
  'Count how many context switches you experience (emails, chats, tab hopping).',
  'Log last night’s sleep duration in hours.',
  'Record hydration in liters (add herbal tea or electrolyte water).',
  'Rate break quality: poor (scrolling), average (short pauses), great (movement/eyes closed).',
  'Submit the form and follow the action plan for at least 3 days before recalculating.',
];

const faqs = [
  {
    question: 'How is the Mental Fatigue Index different from burnout?',
    answer: 'This index looks at daily cognitive load and recovery inputs, so you can course-correct long before clinical burnout.',
  },
  {
    question: 'What counts as context switching?',
    answer: 'Any abrupt shift in attention—new tab, chat ping, app switch, or task change. Track everything for accuracy.',
  },
  {
    question: 'Can hydration really influence mental fatigue?',
    answer: 'Yes, even 1–2% dehydration impairs attention, so water intake plays into the score.',
  },
  {
    question: 'Why cap deep work at 8 hours?',
    answer: 'Most people can’t sustain more than 4–5 hours of world-class focus; 8 is an upper bound for multi-block days.',
  },
  {
    question: 'What if my sleep varies widely?',
    answer: 'Use a 3-day average. The index will encourage consistent routines.',
  },
  {
    question: 'Does caffeine intake matter?',
    answer: 'Indirectly. Poor cutoffs often degrade sleep, spiking fatigue. Pair this tool with the Caffeine Cutoff Calculator.',
  },
  {
    question: 'Can I apply this on weekends?',
    answer: 'Absolutely—use it to plan creative days or detox from meetings.',
  },
  {
    question: 'What is a healthy score?',
    answer: 'Aim for ≤35 most days. Amber (35–64) is manageable if you recover well; >65 suggests you need rest.',
  },
  {
    question: 'How much hydration is enough?',
    answer: 'Most adults thrive between 2.3–3.0 L, more with heat or workouts. The index nudges you toward that zone.',
  },
  {
    question: 'How often should I check?',
    answer: 'Daily during demanding sprints, otherwise weekly to spot trends.',
  },
];

const relatedCalculators = [
  { name: 'Cognitive Focus Efficiency Calculator', slug: 'cognitive-focus-efficiency-calculator', description: 'Track output vs inputs to see how focus translates to results.' },
  { name: 'Daily Screen Exposure Stress Index', slug: 'daily-screen-exposure-stress-index-calculator', description: 'Pair digital stress and fatigue insights.' },
  { name: 'Hydration Needs Calculator', slug: 'hydration-needs-calculator', description: 'Personalize your fluid baseline.' },
  { name: 'Sleep Efficiency Calculator', slug: 'sleep-efficiency-calculator', description: 'Verify that fatigue drops as sleep improves.' },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/mental-fatigue-index-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Mental Fatigue Index Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Mental Fatigue Index Calculator',
      description: 'Estimate daily cognitive fatigue using workload, switches, sleep, hydration, and breaks.',
      author: { '@type': 'Organization', name: 'Mycalculating.com' },
      publisher: { '@type': 'Organization', name: 'Mycalculating.com' },
      url: baseUrl,
      mainEntityOfPage: baseUrl,
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Mental Fatigue Index Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: ['Fatigue scoring', 'Focus stability', 'Recovery gap'],
      url: baseUrl,
      description: 'Use workload and recovery data to quantify cognitive fatigue and plan resets.',
    },
  ],
};

const breakFactor: Record<FormValues['breakQuality'], number> = {
  poor: 0,
  average: 6,
  great: 12,
};

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

const calculateResult = (values: FormValues): ResultPayload => {
  const workload = values.deepWorkHours * 12 + values.contextSwitches * 1.5;
  const recovery = values.sleepHours * 6 + values.hydrationLiters * 4 + breakFactor[values.breakQuality];
  const rawScore = workload - recovery;
  const fatigueScore = clamp(Math.round(rawScore + 30), 0, 100);
  const focusStability = clamp(100 - values.contextSwitches * 1.5 - (values.breakQuality === 'great' ? 5 : 0), 0, 100);
  const recoveryGap = clamp(420 - values.sleepHours * 60 - values.hydrationLiters * 15, -120, 240);

  let state: ResultPayload['state'] = 'resilient';
  let interpretation =
    'Your entries suggest a fairly supported day for your mind overall, with a helpful mix of focus time and basic recovery habits.';

  if (fatigueScore >= 35) {
    state = 'amber';
    interpretation =
      'Your current pattern looks a bit heavier on load than recovery. Gently shortening deep‑focus blocks or adding small pauses may help things feel more sustainable.';
  }
  if (fatigueScore >= 65) {
    state = 'depleted';
    interpretation =
      'These numbers point to a very full day for your attention. You might experiment with lighter tasks, more breaks, or an easier‑paced day soon, if that’s possible for you.';
  }

  const recommendations = [
    'Try adding a bit of light movement before and after deep‑focus blocks to gently reset your energy.',
    'Batching messages or inbox checks into a few windows can reduce constant switching between tasks.',
    'Keeping a glass or bottle nearby and sipping water regularly can support your overall mental energy across the day.',
  ];
  if (state === 'amber') {
    recommendations.push('Consider swapping one intense block for something softer like reflection, planning, or journaling.');
  }
  if (state === 'depleted') {
    recommendations.push('If you can, plan a gentler period with fewer commitments, more rest, and one or two simple priorities.');
  }

  const plan = [
    { label: 'Morning setup', detail: 'A few minutes of stretching, light, or calm planning before checking messages can set a gentler tone.' },
    { label: 'Midday pause', detail: 'A short walk, breathing break, or quiet moment can help your mind reset mid‑day.' },
    { label: 'Evening wind‑down', detail: 'Noting tomorrow’s key tasks and easing away from notifications can support a smoother end to the day.' },
  ];

  return { fatigueScore, state, interpretation, focusStability, recoveryGap, recommendations, plan };
};

export default function MentalFatigueIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deepWorkHours: undefined,
      contextSwitches: undefined,
      sleepHours: undefined,
      hydrationLiters: undefined,
      breakQuality: 'average',
    },
  });

  return (
    <div className="space-y-8">
      <Script id="mental-fatigue-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BatteryMedium className="h-5 w-5" />
            Mental Fatigue Index Calculator
          </CardTitle>
          <CardDescription>Score your daily cognitive load and recovery inputs.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input today’s data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deepWorkHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deep work hours</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder="e.g., 4.5"
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
                  name="contextSwitches"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Context switches</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 18"
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
                  name="sleepHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sleep (hours)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder="e.g., 7.5"
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
                  name="hydrationLiters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hydration (liters)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 2.4"
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
                  name="breakQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Break quality</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select quality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="poor">Poor (scrolling only)</SelectItem>
                          <SelectItem value="average">Average (look away, sip water)</SelectItem>
                          <SelectItem value="great">Great (movement, breathing, outside)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate fatigue
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Interactive result & interpretation
            </CardTitle>
            <CardDescription>Score overview plus personalized recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fatigue score</p>
                <p className="text-2xl font-semibold text-primary">{result.fatigueScore}</p>
                <p className="text-xs text-muted-foreground">Rough pattern: 0–34 more refreshed · 35–64 getting full · 65+ very loaded</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Focus stability</p>
                <p className="text-2xl font-semibold text-primary">{result.focusStability}</p>
                <p className="text-xs text-muted-foreground">Higher = fewer switches and better breaks.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recovery gap</p>
                <p className="text-2xl font-semibold text-primary">{result.recoveryGap} min</p>
                <p className="text-xs text-muted-foreground">Minutes of extra recovery your brain craves.</p>
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
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Fatigue Score</strong> = clamp( DeepWork × 12 + Switches × 1.5 − Sleep × 6 − Hydration × 4 − Break factor + 30 )
          </p>
          <p>
            <strong>Focus Stability</strong> = clamp( 100 − Switches × 1.5 − Break bonus )
          </p>
          <p>
            <strong>Recovery Gap</strong> = 420 − Sleep × 60 − Hydration × 15
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Switch density</p>
                <p className="text-xl font-semibold text-primary">
                  {(((form.getValues().contextSwitches ?? 0) / Math.max(form.getValues().deepWorkHours ?? 1, 1))).toFixed(1)} switches/hr
                </p>
                <p className="text-xs text-muted-foreground">Strive for {'<'} 6 per deep work hour.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Hydration coverage</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.min(100, ((form.getValues().hydrationLiters ?? 0) / 2.5) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Based on a 2.5 L target.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep sufficiency</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.min(100, ((form.getValues().sleepHours ?? 0) / 8) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Relative to 8 hours.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Run the calculator to view switch density, hydration coverage, and sleep sufficiency.</p>
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
            Mental fatigue builds faster than we realize. By logging workload inputs and recovery behaviors, you can build a closed-loop system: push hard, recharge harder, and avoid long slumps.
          </p>
          <p>
            Combine this calculator with sleep tracking, caffeine timing, and digital boundaries to protect your brain from chronic overload.
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
            <Hourglass className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tool blends your focus time, task switching, sleep, hydration, and breaks into a simple index so you can reflect on how your day feels mentally.</p>
          <p>The ideas and numbers are there to inspire small, realistic experiments—keep what supports you and ignore what does not fit your life.</p>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}


