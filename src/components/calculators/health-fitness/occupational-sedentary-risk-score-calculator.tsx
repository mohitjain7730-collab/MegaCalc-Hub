'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Armchair } from 'lucide-react';

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
  let interpretation =
    'Your entries suggest that, overall, your movement and work setup are doing a reasonable job of balancing sitting time.';

  if (riskScore >= 45) {
    classification = 'caution';
    interpretation =
      'Your day includes quite a bit of sitting. Small changes—like more frequent short breaks or a few extra steps—may help your body feel better across the week.';
  }
  if (riskScore >= 70) {
    classification = 'high-risk';
    interpretation =
      'These numbers point to a very sit‑heavy routine. You might find it helpful to experiment with more standing or walking breaks and, when possible, a more supportive work setup.';
  }

  const recommendations = [
    'Consider using gentle reminders to stand up, change posture, or walk for a couple of minutes throughout the day.',
    'When it makes sense, add light movement to calls or breaks (for example, walking while you talk or stretching between tasks).',
    'On days that involve more sitting, a short strength or mobility session can help your body feel more supported.',
  ];
  if (classification !== 'balanced') {
    recommendations.push('Explore simple ergonomic tweaks—like lumbar support or monitor height—that your space and budget allow.');
  }
  if (classification === 'high-risk') {
    recommendations.push('You might aim for a few extra short walks spread across the day, especially earlier, to see how your energy responds.');
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
              <Zap className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See risk score, movement minutes, step gap, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-semibold text-primary">{result.riskScore}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Movement Minutes</p>
                <p className="text-2xl font-semibold text-primary">{result.movementMinutes}</p>
                <p className="text-xs text-muted-foreground">Per day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Step Gap</p>
                <p className="text-2xl font-semibold text-primary">{result.stepGap}</p>
                <p className="text-xs text-muted-foreground">Steps</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.classification}</p>
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
                    <AlertTriangle className="h-4 w-4" />
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
            <strong>Risk Score</strong> = clamp(Sitting Hours × 6 − Standing Breaks × 1.5 − Daily Steps ÷ 800 − Workouts Per Week ×
            3 − Ergonomic Factor + 30, 0, 100). Higher sitting hours increase risk; breaks, steps, workouts, and ergonomic
            improvements reduce it.
          </p>
          <p>
            <strong>Movement Minutes</strong> = Workouts Per Week × 30 + Standing Breaks × 2. This estimates total daily movement
            time from structured exercise and breaks.
          </p>
          <p>
            <strong>Step Gap</strong> = clamp(10,000 − Actual Steps, −5,000, 15,000). Negative values indicate exceeding the 10,000
            step target; positive values show steps needed to reach the target.
          </p>
          <p>
            Ergonomic factors: Poor = 0, Average = 2, Optimized = 5. The calculator accounts for how workstation setup affects
            physical stress and risk.
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

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemType="https://schema.org/MedicalWebPage"
      >
        {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
        <meta itemProp="name" content="The Definitive Guide to Occupational Sedentary Risk: Reducing Sitting Time and Promoting Movement" />
        <meta
          itemProp="description"
          content="An expert, evidence-based guide on sedentary behavior risks, occupational health, movement breaks, ergonomics, and comprehensive strategies to reduce sitting time and support physical well-being."
        />
        <meta
          itemProp="keywords"
          content="sedentary risk score, occupational health, sitting time, movement breaks, ergonomics, desk job health, physical activity"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-sedentary-risk-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          The Definitive Guide to Occupational Sedentary Risk: Reducing Sitting Time, Promoting Movement, and Supporting Physical
          Well-Being
        </h1>
        <p className="text-lg italic text-gray-700">
          Explore the science of sedentary behavior, learn how prolonged sitting affects health, understand occupational risk
          factors, and discover comprehensive strategies to reduce sitting time, increase movement, and support physical well-being in
          desk-based work environments.
        </p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#understanding-sedentary-risk" className="hover:underline">
              Understanding Sedentary Behavior and Occupational Risk
            </a>
          </li>
          <li>
            <a href="#health-effects" className="hover:underline">
              Health Effects of Prolonged Sitting
            </a>
          </li>
          <li>
            <a href="#movement-breaks" className="hover:underline">
              Movement Breaks and Activity Snacks
            </a>
          </li>
          <li>
            <a href="#ergonomics" className="hover:underline">
              Ergonomic Workstation Setup
            </a>
          </li>
          <li>
            <a href="#reduction-strategies" className="hover:underline">
              Comprehensive Strategies to Reduce Sedentary Risk
            </a>
          </li>
        </ul>
        <hr />

        {/* UNDERSTANDING SEDENTARY RISK */}
        <h2 id="understanding-sedentary-risk" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Understanding Sedentary Behavior and Occupational Risk
        </h2>
        <p>
          Sedentary behavior refers to activities with low energy expenditure performed while sitting, reclining, or lying down.
          Occupational sedentary risk is particularly relevant for desk-based workers who spend extended periods sitting.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">What Constitutes Sedentary Behavior</h3>
        <p>
          Sedentary activities include:
        </p>
        <ul>
          <li>Sitting at a desk or computer</li>
          <li>Driving or commuting</li>
          <li>Watching television or using screens</li>
          <li>Reading or studying while seated</li>
          <li>Any activity with minimal movement while seated</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Risk Thresholds</h3>
        <p>
          Research suggests:
        </p>
        <ul>
          <li>
            <b>Moderate risk:</b> 6-8 hours of daily sitting
          </li>
          <li>
            <b>High risk:</b> More than 8 hours of daily sitting without regular breaks
          </li>
          <li>
            <b>Very high risk:</b> More than 10 hours of daily sitting with minimal movement
          </li>
        </ul>

        <hr />

        {/* HEALTH EFFECTS */}
        <h2 id="health-effects" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Health Effects of Prolonged Sitting
        </h2>
        <p>
          Prolonged sitting affects multiple body systems, creating cumulative health risks over time.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Cardiometabolic Effects</h3>
        <ul>
          <li>
            <b>Reduced metabolic rate:</b> Sitting decreases calorie burning and metabolic activity
          </li>
          <li>
            <b>Impaired glucose regulation:</b> Extended sitting reduces insulin sensitivity
          </li>
          <li>
            <b>Increased cardiovascular risk:</b> Prolonged sitting is associated with higher heart disease risk
          </li>
          <li>
            <b>Elevated blood pressure:</b> Reduced circulation can increase blood pressure
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Musculoskeletal Effects</h3>
        <ul>
          <li>
            <b>Postural problems:</b> Forward head posture, rounded shoulders, and spinal misalignment
          </li>
          <li>
            <b>Muscle imbalances:</b> Tight hip flexors, weak glutes, and weakened core muscles
          </li>
          <li>
            <b>Back and neck pain:</b> Poor posture and prolonged static positions cause discomfort
          </li>
          <li>
            <b>Joint stiffness:</b> Reduced movement leads to decreased joint mobility
          </li>
        </ul>

        <hr />

        {/* MOVEMENT BREAKS */}
        <h2 id="movement-breaks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Movement Breaks and Activity Snacks
        </h2>
        <p>
          Regular movement breaks interrupt prolonged sitting and mitigate health risks, even if brief.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Benefits of Movement Breaks</h3>
        <ul>
          <li>Improves circulation and blood flow</li>
          <li>Reduces muscle tension and stiffness</li>
          <li>Enhances glucose regulation</li>
          <li>Boosts energy and alertness</li>
          <li>Supports mental well-being</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Recommended Break Frequency</h3>
        <p>
          Guidelines suggest:
        </p>
        <ul>
          <li>
            <b>Every 30 minutes:</b> Stand or move for 2-3 minutes
          </li>
          <li>
            <b>Every hour:</b> Take a 5-minute walking or stretching break
          </li>
          <li>
            <b>Daily target:</b> Accumulate at least 2 hours of standing or light movement during work hours
          </li>
        </ul>

        <hr />

        {/* ERGONOMICS */}
        <h2 id="ergonomics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Ergonomic Workstation Setup
        </h2>
        <p>
          Proper ergonomics reduce physical stress and support healthy movement patterns, even while seated.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Key Ergonomic Principles</h3>
        <ul>
          <li>
            <b>Monitor height:</b> Top of screen at or slightly below eye level
          </li>
          <li>
            <b>Chair support:</b> Lumbar support, adjustable height, and proper seat depth
          </li>
          <li>
            <b>Keyboard and mouse:</b> At elbow height with wrists in neutral position
          </li>
          <li>
            <b>Foot support:</b> Feet flat on floor or footrest
          </li>
          <li>
            <b>Desk height:</b> Allows comfortable arm positioning
          </li>
        </ul>

        <hr />

        {/* REDUCTION STRATEGIES */}
        <h2 id="reduction-strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Comprehensive Strategies to Reduce Sedentary Risk
        </h2>
        <p>
          Reducing sedentary risk requires a multi-faceted approach combining movement breaks, ergonomic improvements, and lifestyle
          changes.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Increase Movement Breaks</h3>
        <ul>
          <li>
            <b>Set reminders:</b> Use timers or apps to prompt regular breaks
          </li>
          <li>
            <b>Standing meetings:</b> Conduct meetings while standing or walking
          </li>
          <li>
            <b>Active commuting:</b> Walk or cycle part of your commute
          </li>
          <li>
            <b>Desk exercises:</b> Perform simple stretches or movements at your desk
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Optimize Workstation</h3>
        <ul>
          <li>
            <b>Standing desk:</b> Use sit-stand desk to alternate positions
          </li>
          <li>
            <b>Ergonomic accessories:</b> Lumbar support, monitor riser, keyboard tray
          </li>
          <li>
            <b>Proper setup:</b> Adjust chair, monitor, and desk to optimal positions
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Increase Daily Steps</h3>
        <ul>
          <li>
            <b>Set step goals:</b> Aim for 10,000 steps per day or gradually increase from current baseline
          </li>
          <li>
            <b>Take stairs:</b> Use stairs instead of elevators
          </li>
          <li>
            <b>Park farther:</b> Park further from entrances to add walking
          </li>
          <li>
            <b>Walking meetings:</b> Conduct one-on-one meetings while walking
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">4. Incorporate Structured Exercise</h3>
        <ul>
          <li>
            <b>Regular workouts:</b> Aim for 150 minutes of moderate-intensity exercise per week
          </li>
          <li>
            <b>Strength training:</b> Include resistance training 2-3 times per week
          </li>
          <li>
            <b>Flexibility work:</b> Add stretching or yoga to improve mobility
          </li>
        </ul>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>
          Reducing occupational sedentary risk is essential for maintaining physical health, preventing musculoskeletal problems,
          and supporting overall well-being in desk-based work environments. By understanding how prolonged sitting affects health,
          implementing movement breaks, optimizing ergonomic setups, and incorporating regular exercise, you can mitigate sedentary
          risks while maintaining productivity. Remember that small, consistent changes accumulate over time—regular breaks, proper
          ergonomics, and increased daily movement create significant health benefits. Start with one strategy, track your progress,
          and gradually add more movement opportunities. If you experience persistent pain or health concerns related to sedentary
          behavior, consider consulting a healthcare provider or ergonomic specialist who can provide personalized guidance. This
          tool is designed for wellness reflection and is not a substitute for professional medical evaluation or treatment.
        </p>
      </section>

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
            This tool offers a sedentary risk score from sitting hours, standing breaks, daily steps, workouts, and ergonomic
            quality as a gentle, lifestyle-oriented snapshot. It is intended for personal reflection, not for diagnosis or
            treatment decisions.
          </p>
          <p>
            Outputs include risk score (0-100), movement minutes, step gap, wellness classification, interpretation text,
            supportive recommendations, an action plan, and contextual information about the inputs and calculation approach.
          </p>
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
          <p>
            Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
            medical or psychological diagnosis, evaluation, or treatment plan. For any health concerns, please consult a qualified
            professional who can review your full situation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


