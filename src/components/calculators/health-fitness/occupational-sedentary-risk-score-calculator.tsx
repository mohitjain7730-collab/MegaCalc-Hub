'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Armchair, MoveUp, Footprints, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  sittingHours: z.number({ invalid_type_error: 'Enter hours' }).min(0).max(16),
  standingBreaks: z.number({ invalid_type_error: 'Enter number of breaks' }).min(0).max(40),
  dailySteps: z.number({ invalid_type_error: 'Enter steps' }).min(0).max(30000),
  workoutsPerWeek: z.number({ invalid_type_error: 'Enter workouts' }).min(0).max(14),
  ergonomicScore: z.enum(['poor', 'average', 'optimized']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  riskScore: number;
  classification: 'balanced' | 'caution' | 'high-risk';
  interpretation: string;
  movementMinutes: number;
  stepGap: number;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Estimate total seated hours during a typical workday, including commute time.',
  'Count how many purposeful standing or walking breaks you take (≥2 minutes).',
  'Pull your current step average from a wearable or phone health app.',
  'Track structured workouts per week (strength, cardio, yoga).',
  'Rate your workstation ergonomics—chair support, monitor height, alternate desk, etc.',
  'Run the calculator and pick one ergonomic improvement plus one movement habit to implement this week.',
];

const faqs = [
  {
    question: 'What does the Occupational Sedentary Risk Score represent?',
    answer: 'It translates your sitting hours, movement breaks, steps, exercise, and ergonomic quality into a 0–100 score that reflects cardiometabolic and musculoskeletal risk.',
  },
  {
    question: 'How many sitting hours are too many?',
    answer: 'Risk starts climbing above 8 hours, and accelerates past 10 hours without consistent breaks or workouts.',
  },
  {
    question: 'Do brief walk breaks really help?',
    answer: 'Yes—standing or walking for 2–3 minutes every 30–45 minutes improves circulation, glycemic control, and posture.',
  },
  {
    question: 'How should I score ergonomics?',
    answer: 'Poor: basic chair/laptop setup. Average: some adjustments (external keyboard, lumbar cushion). Optimized: full ergonomic chair, monitor at eye level, or sit-stand desk.',
  },
  {
    question: 'Is hitting 10,000 steps enough?',
    answer: 'It offsets some risk, but you still need strength work and regular breaks if you sit for long stretches.',
  },
  {
    question: 'Can this apply to hybrid workers?',
    answer: 'Absolutely—average your time between office and home setups to keep the score realistic.',
  },
  {
    question: 'What about gig workers or drivers?',
    answer: 'Enter actual seated hours (often 12+) and focus on portable mobility tools plus hydration to encourage breaks.',
  },
  {
    question: 'How fast can I reduce the score?',
    answer: 'You’ll see improvement within a week when you add breaks or workouts. Ergonomic upgrades offer instant relief.',
  },
  {
    question: 'Should I invest in a standing desk?',
    answer: 'Standing desks help when paired with walking breaks and proper posture. It’s one of many levers; pick what fits your budget.',
  },
  {
    question: 'How often should I recalc?',
    answer: 'Recalculate whenever your workload, commute, or workout schedule changes—monthly at minimum.',
  },
];

const relatedCalculators = [
  {
    name: 'Work-Life Balance Time Allocation Calculator',
    slug: 'work-life-balance-time-allocation-calculator',
    description: 'Ensure leisure and recovery time match your workload.',
  },
  {
    name: 'Hydration Sweat Rate Calculator',
    slug: 'hydration-sweat-rate-calculator',
    description: 'Proper hydration reduces joint stiffness during sedentary days.',
  },
  {
    name: 'VO₂ Reserve Calculator',
    slug: 'vo2-reserve-calculator',
    description: 'Set smarter cardio targets to complement desk life.',
  },
  {
    name: 'Stress Level Self-Assessment Calculator',
    slug: 'stress-level-self-assessment-calculator',
    description: 'Correlate sedentary risk with perceived stress.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/occupational-sedentary-risk-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Occupational Sedentary Risk Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Occupational Sedentary Risk Score Calculator',
      description: 'Quantify sitting-related risk and get ergonomic plus movement recommendations.',
      author: { '@type': 'Organization', name: 'Mycalculating.com' },
      publisher: { '@type': 'Organization', name: 'Mycalculating.com' },
      url: baseUrl,
      mainEntityOfPage: baseUrl,
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Occupational Sedentary Risk Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: ['Sedentary risk score', 'Movement minute target', 'Step gap analysis'],
      url: baseUrl,
      description: 'Blend sitting hours, breaks, steps, workouts, and ergonomics to assess workplace risk.',
    },
  ],
};

