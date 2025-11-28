'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BrainCircuit, BookMarked, ChartLine, StickyNote, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  totalItems: z.number({ invalid_type_error: 'Enter total material items' }).min(1).max(1000),
  recalledItems: z.number({ invalid_type_error: 'Enter recalled items' }).min(0).max(1000),
  daysSinceStudy: z.number({ invalid_type_error: 'Enter days since study session' }).min(0).max(60),
  spacedSessions: z.number({ invalid_type_error: 'Enter spaced repetitions' }).min(0).max(30),
  sleepHours: z.number({ invalid_type_error: 'Enter average sleep' }).min(4).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  retentionPercent: number;
  forgettingPenalty: number;
  reinforcementLevel: 'excellent' | 'reinforce soon' | 'review ASAP';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Count the distinct info items, flashcards, or concepts you attempted to learn.',
  'Run a quick recall test (written or spoken) and log how many you correctly remembered.',
  'Enter days since your last focused study session and how many spaced repetitions you logged.',
  'Add your average nightly sleep for the past few days to factor in consolidation quality.',
  'Use the output to time your next review block and strengthen weak links.',
];

const faqs = [
  { question: 'What counts as an item?', answer: 'Flashcards, concepts, question stems, or any discrete chunk of information you can answer independently.' },
  { question: 'Why track spaced sessions?', answer: 'Each spaced pass resets some forgetting. Logging them shows whether more repetitions are required.' },
  { question: 'How often should I test retention?', answer: 'Weekly during semester-style study, or within 24 hours when prepping for shorter exams.' },
  { question: 'Does sleep really matter?', answer: 'Yes—sleep drives memory consolidation. Poor sleep increases forgetting penalties.' },
  { question: 'Can I use this for language vocab?', answer: 'Absolutely. Track words attempted vs recalled and plan review sessions.' },
  { question: 'What if I don’t have exact numbers?', answer: 'Estimate using percentages or sample questions—the calculator is meant for quick planning.' },
  { question: 'How can I raise retention fast?', answer: 'Use spaced repetition, mix question types, teach concepts aloud, and sleep 7–9 hours.' },
  { question: 'Should I log recognition or recall?', answer: 'Recall (no cues) gives the clearest signal. Recognition often overestimates true mastery.' },
  { question: 'Can teams or classrooms use this?', answer: 'Yes—log averages for cohorts to schedule group reviews or labs.' },
  { question: 'Does caffeine influence results?', answer: 'Indirectly through sleep. Track caffeine separately if it impacts rest.' },
];

const relatedCalculators = [
  { name: 'Meditation Streak Mindfulness Tracker', slug: 'meditation-streak-mindfulness-progress-tracker', description: 'Use mindfulness streaks to focus longer during study.' },
  { name: 'Cognitive Focus Efficiency Calculator', slug: 'cognitive-focus-efficiency-calculator', description: 'Identify planning gaps that waste study time.' },
  { name: 'Stress Hormone Balance Calculator', slug: 'stress-hormone-balance-calculator', description: 'Balance cortisol/melatonin to improve nightly consolidation.' },
  { name: 'Emotional Wellbeing Index Calculator', slug: 'emotional-wellbeing-index-calculator', description: 'Check mood patterns that affect learning motivation.' },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/memory-retention-percentage-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Memory Retention Percentage Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Memory Retention Percentage Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate current memory retention, forgetting penalty, and review urgency.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const retentionPercent = clamp((values.recalledItems / values.totalItems) * 100, 0, 100);
  const forgettingPenalty = clamp(values.daysSinceStudy * 2 - values.spacedSessions * 3 - (values.sleepHours - 6) * 2, 0, 40);
  const adjustedRetention = clamp(retentionPercent - forgettingPenalty, 0, 100);

  let reinforcementLevel: ResultPayload['reinforcementLevel'] = 'excellent';
  let interpretation = 'Your retention looks strong. Schedule a light spaced review to lock it in.';

  if (adjustedRetention < 80) {
    reinforcementLevel = 'reinforce soon';
    interpretation = 'Some decay is setting in. Layer a focused review within 24 hours.';
  }
  if (adjustedRetention < 60) {
    reinforcementLevel = 'review ASAP';
    interpretation = 'Recall is slipping fast. Plan a deliberate practice block today with active recall and teaching.';
  }

  const recommendations = [
    'Use active recall (closed-book questions) rather than re-reading.',
    'Convert tricky items into spaced-repetition cards to automate reviews.',
    'Wind down screens 60 minutes before bed to protect consolidation.',
  ];
  if (reinforcementLevel !== 'excellent') {
    recommendations.push('Chunk material into 15–20 minute blocks with 5-minute breaks to avoid overload.');
  }
  if (reinforcementLevel === 'review ASAP') {
    recommendations.push('Teach the concept to someone else or record yourself explaining it to solidify pathways.');
  }

  const plan = [
    { label: 'Today', detail: 'Run a targeted recall session on the weakest 20% of items.' },
    { label: 'This Week', detail: 'Add at least two spaced reviews (day 2 and day 5) for the same dataset.' },
    { label: 'Next Block', detail: 'Pair study with sleep tracking to see how rest impacts retention.' },
  ];

  return { retentionPercent: adjustedRetention, forgettingPenalty, reinforcementLevel, interpretation, recommendations, plan };
};

export default function MemoryRetentionPercentageCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalItems: undefined,
      recalledItems: undefined,
      daysSinceStudy: undefined,
      spacedSessions: undefined,
      sleepHours: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="memory-retention-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            Memory Retention Percentage Calculator
          </CardTitle>
          <CardDescription>Measure current recall percentage, forgetting penalty, and review urgency.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your study snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalItems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total items studied</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 80" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recalledItems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Items recalled correctly</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 62" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="daysSinceStudy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days since last focused study</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spacedSessions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spaced-review sessions logged</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Average sleep (hrs/night)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.25" placeholder="e.g., 7.3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate retention
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
            <CardDescription>Instant breakdown of retention percentage and review priority.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Adjusted retention</p>
                <p className="text-2xl font-semibold text-primary">{result.retentionPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Penalty-adjusted based on decay factors.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Forgetting penalty</p>
                <p className="text-2xl font-semibold text-primary">{result.forgettingPenalty.toFixed(1)} pts</p>
                <p className="text-xs text-muted-foreground">Higher numbers mean reviews are overdue.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Review urgency</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.reinforcementLevel.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><ChartLine className="h-4 w-4" />Recommendations</CardTitle>
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
                  <CardTitle className="text-base flex items-center gap-2"><StickyNote className="h-4 w-4" />Action plan</CardTitle>
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
          <p><strong>Retention %</strong> = (Recalled ÷ Total) × 100</p>
          <p><strong>Forgetting penalty</strong> = days × 2 − spacedSessions × 3 − (sleep − 6) × 2</p>
          <p>Adjusted retention = clamp(Retention % − Penalty)</p>
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
          <p>Memory sticks when you attack it from multiple angles—active recall, spaced repetition, teaching, sleep, and mindfulness all matter.</p>
          <p>Use this calculator weekly to time reviews precisely and keep more material in long-term storage.</p>
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
          <p>This calculator converts recall attempts into an adjusted retention percentage while factoring in decay.</p>
          <p>Outputs include retention %, forgetting penalty, review urgency, recommendations, and a simple action plan.</p>
          <p>Supporting sections—formula, steps, extra metrics, related tools, and FAQs—make it easy to share insights with classmates or AI assistants.</p>
        </CardContent>
      </Card>
    </div>
  );
}