const ergonomicFactor: Record<FormValues['ergonomicScore'], number> = {
  poor: 0,
  average: 5,
  optimized: 10,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const baseRisk = values.sittingHours * 6;
  const breakRelief = values.standingBreaks * 1.5;
  const stepRelief = values.dailySteps / 800;
  const workoutRelief = values.workoutsPerWeek * 3;
  const ergoRelief = ergonomicFactor[values.ergonomicScore];
  const rawScore = baseRisk - breakRelief - stepRelief - workoutRelief - ergoRelief;
  const riskScore = clamp(Math.round(rawScore + 30), 0, 100);
  const movementMinutes = clamp(values.workoutsPerWeek * 30 + values.standingBreaks * 2, 0, 300);
  const stepGap = clamp(10000 - values.dailySteps, -5000, 15000);

  let classification: ResultPayload['classification'] = 'balanced';
  let interpretation = 'Great job—your routine offsets sedentary time. Maintain current steps and mobility work.';

  if (riskScore >= 45) {
    classification = 'caution';
    interpretation = 'Add structured breaks, glute activation, and walking meetings to keep risk in check.';
  }
  if (riskScore >= 70) {
    classification = 'high-risk';
    interpretation = 'You are sitting far more than you move. Prioritize hourly standing cues and upgrade ergonomics soon.';
  }

  const recommendations = [
    'Set a repeating 45-minute timer to stand, stretch, or walk to refill water.',
    'Stack movement during calls: walk, peddle under your desk, or use a balance board.',
    'Anchor strength sessions on high-sitting days to protect joints and posture.',
  ];
  if (classification !== 'balanced') {
    recommendations.push('Upgrade ergonomics (lumbar support, monitor riser, or sit-stand desk) within the next 30 days.');
  }
  if (classification === 'high-risk') {
    recommendations.push('Aim for 1,500 extra steps before noon to prevent energy crashes.');
  }

  const plan = [
    { label: 'Morning mobility', detail: '5-minute hip and thoracic opener before checking email.' },
    { label: 'Midday intervention', detail: 'Schedule a non-negotiable walking meeting or mini workout.' },
    { label: 'Evening decompression', detail: 'Foam roll or do gentle yoga to offset desk stiffness.' },
  ];

  return { riskScore, classification, interpretation, movementMinutes, stepGap, recommendations, plan };
};

export default function OccupationalSedentaryRiskScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sittingHours: undefined,
      standingBreaks: undefined,
      dailySteps: undefined,
      workoutsPerWeek: undefined,
      ergonomicScore: 'average',
    },
  });

  return (
    <div className="space-y-8">
      <Script id="sedentary-risk-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Armchair className="h-5 w-5" />
            Occupational Sedentary Risk Score Calculator
          </CardTitle>
          <CardDescription>Transform your workday habits into a prevention-focused risk score.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your workday</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sittingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sitting hours</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.25"
                          placeholder="e.g., 9.5"
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
                  name="standingBreaks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standing / walking breaks per day</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 8"
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
                  name="dailySteps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily steps</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="100"
                          placeholder="e.g., 6500"
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
                  name="workoutsPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Structured workouts per week</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 3"
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
                  name="ergonomicScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ergonomic setup quality</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select quality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="average">Average</SelectItem>
                          <SelectItem value="optimized">Optimized</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate risk
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MoveUp className="h-5 w-5 text-primary" />
              Interactive result & interpretation
            </CardTitle>
            <CardDescription>Risk classification, movement targets, and ergonomic prompts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk score</p>
                <p className="text-2xl font-semibold text-primary">{result.riskScore}</p>
                <p className="text-xs text-muted-foreground">0–44 balanced · 45–69 caution · 70+ high-risk</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Movement minutes / day</p>
                <p className="text-2xl font-semibold text-primary">{result.movementMinutes}</p>
                <p className="text-xs text-muted-foreground">Includes purposeful breaks + workouts.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Step gap</p>
                <p className="text-2xl font-semibold text-primary">{result.stepGap} steps</p>
                <p className="text-xs text-muted-foreground">Negative = you’re exceeding the 10k target.</p>
              </div>
            </div>
            <div className="rounded border p-4 bg-muted/50">
              <p className="text-sm uppercase tracking-wide text-muted-foreground mb-1">Status</p>
              <p className="text-lg font-semibold capitalize">{result.classification}</p>
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
            <Footprints className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Risk Score</strong> = clamp( Sitting hours × 6 − Breaks × 1.5 − Steps ÷ 800 − Workouts × 3 − Ergonomic factor + 30 )
          </p>
          <p>
            <strong>Movement Minutes</strong> = Workouts × 30 + Breaks × 2
          </p>
          <p>
            <strong>Step Gap</strong> = 10,000 − actual steps (capped between −5,000 and 15,000).
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
                <p className="text-sm text-muted-foreground">Break density</p>
                <p className="text-xl font-semibold text-primary">
                  {(((form.getValues().standingBreaks ?? 0) / Math.max(form.getValues().sittingHours ?? 1, 1)) * 60).toFixed(1)} min between breaks
                </p>
                <p className="text-xs text-muted-foreground">Aim for ≤45 min.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Workouts buffer</p>
                <p className="text-xl font-semibold text-primary">
                  {(form.getValues().workoutsPerWeek ?? 0) * 3}%
                </p>
                <p className="text-xs text-muted-foreground">Percent risk reduction from training.</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ergonomic credit</p>
                <p className="text-xl font-semibold text-primary">
                  {ergonomicFactor[form.getValues().ergonomicScore ?? 'average']} pts
                </p>
                <p className="text-xs text-muted-foreground">Move toward “optimized” for max relief.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Run the calculator to unlock break density, workout buffer, and ergonomic credit.</p>
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
            Sedentary risk is cumulative—hours add up even if you hit the gym a few times a week. Pair movement snacks, ergonomic
            upgrades, and strategic workouts to keep joints, fascia, and metabolic health resilient.
          </p>
          <p>
            Use this calculator monthly to make sure lifestyle changes stick. Track step counts, break frequency, and chair/desk
            upgrades like any other KPI.
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
          <p>This calculator quantifies sedentary risk using sitting hours, breaks, steps, workouts, and ergonomics.</p>
          <p>Outputs include a risk score, movement minutes, step gap, recommendations, action plan, and supporting metrics.</p>
          <p>Structured schema markup, steps, guide text, and FAQs help humans and AI agents digest the methodology quickly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


